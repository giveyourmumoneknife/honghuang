import type { CombatStance, ItemId, WorldBossId } from '@/types/common'
import type { CombatStats, WorldBossDefinition, WorldBossDrop } from '@/types/content'
import type { GameSaveData, WorldBossState } from '@/types/state'
import type { ContentRegistry } from '@/data/registry'
import type { CombatResult } from './combat'
import { resolveEncounter } from './combat'
import { evaluateRequirements } from './conditions'
import { applyEffects } from './effects'
import { grantGeneratedGear, qualityTier } from './gear'
import { RESOURCE_LABELS } from './labels'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'
import { calendarFromMonths } from './time'

export type WorldBossStatus = 'ready' | 'cooling' | 'locked' | 'hidden' | 'ending'

export interface WorldBossAvailability {
  status: WorldBossStatus
  revealed: boolean
  requirementsMet: boolean
  unmet: ReturnType<typeof evaluateRequirements>['unmet']
  coolingMonths: number
  pending: boolean
  canChallenge: boolean
}

export interface WorldBossTimeResult {
  state: GameSaveData
  notes: string[]
}

export interface WorldBossChallengeResult {
  ok: boolean
  state: GameSaveData
  message: string
  encounterId?: string
  enemyScale?: number
}

export interface WorldBossCombatResult extends CombatResult {
  boss?: WorldBossDefinition
  firstKill?: boolean
}

export function worldBossStateOf(
  state: GameSaveData,
  bossId: WorldBossId,
): WorldBossState {
  return state.worldBosses[bossId] ?? { id: bossId, attempts: 0, kills: 0 }
}

export function worldBossKillScale(
  state: GameSaveData,
  boss: WorldBossDefinition,
): number {
  const kills = worldBossStateOf(state, boss.id).kills
  return Math.min(boss.maxScale, 1 + Math.max(0, kills) * boss.killScale)
}

export function worldBossAvailability(
  state: GameSaveData,
  boss: WorldBossDefinition,
  now = state.clock.elapsedMonths,
): WorldBossAvailability {
  const stored = worldBossStateOf(state, boss.id)
  const gate = evaluateRequirements(state, boss.requirements)
  const ending = !!state.campaign.ending
  const respawnAt = stored.respawnAtMonths
  const coolingMonths =
    respawnAt !== undefined && respawnAt > now
      ? Math.max(1, Math.ceil(respawnAt - now))
      : 0
  const pending = state.eventRuntime.pendingEncounters.some(
    (entry) => entry.source === 'world_boss' && entry.bossId === boss.id,
  )
  const revealed = !boss.hidden || gate.ok || stored.kills > 0
  let status: WorldBossStatus = 'ready'
  if (ending) status = 'ending'
  else if (coolingMonths > 0) status = 'cooling'
  else if (!gate.ok) status = revealed ? 'locked' : 'hidden'

  return {
    status,
    revealed,
    requirementsMet: gate.ok,
    unmet: gate.unmet,
    coolingMonths,
    pending,
    canChallenge:
      !ending && status === 'ready' && gate.ok && !pending,
  }
}

