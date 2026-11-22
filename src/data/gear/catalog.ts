import type { Element } from '@/types/common'
import type { CombatStats } from '@/types/content'
import type {
  CombatModKey,
  CombatMods,
  GearAffix,
  GearSetRule,
  GearSlot,
} from '@/types/gear'

export interface GearQualityTier {
  id: string
  name: string
  multiplier: number
  affixMin: number
  affixMax: number
  weight: number
  tone: string
}

export const GEAR_QUALITY_TIERS: GearQualityTier[] = [
  {
    id: 'quality.mortal',
    name: '凡品',
    multiplier: 1.05,
    affixMin: 0,
    affixMax: 1,
    weight: 38,
    tone: 'text-muted border-line bg-white/20',
  },
  {
    id: 'quality.fine',
    name: '良品',
    multiplier: 1.28,
    affixMin: 1,
    affixMax: 2,
    weight: 25,
    tone: 'text-jade border-jade/30 bg-jade-soft',
  },
  {
    id: 'quality.superior',
    name: '上品',
    multiplier: 1.55,
    affixMin: 2,
    affixMax: 3,
    weight: 17,
    tone: 'text-[#356a70] border-[#5f9097]/40 bg-[#e7f0ef]',
  },
  {
    id: 'quality.exquisite',
    name: '极品',
    multiplier: 1.88,
    affixMin: 3,
    affixMax: 4,
    weight: 10,
    tone: 'text-gold-deep border-gold/40 bg-gold/[0.08]',
  },
  {
    id: 'quality.spirit',
    name: '灵品',
    multiplier: 2.25,
    affixMin: 4,
    affixMax: 5,
    weight: 6,
    tone: 'text-cinnabar border-cinnabar/35 bg-cinnabar-soft',
  },
  {
    id: 'quality.mystic',
    name: '玄品',
    multiplier: 2.7,
    affixMin: 5,
    affixMax: 6,
    weight: 3,
    tone: 'text-[#674a76] border-[#9273a3]/50 bg-[#efe9f2]',
  },
  {
    id: 'quality.earth',
    name: '地品',
    multiplier: 3.2,
    affixMin: 6,
    affixMax: 7,
    weight: 1.6,
    tone: 'text-gold-deep border-gold/50 bg-gold/[0.1]',
  },
  {
    id: 'quality.heaven',
    name: '天品',
    multiplier: 3.8,
    affixMin: 7,
    affixMax: 8,
    weight: 0.8,
    tone: 'text-cinnabar border-cinnabar/50 bg-cinnabar-soft',
  },
  {
    id: 'quality.immortal',
    name: '仙品',
    multiplier: 4.5,
    affixMin: 8,
    affixMax: 9,
    weight: 0.3,
    tone: 'text-cinnabar border-cinnabar/60 bg-cinnabar/[0.08]',
  },
  {
    id: 'quality.sage',
    name: '圣品',
    multiplier: 5.3,
    affixMin: 9,
    affixMax: 10,
    weight: 0.12,
    tone: 'text-[#763b69] border-[#a36793]/55 bg-[#f2e8ef]',
  },
  {
    id: 'quality.divine',
    name: '神品',
    multiplier: 6.2,
    affixMin: 10,
    affixMax: 11,
    weight: 0.05,
    tone: 'text-gold-deep border-gold/60 bg-gold/[0.12]',
  },
  {
    id: 'quality.dao',
    name: '道品',
    multiplier: 7.4,
    affixMin: 11,
    affixMax: 12,
    weight: 0.02,
    tone: 'text-ink border-gold/60 bg-gold/[0.15]',
  },
]

export const GEAR_TIER_NAMES: string[] = [
  '凡铁',
  '精铁',
  '灵胎',
  '玄胚',
  '地魄',
  '天工',
]

export const GEAR_TIER_PREFIXES: string[] = [
  '旧制',
  '新淬',
  '灵纹',
  '玄铸',
  '地脉',
  '天工',
]

export const GEAR_SLOTS: GearSlot[] = [
  'weapon',
  'armor',
  'head',
  'cloak',
  'waist',
  'boots',
  'neck',
  'ring',
  'accessory',
  'talisman',
]

