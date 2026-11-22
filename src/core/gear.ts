import type { CombatStats } from '@/types/content'
import type {
  CombatModKey,
  CombatMods,
  GeneratedGear,
  GearAffix,
  GearDropOptions,
  GearSetRule,
  GearSlot,
} from '@/types/gear'
import type { GameSaveData, PlayerState } from '@/types/state'
import {
  combatModText,
  GEAR_AFFIX_BY_ID,
  GEAR_AFFIX_TEMPLATES,
  GEAR_ELEMENTS,
  GEAR_QUALITY_TIERS,
  GEAR_SET_BY_ID,
  GEAR_SETS,
  GEAR_SLOTS,
  GEAR_SLOT_LABELS,
  GEAR_TIER_PREFIXES,
  gearAffixTone,
  gearBaseName,
} from '@/data/gear/catalog'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'

const STAT_KEYS: Array<keyof CombatStats> = [
  'health',
  'attack',
  'defense',
  'speed',
  'crit',
  'spirit',
]

export function emptyCombatMods(): CombatMods {
  return {
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
  }
}

export function addCombatMods(
  target: CombatMods,
  source?: Partial<CombatMods>,
): void {
  if (!source) return
  for (const key of Object.keys(target) as CombatModKey[]) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      target[key] += value
    }
  }
}

function addStats(target: Required<CombatStats>, stats?: CombatStats): void {
  if (!stats) return
  for (const key of STAT_KEYS) {
    const value = stats[key]
    if (typeof value === 'number' && Number.isFinite(value)) target[key] += value
  }
}

function emptyStats(): Required<CombatStats> {
  return { health: 0, attack: 0, defense: 0, speed: 0, crit: 0, spirit: 0 }
}

export interface GearBonuses {
  stats: Required<CombatStats>
  mods: CombatMods
  sets: Array<{ rule: GearSetRule; count: number; activeThresholds: string[] }>
}

export function qualityTier(quality: number) {
  const index = Math.max(0, Math.min(GEAR_QUALITY_TIERS.length - 1, Math.round(quality)))
  return GEAR_QUALITY_TIERS[index]
}

export function gearSlotLabel(slot: GearSlot): string {
  return GEAR_SLOT_LABELS[slot]
}

export function gearUpgradeMultiplier(gear: GeneratedGear): number {
  return 1 + Math.max(0, Math.min(10, gear.upgrade)) * 0.06
}

export function gearStats(gear: GeneratedGear): Required<CombatStats> {
  const stats = emptyStats()
  const quality = qualityTier(gear.quality)
  const factor = quality.multiplier * gearUpgradeMultiplier(gear)
  for (const key of STAT_KEYS) {
    const base = gear.baseStats[key] ?? 0
    if (base > 0) stats[key] = Math.max(0, Math.round(base * factor))
  }
  return stats
}

export function gearPower(gear: GeneratedGear): number {
  const stats = gearStats(gear)
  return (
    stats.health * 0.35 +
    stats.attack * 4 +
    stats.defense * 3.5 +
    stats.speed * 2.5 +
    stats.crit * 1.5 +
    stats.spirit * 2 +
    gear.affixes.reduce((sum, affix) => sum + affixGeneralValue(affix), 0)
  )
}

function affixGeneralValue(affix: GearAffix): number {
  const template = GEAR_AFFIX_BY_ID.get(affix.templateId)
  if (!template) return 0
  return template.kind === 'mod' ? affix.value * 2.2 : affix.value * 1.4
}

export function gearAffixMods(gear: GeneratedGear): CombatMods {
  const mods = emptyCombatMods()
  for (const affix of gear.affixes) {
    const template = GEAR_AFFIX_BY_ID.get(affix.templateId)
    if (!template || template.kind !== 'mod' || !template.mod) continue
    const value = template.percent ? affix.value / 100 : affix.value
    mods[template.mod] += value
  }
  return mods
}

export function gearCombatStats(gear: GeneratedGear): Required<CombatStats> {
  const stats = gearStats(gear)
  for (const affix of gear.affixes) {
    const template = GEAR_AFFIX_BY_ID.get(affix.templateId)
    if (!template || template.kind !== 'stat' || !template.stat) continue
    stats[template.stat] += affix.value
  }
  return stats
}