export function prepareWorldBossChallenge(
  state: GameSaveData,
  bossId: WorldBossId,
  registry: ContentRegistry,
): WorldBossChallengeResult {
  const boss = registry.worldBosses.get(bossId)
  if (!boss) {
    return { ok: false, state, message: '这一道影子已经不属于此劫。' }
  }
  if (boss.eraId !== state.campaign.currentEra) {
    return { ok: false, state, message: '它只在属于自己的那一劫里现身。' }
  }
  const availability = worldBossAvailability(state, boss)
  if (availability.status === 'ending') {
    return { ok: false, state, message: '此劫已经落笔，旧影不再回应挑战。' }
  }
  if (availability.status === 'cooling') {
    return {
      ok: false,
      state,
      message: `${boss.name}尚未回来，还需 ${availability.coolingMonths} 个月。`,
    }
  }
  if (!availability.requirementsMet) {
    return { ok: false, state, message: `因缘未至，${boss.name}没有显形。` }
  }
  if (availability.pending) {
    return { ok: false, state, message: `${boss.name}已经在等你出手。` }
  }

  const enemyScale = worldBossKillScale(state, boss)
  const next = cloneGameSaveData(state)
  const stored = worldBossStateOf(next, boss.id)
  next.worldBosses[boss.id] = {
    ...stored,
    id: boss.id,
    attempts: stored.attempts + 1,
  }
  next.eventRuntime.pendingEncounters.push({
    id: `encounter.${next.eventRuntime.nextSequence}`,
    encounterId: boss.encounterId,
    fleeAllowed: false,
    createdAtMonths: next.clock.elapsedMonths,
    source: 'world_boss',
    bossId: boss.id,
  })
  next.eventRuntime.nextSequence += 1

  return {
    ok: true,
    state: next,
    message: `${boss.name}应声显形。${enemyScale > 1.05 ? '它比上一次更强了一线。' : '潮声在你们之间空出一块地方。'}`,
    encounterId: boss.encounterId,
    enemyScale,
  }
}

function rollAmount(
  rng: Rng,
  min: number | undefined,
  max: number | undefined,
  fallback = 1,
): number {
  const low = Math.max(0, Math.floor(min ?? fallback))
  const high = Math.max(low, Math.floor(max ?? low))
  return rng.nextInt(low, high + 1)
}

function scaleStats(stats: CombatStats, scale: number): CombatStats {
  return {
    ...stats,
    health: Math.max(1, Math.round((stats.health ?? 1) * scale)),
    attack: Math.max(1, Math.round((stats.attack ?? 1) * scale)),
    defense: Math.max(0, Math.round((stats.defense ?? 0) * scale)),
    crit: Math.round((stats.crit ?? 0) * scale),
  }
}

function grantDrop(
  state: GameSaveData,
  drop: WorldBossDrop,
  rng: Rng,
  registry: ContentRegistry,
  rewards: string[],
): void {
  switch (drop.kind) {
    case 'item': {
      if (!drop.itemId) return
      const count = rollAmount(rng, drop.countMin, drop.countMax)
      if (count <= 0) return
      state.player.inventory[drop.itemId] =
        (state.player.inventory[drop.itemId] ?? 0) + count
      const name = registry.items.get(drop.itemId)?.name ?? '无名之物'
      rewards.push(`${name} ×${count}`)
      return
    }
    case 'treasure': {
      if (!drop.itemId) return
      if (state.player.treasureIds.includes(drop.itemId)) return
      state.player.treasureIds.push(drop.itemId)
      state.player.activeTreasureId ??= drop.itemId
      const name = registry.treasures.get(drop.itemId)?.name ?? '无名法宝'
      rewards.push(`${name}（法宝）`)
      return
    }
    case 'resource': {
      if (!drop.resource) return
      const amount = rollAmount(rng, drop.amountMin, drop.amountMax)
      if (amount <= 0) return
      state.player.resources[drop.resource] =
        Math.max(0, (state.player.resources[drop.resource] ?? 0) + amount)
      rewards.push(`${RESOURCE_LABELS[drop.resource] ?? '物料'} +${amount}`)
      return
    }
    case 'cultivation': {
      const amount = rollAmount(
        rng,
        drop.cultivationMin,
        drop.cultivationMax,
        1,
      )
      if (amount <= 0) return
      state.player.cultivation += amount
      rewards.push(`修为 +${amount}`)
      return
    }
    case 'gear': {
      if (!drop.gearSlot) return
      const gear = grantGeneratedGear(state, rng, {
        tier: Math.max(1, Math.min(6, Math.round(drop.gearTier ?? 1))),
        qualityBonus: drop.qualityBonus,
        regionId: undefined,
        slot: drop.gearSlot,
      })
      rewards.push(`器物 · ${gear.name}（${qualityTier(gear.quality).name}）`)
      return
    }
    default: {
      const exhaustive: never = drop.kind
      throw new Error(`未知世界 Boss 掉落类型：${String(exhaustive)}`)
    }
  }
}

