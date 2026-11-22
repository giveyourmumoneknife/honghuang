import type { RealmId, RealmStage } from '@/types/common'

/**
 * 境界对根底三维的放大。以凡人为 1，金丹圆满约 5.36 倍；
 * 每一大境约 ×1.6，境内每层约 ×1.15–1.2，接近云隐“大境陡、小层缓”的曲线。
 */
export const REALM_STAGE_SCALE: Record<RealmId, Record<RealmStage, number>> = {
  mortal: { 1: 1, 2: 1.15, 3: 1.32 },
  qi_refining: { 1: 1.6, 2: 1.84, 3: 2.12 },
  foundation: { 1: 2.55, 2: 2.93, 3: 3.37 },
  golden_core: { 1: 4.05, 2: 4.66, 3: 5.36 },
}

export const REALM_ORDER: RealmId[] = [
  'mortal',
  'qi_refining',
  'foundation',
  'golden_core',
]

export function realmCombatScale(realm: RealmId, stage: RealmStage): number {
  return REALM_STAGE_SCALE[realm]?.[stage] ?? 1
}

/**
 * 历练敌势分六阶：一阶凡俗杂兵，六阶劫末法身。
 * 同一片地域可以同时存在低阶与高阶遭遇，由境界决定实际能遇到哪一档。
 */
export const ENCOUNTER_TIER_LABELS: Record<number, string> = {
  1: '一阶',
  2: '二阶',
  3: '三阶',
  4: '四阶',
  5: '五阶',
  6: '六阶',
}

export const MAX_ENCOUNTER_TIER = 6

/** 玩家当前境界对应的历练敌势基准阶。 */
export const PLAYER_COMBAT_TIER: Record<RealmId, Record<RealmStage, number>> = {
  mortal: { 1: 1, 2: 1, 3: 2 },
  qi_refining: { 1: 2, 2: 3, 3: 3 },
  foundation: { 1: 4, 2: 4, 3: 5 },
  golden_core: { 1: 5, 2: 6, 3: 6 },
}

export function playerCombatTier(realm: RealmId, stage: RealmStage): number {
  return PLAYER_COMBAT_TIER[realm]?.[stage] ?? 1
}

/** 历练允许遇到比自身基准高一阶的敌手；更高一阶的凶地留给下一层境界。 */
export const TRAINING_TIER_MARGIN = 1

export function trainingTierCap(realm: RealmId, stage: RealmStage): number {
  return Math.min(
    MAX_ENCOUNTER_TIER,
    playerCombatTier(realm, stage) + TRAINING_TIER_MARGIN,
  )
}

export function encounterTierLabel(tier: number | undefined): string {
  return ENCOUNTER_TIER_LABELS[tier ?? 1] ?? ENCOUNTER_TIER_LABELS[1]
}

/** 防御减伤：def / (def + atk × K)，上限 75%。Yunyin 同口径，避免高防后完全免伤。 */
export const MITIGATION_K = 1.15
export const MITIGATION_CAP = 0.75