export const GEAR_SLOT_LABELS: Record<GearSlot, string> = {
  weapon: '兵刃',
  armor: '护体',
  head: '冠巾',
  cloak: '披风',
  waist: '束带',
  boots: '履足',
  neck: '颈饰',
  ring: '指环',
  accessory: '佩饰',
  talisman: '符箓',
}

export const GEAR_ELEMENT_LABELS: Record<Element, string> = {
  metal: '金',
  wood: '木',
  water: '水',
  fire: '火',
  earth: '土',
  thunder: '雷',
  ice: '冰',
  wind: '风',
}

const NAME_POOLS: Record<GearSlot, string[]> = {
  weapon: ['断潮刀', '听雷剑', '沉沙戟', '照夜枪', '裂云斧', '引潮刺', '青冥钩', '烬海刃'],
  armor: ['旧鳞衣', '青岩甲', '流火袍', '沉云裘', '星纹甲', '寂水衣', '玄藤铠', '照骨衣'],
  head: ['望潮冠', '束星巾', '焚纹额', '守脉盔', '云履簪', '无相笠', '听风帻', '沉玉冠'],
  cloak: ['听潮氅', '烬羽披', '镇岳裘', '星巡帔', '云游衣', '无相幕', '霜纹披', '归脉羽'],
  waist: ['束潮带', '焚纹绦', '负山带', '星砂腰', '旧藤束', '无名扣', '听风绦', '沉玉带'],
  boots: ['踏浪履', '逐风靴', '石纹履', '烬行靴', '云程履', '潜渊靴', '渡雾鞋', '星踏履'],
  neck: ['潮音坠', '烬心玦', '守脉璎', '星巡链', '梦回环', '无名锁', '听霜珠', '归脉魄'],
  ring: ['断潮环', '余烬戒', '镇脉指', '星巡扣', '云生环', '空名戒', '霜纹环', '沉渊指'],
  accessory: ['潮生佩', '烬心环', '镇岳珏', '星巡坠', '梦回铃', '无名玦', '听霜琐', '归脉印'],
  talisman: ['引潮符', '护火篆', '镇脉箓', '星巡符', '照心印', '劫余笺', '沉渊简', '避尘牌'],
}

export const GEAR_ELEMENTS: Element[] = [
  'metal',
  'wood',
  'water',
  'fire',
  'earth',
  'thunder',
  'ice',
  'wind',
]

export interface GearAffixTemplate {
  id: string
  label: string
  kind: 'stat' | 'mod'
  stat?: keyof CombatStats
  mod?: CombatModKey
  /** 词条一阶、器一阶时的基础值。 */
  base: number
  /** 每提高一阶词条增加的值。 */
  perTier: number
  /** 每提高一阶器物增加的值。 */
  gearScale: number
  percent?: boolean
  minGearTier?: number
  slots?: GearSlot[]
  weight: number
  describe: (value: number) => string
}

const percentText = (label: string) => (value: number) => `${label} ${value}%`