function applyWorldBossVictory(
  state: GameSaveData,
  boss: WorldBossDefinition,
  registry: ContentRegistry,
): { state: GameSaveData; firstKill: boolean; rewards: string[] } {
  const now = state.clock.elapsedMonths
  const stored = worldBossStateOf(state, boss.id)
  const firstKill = stored.kills === 0 && stored.firstKilledAtMonths === undefined
  const rng = Rng.fromState(state.rng)
  const rewards: string[] = []

  let next = cloneGameSaveData(state)
  for (const drop of boss.guaranteedDrops) {
    if (drop.firstKillOnly && !firstKill) continue
    grantDrop(next, drop, rng, registry, rewards)
  }

  const pickLow = Math.max(0, Math.floor(boss.dropPicks[0]))
  const pickHigh = Math.max(pickLow, Math.floor(boss.dropPicks[1]))
  const pickCount = rng.nextInt(pickLow, pickHigh + 1)
  const pool = boss.drops.filter((drop) => !drop.firstKillOnly || firstKill)
  for (let index = 0; index < pickCount; index += 1) {
    const drop = rng.pickWeighted(pool)
    if (!drop) break
    const poolIndex = pool.indexOf(drop)
    if (poolIndex >= 0) pool.splice(poolIndex, 1)
    grantDrop(next, drop, rng, registry, rewards)
  }

  const kills = stored.kills + 1
  next.worldBosses[boss.id] = {
    id: boss.id,
    attempts: stored.attempts,
    kills,
    firstKilledAtMonths: stored.firstKilledAtMonths ?? now,
    lastKilledAtMonths: now,
    respawnAtMonths: now + boss.respawnMonths,
  }
  next.campaign.world.flags[`worldboss.${boss.id}.first_kill`] = true
  next.campaign.world.flags[`worldboss.${boss.id}.kills`] = kills

  if (firstKill && boss.onFirstKill?.length) {
    next = applyEffects(next, boss.onFirstKill, {})
  }
  if (boss.onEveryKill?.length) {
    next = applyEffects(next, boss.onEveryKill, {})
  }

  const regionName = registry.regions.get(boss.regionId)?.name ?? '旧地'
  next.chronicle.push({
    id: `chronicle:worldboss:${boss.id}:${kills}`,
    eraId: boss.eraId,
    title: `${boss.name} · ${firstKill ? '初退' : '再退'}`,
    text: firstKill
      ? `你击败了${boss.originalName}留在${regionName}的分身。这是它在这一劫中第一次退去，潮水会在 ${boss.respawnMonths} 个月后把它送回来。`
      : `你再次击败了${boss.name}。它退去时比上一次多停留了一瞬，仿佛在记住你的名字。`,
    year: calendarFromMonths(now).year,
  })

  next.rng = rng.getState()
  return { state: next, firstKill, rewards }
}

export function resolveWorldBossEncounter(
  state: GameSaveData,
  bossId: WorldBossId,
  stance: CombatStance,
  registry: ContentRegistry,
): WorldBossCombatResult {
  const boss = registry.worldBosses.get(bossId)
  if (!boss) {
    return {
      ok: false,
      victory: false,
      fled: false,
      state,
      rounds: 0,
      log: [],
      message: '这一道影子已经不属于此劫。',
      rewards: [],
      playerHealth: state.player.health,
      playerMaxHealth: state.player.health,
    }
  }

  const enemyScale = worldBossKillScale(state, boss)
  const result = resolveEncounter(state, boss.encounterId, stance, registry, {
    enemyScale,
    suppressGearDrop: true,
  })
  if (!result.ok || !result.victory) {
    return { ...result, boss }
  }

  const outcome = applyWorldBossVictory(result.state, boss, registry)
  return {
    ...result,
    state: outcome.state,
    boss,
    firstKill: outcome.firstKill,
    rewards: [...result.rewards, ...outcome.rewards],
    message: `${result.message}${outcome.firstKill ? '（初退）' : '（再退）'}`,
  }
}

