import type { EncounterId, RegionId, ResourceKey } from '@/types/common'
import type { GameSaveData } from '@/types/state'
import type { TrainingMode, TrainingReport, TrainingSession } from '@/types/training'
import type { ContentRegistry } from '@/data/registry'
import { trainingTierCap } from './balance'
import { calendarFromMonths } from './time'
import { applyBattleBodyTemper } from './bodyActions'
import { computeCharacterSheet } from './character'
import { evaluateRequirements } from './conditions'
import { resolveEncounter } from './combat'
import { grantGeneratedGear, gearPower, qualityTier } from './gear'
import { findSecretRealm, SECRET_REALM_LIMITS, secretRealmChance } from './secretRealm'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'

export interface TrainingModeDefinition {
  id: TrainingMode
  name: string
  short: string
  description: string
  months: number
  battleInterval: number
  maxBattles: number
  enemyScale: number
  rewardScale: number
  qualityBonus: number
  dropChance: number
  travelCost: number
  stoneCost: number
  tone: string
}

export const TRAINING_DURATION_MONTHS = 6

export const TRAINING_MODES: TrainingModeDefinition[] = [
  {
    id: 'steady',
    name: '稳健历练',
    short: '稳',
    description: '沿旧潮路巡行，避开凶名太盛的镇地之物。遇敌则战，不追不逐，收获平稳，伤势也轻。',
    months: TRAINING_DURATION_MONTHS,
    battleInterval: 0.5,
    maxBattles: 12,
    enemyScale: 0.85,
    rewardScale: 0.7,
    qualityBonus: 0,
    dropChance: 0.38,
    travelCost: 8,
    stoneCost: 8,
    tone: 'border-line text-muted',
  },
  {
    id: 'deep',
    name: '深入险地',
    short: '深',
    description: '往地脉与兽迹更深处走。争斗更密；若本境有镇地凶物，每四场交手它便会循声现身，带回的器物件相也更好。',
    months: TRAINING_DURATION_MONTHS,
    battleInterval: 0.4,
    maxBattles: 15,
    enemyScale: 1,
    rewardScale: 1,
    qualityBonus: 0.35,
    dropChance: 0.55,
    travelCost: 12,
    stoneCost: 14,
    tone: 'border-gold/45 text-gold-deep',
  },
  {
    id: 'perilous',
    name: '涉险磨砺',
    short: '险',
    description: '专挑凶名最盛之处。若本境有镇地凶物，它会以本相现身；敌手额外得到地气加持，器纹也更容易在生死间显形。',
    months: TRAINING_DURATION_MONTHS,
    battleInterval: 0.3,
    maxBattles: 20,
    enemyScale: 1.32,
    rewardScale: 1.35,
    qualityBonus: 0.85,
    dropChance: 0.72,
    travelCost: 16,
    stoneCost: 22,
    tone: 'border-cinnabar/45 text-cinnabar',
  },
]

const MODE_BY_ID = new Map(TRAINING_MODES.map((mode) => [mode.id, mode]))

export function trainingMode(mode: TrainingMode): TrainingModeDefinition {
  return MODE_BY_ID.get(mode) ?? TRAINING_MODES[0]
}

export interface TrainingActionResult {
  ok: boolean
  state: GameSaveData
  message: string
}

function fail(state: GameSaveData, message: string): TrainingActionResult {
  return { ok: false, state, message }
}

function succeed(state: GameSaveData, message: string): TrainingActionResult {
  return { ok: true, state, message }
}

export function trainingEncounters(
  state: GameSaveData,
  regionId: RegionId,
  registry: ContentRegistry,
): EncounterId[] {
  const region = registry.regions.get(regionId)
  if (!region) return []
  const active = state.campaign.currentEra
  if (!region.eraIds.includes(active)) return []
  const tierCap = trainingTierCap(state.player.realm, state.player.stage)
  return (region.encounterIds ?? []).filter((id) => {
    const encounter = registry.encounters.get(id)
    if (!encounter) return false
    if ((encounter.tier ?? 1) > tierCap) return false
    return evaluateRequirements(state, encounter.requirements).ok
  })
}