export function equippedGear(player: PlayerState, slot: GearSlot): GeneratedGear | undefined {
  const id = player.standardEquipment[slot]
  if (!id) return undefined
  return player.gearInventory.find((gear) => gear.id === id)
}

export function equippedGearList(player: PlayerState): GeneratedGear[] {
  return GEAR_SLOTS.flatMap((slot) => {
    const gear = equippedGear(player, slot)
    return gear ? [gear] : []
  })
}

export function collectGearBonuses(player: PlayerState): GearBonuses {
  const stats = emptyStats()
  const mods = emptyCombatMods()
  const counts = new Map<string, number>()
  for (const gear of equippedGearList(player)) {
    addStats(stats, gearCombatStats(gear))
    addCombatMods(mods, gearAffixMods(gear))
    if (gear.setId) counts.set(gear.setId, (counts.get(gear.setId) ?? 0) + 1)
  }

  const sets: GearBonuses['sets'] = []
  for (const [setId, count] of counts) {
    const rule = GEAR_SET_BY_ID.get(setId)
    if (!rule) continue
    const activeThresholds: string[] = []
    for (const threshold of rule.thresholds) {
      if (count < threshold.count) continue
      activeThresholds.push(threshold.text)
      addStats(stats, threshold.stats)
      addCombatMods(mods, threshold.mods)
    }
    sets.push({ rule, count, activeThresholds })
  }

  return { stats, mods, sets }
}

function slotBaseStats(slot: GearSlot, tier: number): CombatStats {
  switch (slot) {
    case 'weapon':
      return {
        attack: 5 + tier * 2.8,
        crit: tier >= 2 ? 1.2 + tier * 0.5 : 0,
      }
    case 'armor':
      return {
        health: 24 + tier * 12,
        defense: 2.4 + tier * 1.35,
      }
    case 'head':
      return {
        health: 10 + tier * 6,
        spirit: 2.6 + tier * 2,
      }
    case 'cloak':
      return {
        defense: 2 + tier * 1.2,
        health: 14 + tier * 7,
      }
    case 'waist':
      return {
        health: 12 + tier * 6.5,
        speed: 0.9 + tier * 0.45,
      }
    case 'boots':
      return {
        speed: 2.2 + tier * 1.35,
        health: 6 + tier * 3.5,
      }
    case 'neck':
      return {
        spirit: 2.2 + tier * 1.9,
        crit: 1 + tier * 0.8,
      }
    case 'ring':
      return {
        attack: 3 + tier * 1.9,
        crit: 1 + tier * 0.85,
      }
    case 'accessory':
      return {
        crit: 1.5 + tier * 1.4,
        spirit: 1.8 + tier * 1.7,
      }
    case 'talisman':
      return {
        defense: 2 + tier * 1.3,
        spirit: 2.2 + tier * 1.8,
      }
    default:
      return {}
  }
}

function rollQuality(rng: Rng, bonus: number): number {
  const weights = GEAR_QUALITY_TIERS.map((tier) => ({ ...tier, weight: tier.weight }))
  const rolled = rng.pickWeighted(weights)
  let index = rolled ? GEAR_QUALITY_TIERS.findIndex((tier) => tier.id === rolled.id) : 0
  const whole = Math.floor(Math.max(0, bonus))
  const fraction = Math.max(0, bonus) - whole
  index += whole
  if (fraction > 0 && rng.chance(fraction)) index += 1
  return Math.max(0, Math.min(GEAR_QUALITY_TIERS.length - 1, index))
}

function rollAffixTier(rng: Rng, gearTier: number, quality: number): number {
  const ceiling = Math.min(5, 2 + quality * 0.45 + gearTier * 0.3)
  return Math.max(1, Math.min(5, 1 + Math.floor(rng.next() * ceiling)))
}

