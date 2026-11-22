import type { CombatStats } from '@/types/content'
import type { ContentRegistry } from '@/data/registry'
import type { BloodlineDefinition, CharacterPhysiqueDefinition } from '@/types/content'
import type { CombatMods } from '@/types/gear'
import type { BodyPath, GameSaveData, PlayerBloodlineState } from '@/types/state'
import type { RealmId } from '@/types/common'
import { REALM_ORDER } from './balance'

export const BODY_MAX_STAGE = 5
export const BODY_STAGE_THRESHOLDS = [0, 120, 360, 800, 1500, 2600] as const
export const BLOODLINE_MAX_PURITY = 100
export const BLOODLINE_PURITY_GATES = [0, 20, 40, 60, 78, 92] as const

export interface BodyStageDefinition {
  stage: number
  name: string
  description: string
  threshold: number
  lawRank: number
  stats: CombatStats
}

export const BODY_STAGES: BodyStageDefinition[] = [
  {
    stage: 0,
    name: '凡躯',
    description: '气血只够撑起一日三餐。淬体尚未真正开始，但每一分积蓄都算数。',
    threshold: 0,
    lawRank: 0,
    stats: {},
  },
  {
    stage: 1,
    name: '淬皮',
    description: '皮膜被灵机反复洗过，寻常刀石难伤。你开始能在寒气里睡稳。',
    threshold: 120,
    lawRank: 2,
    stats: { health: 30, defense: 3 },
  },
  {
    stage: 2,
    name: '易骨',
    description: '旧骨被一点点换掉。走路时脚下更沉，出手时骨头会先于念头发力。',
    threshold: 360,
    lawRank: 4,
    stats: { health: 70, defense: 7, attack: 3 },
  },
  {
    stage: 3,
    name: '换血',
    description: '血被淬得像温热的铁水。伤口收口更快，久战之后也不容易手抖。',
    threshold: 800,
    lawRank: 6,
    stats: { health: 140, defense: 13, attack: 7, speed: 2 },
  },
  {
    stage: 4,
    name: '金身',
    description: '骨血皮膜终于连成一体。寻常法宝落在身上，只留下一声闷响。',
    threshold: 1500,
    lawRank: 8,
    stats: { health: 240, defense: 21, attack: 13, speed: 4, spirit: 4 },
  },
  {
    stage: 5,
    name: '不漏',
    description: '气血不再从毛孔里无端散失。你站着不动，也像一口扣紧的钟。',
    threshold: 2600,
    lawRank: 10,
    stats: { health: 400, defense: 32, attack: 22, speed: 7, spirit: 9 },
  },
]

export interface BodyPathDefinition {
  id: BodyPath
  name: string
  tagline: string
  description: string
  lawMultiplier: number
  bodyRatio: number
}

export const BODY_PATHS: BodyPathDefinition[] = [
  {
    id: 'law',
    name: '法修',
    tagline: '以法为主，以体为辅',
    description: '修为进境最快，淬体只取一成余韵。适合专心冲境、把体魄当作底子的人。',
    lawMultiplier: 1.1,
    bodyRatio: 0.12,
  },
  {
    id: 'dual',
    name: '法体双修',
    tagline: '法与体彼此借力',
    description: '修行略慢，却能把四成五的修为转成淬体。法与体的境界越接近，破境越稳。',
    lawMultiplier: 0.95,
    bodyRatio: 0.45,
  },
  {
    id: 'body',
    name: '体修',
    tagline: '以体证道，以力破法',
    description: '修为进境最慢，淬体最猛。体魄会先于境界成长，但法境突破会更吃力。',
    lawMultiplier: 0.75,
    bodyRatio: 1,
  },
]

export type BodyBalanceKind =
  | 'harmony'
  | 'lawLean'
  | 'bodyLean'
  | 'lawFlood'
  | 'bodyFlood'

export interface BodyBalanceInfo {
  lawRank: number
  bodyRank: number
  gap: number
  kind: BodyBalanceKind
  label: string
  hint: string
  cultivationMultiplier: number
  bodyGainMultiplier: number
  bodyBreakthroughBonus: number
  lawBreakthroughBonus: number
}

export function lawRankOf(realm: RealmId, stage: number): number {
  const realmIndex = Math.max(0, REALM_ORDER.indexOf(realm))
  const realmStage = Math.max(1, Math.min(3, Math.round(stage)))
  return realmIndex * 3 + realmStage - 1
}

export function bodyStageDefinition(stage: number): BodyStageDefinition {
  const index = Math.max(0, Math.min(BODY_MAX_STAGE, Math.round(stage)))
  return BODY_STAGES[index]
}

