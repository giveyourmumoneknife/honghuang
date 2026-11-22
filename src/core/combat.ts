import type { CombatStance, Element, EncounterId, ItemId, ResourceKey } from '@/types/common'
import type {
  CombatSkillDefinition,
  CombatStats,
  EncounterDefinition,
  EncounterReward,
  EnemyDefinition,
} from '@/types/content'
import type { GameSaveData } from '@/types/state'
import type { CombatMods } from '@/types/gear'
import type { ContentRegistry } from '@/data/registry'
import { MITIGATION_CAP, MITIGATION_K } from './balance'
import { applyCaveRaidOutcome, caveDefenseBonus } from './cave'
import { computeCharacterSheet } from './character'
import { activeBloodlineDefinition, bloodlineSkillForCombat } from './body'
import { activeDivineDefinitions } from './divine'
import { daoCombatRules } from './dao'
import { applyEffects } from './effects'
import { grantGeneratedGear, qualityTier } from './gear'
import { RESOURCE_LABELS } from './labels'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'

export type CombatTone = 'plain' | 'good' | 'bad' | 'skill' | 'fate'

export interface CombatLogLine {
  round: number
  text: string
  tone: CombatTone
}

export interface CombatResult {
  ok: boolean
  victory: boolean
  fled: boolean
  state: GameSaveData
  encounter?: EncounterDefinition
  rounds: number
  log: CombatLogLine[]
  message: string
  rewards: string[]
  playerHealth: number
  playerMaxHealth: number
}

export const STANCE_LABELS: Record<CombatStance, string> = {
  steady: '守中',
  aggressive: '抢攻',
  guarded: '固守',
}

export const STANCE_DESCRIPTIONS: Record<CombatStance, string> = {
  steady: '攻守如常，不冒进也不退让。',
  aggressive: '攻势更盛，但护体灵机变薄。',
  guarded: '先护住经脉，再等敌手露出破绽。',
}

const ELEMENT_ADVANTAGE: Partial<Record<Element, Element[]>> = {
  water: ['fire'],
  fire: ['metal', 'wood'],
  metal: ['wood'],
  wood: ['earth'],
  earth: ['water'],
  thunder: ['water'],
  ice: ['fire'],
  wind: ['earth'],
}

function elementMultiplier(attacker?: Element, defender?: Element): number {
  if (!attacker || !defender) return 1
  if (ELEMENT_ADVANTAGE[attacker]?.includes(defender)) return 1.25
  if (ELEMENT_ADVANTAGE[defender]?.includes(attacker)) return 0.85
  return 1
}

interface Fighter {
  id: string
  name: string
  title: string
  element?: Element
  traits: EnemyDefinition['traits']
  skills: CombatSkillDefinition[]
  maxHealth: number
  health: number
  attack: number
  defense: number
  speed: number
  crit: number
  cooldowns: Record<string, number>
  stunned: number
  shield: number
  dots: Array<{ source: string; damage: number; rounds: number }>
  defeatReward?: EncounterReward
  mods?: CombatMods
  /** 道途 · 先声：争斗首回合伤害加成。 */
  firstRoundDamageBonus?: number
  /** 道途 · 浴血：击杀时按最大气血比例回复。 */
  killHealPercent?: number
  /** 道则 · 向死而生：每回合燃烧的最大气血比例。 */
  roundHpLoss?: number
  /** 道则 · 向死而生：此战无法退走。 */
  cannotFlee?: boolean
}

export interface EncounterResolutionOptions {
  enemyScale?: number
  rewardScale?: number
  training?: boolean
  suppressGearDrop?: boolean
}

function createSheetStats(stats: CombatStats, fallbackHealth: number): Fighter {
  return {
    id: 'player',
    name: '你',
    title: '散修',
    traits: [],
    skills: [],
    maxHealth: fallbackHealth,
    health: fallbackHealth,
    attack: stats.attack ?? 6,
    defense: stats.defense ?? 3,
    speed: stats.speed ?? 5,
    crit: stats.crit ?? 5,
    cooldowns: {},
    stunned: 0,
    shield: 0,
    dots: [],
  }
}