function rollAffix(
  rng: Rng,
  gearTier: number,
  quality: number,
  slot: GearSlot,
  excluded: Set<string>,
): GearAffix | undefined {
  const candidates = GEAR_AFFIX_TEMPLATES.filter(
    (template) =>
      !excluded.has(template.id) &&
      (template.minGearTier ?? 1) <= gearTier &&
      (!template.slots || template.slots.includes(slot)),
  )
  const template = rng.pickWeighted(candidates)
  if (!template) return undefined
  const tier = rollAffixTier(rng, gearTier, quality)
  const value = Math.max(
    1,
    Math.round(
      (template.base + template.perTier * (tier - 1) + template.gearScale * (gearTier - 1)) *
        GEAR_AFFIX_POWER,
    ),
  )
  return {
    templateId: template.id,
    label: template.label,
    description: template.describe(value),
    tier,
    value,
  }
}

export function rollGear(
  rng: Rng,
  options: GearDropOptions,
  sequence: number,
  createdAtMonths: number,
): GeneratedGear {
  const tier = Math.max(1, Math.min(6, Math.round(options.tier)))
  const slot = options.slot ?? rng.pick(GEAR_SLOTS) ?? 'weapon'
  const quality = rollQuality(rng, options.qualityBonus ?? 0)
  const qualityInfo = GEAR_QUALITY_TIERS[quality]

  const base: CombatStats = {}
  const raw = slotBaseStats(slot, tier)
  for (const key of STAT_KEYS) {
    const value = raw[key] ?? 0
    if (value > 0) {
      const variance = 0.9 + rng.next() * 0.2
      base[key] = Math.max(1, Math.round(value * variance))
    }
  }

  const affixCount =
    qualityInfo.affixMin +
    (qualityInfo.affixMax > qualityInfo.affixMin
      ? rng.nextInt(0, qualityInfo.affixMax - qualityInfo.affixMin + 1)
      : 0)
  const affixes: GearAffix[] = []
  const used = new Set<string>()
  for (let index = 0; index < affixCount; index += 1) {
    const affix = rollAffix(rng, tier, quality, slot, used)
    if (!affix) break
    used.add(affix.templateId)
    affixes.push(affix)
  }

  const setId =
    options.forceSetId ??
    (quality >= 1 && rng.chance(0.16) ? rng.pick(GEAR_SETS)?.id : undefined)
  const element = rng.chance(0.55) ? rng.pick(GEAR_ELEMENTS) : undefined

  return {
    id: `gear.${sequence}`,
    name: `${GEAR_TIER_PREFIXES[tier - 1]}${gearBaseName(slot, rng)}`,
    slot,
    tier,
    quality,
    element,
    baseStats: base,
    affixes,
    upgrade: 0,
    sealed: [],
    locked: false,
    setId,
    sourceRegionId: options.regionId,
    createdAtMonths,
  }
}

export function grantGeneratedGear(
  state: GameSaveData,
  rng: Rng,
  options: GearDropOptions,
): GeneratedGear {
  const sequence = Math.max(1, state.player.gearSeq ?? 1)
  const gear = rollGear(rng, options, sequence, state.clock.elapsedMonths)
  state.player.gearSeq = sequence + 1
  state.player.gearInventory.push(gear)
  return gear
}

export interface GearActionResult {
  ok: boolean
  state: GameSaveData
  message: string
}

function fail(state: GameSaveData, message: string): GearActionResult {
  return { ok: false, state, message }
}

function succeed(state: GameSaveData, message: string): GearActionResult {
  return { ok: true, state, message }
}

export interface GearCost {
  spirit_stones: number
  ore: number
}

export const MAX_GEAR_UPGRADE = 10
export const MAX_SEALED_AFFIXES = 3
export const MAX_GEAR_AFFIXES = 9
const GEAR_AFFIX_POWER = 1.35

export function upgradeCost(gear: GeneratedGear): GearCost {
  return {
    spirit_stones: 12 + gear.tier * 8 + gear.quality * 6 + gear.upgrade * 7,
    ore: 1 + gear.tier + Math.floor(gear.quality / 3),
  }
}

export function reforgeCost(gear: GeneratedGear): GearCost {
  const sealed = gear.sealed.length
  return {
    spirit_stones: 18 + gear.tier * 10 + gear.quality * 9 + sealed * 12,
    ore: 2 + gear.tier + sealed,
  }
}

export function sealCost(gear: GeneratedGear): GearCost {
  return {
    spirit_stones: 14 + gear.tier * 6 + gear.quality * 5,
    ore: 2 + gear.tier,
  }
}