export function bodyBalanceInfo(
  body: { stage: number },
  realm: RealmId,
  realmStage: number,
): BodyBalanceInfo {
  const lawRank = lawRankOf(realm, realmStage)
  const bodyRank = bodyStageDefinition(body.stage).lawRank
  const gap = lawRank - bodyRank

  if (Math.abs(gap) <= 1) {
    return {
      lawRank,
      bodyRank,
      gap,
      kind: 'harmony',
      label: '法体相济',
      hint: '法与体彼此托底：修行、淬体与两种破境都略有加成。',
      cultivationMultiplier: 1.05,
      bodyGainMultiplier: 1.08,
      bodyBreakthroughBonus: 0.03,
      lawBreakthroughBonus: 0.02,
    }
  }
  if (gap >= 3) {
    return {
      lawRank,
      bodyRank,
      gap,
      kind: 'lawFlood',
      label: '法盛体虚',
      hint: '法境远高于体魄：修行更快，但淬体迟滞，破体也更险。',
      cultivationMultiplier: 1.12,
      bodyGainMultiplier: 0.75,
      bodyBreakthroughBonus: -0.08,
      lawBreakthroughBonus: 0.04,
    }
  }
  if (gap <= -3) {
    return {
      lawRank,
      bodyRank,
      gap,
      kind: 'bodyFlood',
      label: '体盛法滞',
      hint: '体魄远强于法境：淬体更猛，但灵机运转被厚重气血拖慢。',
      cultivationMultiplier: 0.88,
      bodyGainMultiplier: 1.35,
      bodyBreakthroughBonus: 0.08,
      lawBreakthroughBonus: -0.06,
    }
  }
  if (gap > 0) {
    return {
      lawRank,
      bodyRank,
      gap,
      kind: 'lawLean',
      label: '法意偏盛',
      hint: '法境略高于体魄。修行稍顺，淬体略缓；再拉近一层便可法体相济。',
      cultivationMultiplier: 1.03,
      bodyGainMultiplier: 0.92,
      bodyBreakthroughBonus: -0.03,
      lawBreakthroughBonus: 0.01,
    }
  }
  return {
    lawRank,
    bodyRank,
    gap,
    kind: 'bodyLean',
    label: '体意偏盛',
    hint: '体魄略强于法境。淬体稍顺，修行略慢；再补一层法境便可相济。',
    cultivationMultiplier: 0.96,
    bodyGainMultiplier: 1.12,
    bodyBreakthroughBonus: 0.03,
    lawBreakthroughBonus: -0.02,
  }
}

export function bodyPathDefinition(path: BodyPath): BodyPathDefinition {
  return BODY_PATHS.find((entry) => entry.id === path) ?? BODY_PATHS[1]
}

export interface BodyProgressInfo {
  stage: BodyStageDefinition
  next?: BodyStageDefinition
  temper: number
  threshold: number
  progress: number
  ready: boolean
  atMax: boolean
}

export function bodyProgressInfo(temper: number, stage: number): BodyProgressInfo {
  const current = bodyStageDefinition(stage)
  const atMax = current.stage >= BODY_MAX_STAGE
  const next = atMax ? undefined : BODY_STAGES[current.stage + 1]
  const floor = current.threshold
  const ceiling = next?.threshold ?? current.threshold
  const progress = atMax
    ? 1
    : Math.max(0, Math.min(1, (temper - floor) / Math.max(1, ceiling - floor)))
  return {
    stage: current,
    next,
    temper,
    threshold: ceiling,
    progress,
    ready: !atMax && temper >= ceiling,
    atMax,
  }
}

export function bloodlineStageDefinition(
  bloodline: BloodlineDefinition,
  stage: number,
): BloodlineDefinition['stages'][number] {
  const index = Math.max(0, Math.min(bloodline.stages.length - 1, Math.round(stage)))
  return bloodline.stages[index]
}

export function activeBloodlineDefinition(
  state: GameSaveData,
  registry: ContentRegistry,
): BloodlineDefinition | undefined {
  const active = state.player.bloodline
  if (!active) return undefined
  return registry.bloodlines.get(active.id)
}

export function bloodlineNextStage(
  bloodline: BloodlineDefinition,
  currentStage: number,
): BloodlineDefinition['stages'][number] | undefined {
  return bloodline.stages[currentStage + 1]
}

export function bloodlineSkillForCombat(
  bloodline: BloodlineDefinition,
  stage: number,
): BloodlineDefinition['skill'] | undefined {
  if (stage < bloodline.skillUnlockStage) return undefined
  const scale = 1 + Math.max(0, stage - bloodline.skillUnlockStage) * 0.12
  return {
    ...bloodline.skill,
    name: `${bloodline.skill.name}·${bloodlineStageDefinition(bloodline, stage).name}`,
    multiplier: Math.round(bloodline.skill.multiplier * scale * 10) / 10,
    power: Math.round((bloodline.skill.power ?? 0) * scale),
  }
}