function createEnemyFighter(enemy: EnemyDefinition, index: number): Fighter {
  return {
    id: `${enemy.id}#${index}`,
    name: enemy.name,
    title: enemy.title,
    element: enemy.element,
    traits: [...enemy.traits],
    skills: enemy.skills,
    maxHealth: Math.max(1, enemy.stats.health ?? 40),
    health: Math.max(1, enemy.stats.health ?? 40),
    attack: Math.max(1, enemy.stats.attack ?? 6),
    defense: Math.max(0, enemy.stats.defense ?? 2),
    speed: Math.max(1, enemy.stats.speed ?? 4),
    crit: Math.max(0, enemy.stats.crit ?? 3),
    cooldowns: {},
    stunned: 0,
    shield: 0,
    dots: [],
    defeatReward: enemy.reward,
  }
}

function pickSkill(fighter: Fighter, round: number): CombatSkillDefinition | undefined {
  return fighter.skills.find((skill) => (fighter.cooldowns[skill.id] ?? 0) <= round)
}

function tickDots(fighter: Fighter, log: CombatLogLine[], round: number): void {
  for (const dot of fighter.dots) {
    dot.rounds -= 1
    fighter.health = Math.max(0, fighter.health - dot.damage)
    log.push({
      round,
      text: `${fighter.name}受${dot.source}侵蚀，气血 -${dot.damage}。`,
      tone: fighter.id === 'player' ? 'bad' : 'good',
    })
  }
  fighter.dots = fighter.dots.filter((dot) => dot.rounds > 0 && fighter.health > 0)
}

function applySkillEffect(
  attacker: Fighter,
  defender: Fighter,
  skill: CombatSkillDefinition,
  damage: number,
  log: CombatLogLine[],
  round: number,
  rng: Rng,
): void {
  if (!skill.effect) return
  const power = skill.power ?? 4
  switch (skill.effect) {
    case 'burn':
      defender.dots.push({ source: '灼火', damage: Math.max(1, Math.round(power * 0.8)), rounds: 3 })
      log.push({ round, text: `${defender.name}身上留下灼痕，火势不会立刻熄灭。`, tone: 'skill' })
      break
    case 'poison':
      defender.dots.push({ source: '浊毒', damage: Math.max(1, Math.round(power * 0.6)), rounds: 4 })
      log.push({ round, text: `${defender.name}的动作慢了半拍，毒息已经入脉。`, tone: 'skill' })
      break
    case 'stun':
      defender.stunned = Math.max(defender.stunned, 1)
      log.push({ round, text: `${defender.name}被震得短暂失神，下一手慢了一线。`, tone: 'skill' })
      break
    case 'heal': {
      const rawHeal = Math.round(attacker.maxHealth * 0.08 + power)
      const heal = Math.min(
        attacker.maxHealth - attacker.health,
        Math.round(rawHeal * (1 + (attacker.mods?.healing ?? 0))),
      )
      attacker.health += heal
      log.push({ round, text: `${attacker.name}借势调息，气血 +${heal}。`, tone: 'good' })
      break
    }
    case 'shield':
      attacker.shield = Math.max(attacker.shield, 1)
      log.push({ round, text: `${attacker.name}身周潮气收拢，下一轮所受伤害更少。`, tone: 'good' })
      break
    case 'drain': {
      const heal = Math.max(1, Math.round(damage * 0.25))
      attacker.health = Math.min(attacker.maxHealth, attacker.health + heal)
      log.push({ round, text: `${attacker.name}从这一击中夺回一缕灵机，气血 +${heal}。`, tone: 'skill' })
      break
    }
    case 'execute': {
      if (defender.health <= 0) break
      const threshold = 0.4
      if (defender.health / defender.maxHealth > threshold) {
        log.push({ round, text: `${defender.name}气机未散，「${skill.name}」只留下一道浅痕。`, tone: 'plain' })
        break
      }
      const extra = Math.max(
        1,
        Math.round(defender.maxHealth * (0.04 + power * 0.005)),
      )
      defender.health = Math.max(0, defender.health - extra)
      log.push({
        round,
        text: `${defender.name}的气血已乱，「${skill.name}」顺势收走其名，追加 ${extra} 点伤势。`,
        tone: attacker.id === 'player' ? 'skill' : 'bad',
      })
      break
    }
    default:
      break
  }
  if (rng.next() < 0.35) {
    // Keep a silent draw so the stream advances even when no extra effect fires.
  }
}