export function transferCost(from: GeneratedGear, affix: GearAffix, to: GeneratedGear): GearCost {
  return {
    spirit_stones: 20 + from.tier * 8 + to.tier * 8 + affix.tier * 14,
    ore: 2 + Math.floor((from.tier + to.tier) / 2),
  }
}

export function dismantleYield(gear: GeneratedGear): GearCost {
  return {
    spirit_stones: Math.round(8 + gear.tier * 7 + gear.quality * 11 + gear.upgrade * 5),
    ore: Math.round(2 + gear.tier + gear.quality * 0.8),
  }
}

function canPay(state: GameSaveData, cost: GearCost): boolean {
  return (
    (state.player.resources.spirit_stones ?? 0) >= cost.spirit_stones &&
    (state.player.resources.ore ?? 0) >= cost.ore
  )
}

function pay(next: GameSaveData, cost: GearCost): void {
  next.player.resources.spirit_stones =
    (next.player.resources.spirit_stones ?? 0) - cost.spirit_stones
  next.player.resources.ore = (next.player.resources.ore ?? 0) - cost.ore
}

function costHint(cost: GearCost): string {
  return `灵石 ${cost.spirit_stones} · 灵矿 ${cost.ore}`
}

function findGear(state: GameSaveData, gearId: string): GeneratedGear | undefined {
  return state.player.gearInventory.find((gear) => gear.id === gearId)
}

export function isGearEquipped(player: PlayerState, gearId: string): boolean {
  return Object.values(player.standardEquipment).includes(gearId)
}

export function equipGear(state: GameSaveData, gearId: string): GearActionResult {
  const gear = findGear(state, gearId)
  if (!gear) return fail(state, '行囊里没有这件器物。')
  if (isGearEquipped(state.player, gearId)) return fail(state, '它已经在你身上了。')
  const next = cloneGameSaveData(state)
  const previous = next.player.standardEquipment[gear.slot]
  next.player.standardEquipment[gear.slot] = gearId
  return succeed(
    next,
    previous
      ? `已把${gearSlotLabel(gear.slot)}位换成${gear.name}。`
      : `已装备${gear.name}。`,
  )
}

export function unequipGear(state: GameSaveData, slot: GearSlot): GearActionResult {
  const current = state.player.standardEquipment[slot]
  if (!current) return fail(state, '这个位置本就空着。')
  const next = cloneGameSaveData(state)
  delete next.player.standardEquipment[slot]
  const gear = next.player.gearInventory.find((entry) => entry.id === current)
  return succeed(next, gear ? `已把${gear.name}收回器匣。` : '已卸下器物。')
}

export function upgradeGear(state: GameSaveData, gearId: string): GearActionResult {
  const gear = findGear(state, gearId)
  if (!gear) return fail(state, '行囊里没有这件器物。')
  if (gear.upgrade >= MAX_GEAR_UPGRADE) return fail(state, `${gear.name}已经淬炼到顶。`)
  const cost = upgradeCost(gear)
  if (!canPay(state, cost)) return fail(state, `淬炼还差一些火料：需要${costHint(cost)}。`)
  const next = cloneGameSaveData(state)
  const target = findGear(next, gearId)
  if (!target) return fail(state, '行囊里没有这件器物。')
  pay(next, cost)
  target.upgrade += 1
  return succeed(next, `${gear.name}淬至 +${target.upgrade}，器纹更沉了一分。`)
}