export const GEAR_AFFIX_TEMPLATES: GearAffixTemplate[] = [
  {
    id: 'gear.affix.sharp',
    label: '锋锐',
    kind: 'stat',
    stat: 'attack',
    base: 2,
    perTier: 1.5,
    gearScale: 0.8,
    slots: ['weapon', 'accessory', 'ring'],
    weight: 16,
    describe: (value) => `攻势 +${value}`,
  },
  {
    id: 'gear.affix.sink',
    label: '沉势',
    kind: 'stat',
    stat: 'defense',
    base: 1.2,
    perTier: 1,
    gearScale: 0.6,
    slots: ['armor', 'talisman', 'boots', 'cloak', 'waist'],
    weight: 15,
    describe: (value) => `护体 +${value}`,
  },
  {
    id: 'gear.affix.tidebreath',
    label: '潮息',
    kind: 'stat',
    stat: 'health',
    base: 5,
    perTier: 4,
    gearScale: 2.4,
    slots: ['armor', 'head', 'accessory', 'cloak', 'waist', 'neck'],
    weight: 16,
    describe: (value) => `气血 +${value}`,
  },
  {
    id: 'gear.affix.lightstep',
    label: '轻身',
    kind: 'stat',
    stat: 'speed',
    base: 0.8,
    perTier: 0.7,
    gearScale: 0.4,
    slots: ['boots', 'head', 'accessory', 'waist', 'ring'],
    weight: 13,
    describe: (value) => `身法 +${value}`,
  },
  {
    id: 'gear.affix.keensight',
    label: '锐目',
    kind: 'stat',
    stat: 'crit',
    base: 0.8,
    perTier: 0.7,
    gearScale: 0.35,
    slots: ['weapon', 'head', 'accessory', 'neck', 'ring'],
    weight: 13,
    describe: (value) => `暴击 +${value}%`,
  },
  {
    id: 'gear.affix.stillmind',
    label: '定神',
    kind: 'stat',
    stat: 'spirit',
    base: 1,
    perTier: 0.9,
    gearScale: 0.45,
    slots: ['head', 'accessory', 'talisman', 'neck'],
    weight: 13,
    describe: (value) => `神识 +${value}`,
  },
  {
    id: 'gear.affix.bone',
    label: '厚骨',
    kind: 'stat',
    stat: 'health',
    base: 3,
    perTier: 2.5,
    gearScale: 2,
    slots: ['armor', 'boots', 'cloak', 'waist'],
    weight: 12,
    describe: (value) => `气血 +${value}`,
  },
  {
    id: 'gear.affix.chasewind',
    label: '逐风',
    kind: 'stat',
    stat: 'speed',
    base: 0.6,
    perTier: 0.55,
    gearScale: 0.3,
    slots: ['boots', 'weapon', 'ring'],
    weight: 11,
    describe: (value) => `身法 +${value}`,
  },
  {
    id: 'gear.affix.drinkblood',
    label: '饮血',
    kind: 'mod',
    mod: 'lifesteal',
    base: 2,
    perTier: 1,
    gearScale: 0.25,
    percent: true,
    minGearTier: 2,
    slots: ['weapon', 'talisman', 'ring'],
    weight: 9,
    describe: percentText('饮血'),
  },
  {
    id: 'gear.affix.armorbreak',
    label: '破甲',
    kind: 'mod',
    mod: 'armorPen',
    base: 3,
    perTier: 1.2,
    gearScale: 0.3,
    percent: true,
    minGearTier: 2,
    slots: ['weapon'],
    weight: 9,
    describe: percentText('破甲'),
  },
  {
    id: 'gear.affix.critheavy',
    label: '趁虚',
    kind: 'mod',
    mod: 'critDamage',
    base: 6,
    perTier: 3,
    gearScale: 0.5,
    percent: true,
    minGearTier: 2,
    slots: ['weapon', 'accessory', 'ring'],
    weight: 8,
    describe: percentText('暴击伤害'),
  },
  {
    id: 'gear.affix.dodge',
    label: '避影',
    kind: 'mod',
    mod: 'dodge',
    base: 2,
    perTier: 0.8,
    gearScale: 0.2,
    percent: true,
    minGearTier: 2,
    slots: ['boots', 'head', 'accessory', 'cloak', 'ring'],
    weight: 8,
    describe: percentText('闪避'),
  },
  {
    id: 'gear.affix.thorns',
    label: '反震',
    kind: 'mod',
    mod: 'thorns',
    base: 3,
    perTier: 1.2,
    gearScale: 0.3,
    percent: true,
    minGearTier: 2,
    slots: ['armor', 'talisman', 'cloak', 'waist'],
    weight: 8,
    describe: percentText('反震'),
  },
  {
    id: 'gear.affix.regen',
    label: '归元',
    kind: 'mod',
    mod: 'regen',
    base: 1,
    perTier: 0.5,
    gearScale: 0.12,
    percent: true,
    minGearTier: 3,
    slots: ['armor', 'talisman', 'cloak', 'neck'],
    weight: 6,
    describe: percentText('每回合回血'),
  },
  {
    id: 'gear.affix.ember',
    label: '余烬',
    kind: 'mod',
    mod: 'burn',
    base: 3,
    perTier: 1.4,
    gearScale: 0.35,
    percent: true,
    minGearTier: 2,
    slots: ['weapon', 'accessory', 'ring'],
    weight: 7,
    describe: percentText('灼痕威力'),
  },
  {
    id: 'gear.affix.guard',
    label: '守一',
    kind: 'mod',
    mod: 'shieldStart',
    base: 1,
    perTier: 0.3,
    gearScale: 0.06,
    minGearTier: 3,
    slots: ['talisman', 'armor', 'waist'],
    weight: 5,
    describe: (value) => `开场护体 ${Math.max(1, value)} 回合`,
  },
  {
    id: 'gear.affix.comeback',
    label: '逆势',
    kind: 'mod',
    mod: 'lowHpAttack',
    base: 5,
    perTier: 2.5,
    gearScale: 0.5,
    percent: true,
    minGearTier: 3,
    slots: ['weapon', 'armor', 'cloak'],
    weight: 5,
    describe: percentText('残血时攻势'),
  },
  {
    id: 'gear.affix.ride',
    label: '乘势',
    kind: 'mod',
    mod: 'elementBonus',
    base: 2,
    perTier: 1,
    gearScale: 0.25,
    percent: true,
    minGearTier: 2,
    slots: ['weapon', 'accessory', 'ring'],
    weight: 8,
    describe: percentText('伤害加成'),
  },
  {
    id: 'gear.affix.resolve',
    label: '化劲',
    kind: 'mod',
    mod: 'elementResist',
    base: 2,
    perTier: 1,
    gearScale: 0.25,
    percent: true,
    minGearTier: 2,
    slots: ['armor', 'talisman', 'boots', 'cloak', 'waist'],
    weight: 9,
    describe: percentText('受伤减免'),
  },
  {
    id: 'gear.affix.pathfinder',
    label: '识途',
    kind: 'mod',
    mod: 'travel',
    base: 4,
    perTier: 2,
    gearScale: 0.4,
    percent: true,
    slots: ['boots', 'talisman', 'cloak'],
    weight: 8,
    describe: percentText('行旅速度'),
  },
  {
    id: 'gear.affix.gather',
    label: '聚灵',
    kind: 'mod',
    mod: 'cultivation',
    base: 3,
    perTier: 1.5,
    gearScale: 0.3,
    percent: true,
    slots: ['head', 'talisman', 'neck'],
    weight: 7,
    describe: percentText('修为所得'),
  },
  {
    id: 'gear.affix.pickup',
    label: '拾遗',
    kind: 'mod',
    mod: 'dropRate',
    base: 5,
    perTier: 2.5,
    gearScale: 0,
    percent: true,
    slots: ['head', 'accessory', 'neck', 'ring'],
    weight: 7,
    describe: percentText('历练掉落'),
  },
  {
    id: 'gear.affix.spring',
    label: '回春',
    kind: 'mod',
    mod: 'healing',
    base: 4,
    perTier: 2,
    gearScale: 0.4,
    percent: true,
    slots: ['armor', 'talisman', 'accessory', 'cloak', 'neck'],
    weight: 7,
    describe: percentText('受治疗加成'),
  },
  {
    id: 'gear.affix.first',
    label: '先声',
    kind: 'mod',
    mod: 'firstStrike',
    base: 1,
    perTier: 0.5,
    gearScale: 0.1,
    minGearTier: 2,
    slots: ['boots', 'accessory', 'weapon', 'waist', 'ring'],
    weight: 6,
    describe: (value) => `首轮身法 +${value}`,
  },
  {
    id: 'gear.affix.firm',
    label: '磐根',
    kind: 'stat',
    stat: 'defense',
    base: 0.8,
    perTier: 0.8,
    gearScale: 0.5,
    slots: ['armor', 'boots', 'talisman', 'cloak', 'waist'],
    weight: 11,
    describe: (value) => `护体 +${value}`,
  },
  {
    id: 'gear.affix.soul',
    label: '澄心',
    kind: 'stat',
    stat: 'spirit',
    base: 0.8,
    perTier: 0.7,
    gearScale: 0.4,
    slots: ['head', 'talisman', 'neck'],
    weight: 10,
    describe: (value) => `神识 +${value}`,
  },
]

