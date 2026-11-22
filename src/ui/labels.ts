import { getContentRegistry } from '@/data'
import { BODY_STAGES } from '@/core/body'
import { statusLabel } from '@/core/character'
import type {
  FactionStanding,
  RegionKind,
  ResourceCost,
} from '@/types/common'
import type { CombatStats, EncounterReward } from '@/types/content'
import type { Effect, Requirement } from '@/types/dsl'

const registry = getContentRegistry()

const RESOURCE_LABELS: Record<string, string> = {
  spirit_stones: '灵石',
  spirit_herbs: '灵草',
  ore: '灵矿',
  beast_cores: '兽核',
  contribution: '贡献',
  merit: '功德',
  karma: '因果',
}

const REALM_LABELS: Record<string, string> = {
  mortal: '凡人',
  qi_refining: '炼气',
  foundation: '筑基',
  golden_core: '金丹',
}

const FLAG_LABELS: Record<string, string> = {
  'longhan.three_clans_covenant': '三族会盟已立',
  'longhan.rahu_whisper': '曾闻魔渊低语',
  'longhan.calamity_resolved': '劫火已有归处',
  'longhan.tide_settled': '潮汐已定',
  'longhan.dragon_favored': '受过龙族旧鳞',
  'longhan.phoenix_favored': '受过凤族旧羽',
  'longhan.qilin_favored': '受过大地理脉之证',
  'longhan.chaos_breath_heard': '听过混沌裂隙的呼吸',
  'longhan.beast_tide_answered': '曾迎过荒原兽潮',
  'longhan.dragon_gate_answered': '在龙门退潮时留名',
  'longhan.ao_guang_bonded': '与敖光结缘',
  'longhan.cave.opened': '寻得听潮洞',
  'longhan.heard_dao': '听过紫霄道音',
  'longhan.palace_entered': '曾入紫霄宫门',
  'longhan.dragon_inner_strife_quelled': '曾止龙庭内斗',
  'longhan.volcano_crisis_eased': '曾缓火山之危',
  'longhan.earth_vein_restored': '曾续地脉裂口',
  'longhan.rahu_price_paid': '曾为魔道付过代价',
  'longhan.dao_bell_under_pillar_seen': '曾在不周山腹听见半声钟',
  'longhan.dao_bell_heard': '等到了第三遍钟声',
  'longhan.dao_bell_knocked': '曾敲过不周山壁',
  'longhan.dao_bell_climbed': '曾登紫霄阶',
  'longhan.dao_bell_answered': '曾在紫霄宫门外作答',
  'longhan.dao_bell_echo_seen': '曾闻紫霄余钟',
  'longhan.dao_next_era_asked': '曾问下一劫',
  'longhan.dragon_trial_current_seen': '曾独自巡海一季',
  'longhan.dragon_trial_current_passed': '巡海试炼已过',
  'longhan.dragon_elder_scene_seen': '曾为龙庭续册',
  'longhan.dragon_elder_record': '巡海册旧案有记',
  'longhan.missing_tide_envoy': '巡海册上有一页空白',
  'longhan.envoy_lead_seen': '曾见退潮暗水道',
  'longhan.envoy_channel_entered': '曾入旧宫暗水道',
  'longhan.envoy_channel_reported': '曾报回暗水道',
  'longhan.envoy_channel_sealed': '曾封暗水道',
  'longhan.envoy_remains_seen': '曾见巡海使遗骸',
  'longhan.envoy_name_returned': '曾带回被割去的名字',
  'longhan.envoy_bell_taken': '曾取走归期铃',
  'longhan.envoy_return_seen': '曾补巡海册归期',
  'longhan.missing_tide_envoy_returned': '巡海册空白已补',
  'longhan.envoy_bell_hung': '归期铃已挂潮眼',
  'longhan.envoy_page_closed': '曾合上巡海册空白页',
  'longhan.envoy_bell_rung': '曾摇归期铃',
}

const REGION_KIND_LABELS: Record<RegionKind, string> = {
  land: '陆',
  sea: '海',
  volcano: '火',
  cliff: '崖',
  abyss: '渊',
  wilds: '荒',
  mountain: '山',
  palace: '宫',
}

const STANDING_LABELS: Record<FactionStanding, string> = {
  ally: '盟',
  neutral: '平',
  rival: '争',
  enemy: '仇',
}

export function regionKindLabel(kind: RegionKind): string {
  return REGION_KIND_LABELS[kind] ?? '地'
}