export function reforgeGear(state: GameSaveData, gearId: string): GearActionResult {
  const gear = findGear(state, gearId)
  if (!gear) return fail(state, '行囊里没有这件器物。')
  if (gear.affixes.length === 0) return fail(state, '这件器物还没有可洗的器纹。')
  if (gear.affixes.every((_, index) => gear.sealed.includes(index))) {
    return fail(state, '所有词条都被封印了，没有可洗之处。')
  }
  const cost = reforgeCost(gear)
  if (!canPay(state, cost)) return fail(state, `洗练还差一些料：需要${costHint(cost)}。`)

  const next = cloneGameSaveData(state)
  const target = findGear(next, gearId)
  if (!target) return fail(state, '行囊里没有这件器物。')
  pay(next, cost)
  const rng = Rng.fromState(next.rng)

  const raw = slotBaseStats(target.slot, target.tier)
  const base: CombatStats = {}
  for (const key of STAT_KEYS) {
    const value = raw[key] ?? 0
    if (value > 0) {
      const variance = 0.9 + rng.next() * 0.2
      base[key] = Math.max(1, Math.round(value * variance))
    }
  }
  target.baseStats = base

  const sealedTemplates = new Set(
    target.sealed.map((index) => target.affixes[index]?.templateId).filter(Boolean) as string[],
  )
  const used = new Set(sealedTemplates)
  target.affixes = target.affixes.map((affix, index) => {
    if (target.sealed.includes(index)) return affix
    const rolled = rollAffix(rng, target.tier, target.quality, target.slot, used)
    if (!rolled) return affix
    used.add(rolled.templateId)
    return rolled
  })
  next.rng = rng.getState()
  return succeed(next, `${target.name}的器纹重新排过，旧痕没有完全褪尽。`)
}

export function sealGearAffix(
  state: GameSaveData,
  gearId: string,
  affixIndex: number,
): GearActionResult {
  const gear = findGear(state, gearId)
  if (!gear) return fail(state, '行囊里没有这件器物。')
  if (!gear.affixes[affixIndex]) return fail(state, '这一道器纹已经不在。')
  if (gear.sealed.includes(affixIndex)) return fail(state, '这道器纹已经封住了。')
  if (gear.sealed.length >= MAX_SEALED_AFFIXES) {
    return fail(state, `一件器物最多封 ${MAX_SEALED_AFFIXES} 道器纹。`)
  }
  const cost = sealCost(gear)
  if (!canPay(state, cost)) return fail(state, `封印还差一些料：需要${costHint(cost)}。`)
  const next = cloneGameSaveData(state)
  const target = findGear(next, gearId)
  if (!target) return fail(state, '行囊里没有这件器物。')
  pay(next, cost)
  target.sealed.push(affixIndex)
  target.sealed.sort((left, right) => left - right)
  return succeed(next, `已封住${target.affixes[affixIndex]?.label ?? '这道'}器纹，洗练不会再动它。`)
}

export function unsealGearAffix(
  state: GameSaveData,
  gearId: string,
  affixIndex: number,
): GearActionResult {
  const gear = findGear(state, gearId)
  if (!gear) return fail(state, '行囊里没有这件器物。')
  if (!gear.sealed.includes(affixIndex)) return fail(state, '这道器纹没有被封住。')
  const cost = sealCost(gear)
  if (!canPay(state, cost)) return fail(state, `解封还差一些料：需要${costHint(cost)}。`)
  const next = cloneGameSaveData(state)
  const target = findGear(next, gearId)
  if (!target) return fail(state, '行囊里没有这件器物。')
  pay(next, cost)
  target.sealed = target.sealed.filter((index) => index !== affixIndex)
  return succeed(next, '封印解开，器纹重新暴露在洗练之下。')
}

export function transferGearAffix(
  state: GameSaveData,
  fromId: string,
  affixIndex: number,
  toId: string,
): GearActionResult {
  if (fromId === toId) return fail(state, '不能把器纹拓回同一件器物。')
  const from = findGear(state, fromId)
  const to = findGear(state, toId)
  if (!from || !to) return fail(state, '器匣里缺少这一件器物。')
  if (isGearEquipped(state.player, fromId) || isGearEquipped(state.player, toId)) {
    return fail(state, '先卸下这两件器物，才能拓印器纹。')
  }
  const affix = from.affixes[affixIndex]
  if (!affix) return fail(state, '这一道器纹已经不在。')
  if (from.sealed.includes(affixIndex)) return fail(state, '封住的器纹无法拓印。')
  if (to.affixes.length >= MAX_GEAR_AFFIXES) return fail(state, `${to.name}已经载不下更多器纹。`)
  if (to.affixes.some((entry) => entry.templateId === affix.templateId)) {
    return fail(state, `${to.name}已经有${affix.label}这道器纹。`)
  }
  const cost = transferCost(from, affix, to)
  if (!canPay(state, cost)) return fail(state, `拓印还差一些料：需要${costHint(cost)}。`)

  const next = cloneGameSaveData(state)
  const source = findGear(next, fromId)
  const target = findGear(next, toId)
  if (!source || !target) return fail(state, '器匣里缺少这一件器物。')
  pay(next, cost)
  const [moved] = source.affixes.splice(affixIndex, 1)
  source.sealed = source.sealed
    .filter((index) => index !== affixIndex)
    .map((index) => (index > affixIndex ? index - 1 : index))
  if (moved) target.affixes.push(moved)
  return succeed(next, `把${moved?.label ?? '器纹'}从${source.name}拓到了${target.name}。`)
}