function resolveAttack(
  attacker: Fighter,
  defender: Fighter,
  stance: CombatStance,
  isPlayer: boolean,
  round: number,
  rng: Rng,
  log: CombatLogLine[],
): void {
  const skill = isPlayer || attacker.skills.length > 0 ? pickSkill(attacker, round) : undefined
  if (skill) attacker.cooldowns[skill.id] = round + skill.cooldown

  const stanceAttack =
    isPlayer && stance === 'aggressive' ? 1.25 : isPlayer && stance === 'guarded' ? 0.82 : 1
  const stanceDefense =
    isPlayer && stance === 'guarded' ? 1.35 : isPlayer && stance === 'aggressive' ? 0.8 : 1
  const attackerMods = attacker.mods
  const defenderMods = defender.mods
  const berserk = attacker.traits.includes('berserk') && attacker.health < attacker.maxHealth * 0.5 ? 1.3 : 1
  const spiritEater = attacker.traits.includes('spirit_eater') ? 1.12 : 1
  const desperate =
    attacker.health < attacker.maxHealth * 0.4 ? 1 + (attackerMods?.lowHpAttack ?? 0) : 1
  const tempo =
    isPlayer && round === 1 ? 1 + Math.max(0, attacker.firstRoundDamageBonus ?? 0) : 1
  const attackBase =
    attacker.attack * stanceAttack * berserk * spiritEater * desperate * tempo
  const attackValue = attackBase * (skill?.multiplier ?? 1)
  const defenseValue =
    defender.defense *
    (isPlayer ? stanceDefense : 1) *
    (1 - Math.min(0.6, Math.max(0, attackerMods?.armorPen ?? 0)))
  const mitigation = Math.min(
    MITIGATION_CAP,
    defenseValue / (defenseValue + attackBase * MITIGATION_K),
  )
  let damage = Math.max(1, Math.round(attackValue * (1 - mitigation)))
  damage = Math.round(
    damage *
      elementMultiplier(attacker.element, defender.element) *
      (1 + (attackerMods?.elementBonus ?? 0)) *
      (1 - Math.min(0.55, Math.max(0, defenderMods?.elementResist ?? 0))),
  )

  if (defender.traits.includes('armored')) damage = Math.max(1, Math.round(damage * 0.78))
  const dodgeChance = Math.min(0.35, Math.max(0, defenderMods?.dodge ?? 0))
  if (
    (defender.traits.includes('swift') && rng.chance(0.1)) ||
    (dodgeChance > 0 && rng.chance(dodgeChance))
  ) {
    log.push({
      round,
      text: `${defender.name}在最后一瞬换了身形，这一击落在空处。`,
      tone: 'bad',
    })
    return
  }

  const critChance = Math.min(0.65, Math.max(0, attacker.crit / 100))
  const crit = rng.chance(critChance)
  if (crit) damage = Math.round(damage * (1.8 + Math.max(0, attackerMods?.critDamage ?? 0)))

  if (defender.shield > 0) {
    defender.shield -= 1
    damage = Math.max(1, Math.round(damage * 0.55))
    log.push({ round, text: `${defender.name}的护体灵机挡去了大半力道。`, tone: 'plain' })
  }

  defender.health = Math.max(0, defender.health - damage)
  const skillName = skill ? `「${skill.name}」` : ''
  log.push({
    round,
    text: `${attacker.name}${skillName}${crit ? '击中要害' : '出手'}，${defender.name}气血 -${damage}。`,
    tone: isPlayer ? (crit ? 'skill' : 'good') : 'bad',
  })

  const lifesteal = Math.max(0, attackerMods?.lifesteal ?? 0)
  if (lifesteal > 0 && damage > 0) {
    const heal = Math.min(
      attacker.maxHealth - attacker.health,
      Math.max(1, Math.round(damage * lifesteal)),
    )
    if (heal > 0) {
      attacker.health += heal
      log.push({ round, text: `${attacker.name}自伤处夺回一缕气血，+${heal}。`, tone: 'skill' })
    }
  }

  const killHeal = Math.max(0, attacker.killHealPercent ?? 0)
  if (killHeal > 0 && defender.health <= 0 && attacker.health > 0) {
    const heal = Math.min(
      attacker.maxHealth - attacker.health,
      Math.max(1, Math.round(attacker.maxHealth * killHeal)),
    )
    if (heal > 0) {
      attacker.health += heal
      log.push({ round, text: `${attacker.name}踏过对手的气机，气血 +${heal}。`, tone: 'skill' })
    }
  }

  const thorns = Math.max(0, defenderMods?.thorns ?? 0)
  if (thorns > 0 && damage > 0) {
    const reflect = Math.max(1, Math.round(damage * thorns))
    attacker.health = Math.max(0, attacker.health - reflect)
    log.push({ round, text: `${defender.name}周身一震，反震 ${reflect} 点气血。`, tone: 'plain' })
  }

  const burn = Math.max(0, attackerMods?.burn ?? 0)
  if (burn > 0 && damage > 0 && rng.chance(0.25)) {
    defender.dots.push({
      source: '器焰',
      damage: Math.max(1, Math.round(attacker.attack * burn)),
      rounds: 3,
    })
    log.push({ round, text: `${defender.name}的伤处留下器焰，火气未散。`, tone: 'skill' })
  }

  if (skill && damage > 0) {
    applySkillEffect(attacker, defender, skill, damage, log, round, rng)
  }

  if (attacker.traits.includes('venom') && defender.health > 0) {
    defender.dots.push({
      source: '毒牙',
      damage: Math.max(1, Math.round(attacker.attack * 0.25)),
      rounds: 3,
    })
  }
  if (attacker.traits.includes('regenerating')) {
    const heal = Math.max(1, Math.round(attacker.maxHealth * 0.04))
    attacker.health = Math.min(attacker.maxHealth, attacker.health + heal)
  }
}