export interface PhysiqueAwakeningView {
  stage: number
  name: string
  description: string
  unlocked: boolean
  stats?: CombatStats
  mods?: Partial<CombatMods>
}

export interface PhysiqueContribution {
  stats: Required<CombatStats>
  mods: CombatMods
  sources: Array<{ id: string; label: string; stats: CombatStats }>
  awakenings: PhysiqueAwakeningView[]
}

const ZERO_STATS = (): Required<CombatStats> => ({
  health: 0,
  attack: 0,
  defense: 0,
  speed: 0,
  crit: 0,
  spirit: 0,
})

const ZERO_MODS = (): CombatMods => ({
  lifesteal: 0,
  armorPen: 0,
  critDamage: 0,
  dodge: 0,
  thorns: 0,
  regen: 0,
  burn: 0,
  shieldStart: 0,
  lowHpAttack: 0,
  elementBonus: 0,
  elementResist: 0,
  travel: 0,
  cultivation: 0,
  dropRate: 0,
  healing: 0,
  firstStrike: 0,
})

function addStats(target: Required<CombatStats>, stats?: CombatStats): void {
  if (!stats) return
  target.health += stats.health ?? 0
  target.attack += stats.attack ?? 0
  target.defense += stats.defense ?? 0
  target.speed += stats.speed ?? 0
  target.crit += stats.crit ?? 0
  target.spirit += stats.spirit ?? 0
}

function addMods(target: CombatMods, mods?: Partial<CombatMods>): void {
  if (!mods) return
  for (const key of Object.keys(target) as Array<keyof CombatMods>) {
    target[key] += mods[key] ?? 0
  }
}

export function physiqueContribution(
  physique: CharacterPhysiqueDefinition | undefined,
  bodyStage: number,
): PhysiqueContribution {
  const stats = ZERO_STATS()
  const mods = ZERO_MODS()
  const sources: PhysiqueContribution['sources'] = []
  if (!physique) return { stats, mods, sources, awakenings: [] }

  addStats(stats, physique.stats)
  if (physique.stats) {
    sources.push({ id: physique.id, label: `体质 · ${physique.name}`, stats: physique.stats })
  }
  const awakenings = physique.awakenings.map((awakening) => {
    const unlocked = bodyStage >= awakening.stage
    if (unlocked) {
      addStats(stats, awakening.stats)
      addMods(mods, awakening.mods)
      if (awakening.stats) {
        sources.push({
          id: `${physique.id}.${awakening.stage}`,
          label: `觉醒 · ${awakening.name}`,
          stats: awakening.stats,
        })
      }
    }
    return {
      stage: awakening.stage,
      name: awakening.name,
      description: awakening.description,
      unlocked,
      stats: awakening.stats,
      mods: awakening.mods,
    }
  })
  return { stats, mods, sources, awakenings }
}

export interface BodyStatContribution {
  stats: Required<CombatStats>
  source?: { id: string; label: string; stats: CombatStats }
}

export function bodyStatContribution(bodyStage: number): BodyStatContribution {
  const stage = bodyStageDefinition(bodyStage)
  const stats = ZERO_STATS()
  addStats(stats, stage.stats)
  return {
    stats,
    source:
      stage.stage > 0
        ? { id: `body.stage.${stage.stage}`, label: `体魄 · ${stage.name}`, stats: stage.stats }
        : undefined,
  }
}

export interface BloodlineContribution {
  stats: Required<CombatStats>
  mods: CombatMods
  sources: Array<{ id: string; label: string; stats: CombatStats }>
}

export function bloodlineContribution(
  bloodline: BloodlineDefinition | undefined,
  active: PlayerBloodlineState | undefined,
): BloodlineContribution {
  const stats = ZERO_STATS()
  const mods = ZERO_MODS()
  const sources: BloodlineContribution['sources'] = []
  if (!bloodline || !active) return { stats, mods, sources }

  for (const stage of bloodline.stages) {
    if (stage.stage === 0 || stage.stage > active.stage) continue
    addStats(stats, stage.stats)
    addMods(mods, stage.mods)
    if (stage.stats) {
      sources.push({
        id: `${bloodline.id}.${stage.stage}`,
        label: `血脉 · ${stage.name}`,
        stats: stage.stats,
      })
    }
  }
  return { stats, mods, sources }
}

export function bodyTemperFromCultivation(
  cultivationGain: number,
  multiplier: number,
): number {
  if (!Number.isFinite(cultivationGain) || cultivationGain <= 0) return 0
  return Math.max(0, cultivationGain * Math.max(0, multiplier))
}

export function bodyTemperFromBattle(
  cultivationReward: number,
  multiplier: number,
): number {
  return Math.max(0, bodyTemperFromCultivation(cultivationReward, multiplier) * 0.55)
}