export const GEAR_AFFIX_BY_ID = new Map(
  GEAR_AFFIX_TEMPLATES.map((template) => [template.id, template]),
)

export const GEAR_SETS: GearSetRule[] = [
  {
    id: 'set.gear.tide',
    name: '听潮新制',
    size: 4,
    description: '散修依龙宫旧谱重铸的制式。四件齐备时，伤处会被潮气缓缓覆住。',
    thresholds: [
      { count: 2, text: '潮气初合：神识 +3', stats: { spirit: 3 } },
      {
        count: 4,
        text: '听潮成势：气血 +28、神识 +5，受伤减免 4%',
        stats: { health: 28, spirit: 5 },
        mods: { elementResist: 0.04 },
      },
    ],
  },
  {
    id: 'set.gear.ember',
    name: '余烬新制',
    size: 4,
    description: '以凤族外炉的余灰淬成。四件齐备时，伤口里的火星不会随潮水熄灭。',
    thresholds: [
      { count: 2, text: '余温初聚：攻势 +2', stats: { attack: 2 } },
      {
        count: 4,
        text: '余烬不熄：攻势 +4、暴击 +3%，命中附带灼痕',
        stats: { attack: 4, crit: 3 },
        mods: { burn: 0.05 },
      },
    ],
  },
  {
    id: 'set.gear.ridge',
    name: '守脉新制',
    size: 4,
    description: '麒麟崖守脉人换代后的甲式。四件齐备时，站位本身便是一道堤。',
    thresholds: [
      { count: 2, text: '地气初沉：护体 +2', stats: { defense: 2 } },
      {
        count: 4,
        text: '守脉不移：气血 +40、护体 +4，受击反震 5%',
        stats: { health: 40, defense: 4 },
        mods: { thorns: 0.05 },
      },
    ],
  },
  {
    id: 'set.gear.star',
    name: '星巡新制',
    size: 4,
    description: '仿星砂耳坠的纹路所制。四件齐备时，脚步会先于念头挪开半步。',
    thresholds: [
      { count: 2, text: '星纹轻转：身法 +2', stats: { speed: 2 } },
      {
        count: 4,
        text: '移星换位：身法 +3、暴击 +3%，闪避 4%',
        stats: { speed: 3, crit: 3 },
        mods: { dodge: 0.04 },
      },
    ],
  },
  {
    id: 'set.gear.void',
    name: '无相新制',
    size: 4,
    description: '没有来历的几件旧物，被同一种极淡的墨色连在一起。',
    thresholds: [
      { count: 2, text: '无相初定：神识 +3', stats: { spirit: 3 } },
      {
        count: 4,
        text: '名不可见：攻势 +4、神识 +4，破甲 6%',
        stats: { attack: 4, spirit: 4 },
        mods: { armorPen: 0.06 },
      },
    ],
  },
]