export function standingLabel(standing: FactionStanding): string {
  return STANDING_LABELS[standing] ?? '未明'
}

export function flagLabel(flag: string): string {
  return FLAG_LABELS[flag] ?? '一段旧因缘'
}

export function describeRequirement(requirement: Requirement): string {
  switch (requirement.kind) {
    case 'flag':
      return requirement.value === undefined || requirement.value === true
        ? flagLabel(requirement.flag)
        : `${flagLabel(requirement.flag)}（${String(requirement.value)}）`
    case 'era': {
      const era = registry.eras.get(requirement.eraId)
      return `身处${era?.name ?? '旧时量劫'}`
    }
    case 'phase': {
      const era = registry.eras.get(requirement.eraId)
      const phase = era?.phases.find((entry) => entry.id === requirement.phaseId)
      return `劫数已至${phase?.name ?? '无名劫数'}`
    }
    case 'factionMembership': {
      const faction = registry.factions.get(requirement.factionId)
      const rank = faction?.ranks.find(
        (entry) => entry.order === (requirement.rankAtLeast ?? 1),
      )
      return requirement.rankAtLeast && requirement.rankAtLeast > 1
        ? `${faction?.name ?? '势力'}${rank?.title ?? '职位'}`
        : `身在${faction?.name ?? '势力'}`
    }
    case 'factionReputation': {
      const faction = registry.factions.get(requirement.factionId)
      return `${faction?.name ?? '势力'}声望 ≥ ${requirement.minReputation}`
    }
    case 'regionUnlocked': {
      const region = registry.regions.get(requirement.regionId)
      return `潮路已通${region?.name ?? '无名之地'}`
    }
    case 'regionVisited': {
      const region = registry.regions.get(requirement.regionId)
      return `曾亲至${region?.name ?? '无名之地'}`
    }
    case 'regionState':
      return '当地旧痕已合'
    case 'realm': {
      const stage = requirement.minStage ?? 1
      return `境界至少${REALM_LABELS[requirement.minRealm] ?? '未明'} ${stage} 层`
    }
    case 'bodyStage':
      return `体魄至少${BODY_STAGES[Math.max(0, Math.min(5, requirement.minStage))]?.name ?? '凡躯'}`
    case 'bloodlineStage':
      return `血脉至少${requirement.minStage} 阶`
    case 'item': {
      const item = registry.getItem(requirement.itemId)
      return `持有${item?.name ?? '无名之物'}${requirement.count ? ` ×${requirement.count}` : ''}`
    }
    case 'technique': {
      const technique = registry.techniques.get(requirement.techniqueId)
      return `习得${technique?.name ?? '无名功法'}`
    }
    case 'petNotOwned':
      return '尚未收留此灵宠'
    case 'mountNotOwned':
      return '尚未得此坐骑'
    case 'treasureNotOwned':
      return '尚未得此法宝'
    case 'partnerFavor': {
      const partner = registry.partners.get(requirement.partnerId)
      return `${partner?.name ?? '某人'}情谊 ≥ ${requirement.minTier}`
    }
    case 'all':
      return requirement.of.map(describeRequirement).join('、')
    case 'any':
      return `任一：${requirement.of.map(describeRequirement).join(' / ')}`
    case 'not':
      return `不可：${describeRequirement(requirement.of)}`
    default:
      return '因缘未明'
  }
}

export function describeRequirements(requirements: readonly Requirement[]): string {
  if (requirements.length === 0) return '无额外条件'
  return requirements.map(describeRequirement).join('、')
}

export function formatCost(cost: ResourceCost | undefined): string {
  if (!cost) return '无'
  const parts = Object.entries(cost)
    .filter(([, amount]) => typeof amount === 'number' && amount > 0)
    .map(([key, amount]) => `${RESOURCE_LABELS[key] ?? '物料'} ${amount}`)
  return parts.length > 0 ? parts.join(' · ') : '无'
}

export function resourceLabel(key: string): string {
  return RESOURCE_LABELS[key] ?? '物料'
}

const STAT_LABELS: Record<keyof CombatStats, string> = {
  health: '气血',
  attack: '攻势',
  defense: '护体',
  speed: '身法',
  crit: '暴击',
  spirit: '神识',
}

const STAT_KEYS = Object.keys(STAT_LABELS) as Array<keyof CombatStats>