export function dismantleGear(state: GameSaveData, gearId: string): GearActionResult {
  const gear = findGear(state, gearId)
  if (!gear) return fail(state, '行囊里没有这件器物。')
  if (isGearEquipped(state.player, gearId)) return fail(state, '先卸下它，才能拆解。')
  if (gear.locked) return fail(state, `${gear.name}被锁住了，先解开锁定。`)
  const next = cloneGameSaveData(state)
  next.player.gearInventory = next.player.gearInventory.filter((entry) => entry.id !== gearId)
  const yield_ = dismantleYield(gear)
  next.player.resources.spirit_stones =
    (next.player.resources.spirit_stones ?? 0) + yield_.spirit_stones
  next.player.resources.ore = (next.player.resources.ore ?? 0) + yield_.ore
  return succeed(
    next,
    `拆开${gear.name}，收回灵石 ${yield_.spirit_stones}、灵矿 ${yield_.ore}。`,
  )
}

export function toggleGearLock(state: GameSaveData, gearId: string): GearActionResult {
  const gear = findGear(state, gearId)
  if (!gear) return fail(state, '行囊里没有这件器物。')
  const next = cloneGameSaveData(state)
  const target = findGear(next, gearId)
  if (!target) return fail(state, '行囊里没有这件器物。')
  target.locked = !target.locked
  return succeed(next, target.locked ? `已锁住${target.name}，拆解时会多问一句。` : `已解开${target.name}的锁。`)
}

export interface GearRecycleQuote {
  ids: string[]
  count: number
  yield: GearCost
  skipped: number
}

export function quoteGearRecycle(
  state: GameSaveData,
  gearIds: readonly string[],
): GearRecycleQuote {
  const ids: string[] = []
  const yield_: GearCost = { spirit_stones: 0, ore: 0 }
  let skipped = 0
  for (const id of new Set(gearIds)) {
    const gear = findGear(state, id)
    if (!gear || gear.locked || isGearEquipped(state.player, id)) {
      skipped += 1
      continue
    }
    const entry = dismantleYield(gear)
    ids.push(id)
    yield_.spirit_stones += entry.spirit_stones
    yield_.ore += entry.ore
  }
  yield_.spirit_stones = Math.round(yield_.spirit_stones * 1.1)
  yield_.ore = Math.round(yield_.ore * 1.1)
  return { ids, count: ids.length, yield: yield_, skipped }
}

export function recycleGear(
  state: GameSaveData,
  gearIds: readonly string[],
): GearActionResult {
  const quote = quoteGearRecycle(state, gearIds)
  if (quote.count === 0) return fail(state, '没有可以回收的器物。先卸下并解锁它们。')
  const next = cloneGameSaveData(state)
  const chosen = new Set(quote.ids)
  next.player.gearInventory = next.player.gearInventory.filter(
    (entry) => !chosen.has(entry.id),
  )
  next.player.resources.spirit_stones =
    (next.player.resources.spirit_stones ?? 0) + quote.yield.spirit_stones
  next.player.resources.ore = (next.player.resources.ore ?? 0) + quote.yield.ore
  return succeed(
    next,
    `回收 ${quote.count} 件器物，收回灵石 ${quote.yield.spirit_stones}、灵矿 ${quote.yield.ore}。`,
  )
}

export interface GearCompareRow {
  key: keyof CombatStats
  label: string
  current: number
  next: number
  delta: number
}