export const GEAR_SET_BY_ID = new Map(GEAR_SETS.map((rule) => [rule.id, rule]))

export function gearBaseName(slot: GearSlot, rng: { pick<T>(items: readonly T[]): T | undefined }): string {
  return rng.pick(NAME_POOLS[slot]) ?? '无名器'
}

export const GEAR_MOD_LABELS: Record<CombatModKey, string> = {
  lifesteal: '饮血',
  armorPen: '破甲',
  critDamage: '重击',
  dodge: '闪避',
  thorns: '反震',
  regen: '归元',
  burn: '余烬',
  shieldStart: '护体',
  lowHpAttack: '逆势',
  elementBonus: '乘势',
  elementResist: '化劲',
  travel: '识途',
  cultivation: '聚灵',
  dropRate: '拾遗',
  healing: '回春',
  firstStrike: '先声',
}

export function combatModText(mods: Partial<CombatMods>): string {
  const entries: string[] = []
  for (const [rawKey, value] of Object.entries(mods)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) continue
    const key = rawKey as CombatModKey
    if (key === 'firstStrike' || key === 'shieldStart') {
      entries.push(`${GEAR_MOD_LABELS[key]} ${Math.round(value)}`)
    } else {
      entries.push(`${GEAR_MOD_LABELS[key]} ${Math.round(value * 100)}%`)
    }
  }
  return entries.join(' · ')
}

export const GEAR_STAT_LABELS: Record<keyof CombatStats, string> = {
  health: '气血',
  attack: '攻势',
  defense: '护体',
  speed: '身法',
  crit: '暴击',
  spirit: '神识',
}

export function gearAffixTone(tier: number): string {
  if (tier >= 5) return 'border-cinnabar/45 text-cinnabar'
  if (tier >= 4) return 'border-cinnabar/40 text-cinnabar'
  if (tier >= 3) return 'border-gold/45 text-gold-deep'
  return 'border-line text-muted'
}

export type { GearAffix }