function signed(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`
}

function truncateText(text: string, limit = 34): string {
  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

export function describeStats(stats?: CombatStats): string {
  if (!stats) return ''
  return STAT_KEYS.filter((key) => {
    const value = stats[key]
    return typeof value === 'number' && Number.isFinite(value) && value !== 0
  })
    .map((key) => `${STAT_LABELS[key]} ${signed(stats[key] ?? 0)}`)
    .join(' · ')
}

export function describeStatsDelta(
  current?: CombatStats,
  next?: CombatStats,
): string {
  const parts = STAT_KEYS.flatMap((key) => {
    const delta = Math.round(next?.[key] ?? 0) - Math.round(current?.[key] ?? 0)
    return delta === 0 ? [] : [`${STAT_LABELS[key]} ${signed(delta)}`]
  })
  return parts.length > 0 ? parts.join('、') : '六项属性皆无增减'
}

function itemName(id: string): string {
  return registry.getItem(id)?.name ?? '无名之物'
}

function encounterRewardText(reward: EncounterReward): string {
  const parts: string[] = []
  if (reward.cultivation && reward.cultivation > 0) {
    parts.push(`修为 +${reward.cultivation}`)
  }
  if (reward.resources) {
    for (const [key, amount] of Object.entries(reward.resources)) {
      if (typeof amount === 'number' && amount > 0) {
        parts.push(`${RESOURCE_LABELS[key] ?? '物料'} +${amount}`)
      }
    }
  }
  if (reward.items) {
    for (const entry of reward.items) {
      const count = Math.max(1, Math.floor(entry.count ?? 1))
      parts.push(`${itemName(entry.itemId)}${count > 1 ? ` ×${count}` : ''}`)
    }
  }
  return parts.join('、')
}

export function describeReward(
  reward?: EncounterReward,
  scale = 1,
): string {
  if (!reward) return ''
  const factor = Number.isFinite(scale) && scale > 0 ? scale : 1
  const scaled: EncounterReward = {
    cultivation: reward.cultivation
      ? Math.max(1, Math.round(reward.cultivation * factor))
      : undefined,
    resources: reward.resources
      ? Object.fromEntries(
          Object.entries(reward.resources).flatMap(([key, amount]) =>
            typeof amount === 'number' && amount > 0
              ? [[key, Math.max(1, Math.round(amount * factor))]]
              : [],
          ),
        )
      : undefined,
    items: reward.items,
  }
  return encounterRewardText(scaled)
}

export function describeEffect(effect: Effect): string {
  switch (effect.kind) {
    case 'setFlag': {
      const label = FLAG_LABELS[effect.flag]
      return label ? `刻下「${label}」` : '一段旧因缘落定'
    }
    case 'clearFlag': {
      const label = FLAG_LABELS[effect.flag]
      return label ? `解开「${label}」` : '一段旧因缘散去'
    }
    case 'scheduleEvent': {
      const event = registry.events.get(effect.eventId)
      const delay = effect.delayMonths ?? 0
      return event
        ? `${delay > 0 ? `${delay} 月后` : '随后'}牵出「${event.title}」`
        : `${delay > 0 ? `${delay} 月后` : '随后'}再起一段潮声`
    }
    case 'changeFactionState': {
      const faction = registry.factions.get(effect.factionId)
      const name = faction?.name ?? '无名势力'
      const parts: string[] = []
      if (effect.membership === true) parts.push(`列入${name}`)
      if (effect.membership === false) parts.push(`脱离${name}`)
      if (typeof effect.rank === 'number') {
        const rank = faction?.ranks.find((entry) => entry.order === effect.rank)
        parts.push(rank ? `位次至「${rank.title}」` : `位次至第 ${effect.rank} 阶`)
      }
      if (effect.contributionDelta) {
        parts.push(`贡献 ${signed(effect.contributionDelta)}`)
      }
      if (effect.reputationDelta) {
        parts.push(`声望 ${signed(effect.reputationDelta)}`)
      }
      if (effect.fortuneDelta) {
        parts.push(`气运 ${signed(effect.fortuneDelta)}`)
      }
      if (effect.flags && Object.keys(effect.flags).length > 0) {
        parts.push('门中旧例改易')
      }
      return parts.length > 0 ? parts.join('、') : `${name}的局势生变`
    }
    case 'changeRegionState': {
      const region = registry.regions.get(effect.regionId)
      return `${region?.name ?? '当地'}的旧痕改易`
    }
    case 'unlockSite': {
      const resolved = registry.resolveSite(effect.siteId)
      return `显出幽微「${resolved?.site.name ?? '无名之地'}」`
    }
    case 'unlockRegion': {
      const region = registry.regions.get(effect.regionId)
      return `潮路通至${region?.name ?? '无名之地'}`
    }
    case 'changeEra': {
      const era = registry.eras.get(effect.eraId)
      return `量劫转入${era?.name ?? '下一页'}`
    }
    case 'changeDaoguo':
      return `道果 ${signed(effect.amount)}`
    case 'gainStarMark':
      return `星痕 +${effect.amount}`
    case 'gainFoundation': {
      const foundationLabels: Record<string, string> = {
        health: '气血',
        attack: '攻势',
        defense: '护体',
        spirit: '神识',
      }
      const parts = Object.entries(effect.stats)
        .filter(([, amount]) => typeof amount === 'number' && amount > 0)
        .map(([key, amount]) => `${foundationLabels[key] ?? key} +${amount}`)
      return parts.length > 0 ? `根基 ${parts.join('、')}` : '根基微有增益'
    }
    case 'addRumor':
      return `传出一则风声：${truncateText(effect.text)}`
    case 'changeFavorTier': {
      const partner = registry.partners.get(effect.partnerId)
      return `${partner?.name ?? '某人'}情谊 ${signed(effect.delta)} 阶`
    }
    case 'bondPartner': {
      const partner = registry.partners.get(effect.partnerId)
      return `与${partner?.name ?? '某人'}结为道侣`
    }
    case 'applyStatus': {
      const months = effect.months ? ` ${effect.months} 月` : ''
      return `身负「${statusLabel(effect.statusId)}」${months}`
    }
    case 'grantItem': {
      const count = Math.max(1, Math.floor(effect.count ?? 1))
      return `得「${itemName(effect.itemId)}」${count > 1 ? ` ×${count}` : ''}`
    }
    case 'removeItem': {
      const count = Math.max(1, Math.floor(effect.count ?? 1))
      return `失「${itemName(effect.itemId)}」${count > 1 ? ` ×${count}` : ''}`
    }
    case 'grantTreasure': {
      const treasure = registry.treasures.get(effect.treasureId)
      return `得法宝「${treasure?.name ?? '无名之器'}」`
    }
    case 'grantMount': {
      const mount = registry.mounts.get(effect.mountId)
      return `得坐骑「${mount?.name ?? '无名之骑'}」`
    }
    case 'grantPet': {
      const pet = registry.pets.get(effect.petId)
      return `得灵宠「${pet?.name ?? '无名之灵'}」`
    }
    case 'changeResource':
      return `${RESOURCE_LABELS[effect.resource] ?? '物料'} ${signed(effect.amount)}`
    case 'gainCultivation':
      return `修为 ${signed(effect.amount)}`
    case 'gainBodyTemper':
      return `淬体值 ${signed(effect.amount)}`
    case 'grantBloodline': {
      const bloodline = registry.bloodlines.get(effect.bloodlineId)
      return `承载血脉「${bloodline?.name ?? '旧血'}」`
    }
    case 'learnTechnique': {
      const technique = registry.techniques.get(effect.techniqueId)
      return `习得《${technique?.name ?? '无名功法'}》`
    }
    case 'unlockCave': {
      const cave = registry.caves.get(effect.caveId)
      return `寻得洞府「${cave?.name ?? '无名洞府'}」`
    }
    case 'unlockBuilding': {
      const building = [...registry.caves.values()]
        .flatMap((cave) => cave.buildings)
        .find((entry) => entry.id === effect.caveBuildingId)
      return `洞府开「${building?.name ?? '新筑'}」${effect.level ? ` ${effect.level} 阶` : ''}`
    }
    case 'addMemory':
      return `留下一段旧忆：${truncateText(effect.text)}`
    case 'startCombat': {
      const encounter = registry.encounters.get(effect.encounterId)
      const locked = effect.fleeAllowed === false ? '（退路封死）' : ''
      return `卷入「${encounter?.name ?? '一场争斗'}」${locked}`
    }
    default:
      return '因果生变'
  }
}

export function describeEffects(
  effects: readonly Effect[] | undefined,
  fallback = '无直接得失',
): string {
  if (!effects || effects.length === 0) return fallback
  return effects
    .map((effect) => describeEffect(effect).replace(/[。；，、]+$/u, ''))
    .join('；')
}