export function compareCombatStats(
  candidate?: CombatStats,
  current?: CombatStats,
): GearCompareRow[] {
  const currentStats = emptyStats()
  const nextStats = emptyStats()
  for (const key of STAT_KEYS) {
    currentStats[key] = Math.round(current?.[key] ?? 0)
    nextStats[key] = Math.round(candidate?.[key] ?? 0)
  }
  return STAT_KEYS.map((key) => ({
    key,
    label:
      key === 'health'
        ? '气血'
        : key === 'attack'
          ? '攻势'
          : key === 'defense'
            ? '护体'
            : key === 'speed'
              ? '身法'
              : key === 'crit'
                ? '暴击'
                : '神识',
    current: currentStats[key],
    next: nextStats[key],
    delta: nextStats[key] - currentStats[key],
  }))
}

export function compareGearStats(
  candidate: GeneratedGear,
  equipped?: GeneratedGear,
): GearCompareRow[] {
  return compareCombatStats(
    gearCombatStats(candidate),
    equipped ? gearCombatStats(equipped) : undefined,
  )
}

export function gearModText(gear: GeneratedGear): string {
  return combatModText(gearAffixMods(gear))
}

export function gearSetText(gear: GeneratedGear): string {
  if (!gear.setId) return ''
  const rule = GEAR_SET_BY_ID.get(gear.setId)
  return rule ? `${rule.name}（${rule.size} 件）` : ''
}

export function gearQualityName(gear: GeneratedGear): string {
  return GEAR_QUALITY_TIERS[gear.quality]?.name ?? '凡品'
}

export function gearGeneratedStatsText(gear: GeneratedGear): string {
  const stats = gearCombatStats(gear)
  const labels: Array<[keyof CombatStats, string]> = [
    ['attack', '攻势'],
    ['defense', '护体'],
    ['health', '气血'],
    ['speed', '身法'],
    ['crit', '暴击'],
    ['spirit', '神识'],
  ]
  return labels
    .filter(([key]) => (stats[key] ?? 0) > 0)
    .map(([key, label]) =>
      key === 'crit' ? `${label} ${stats[key]}%` : `${label} ${stats[key]}`,
    )
    .join(' · ')
}

export interface GearAffixView extends GearAffix {
  index: number
  sealed: boolean
  tone: string
}

export interface GearView {
  gear: GeneratedGear
  qualityName: string
  qualityTone: string
  tierName: string
  slotLabel: string
  power: number
  statsText: string
  modText: string
  setText: string
  affixes: GearAffixView[]
  compare: GearCompareRow[]
  isEquipped: boolean
  equippedInSlotName?: string
  upgradeCost: GearCost
  reforgeCost: GearCost
  sealCost: GearCost
  dismantleYield: GearCost
  maxUpgrade: number
  maxSealed: number
  canUpgrade: boolean
}

export function buildGearView(player: PlayerState, gear: GeneratedGear): GearView {
  const equipped = equippedGear(player, gear.slot)
  const isEquipped = equipped?.id === gear.id
  return {
    gear,
    qualityName: gearQualityName(gear),
    qualityTone: qualityTier(gear.quality).tone,
    tierName: ['凡铁', '精铁', '灵胎', '玄胚', '地魄', '天工'][gear.tier - 1] ?? '凡铁',
    slotLabel: gearSlotLabel(gear.slot),
    power: Math.round(gearPower(gear)),
    statsText: gearGeneratedStatsText(gear),
    modText: gearModText(gear),
    setText: gearSetText(gear),
    affixes: gear.affixes.map((affix, index) => ({
      ...affix,
      index,
      sealed: gear.sealed.includes(index),
      tone: gearAffixTone(affix.tier),
    })),
    compare: compareGearStats(gear, isEquipped ? undefined : equipped),
    isEquipped,
    equippedInSlotName: isEquipped ? undefined : equipped?.name,
    upgradeCost: upgradeCost(gear),
    reforgeCost: reforgeCost(gear),
    sealCost: sealCost(gear),
    dismantleYield: dismantleYield(gear),
    maxUpgrade: MAX_GEAR_UPGRADE,
    maxSealed: MAX_SEALED_AFFIXES,
    canUpgrade: gear.upgrade < MAX_GEAR_UPGRADE,
  }
}

export function gearTransferCostText(
  from: GeneratedGear,
  affixIndex: number,
  to: GeneratedGear,
): string {
  const affix = from.affixes[affixIndex]
  if (!affix) return ''
  const cost = transferCost(from, affix, to)
  return costHint(cost)
}