function addReward(
  target: GameSaveData,
  reward: EncounterReward | undefined,
  lines: string[],
  registry: ContentRegistry,
  scale = 1,
): void {
  if (!reward) return
  const factor = Number.isFinite(scale) && scale > 0 ? scale : 1
  if (reward.cultivation && reward.cultivation > 0) {
    const gained = Math.max(1, Math.round(reward.cultivation * factor))
    target.player.cultivation += gained
    lines.push(`修为 +${gained}`)
  }
  if (reward.resources) {
    for (const [key, amount] of Object.entries(reward.resources)) {
      if (typeof amount !== 'number' || amount <= 0) continue
      const gained = Math.max(1, Math.round(amount * factor))
      target.player.resources[key as ResourceKey] =
        (target.player.resources[key as ResourceKey] ?? 0) + gained
      lines.push(`${RESOURCE_LABELS[key as ResourceKey] ?? '物料'} +${gained}`)
    }
  }
  if (reward.items) {
    for (const entry of reward.items) {
      const count = Math.max(1, Math.floor(entry.count ?? 1))
      target.player.inventory[entry.itemId as ItemId] =
        (target.player.inventory[entry.itemId as ItemId] ?? 0) + count
      const name = registry.getItem(entry.itemId)?.name ?? '无名之物'
      lines.push(`${name} ×${count}`)
    }
  }
}