export function advanceWorldBossTime(
  state: GameSaveData,
  registry: ContentRegistry,
): WorldBossTimeResult {
  const now = state.clock.elapsedMonths
  let next = state
  const notes: string[] = []

  for (const boss of registry.worldBosses.values()) {
    const stored = next.worldBosses[boss.id]
    if (!stored?.respawnAtMonths || now < stored.respawnAtMonths) continue
    if (next === state) next = cloneGameSaveData(state)
    const entry = next.worldBosses[boss.id]
    if (!entry) continue
    const respawnAt = entry.respawnAtMonths
    delete entry.respawnAtMonths

    const rumorId = `rumor.worldboss.${boss.id}.return.${respawnAt ?? 0}`
    if (!next.eventRuntime.rumors.some((rumor) => rumor.id === rumorId)) {
      const regionName = registry.regions.get(boss.regionId)?.name ?? '旧地'
      next.eventRuntime.rumors.push({
        id: rumorId,
        text: `${regionName}又有人看见了${boss.name}。潮水把它的影子送回原处，像从未被谁打散过。`,
        createdAtMonths: now,
      })
    }
    notes.push(`${boss.name}在${registry.regions.get(boss.regionId)?.name ?? '旧地'}重新现世。`)
  }

  return { state: next, notes }
}

export function describeWorldBossDrop(
  drop: WorldBossDrop,
  registry: ContentRegistry,
): string {
  switch (drop.kind) {
    case 'item': {
      const name = drop.itemId
        ? (registry.items.get(drop.itemId)?.name ?? '无名之物')
        : '无名之物'
      const low = drop.countMin ?? 1
      const high = drop.countMax ?? low
      return low === high ? `${name} ×${low}` : `${name} ×${low}-${high}`
    }
    case 'treasure':
      return drop.itemId
        ? `${registry.treasures.get(drop.itemId)?.name ?? '无名法宝'}（法宝）`
        : '无名法宝'
    case 'resource': {
      const label = drop.resource
        ? (RESOURCE_LABELS[drop.resource] ?? '物料')
        : '物料'
      const low = drop.amountMin ?? 1
      const high = drop.amountMax ?? low
      return low === high ? `${label} ×${low}` : `${label} ×${low}-${high}`
    }
    case 'cultivation': {
      const low = drop.cultivationMin ?? 1
      const high = drop.cultivationMax ?? low
      return low === high ? `修为 +${low}` : `修为 +${low}-${high}`
    }
    case 'gear': {
      const slotLabel = drop.gearSlot ?? '器物'
      return `常规器物 · ${slotLabel}（${drop.gearTier ?? 1} 阶）`
    }
    default: {
      const exhaustive: never = drop.kind
      throw new Error(`未知世界 Boss 掉落类型：${String(exhaustive)}`)
    }
  }
}

export function worldBossSigil(
  boss: WorldBossDefinition,
  registry: ContentRegistry,
): { itemId: ItemId; name: string } | undefined {
  const drop = boss.guaranteedDrops.find(
    (entry) => entry.firstKillOnly && entry.kind === 'item' && entry.itemId,
  )
  if (!drop?.itemId) return undefined
  return {
    itemId: drop.itemId,
    name: registry.items.get(drop.itemId)?.name ?? '旧信物',
  }
}

export function worldBossEnemyStats(
  boss: WorldBossDefinition,
  registry: ContentRegistry,
  state: GameSaveData,
): CombatStats[] {
  const scale = worldBossKillScale(state, boss)
  const encounter = registry.encounters.get(boss.encounterId)
  return (encounter?.enemyIds ?? []).flatMap((enemyId) => {
    const enemy = registry.enemies.get(enemyId)
    return enemy ? [scaleStats(enemy.stats, scale)] : []
  })
}