export function startTraining(
  state: GameSaveData,
  regionId: RegionId,
  modeId: TrainingMode,
  registry: ContentRegistry,
): TrainingActionResult {
  if (state.campaign.ending) return fail(state, '此劫已定，潮路不再为你展开。')
  if (state.player.training) return fail(state, '你已经在历练途中，先收束这一程。')
  const region = registry.regions.get(regionId)
  const regionState = state.campaign.world.regions[regionId]
  if (!region || !regionState?.unlocked) return fail(state, '这片地方还没有接上你的潮路。')
  if (trainingEncounters(state, regionId, registry).length === 0) {
    return fail(state, `${region.name}眼下没有与你境界相称的敌手。`)
  }
  const mode = trainingMode(modeId)
  if ((state.player.resources.spirit_stones ?? 0) < mode.stoneCost) {
    return fail(state, `置办这一程还差灵石 ${mode.stoneCost}。`)
  }
  if (state.idle.travelProgress < mode.travelCost) {
    return fail(
      state,
      `潮路尚短：需要 ${mode.travelCost} 点行旅，当前只有 ${Math.floor(state.idle.travelProgress)} 点。`,
    )
  }

  const next = cloneGameSaveData(state)
  next.player.resources.spirit_stones =
    (next.player.resources.spirit_stones ?? 0) - mode.stoneCost
  next.idle.travelProgress = Math.max(0, next.idle.travelProgress - mode.travelCost)
  const start = next.clock.elapsedMonths
  const session: TrainingSession = {
    id: `training.${Math.round(start)}.${next.player.gearSeq}`,
    regionId,
    mode: mode.id,
    startedMonths: start,
    endsMonths: start + mode.months,
    nextBattleMonths: start + mode.battleInterval,
    wins: 0,
    losses: 0,
    battles: 0,
    cultivation: 0,
    resources: {},
    gearIds: [],
    log: [
      {
        months: start,
        text: `你收起洞府牌印，沿${region.name}的旧潮路启程。${mode.name}，预计六个月后回返。`,
        tone: 'fate',
      },
    ],
  }
  next.player.training = session
  return succeed(
    next,
    `已启程：${region.name}·${mode.name}。此后潮路上会自行遇敌，六个月内可随时收束。`,
  )
}

function finishTraining(
  state: GameSaveData,
  registry: ContentRegistry,
  earlyStopped: boolean,
  endedMonths = state.clock.elapsedMonths,
): GameSaveData {
  const session = state.player.training
  if (!session) return state
  const region = registry.regions.get(session.regionId)
  const mode = trainingMode(session.mode)
  const gearNames = session.gearIds.flatMap((id) => {
    const gear = state.player.gearInventory.find((entry) => entry.id === id)
    return gear ? [`${gear.name}（${qualityTier(gear.quality).name}）`] : []
  })
  const best = session.bestGearId
    ? state.player.gearInventory.find((gear) => gear.id === session.bestGearId)
    : undefined
  const fought = session.wins + session.losses
  const monthsSpent = Math.max(1, Math.round(endedMonths - session.startedMonths))
  const opening = earlyStopped
    ? `提前收束了${region?.name ?? '旧地'}的历练（历时${monthsSpent}月）`
    : `${region?.name ?? '旧地'}历练${monthsSpent}月`
  const foundRealms = session.secretRealms ?? []
  const realmNote = foundRealms.length > 0 ? `，秘境 ${foundRealms.length} 处` : ''
  const summary = `${opening}：交手 ${fought} 场，胜 ${session.wins}、负 ${session.losses}，修为 +${Math.round(session.cultivation)}${realmNote}。`
  const report: TrainingReport = {
    id: session.id,
    regionId: session.regionId,
    regionName: region?.name ?? '旧地',
    mode: session.mode,
    startedMonths: session.startedMonths,
    endedMonths,
    wins: session.wins,
    losses: session.losses,
    cultivation: session.cultivation,
    resources: session.resources,
    gearNames,
    bestGearName: best ? `${best.name}（${qualityTier(best.quality).name}）` : undefined,
    summary,
    earlyStopped,
    secretRealms: foundRealms.length > 0 ? [...foundRealms] : undefined,
  }
  state.player.training = undefined
  state.player.trainingReports = [...state.player.trainingReports, report].slice(-8)
  state.chronicle.push({
    id: `chronicle:training:${session.id}`,
    eraId: state.campaign.currentEra,
    title: `${region?.name ?? '旧地'}历练`,
    text: `${summary}${gearNames.length ? `带回 ${gearNames.length} 件器物。` : '没有带回新的器物。'}${foundRealms.length ? `途中误入${foundRealms.map((entry) => `「${entry.name}」`).join('、')}。` : ''}${mode.id === 'perilous' ? '这一路并不安稳。' : ''}`,
    year: calendarFromMonths(endedMonths).year,
  })
  return state
}