export function resolveEncounter(
  state: GameSaveData,
  encounterId: EncounterId,
  stance: CombatStance,
  registry: ContentRegistry,
  options: EncounterResolutionOptions = {},
): CombatResult {
  const encounter = registry.encounters.get(encounterId)
  const sheet = computeCharacterSheet(state, registry)
  if (!encounter) {
    return {
      ok: false,
      victory: false,
      fled: false,
      state,
      rounds: 0,
      log: [],
      message: '这场遭遇已经散入潮声。',
      rewards: [],
      playerHealth: state.player.health,
      playerMaxHealth: sheet.maxHealth,
    }
  }

  const pendingIndex = state.eventRuntime.pendingEncounters.findIndex(
    (entry) => entry.encounterId === encounterId,
  )
  if (pendingIndex < 0) {
    return {
      ok: false,
      victory: false,
      fled: false,
      state,
      encounter,
      rounds: 0,
      log: [],
      message: '此处没有等你出手的东西。',
      rewards: [],
      playerHealth: state.player.health,
      playerMaxHealth: sheet.maxHealth,
    }
  }

  const pending = state.eventRuntime.pendingEncounters[pendingIndex]
  const isCaveRaid = pending.source === 'cave_raid'
  let next = cloneGameSaveData(state)
  next.eventRuntime.pendingEncounters.splice(pendingIndex, 1)
  const rng = Rng.fromState(next.rng)

  const player = createSheetStats(
    {
      health: sheet.maxHealth,
      attack: sheet.attack,
      defense: sheet.defense,
      speed: sheet.speed,
      crit: sheet.crit,
      spirit: sheet.spirit,
    },
    sheet.maxHealth,
  )
  player.element = sheet.element
  player.mods = sheet.mods
  const daoRules = daoCombatRules(state)
  player.firstRoundDamageBonus = daoRules.firstRoundDamageBonus
  player.killHealPercent = daoRules.killHealPercent
  player.roundHpLoss = daoRules.roundHpLoss
  player.cannotFlee = daoRules.cannotFlee
  player.speed += Math.max(0, Math.round(sheet.mods.firstStrike))
  player.shield = Math.min(3, Math.max(0, Math.round(sheet.mods.shieldStart)))
  player.health = Math.max(1, Math.min(sheet.maxHealth, state.player.health))
  const raidDefense = isCaveRaid ? caveDefenseBonus(state, registry) : 0
  player.defense += raidDefense
  for (const techniqueId of next.player.equippedTechniqueIds ?? []) {
    const technique = registry.techniques.get(techniqueId)
    if (technique?.skill) player.skills.push(technique.skill)
  }
  for (const ability of activeDivineDefinitions(next, registry)) {
    player.skills.push(ability.skill)
  }
  const bloodline = activeBloodlineDefinition(next, registry)
  const bloodlineState = next.player.bloodline
  if (bloodline && bloodlineState) {
    const skill = bloodlineSkillForCombat(bloodline, bloodlineState.stage)
    if (skill) player.skills.push(skill)
  }

  const enemyScale = Math.max(0.5, options.enemyScale ?? 1)
  const enemies = encounter.enemyIds
    .map((enemyId, index) => {
      const definition = registry.enemies.get(enemyId)
      if (!definition) return undefined
      const fighter = createEnemyFighter(definition, index)
      if (enemyScale !== 1) {
        fighter.maxHealth = Math.max(1, Math.round(fighter.maxHealth * enemyScale))
        fighter.health = fighter.maxHealth
        fighter.attack = Math.max(1, Math.round(fighter.attack * enemyScale))
        fighter.defense = Math.max(0, Math.round(fighter.defense * enemyScale))
        fighter.crit = Math.round(fighter.crit * enemyScale)
      }
      return fighter
    })
    .filter((entry): entry is Fighter => entry !== undefined)

  if (enemies.length === 0) {
    return {
      ok: false,
      victory: false,
      fled: false,
      state,
      encounter,
      rounds: 0,
      log: [],
      message: '遭遇中没有任何敌手，像是一场被风吹散的误会。',
      rewards: [],
      playerHealth: player.health,
      playerMaxHealth: sheet.maxHealth,
    }
  }

  const log: CombatLogLine[] = [
    {
      round: 0,
      text: `${encounter.name}。你选了${STANCE_LABELS[stance]}。`,
      tone: 'fate',
    },
    ...(raidDefense > 0
      ? [
          {
            round: 0,
            text: `洞府回澜与守夜人替你压住阵脚，护体 +${raidDefense}。`,
            tone: 'good' as const,
          },
        ]
      : []),
    ...(player.shield > 0
      ? [
          {
            round: 0,
            text: `符器先行，身周已有一层护体灵机（${player.shield} 回合）。`,
            tone: 'good' as const,
          },
        ]
      : []),
    ...(daoRules.cannotFlee
      ? [
          {
            round: 0,
            text: '道则「向死而生」压住了退路。此战只能向前，气血会随每一息燃去。',
            tone: 'fate' as const,
          },
        ]
      : []),
  ]
  let round = 1
  let victory = false
  const maxRounds = 18

  while (round <= maxRounds) {
    const aliveEnemies = enemies.filter((enemy) => enemy.health > 0)
    if (aliveEnemies.length === 0) {
      victory = true
      break
    }
    if (player.health <= 0) break

    tickDots(player, log, round)
    for (const enemy of aliveEnemies) tickDots(enemy, log, round)
    if (player.health <= 0) break

    const regen = Math.max(0, sheet.mods.regen)
    if (regen > 0 && player.health < player.maxHealth) {
      const heal = Math.min(
        player.maxHealth - player.health,
        Math.max(1, Math.round(player.maxHealth * regen)),
      )
      player.health += heal
      log.push({ round, text: `器纹自行流转，气血 +${heal}。`, tone: 'good' })
    }

    const order: Array<{ fighter: Fighter; isPlayer: boolean }> = [
      { fighter: player, isPlayer: true },
      ...aliveEnemies.map((enemy) => ({ fighter: enemy, isPlayer: false })),
    ].sort((left, right) => right.fighter.speed - left.fighter.speed)

    for (const entry of order) {
      if (player.health <= 0) break
      const living = enemies.filter((enemy) => enemy.health > 0)
      if (living.length === 0) break
      if (entry.fighter.health <= 0) continue
      if (entry.fighter.stunned > 0) {
        entry.fighter.stunned -= 1
        log.push({ round, text: `${entry.fighter.name}仍在失神，没能出手。`, tone: 'plain' })
        continue
      }
      if (entry.isPlayer) {
        resolveAttack(player, living[0], stance, true, round, rng, log)
      } else {
        resolveAttack(entry.fighter, player, stance, false, round, rng, log)
      }
    }

    const stillFighting = enemies.some((enemy) => enemy.health > 0)
    if (daoRules.roundHpLoss > 0 && stillFighting && player.health > 0) {
      const loss = Math.max(1, Math.round(player.maxHealth * daoRules.roundHpLoss))
      player.health = Math.max(0, player.health - loss)
      log.push({
        round,
        text: `向死而生的道则烧去 ${loss} 点气血。你还在向前。`,
        tone: 'bad',
      })
    }

    round += 1
  }

  victory = enemies.every((enemy) => enemy.health <= 0)
  next.rng = rng.getState()
  const rewards: string[] = []

  if (victory) {
    next.player.health = Math.max(1, player.health)
    next = applyEffects(next, encounter.victoryEffects, { sourceEventId: undefined })
    const rewardScale = options.rewardScale ?? 1
    addReward(next, encounter.reward, rewards, registry, rewardScale)
    for (const enemy of enemies) {
      addReward(next, enemy.defeatReward, rewards, registry, rewardScale)
    }
    if (!options.suppressGearDrop) {
      const danger = encounter.regionId
        ? (registry.regions.get(encounter.regionId)?.danger ?? 2)
        : 2
      const dropChance = Math.min(
        0.85,
        0.12 + danger * 0.05 + Math.max(0, sheet.mods.dropRate),
      )
      if (rng.chance(dropChance)) {
        const tier = Math.max(
          1,
          Math.min(6, Math.round(1 + danger * 0.65 + rng.nextInt(-1, 2))),
        )
        const gear = grantGeneratedGear(next, rng, {
          tier,
          regionId: encounter.regionId,
        })
        rewards.push(`器物 · ${gear.name}（${qualityTier(gear.quality).name}）`)
      }
    }
    next.rng = rng.getState()
    if (encounter.regionId) {
      const region = next.campaign.world.regions[encounter.regionId]
      if (region) region.flags[`encounter_cleared.${encounter.id}`] = true
    }
    if (isCaveRaid) {
      next = applyCaveRaidOutcome(next, true, registry)
      log.push({
        round,
        text: '洞府守住了。你把最后一具敌影拖出洞口，潮水很快抹平了所有脚印。',
        tone: 'good',
      })
    }
    log.push({
      round,
      text: `${encounter.name}落定。你从这一场争斗里活了下来。`,
      tone: 'fate',
    })
    return {
      ok: true,
      victory: true,
      fled: false,
      state: next,
      encounter,
      rounds: round - 1,
      log,
      message: `胜：${encounter.name}`,
      rewards,
      playerHealth: next.player.health,
      playerMaxHealth: sheet.maxHealth,
    }
  }

  const exhausted = player.health > 0 && pending.fleeAllowed && !daoRules.cannotFlee
  if (exhausted) {
    next.player.health = Math.max(1, Math.round(sheet.maxHealth * 0.5))
    log.push({
      round,
      text: '你还有余力，却已经看不清胜机。趁着潮声未歇，退了。',
      tone: 'fate',
    })
    return {
      ok: true,
      victory: false,
      fled: true,
      state: next,
      encounter,
      rounds: round - 1,
      log,
      message: `未能分出胜负：${encounter.name}`,
      rewards: [],
      playerHealth: next.player.health,
      playerMaxHealth: sheet.maxHealth,
    }
  }

  if (options.training) {
    next.player.health = Math.max(1, Math.round(sheet.maxHealth * 0.3))
    log.push({
      round,
      text: '你被同伴拖出战场。这一场没能打完，但命还在，潮路也还在。',
      tone: 'fate',
    })
    return {
      ok: true,
      victory: false,
      fled: true,
      state: next,
      encounter,
      rounds: round - 1,
      log,
      message: `历练受挫：${encounter.name}`,
      rewards: [],
      playerHealth: next.player.health,
      playerMaxHealth: sheet.maxHealth,
    }
  }

  next.player.health = Math.max(1, Math.round(sheet.maxHealth * 0.22))
  next = applyEffects(next, encounter.defeatEffects, { sourceEventId: undefined })
  if (isCaveRaid) {
    next = applyCaveRaidOutcome(next, false, registry)
    log.push({
      round,
      text: '你倒在洞口。醒来时，洞中少了一些东西，灵脉也浊了一线。',
      tone: 'bad',
    })
  }
  log.push({
    round,
    text: '眼前一黑。最后留下的是潮声，还是自己的心跳，你已经分不清。',
    tone: 'fate',
  })
  return {
    ok: true,
    victory: false,
    fled: false,
    state: next,
    encounter,
    rounds: round - 1,
    log,
    message: `败：${encounter.name}`,
    rewards: [],
    playerHealth: next.player.health,
    playerMaxHealth: sheet.maxHealth,
  }
}

