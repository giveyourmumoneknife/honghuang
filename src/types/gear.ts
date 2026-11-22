import type { Element } from './common'
import type { CombatStats } from './content'

export type GearSlot =
  | 'weapon'
  | 'armor'
  | 'head'
  | 'cloak'
  | 'waist'
  | 'boots'
  | 'neck'
  | 'ring'
  | 'accessory'
  | 'talisman'

export interface CombatMods {
  /** 造成伤害时按比例回复气血。 */
  lifesteal: number
  /** 无视目标一部分护体。 */
  armorPen: number
  /** 暴击时的额外倍率。 */
  critDamage: number
  /** 闪避一次攻势的几率。 */
  dodge: number
  /** 受击时反弹一部分伤害。 */
  thorns: number
  /** 每回合自行恢复的最大气血比例。 */
  regen: number
  /** 命中时有几率留下持续灼烧，按攻势比例结算。 */
  burn: number
  /** 争斗开始时自带的护体回合数。 */
  shieldStart: number
  /** 气血低于四成时的攻势加成。 */
  lowHpAttack: number
  /** 一切造成的伤害加成。 */
  elementBonus: number
  /** 一切受到的伤害减免。 */
  elementResist: number
  /** 行旅进度加成。 */
  travel: number
  /** 主修与历练的修为加成。 */
  cultivation: number
  /** 历练战利品的额外掉落几率。 */
  dropRate: number
  /** 受治疗效果的加成。 */
  healing: number
  /** 争斗首轮的身法加成。 */
  firstStrike: number
}

export type CombatModKey = keyof CombatMods

export interface GearAffix {
  templateId: string
  label: string
  description: string
  /** 词条品阶，1 至 5。 */
  tier: number
  /** 数值；百分比词条以整数百分数记录。 */
  value: number
}

export interface GeneratedGear {
  id: string
  name: string
  slot: GearSlot
  /** 器物等阶，1 至 6。 */
  tier: number
  /** 品相，0 为凡品，末位为道品。 */
  quality: number
  element?: Element
  baseStats: CombatStats
  affixes: GearAffix[]
  /** 淬炼次数，0 至 10。 */
  upgrade: number
  /** 被封印的词条下标；洗练不会动它们。 */
  sealed: number[]
  locked: boolean
  setId?: string
  sourceRegionId?: string
  createdAtMonths: number
  note?: string
}

export interface GearSetThreshold {
  count: number
  text: string
  stats?: CombatStats
  mods?: Partial<CombatMods>
}

export interface GearSetRule {
  id: string
  name: string
  size: number
  description: string
  thresholds: GearSetThreshold[]
}

export interface GearDropOptions {
  tier: number
  qualityBonus?: number
  regionId?: string
  forceSetId?: string
  slot?: GearSlot
}