export function stopTraining(state: GameSaveData, registry: ContentRegistry): TrainingActionResult {
  if (!state.player.training) return fail(state, '眼下没有正在进行的历练。')
  const next = finishTraining(cloneGameSaveData(state), registry, true)
  const report = next.player.trainingReports[next.player.trainingReports.length - 1]
  return succeed(next, report?.summary ?? '历练已收束。')
}

function appendLog(session: TrainingSession, months: number, text: string, tone: TrainingSession['log'][number]['tone']): void {
  session.log.push({ months, text, tone })
  if (session.log.length > 14) session.log = session.log.slice(-14)
}

function pickEncounter(
  encounters: EncounterId[],
  rng: Rng,
  index: number,
): EncounterId | undefined {
  if (encounters.length === 0) return undefined
  return encounters[index % encounters.length] ?? rng.pick(encounters)
}

function encounterIsBoss(id: EncounterId, registry: ContentRegistry): boolean {
  return registry.encounters.get(id)?.tags?.includes('boss') ?? false
}

export function advanceTraining(
  state: GameSaveData,
  months: number,
  registry: ContentRegistry,
): GameSaveData {
  if (!state.player.training) return state
  if (!Number.isFinite(months) || months <= 0) return state
  let next = state
  const target = state.clock.elapsedMonths
  let guard = 0

  while (next.player.training && guard < 64) {
    guard += 1
    let session: TrainingSession | undefined = next.player.training
    if (!session) break
    const mode = trainingMode(session.mode)
    const region = registry.regions.get(session.regionId)
    const encounters = trainingEncounters(next, session.regionId, registry)
    if (!region || encounters.length === 0) {
      next = finishTraining(next, registry, true)
      break
    }

    if (session.battles >= mode.maxBattles) {
      next = finishTraining(
        next,
        registry,
        false,
        Math.min(target, session.endsMonths),
      )
      break
    }

    const battleLimit = Math.min(target, session.endsMonths)
    if (session.nextBattleMonths > battleLimit) {
      if (target >= session.endsMonths) {
        next = finishTraining(next, registry, false, session.endsMonths)
      }
      break
    }

    const sheet = computeCharacterSheet(next, registry)
    if (next.player.health < sheet.maxHealth * 0.35) {
      const before = next.player.health
      next = cloneGameSaveData(next)
      session = next.player.training
      if (!session) break
      next.player.health = Math.min(
        sheet.maxHealth,
        next.player.health + Math.round(sheet.maxHealth * 0.22),
      )
      appendLog(
        session,
        session.nextBattleMonths,
        `气血未复，你在${region.name}的旧驿站停了一日。气血 ${Math.ceil(before)} → ${Math.ceil(next.player.health)}。`,
        'plain',
      )
      session.nextBattleMonths += 1
      continue
    }

    const rng = Rng.fromState(next.rng)
    const elite = (session.battles + 1) % 4 === 0
    const bossPool = encounters.filter((id) => encounterIsBoss(id, registry))
    const normalPool = encounters.filter((id) => !encounterIsBoss(id, registry))
    const pool =
      mode.id !== 'steady' && elite && bossPool.length > 0
        ? bossPool
        : normalPool.length > 0
          ? normalPool
          : encounters
    const encounterId = pickEncounter(pool, rng, session.battles)
    next.rng = rng.getState()
    if (!encounterId) {
      next = finishTraining(next, registry, true)
      break
    }

    const battleMonth = session.nextBattleMonths
    const pendingId = `training.${session.id}.${session.battles}`
    next = cloneGameSaveData(next)
    session = next.player.training
    if (!session) break
    next.eventRuntime.pendingEncounters.push({
      id: pendingId,
      encounterId,
      fleeAllowed: false,
      createdAtMonths: battleMonth,
    })
    const beforeCultivation = next.player.cultivation
    const beforeResources = { ...next.player.resources }
    const result = resolveEncounter(next, encounterId, 'steady', registry, {
      enemyScale: mode.enemyScale * (elite ? 1.22 : 1),
      rewardScale: mode.rewardScale,
      training: true,
      suppressGearDrop: true,
    })
    if (!result.ok) {
      appendLog(session, battleMonth, result.message, 'bad')
      next = finishTraining(next, registry, true)
      break
    }
    next = result.state
    session = next.player.training
    if (!session) break

    session.battles += 1
    const cultivationGain = Math.max(0, next.player.cultivation - beforeCultivation)
    session.cultivation += cultivationGain
    const bodyGain = applyBattleBodyTemper(next, cultivationGain, registry)
    for (const key of Object.keys(next.player.resources) as ResourceKey[]) {
      const gained = (next.player.resources[key] ?? 0) - (beforeResources[key] ?? 0)
      if (gained > 0) {
        session.resources[key] = (session.resources[key] ?? 0) + gained
      }
    }
    const encounterName = result.encounter?.name ?? '无名敌手'
    if (result.victory) {
      session.wins += 1
    } else {
      session.losses += 1
    }
    const healthPercent = Math.round((next.player.health / result.playerMaxHealth) * 100)
    appendLog(
      session,
      battleMonth,
      `${elite ? '强敌' : ''}${result.victory ? '胜' : '负'}${encounterName}：交手 ${result.rounds} 合，气血余 ${healthPercent}%${cultivationGain > 0 ? `，修为 +${Math.round(cultivationGain)}` : ''}。`,
      result.victory ? 'good' : 'bad',
    )
    if (bodyGain > 0) {
      appendLog(session, battleMonth, `筋骨记住了这一战，体魄淬炼 +${Math.round(bodyGain)}。`, 'fate')
    }

    const dropRng = Rng.fromState(next.rng)
    const dropChance = Math.min(
      0.95,
      mode.dropChance +
        Math.max(0, computeCharacterSheet(next, registry).mods.dropRate) +
        (result.victory ? 0.08 : 0) +
        (elite ? 0.2 : 0),
    )
    if (result.victory && dropRng.chance(dropChance)) {
      const danger = region.danger
      const tierCap = trainingTierCap(next.player.realm, next.player.stage)
      const tier = Math.max(
        1,
        Math.min(
          tierCap,
          Math.round(1 + danger * 0.65 + dropRng.nextInt(-1, 2) + (elite ? 1 : 0)),
        ),
      )
      const gear = grantGeneratedGear(next, dropRng, {
        tier,
        qualityBonus: mode.qualityBonus + (elite ? 0.55 : 0),
        regionId: session.regionId,
      })
      session.gearIds.push(gear.id)
      const qualityName = qualityTier(gear.quality).name
      appendLog(session, battleMonth, `拾得器物 · ${gear.name}（${qualityName}）。`, 'fate')
      const activeSession = session
      const previousBest = activeSession.bestGearId
        ? next.player.gearInventory.find((entry) => entry.id === activeSession.bestGearId)
        : undefined
      if (!previousBest || gearPower(gear) > gearPower(previousBest)) {
        activeSession.bestGearId = gear.id
      }
    }

    const foundRealms = session.secretRealms ?? []
    if (
      foundRealms.length < SECRET_REALM_LIMITS[session.mode] &&
      dropRng.chance(secretRealmChance(session.mode, region.danger))
    ) {
      const outcome = findSecretRealm(next, {
        regionId: session.regionId,
        tierCap: trainingTierCap(next.player.realm, next.player.stage),
        exclude: new Set(foundRealms.map((entry) => entry.id)),
        rng: dropRng,
        registry,
      })
      if (outcome) {
        next = outcome.state
        const active = next.player.training
        if (!active) break
        session = active
        active.secretRealms = [...(active.secretRealms ?? []), outcome.entry]
        active.gearIds.push(...outcome.gearIds)
        if (outcome.bestGearId) {
          const previousBest = active.bestGearId
            ? next.player.gearInventory.find((entry) => entry.id === active.bestGearId)
            : undefined
          const foundGear = next.player.gearInventory.find(
            (entry) => entry.id === outcome.bestGearId,
          )
          if (
            foundGear &&
            (!previousBest || gearPower(foundGear) > gearPower(previousBest))
          ) {
            active.bestGearId = foundGear.id
          }
        }
        appendLog(
          active,
          battleMonth,
          `误入秘境「${outcome.entry.name}」：${outcome.entry.rewardText}。`,
          'fate',
        )
      }
    }
    next.rng = dropRng.getState()
    session.nextBattleMonths += mode.battleInterval
  }

  return next
}

export function trainingProgress(session: TrainingSession, currentMonths: number): number {
  const total = Math.max(1, session.endsMonths - session.startedMonths)
  return Math.max(0, Math.min(1, (currentMonths - session.startedMonths) / total))
}