export function fleeEncounter(
  state: GameSaveData,
  encounterId: EncounterId,
): CombatResult {
  const index = state.eventRuntime.pendingEncounters.findIndex(
    (entry) => entry.encounterId === encounterId,
  )
  if (index < 0) {
    return {
      ok: false,
      victory: false,
      fled: false,
      state,
      rounds: 0,
      log: [],
      message: '此时并没有缠住你的东西。',
      rewards: [],
      playerHealth: state.player.health,
      playerMaxHealth: state.player.health,
    }
  }
  const pending = state.eventRuntime.pendingEncounters[index]
  if (!pending.fleeAllowed) {
    return {
      ok: false,
      victory: false,
      fled: false,
      state,
      rounds: 0,
      log: [],
      message: '退路已经被封死，只能应战。',
      rewards: [],
      playerHealth: state.player.health,
      playerMaxHealth: state.player.health,
    }
  }
  if (daoCombatRules(state).cannotFlee) {
    return {
      ok: false,
      victory: false,
      fled: false,
      state,
      rounds: 0,
      log: [],
      message: '「向死而生」压住了你的退路。这一战只能打到有人倒下。',
      rewards: [],
      playerHealth: state.player.health,
      playerMaxHealth: state.player.health,
    }
  }
  const next = cloneGameSaveData(state)
  next.eventRuntime.pendingEncounters.splice(index, 1)
  next.idle.travelProgress = Math.max(0, next.idle.travelProgress - 2)
  return {
    ok: true,
    victory: false,
    fled: true,
    state: next,
    rounds: 0,
    log: [
      {
        round: 0,
        text: '你没有回头。身后的动静渐渐被潮声盖住。',
        tone: 'fate',
      },
    ],
    message: '已离开这场遭遇。',
    rewards: [],
    playerHealth: next.player.health,
    playerMaxHealth: next.player.health,
  }
}
