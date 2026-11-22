import { defineStore } from 'pinia'
import type {
  CombatStance,
  CraftRecipeId,
  DaoNodeId,
  DaoPrincipleId,
  DiscipleAssignment,
  DivineAbilityId,
  EncounterId,
  EventId,
  FactionId,
  GameSpeed,
  ItemId,
  MountId,
  PartnerRole,
  PetId,
  RealmId,
  RegionId,
  ResourceCost,
  SiteId,
  TechniqueId,
  WorldBossId,
} from '@/types/common'
import type {
  ChoiceDefinition,
  EventDefinition,
  FactionDefinition,
  ItemDefinition,
  PartnerDefinition,
} from '@/types/content'
import type {
  BodyPath,
  EraTransitionMode,
  FactionState,
  GameSaveData,
  GameSettings,
  IdleSlot,
  InboxEntry,
} from '@/types/state'
import type { GearSlot, GeneratedGear } from '@/types/gear'
import type { TrainingMode } from '@/types/training'
import { getContentRegistry } from '@/data'
import type { ContentRegistry } from '@/data/registry'
import { GEAR_SLOTS, GEAR_SLOT_LABELS } from '@/data/gear/catalog'
import {
  buildGearView,
  dismantleGear as dismantleGearCore,
  equipGear as equipGearCore,
  quoteGearRecycle,
  recycleGear as recycleGearCore,
  reforgeGear as reforgeGearCore,
  sealGearAffix as sealGearAffixCore,
  toggleGearLock as toggleGearLockCore,
  transferGearAffix as transferGearAffixCore,
  unequipGear as unequipGearCore,
  unsealGearAffix as unsealGearAffixCore,
  upgradeGear as upgradeGearCore,
} from '@/core/gear'
import {
  advanceTraining,
  startTraining as startTrainingCore,
  stopTraining as stopTrainingCore,
  trainingEncounters,
  trainingMode,
  trainingProgress,
  TRAINING_MODES,
} from '@/core/training'
import {
  acquireBloodline as acquireBloodlineCore,
  applyBodyTemperGain,
  attemptBodyBreakthrough as attemptBodyBreakthroughCore,
  awakenBloodline as awakenBloodlineCore,
  characterBodyView,
  refineBloodline as refineBloodlineCore,
  setBodyPath as setBodyPathCore,
  severBloodline as severBloodlineCore,
  temperBody as temperBodyCore,
} from '@/core/bodyActions'
import {
  activateTreasure as activateTreasureCore,
  advanceCharacterTime,
  attemptBreakthrough as attemptBreakthroughCore,
  breakthroughInfo,
  computeCharacterSheet,
  evolvePet as evolvePetCore,
  growMount as growMountCore,
  setActiveMount as setActiveMountCore,
  setActivePet as setActivePetCore,
  setActiveTreasure as setActiveTreasureCore,
  statusDescription,
  statusLabel,
  studyTechniqueNode,
  techniqueViews,
  temperTreasure as temperTreasureCore,
  treasureActiveCooldown,
  treasureEffectiveStats,
  treasureTemperLevel,
  useConsumableItem,
} from '@/core/character'
import {
  fleeEncounter,
  resolveEncounter,
  type CombatResult,
} from '@/core/combat'
import {
  advanceCaveTime,
  assignDisciple as assignDiscipleCore,
  canPayCost,
  caveChainStates,
  caveDefenseBonus,
  caveProduction,
  caveRaidDefinition,
  caveTideState,
  caveVeinTendCooldown,
  caveVerbCooldown,
  caveVisitorDefinition,
  discipleAssignment,
  discipleAssignmentPower,
  expertiseMonths,
  expertiseRank,
  nextExpertiseRank,
  recruitDisciple as recruitDiscipleCore,
  resolveCaveVisitor as resolveCaveVisitorCore,
  tendCaveVein as tendCaveVeinCore,
  toggleCaveChain as toggleCaveChainCore,
  TRUST_MAX,
  upgradeCaveBuilding as upgradeCaveBuildingCore,
  upgradeCaveVein as upgradeCaveVeinCore,
  useCaveVerb as useCaveVerbCore,
  VEIN_TEND_COOLDOWN,
  VEIN_TEND_COST,
  VISITOR_STAY_MONTHS,
} from '@/core/cave'
import { evaluateRequirements } from '@/core/conditions'
import {
  DAO_BOSS_MARK_IDS,
  DAO_RESET_COST,
  DAO_STORY_MARK_EVENT_IDS,
  daoCombatRules,
  daoProductionRules,
  daoRealmMilestones,
  daoSpentMarks,
  purchaseDaoNode as purchaseDaoNodeCore,
  purchaseDaoPrinciple as purchaseDaoPrincipleCore,
  resetDao as resetDaoCore,
} from '@/core/dao'
import {
  divineAbilityViews,
  divineSummary,
  equipTechnique as equipTechniqueCore,
  fuseDivineAbility as fuseDivineAbilityCore,
  setDivineAbilityActive as setDivineAbilityActiveCore,
  unequipTechnique as unequipTechniqueCore,
} from '@/core/divine'
import {
  craftRecipe as craftRecipeCore,
  professionViews,
} from '@/core/professions'
import { processWorldDispatch } from '@/core/dispatch'
import {
  advanceWorldBossTime,
  describeWorldBossDrop,
  prepareWorldBossChallenge,
  resolveWorldBossEncounter,
  worldBossAvailability,
  worldBossEnemyStats,
  worldBossKillScale,
  worldBossSigil,
  worldBossStateOf,
} from '@/core/worldBoss'
import {
  advanceEraPhase,
  nextEraPhase,
  settlementReadiness,
  settleEra,
} from '@/core/era'
import {
  findPlayerFaction,
  FACTION_DUTY_COOLDOWN_MONTHS,
  factionRankTitle,
  factionTechniqueCost,
  factionTechniqueRank,
  joinFaction,
  learnFactionTechnique,
  leaveFaction,
  nextRankDefinition,
  performFactionDuty,
  promoteFaction,
  promotionCost,
} from '@/core/faction'
import { cloneGameSaveData } from '@/core/state'
import { createNewGameSave } from '@/core/newGame'
import {
  checkEventEligibility,
  processScheduledEvents,
  resolveEventChoice,
} from '@/core/eventRuntime'
import { markInboxRead } from '@/core/inbox'
import { setIdleSlotActive, TRAVEL_PROGRESS_CAP } from '@/core/idle'
import { simulateOffline, type OfflineGate, type OfflineReport } from '@/core/offline'
import { createSaveEnvelope, decodeSaveJson, SAVE_VERSION } from '@/core/save'
import {
  SaveSlotStore,
  type ManualSaveSlot,
  type SaveSlotSummary,
} from '@/core/saveSlots'
import { createLocalStorageSaveStorage } from '@/core/saveStorage'
import { tickEngine, type TickGate } from '@/core/tick'
import {
  calendarFromMonths,
  formatGameSpan,
  formatGameTime,
  isClockPaused,
  pushPauseToken,
  releasePauseToken,
  setGameSpeed,
} from '@/core/time'
import {
  exploreSite,
  HIDDEN_TRAVEL_PROGRESS_COST,
  SITE_EXPLORE_COST,
  TRAVEL_PROGRESS_COST,
  travelToRegion,
} from '@/core/world'

const registry: ContentRegistry = getContentRegistry()
const MANUAL_PAUSE_TOKEN = 'manual-pause'

export interface NewGameChoice {
  name: string
  originId: string
  rootId: string
  physiqueId: string
  talentIds: string[]
}

const REALM_LABELS: Record<RealmId, string> = {
  mortal: '凡人',
  qi_refining: '炼气',
  foundation: '筑基',
  golden_core: '金丹',
}

const RESOURCE_LABELS: Record<string, string> = {
  spirit_stones: '灵石',
  spirit_herbs: '灵草',
  ore: '灵矿',
  beast_cores: '兽核',
  contribution: '贡献',
  merit: '功德',
  karma: '因果',
}

const SLOT_LABELS: Record<IdleSlot, string> = {
  cultivation: '主修',
  cave: '洞府',
  travel: '游历',
}

const FAVOR_LABELS = ['陌路', '相识', '信重', '知己', '同心'] as const

const PARTNER_ROLE_LABELS: Record<PartnerRole, string> = {
  companion: '同行',
  guardian: '守御',
  scout: '斥候',
  teacher: '授业',
}

function favorLabelOf(favor: number): string {
  const tier = Math.max(0, Math.min(FAVOR_LABELS.length - 1, Math.floor(favor)))
  return FAVOR_LABELS[tier]
}

function partnerViewOf(state: GameSaveData, partner: PartnerDefinition) {
  const eraId = state.campaign.currentEra
  const favor = state.player.partnerFavor[partner.id] ?? 0
  const bonded = state.player.partnerIds.includes(partner.id)
  const bondCheck = evaluateRequirements(state, partner.bond.requirements)
  const logs = state.eventRuntime.favorLog
    .filter((entry) => entry.partnerId === partner.id)
    .slice(-4)
    .reverse()
  return {
    id: partner.id,
    name: partner.name,
    roleLabel: PARTNER_ROLE_LABELS[partner.role],
    factionName: partner.factionId
      ? (registry.factions.get(partner.factionId)?.name ?? '不明')
      : '散修',
    eraFate: partner.eraFates[eraId] ?? '',
    description: partner.description,
    favor,
    favorLabel: favorLabelOf(favor),
    bonded,
    bondReady: bondCheck.ok,
    bondUnmet: bondCheck.unmet,
    bondDescription: partner.bond.description,
    bondEventTitle: partner.bond.eventId
      ? (registry.events.get(partner.bond.eventId)?.title ?? '')
      : '',
    postEventTitles: partner.postBondEventIds
      .map((eventId) => registry.events.get(eventId)?.title ?? '')
      .filter(Boolean),
    publicEventTitles: (partner.publicEventIds ?? [])
      .map((eventId) => registry.events.get(eventId)?.title ?? '')
      .filter(Boolean),
    logs,
  }
}

function createUnbornGame(): GameSaveData {
  const game = createNewGameSave({
    playerName: '未落生',
    origin: '四海',
    lineage: '人族',
    eraId: 'era.prologue',
    phaseId: 'phase.prologue.wake',
    regionId: 'region.longhan.four_seas',
    realm: 'mortal',
    stage: 1,
    regions: [...registry.regions.values()].map((region) => ({
      id: region.id,
      unlocked: region.id === 'region.longhan.four_seas',
      visited: region.id === 'region.longhan.four_seas',
    })),
    factions: [...registry.factions.values()].map((faction) => ({
      id: faction.id,
      membership: false,
      rank: 0,
    })),
    idleActive: {
      cultivation: false,
      travel: false,
    },
    seed: 0x9e3779b9,
  })
  game.player.flags['meta.unborn'] = true
  game.player.health = computeCharacterSheet(game, registry).maxHealth
  return game
}

function isGameSaveData(value: unknown): value is GameSaveData {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<GameSaveData>
  return (
    candidate.schemaVersion === SAVE_VERSION &&
    !!candidate.player &&
    typeof candidate.player.cultivation === 'number' &&
    !!candidate.player.resources &&
    !!candidate.campaign?.world &&
    Array.isArray(candidate.inbox) &&
    Array.isArray(candidate.chronicle) &&
    !!candidate.clock &&
    !!candidate.idle &&
    !!candidate.eventRuntime
  )
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const safe = Math.max(0, value)
  if (safe >= 100_000_000) return `${(safe / 100_000_000).toFixed(1)}亿`
  if (safe >= 10_000) return `${(safe / 10_000).toFixed(1)}万`
  if (safe < 10 && !Number.isInteger(safe)) return safe.toFixed(1)
  return Math.floor(safe).toString()
}

function addResources(
  target: GameSaveData,
  resources: Partial<Record<string, number>>,
): void {
  for (const [key, amount] of Object.entries(resources)) {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) continue
    target.player.resources[key as keyof typeof target.player.resources] =
      (target.player.resources[key as keyof typeof target.player.resources] ?? 0) + amount
  }
}

function buildBlockingGates(game: GameSaveData): TickGate[] {
  if (game.settings.pauseMode === 'none') return []
  const gates: TickGate[] = []
  for (const entry of game.eventRuntime.scheduled) {
    const pause = registry.events.get(entry.eventId)?.pause
    if (pause === 'story' || (pause === 'ambient' && game.settings.pauseMode === 'all')) {
      gates.push({ atMonths: entry.dueMonths })
    }
  }
  return gates
}

function activeMountTravelBonus(game: GameSaveData): number {
  const mountId = game.player.activeMountId
  if (!mountId) return 0
  const mount = registry.mounts.get(mountId)
  const stageIndex = game.player.mountStages[mountId] ?? 1
  return mount?.stages.find((stage) => stage.stage === stageIndex)?.travelBonus ?? 0
}

function buildIdleRates(game: GameSaveData) {
  const sheet = computeCharacterSheet(game, registry)
  const production = caveProduction(game, registry)
  return {
    cultivationPerMonth:
      (0.8 + (game.cave ? 0.4 : 0) + production.cultivationPerMonth) *
      sheet.cultivationMultiplier,
    caveYieldPerMonth: game.cave ? production.resources : {},
    travelProgressPerMonth:
      (1.2 + production.travelPerMonth + activeMountTravelBonus(game)) *
      (1 + Math.max(0, sheet.mods.travel)),
  }
}

function costText(cost?: ResourceCost): string {
  if (!cost) return '无'
  const entries = Object.entries(cost).filter(
    ([, amount]) => typeof amount === 'number' && amount > 0,
  )
  if (entries.length === 0) return '无'
  return entries
    .map(([key, amount]) => `${RESOURCE_LABELS[key] ?? '物料'} ${amount}`)
    .join(' · ')
}

const DISCIPLE_ASSIGNMENT_LABELS: Record<DiscipleAssignment, string> = {
  study: '研读',
  gather: '采集',
  guard: '守夜',
  craft: '炼作',
  tend: '养脉',
}

const DISCIPLE_ASSIGNMENTS: DiscipleAssignment[] = [
  'study',
  'gather',
  'guard',
  'craft',
  'tend',
]


function statsText(stats?: {
  health?: number
  attack?: number
  defense?: number
  speed?: number
  crit?: number
  spirit?: number
}): string {
  if (!stats) return ''
  const labels: Array<[keyof typeof stats, string]> = [
    ['health', '气血'],
    ['attack', '攻'],
    ['defense', '防'],
    ['speed', '速'],
    ['crit', '暴'],
    ['spirit', '神'],
  ]
  return labels
    .filter(([key]) => typeof stats[key] === 'number' && stats[key] !== 0)
    .map(([key, label]) => `${label} +${stats[key]}`)
    .join(' · ')
}

function consumableUseText(item: ItemDefinition): string {
  if (item.category !== 'consumable') return ''
  const parts = item.effects.flatMap((effect) => {
    if (effect.kind === 'applyStatus') {
      const months = effect.months ? ` ${effect.months} 月` : ''
      return [`获得「${statusLabel(effect.statusId)}」${months}`]
    }
    if (effect.kind === 'changeResource') {
      const amount = effect.amount > 0 ? `+${effect.amount}` : `${effect.amount}`
      return [`${RESOURCE_LABELS[effect.resource] ?? '物料'} ${amount}`]
    }
    if (effect.kind === 'gainCultivation') return [`修为 +${effect.amount}`]
    if (effect.kind === 'gainBodyTemper') return [`淬体值 +${effect.amount}`]
    if (effect.kind === 'grantBloodline') return ['承载一条旧血']
    return []
  })
  return parts.join('、') || '药效会在服下后生效'
}

export const useGameStore = defineStore('game', {
  state: () => ({
    game: createUnbornGame(),
    started: false,
    activeEventId: null as EventId | null,
    toast: null as string | null,
    offlineReport: null as OfflineReport | null,
    loadedFromSave: false,
    lastSavedLabel: '',
    lastAutosaveAt: 0,
    saving: false,
    lastCombat: null as CombatResult | null,
  }),

  getters: {
    era(state) {
      return registry.eras.get(state.game.campaign.currentEra)
    },
    phase(state) {
      return registry.eras
        .get(state.game.campaign.currentEra)
        ?.phases.find((phase) => phase.id === state.game.campaign.world.phaseId)
    },
    region(state) {
      return registry.regions.get(state.game.player.regionId)
    },
    currentRegion(state) {
      return registry.regions.get(state.game.player.regionId)
    },
    regionState(state) {
      return state.game.campaign.world.regions[state.game.player.regionId]
    },
    currentRegionState(state) {
      return state.game.campaign.world.regions[state.game.player.regionId]
    },
    joinedFactionId(state): FactionId | undefined {
      return findPlayerFaction(state.game)
    },
    faction(state): FactionDefinition | undefined {
      const factionId = findPlayerFaction(state.game)
      return factionId ? registry.factions.get(factionId) : undefined
    },
    factionState(state) {
      const factionId = findPlayerFaction(state.game)
      return factionId
        ? state.game.campaign.world.factions[factionId]
        : undefined
    },
    factionRankTitle(state): string {
      const factionId = findPlayerFaction(state.game)
      if (!factionId) return '门外客'
      const rank = state.game.campaign.world.factions[factionId]?.rank ?? 0
      return factionRankTitle(registry.factions.get(factionId), rank)
    },
    regionViews(state) {
      const currentId = state.game.player.regionId
      const currentDefinition = registry.regions.get(currentId)
      const ending = !!state.game.campaign.ending
      const era = registry.eras.get(state.game.campaign.currentEra)
      const order = new Map((era?.regionIds ?? []).map((id, index) => [id, index]))
      return [...registry.regions.values()]
        .filter((definition) => definition.eraIds.includes(state.game.campaign.currentEra))
        .sort(
          (left, right) =>
            (order.get(left.id) ?? 99) - (order.get(right.id) ?? 99),
        )
        .map((definition) => {
          const regionState = state.game.campaign.world.regions[definition.id]
          const unlocked = regionState?.unlocked ?? false
          const visited = regionState?.visited ?? false
          const isCurrent = definition.id === currentId
          const adjacent = currentDefinition?.neighbors.includes(definition.id) ?? false
          const requirements = evaluateRequirements(
            state.game,
            definition.unlockRequirements ?? [],
          )
          const revealed = !definition.hidden || unlocked || requirements.ok
          const cost = definition.hidden
            ? HIDDEN_TRAVEL_PROGRESS_COST
            : TRAVEL_PROGRESS_COST
          const routeKnown = visited || adjacent
          const canTravel =
            !ending &&
            !isCurrent &&
            state.game.idle.travelProgress >= cost &&
            (unlocked ? routeKnown : adjacent && requirements.ok)
          return {
            ...definition,
            name: revealed ? definition.name : '云遮之地',
            description: revealed
              ? definition.description
              : '潮路尽头被云水遮住。先走到相邻之地，才有机会看见它的真名。',
            revealed,
            unlocked,
            visited,
            isCurrent,
            adjacent,
            routeKnown,
            canTravel,
            travelCost: cost,
            requirementsMet: requirements.ok,
            unmet: requirements.unmet,
            travelProgress: state.game.idle.travelProgress,
            factionNames: definition.factionPresence
              .map((id) => registry.factions.get(id)?.name ?? '无名势力'),
            siteCount: definition.sites.length,
            exploredSiteCount: regionState
              ? definition.sites.filter(
                  (site) => (regionState.exploredSites[site.id] ?? 0) > 0,
                ).length
              : 0,
          }
        })
    },
    siteViews(state) {
      const region = registry.regions.get(state.game.player.regionId)
      if (!region) return []
      const regionState = state.game.campaign.world.regions[region.id]
      const ending = !!state.game.campaign.ending
      return region.sites.map((site) => {
        const requirements = evaluateRequirements(state.game, site.unlockRequirements)
        const unlocked = !site.hidden || regionState?.unlockedSiteIds.includes(site.id) === true
        const accessible = unlocked || requirements.ok
        const revealed = !site.hidden || accessible
        const explored = regionState?.exploredSites[site.id] ?? 0
        return {
          ...site,
          name: revealed ? site.name : '未名之地',
          description: revealed
            ? site.description
            : '林雾与潮声叠在一起，还看不清这里究竟藏着什么。',
          revealed,
          unlocked,
          accessible,
          explored,
          firstVisit: explored === 0,
          canExplore:
            !ending &&
            accessible &&
            state.game.idle.travelProgress >= SITE_EXPLORE_COST,
          exploreCost: SITE_EXPLORE_COST,
          requirementsMet: requirements.ok,
          unmet: requirements.unmet,
        }
      })
    },
    factionViews(state) {
      const currentMembership = findPlayerFaction(state.game)
      const ending = !!state.game.campaign.ending
      return [...registry.factions.values()]
        .filter((definition) =>
          definition.eraPresence[state.game.campaign.currentEra] !== undefined,
        )
        .map((definition) => {
          const factionState: FactionState =
            state.game.campaign.world.factions[definition.id] ?? {
            id: definition.id,
            membership: false,
            rank: 0,
            contribution: 0,
            reputation: 0,
            fortune: 0,
            flags: {},
          }
          const nextRank = nextRankDefinition(definition, factionState.rank)
          const rankGate = nextRank
            ? evaluateRequirements(state.game, nextRank.requirements)
            : { ok: false, unmet: [] }
          const cost = nextRank
            ? promotionCost(nextRank.order)
            : { contribution: 0, reputation: 0 }
          const joinGate = evaluateRequirements(
            state.game,
            definition.join?.requirements ?? [],
          )
          const eraStatus =
            definition.eraPresence[state.game.campaign.currentEra] ?? 'absent'
          const entryCost = definition.join?.entryCost ?? {}
          const canPayJoin = Object.entries(entryCost).every(([key, amount]) => {
            if (!amount || amount <= 0) return true
            return (
              state.game.player.resources[key as keyof typeof state.game.player.resources] ??
              0
            ) >= amount
          })
          const dutyLast = factionState.flags['duty_last_month']
          const dutyCooldownRemaining =
            typeof dutyLast === 'number'
              ? Math.max(
                  0,
                  dutyLast + FACTION_DUTY_COOLDOWN_MONTHS - state.game.clock.elapsedMonths,
                )
              : 0
          const teachings = factionState.membership
            ? (definition.techniqueIds ?? []).flatMap((techniqueId) => {
                const technique = registry.techniques.get(techniqueId)
                if (!technique) return []
                const learned = state.game.player.techniqueIds.includes(techniqueId)
                const requiredRank = factionTechniqueRank(technique)
                const techniqueCost = factionTechniqueCost(technique)
                return [
                  {
                    id: technique.id,
                    name: technique.name,
                    description: technique.description,
                    tier: technique.tier,
                    skillName: technique.skill?.name,
                    learned,
                    requiredRank,
                    requiredRankTitle: factionRankTitle(definition, requiredRank),
                    contribution: techniqueCost.contribution,
                    spiritStones: techniqueCost.spiritStones,
                    canLearn:
                      !ending &&
                      !learned &&
                      factionState.rank >= requiredRank &&
                      factionState.contribution >= techniqueCost.contribution &&
                      (state.game.player.resources.spirit_stones ?? 0) >=
                        techniqueCost.spiritStones,
                  },
                ]
              })
            : []
          return {
            ...definition,
            eraStatus,
            revealed: eraStatus !== 'hidden' || joinGate.ok,
            membership: factionState.membership,
            rank: factionState.rank,
            rankTitle: factionRankTitle(definition, factionState.rank),
            contribution: factionState.contribution,
            reputation: factionState.reputation,
            otherMembership: !!currentMembership && currentMembership !== definition.id,
            joinRequirementsMet: joinGate.ok,
            joinUnmet: joinGate.unmet,
            canPayJoin,
            canJoin:
              !ending &&
              definition.joinable &&
              !!definition.join &&
              !factionState.membership &&
              !currentMembership &&
              joinGate.ok &&
              canPayJoin,
            nextRank,
            nextRankTitle: nextRank?.title,
            nextRankTrial: nextRank?.trial,
            promotionCost: cost,
            promotionGateMet: rankGate.ok,
            promotionUnmet: rankGate.unmet,
            canPromote:
              !ending &&
              factionState.membership &&
              !!nextRank &&
              rankGate.ok &&
              factionState.contribution >= cost.contribution &&
              factionState.reputation >= cost.reputation,
            dutyCooldownRemaining,
            canDuty:
              !ending &&
              factionState.membership &&
              dutyCooldownRemaining <= 0,
            teachings,
            relationshipViews: definition.relations.map((relation) => ({
              ...relation,
              factionName: registry.factions.get(relation.factionId)?.name ?? '无名势力',
            })),
          }
        })
    },
    eraPhases(state) {
      const era = registry.eras.get(state.game.campaign.currentEra)
      if (!era) return []
      const current = era.phases.find(
        (phase) => phase.id === state.game.campaign.world.phaseId,
      )
      const currentOrder = current?.order ?? 0
      return [...era.phases]
        .sort((left, right) => left.order - right.order)
        .map((phase) => {
          const gate = evaluateRequirements(state.game, phase.gateRequirements)
          return {
            ...phase,
            active: phase.id === current?.id,
            passed: phase.order < currentOrder,
            gateMet: gate.ok,
            unmet: gate.unmet,
          }
        })
    },
    nextPhaseInfo(state) {
      const era = registry.eras.get(state.game.campaign.currentEra)
      if (!era) return undefined
      const next = nextEraPhase(era, state.game.campaign.world.phaseId)
      if (!next) return undefined
      const gate = evaluateRequirements(state.game, next.gateRequirements)
      return {
        ...next,
        gateMet: gate.ok,
        unmet: gate.unmet,
      }
    },
    settlementReadiness(state) {
      return settlementReadiness(
        state.game,
        registry.eras.get(state.game.campaign.currentEra),
      )
    },
    ending(state) {
      return state.game.campaign.ending
    },
    travelProgress(state): number {
      return state.game.idle.travelProgress
    },
    partnerViews(state) {
      return [...registry.partners.values()].map((partner) =>
        partnerViewOf(state.game, partner),
      )
    },
    featuredPartner(state) {
      const partners = [...registry.partners.values()]
      const bonded = partners.find((partner) =>
        state.game.player.partnerIds.includes(partner.id),
      )
      const candidate =
        bonded ??
        partners
          .filter((partner) => (state.game.player.partnerFavor[partner.id] ?? 0) > 0)
          .sort(
            (left, right) =>
              (state.game.player.partnerFavor[right.id] ?? 0) -
              (state.game.player.partnerFavor[left.id] ?? 0),
          )[0]
      return candidate ? partnerViewOf(state.game, candidate) : undefined
    },
    bondedPartnerCount(state): number {
      return state.game.player.partnerIds.length
    },
    cave: (state) =>
      state.game.cave ? registry.caves.get(state.game.cave.id) : undefined,
    caveOpen: (state) => !!state.game.cave,
    buildingLevels(state): Record<string, number> {
      return state.game.cave?.buildings ?? {}
    },
    buildingViews(state) {
      const cave = state.game.cave
      if (!cave) return []
      const definition = registry.caves.get(cave.id)
      if (!definition) return []
      return definition.buildings.map((building) => {
        const level = cave.buildings[building.id] ?? 0
        const current = building.levels.find((entry) => entry.level === level)
        const next = building.levels.find((entry) => entry.level === level + 1)
        const verb = current?.verb
        const cooldown = verb ? caveVerbCooldown(state.game, verb.id) : 0
        return {
          id: building.id,
          name: building.name,
          description: building.description,
          level,
          maxLevel: building.levels.length,
          levels: building.levels.map((entry) => ({
            ...entry,
            unlocked: level >= entry.level,
          })),
          current,
          next,
          canUpgrade: !!next && canPayCost(state.game, next.cost),
          nextCostText: next ? costText(next.cost) : '',
          verb: verb
            ? {
                ...verb,
                cooldown,
                ready: cooldown <= 0,
                affordable: canPayCost(state.game, verb.cost),
                costText: costText(verb.cost),
                canUse:
                  cooldown <= 0 &&
                  canPayCost(state.game, verb.cost) &&
                  !state.game.campaign.ending,
              }
            : undefined,
        }
      })
    },
    caveTideView(state) {
      const tide = caveTideState(state.game, registry)
      return {
        ...tide,
        tideText: formatAmount(tide.tide),
        perMonthText: formatAmount(tide.perMonth),
        percent: tide.cap > 0 ? Math.min(100, Math.round((tide.tide / tide.cap) * 100)) : 0,
      }
    },
    caveChainViews(state) {
      return caveChainStates(state.game, registry).map((chain) => ({
        ...chain,
        tideCostText: formatAmount(chain.definition.tidePerMonth),
        inputCostText: costText(chain.definition.inputs),
        missingText: Object.entries(chain.missing)
          .map(
            ([key, amount]) =>
              `${RESOURCE_LABELS[key] ?? '物料'} ${formatAmount(amount ?? 0)}`,
          )
          .join('、'),
      }))
    },
    caveProductionView(state) {
      const production = caveProduction(state.game, registry)
      const cave = state.game.cave
      return {
        cultivation: formatAmount(production.cultivationPerMonth),
        travel: formatAmount(production.travelPerMonth),
        defense: production.defense,
        purity: cave?.purity ?? 0,
        reputation: cave?.reputation ?? 0,
        purityFactor: production.purityFactor,
        purityPercent: Math.round(production.purityFactor * 100),
        resources: Object.entries(production.resources).flatMap(([key, rate]) =>
          typeof rate === 'number' && rate > 0
            ? [
                {
                  key,
                  label: RESOURCE_LABELS[key] ?? '物料',
                  value: formatAmount(rate),
                },
              ]
            : [],
        ),
      }
    },
    caveVeinView(state) {
      const cave = state.game.cave
      if (!cave) return undefined
      const definition = registry.caves.get(cave.id)
      if (!definition) return undefined
      const current = definition.spiritVein.levels.find(
        (entry) => entry.level === cave.spiritVeinLevel,
      )
      const next = definition.spiritVein.levels.find(
        (entry) => entry.level === cave.spiritVeinLevel + 1,
      )
      const tendCooldown = caveVeinTendCooldown(state.game)
      return {
        ...definition.spiritVein,
        current,
        next,
        purity: cave.purity,
        reputation: cave.reputation,
        purityFactor:
          Math.round((0.75 + (cave.purity / 100) * 0.45) * 100) / 100,
        canUpgrade:
          !!next &&
          canPayCost(state.game, next.cost) &&
          !state.game.campaign.ending,
        costText: next ? costText(next.cost) : '',
        tendCooldown,
        tendReady: tendCooldown <= 0,
        tendAffordable: canPayCost(state.game, VEIN_TEND_COST),
        tendCostText: costText(VEIN_TEND_COST),
        tendCooldownMonths: VEIN_TEND_COOLDOWN,
        canTend:
          cave.purity < 100 &&
          tendCooldown <= 0 &&
          canPayCost(state.game, VEIN_TEND_COST) &&
          !state.game.campaign.ending,
      }
    },
    caveDiscipleViews(state) {
      const cave = state.game.cave
      if (!cave) return []
      const definition = registry.caves.get(cave.id)
      if (!definition) return []
      return definition.disciples.map((disciple) => {
        const recruited = cave.discipleIds.includes(disciple.id)
        const assignment = discipleAssignment(cave, disciple)
        const trust = cave.discipleTrust[disciple.id] ?? 0
        const gate = evaluateRequirements(state.game, disciple.requirements)
        const affordable = canPayCost(state.game, disciple.recruitCost)
        const expertise = expertiseMonths(cave, disciple.id, assignment)
        const rank = expertiseRank(expertise)
        const nextRank = nextExpertiseRank(expertise)
        return {
          ...disciple,
          recruited,
          assignment,
          assignmentLabel: DISCIPLE_ASSIGNMENT_LABELS[assignment],
          assignmentOptions: DISCIPLE_ASSIGNMENTS.map((id) => ({
            id,
            label: DISCIPLE_ASSIGNMENT_LABELS[id],
            active: id === assignment,
            power: discipleAssignmentPower(cave, disciple, id),
            rank: expertiseRank(expertiseMonths(cave, disciple.id, id)).name,
          })),
          trust,
          trustMax: TRUST_MAX,
          trustLine:
            disciple.trustLines[
              Math.min(
                disciple.trustLines.length - 1,
                Math.floor(trust / 2),
              )
            ] ?? '',
          expertiseMonths: Math.floor(expertise),
          expertiseRank: rank.name,
          expertiseBonus: Math.round(rank.bonus * 100),
          expertiseNext: nextRank
            ? `${nextRank.name} · 还需 ${Math.max(0, Math.ceil(nextRank.months - expertise))} 月`
            : '已至此道尽头',
          power: discipleAssignmentPower(cave, disciple, assignment),
          powerText: `差事效率 ${Math.round(
            discipleAssignmentPower(cave, disciple, assignment) * 100,
          )}%${disciple.aptitude === assignment ? '（本命差事）' : ''}`,
          requirementsMet: gate.ok,
          unmet: gate.unmet,
          affordable,
          recruitCostText: costText(disciple.recruitCost),
          canRecruit:
            !recruited &&
            gate.ok &&
            affordable &&
            !state.game.campaign.ending,
        }
      })
    },
    caveRaidView(state) {
      const cave = state.game.cave
      const raid = caveRaidDefinition(state.game, registry)
      if (!cave?.raid || !raid) return undefined
      return {
        ...raid,
        encounterName: registry.encounters.get(raid.encounterId)?.name ?? '不明敌手',
        dueIn: Math.max(0, Math.ceil(cave.raid.dueMonths - state.game.clock.elapsedMonths)),
        encounterQueued: cave.raid.encounterQueued,
        defense: caveDefenseBonus(state.game, registry),
      }
    },
    caveVisitorView(state) {
      const cave = state.game.cave
      const visitor = caveVisitorDefinition(state.game, registry)
      if (!cave?.visitor || !visitor) return undefined
      return {
        ...visitor,
        stayMonths: Math.max(
          0,
          Math.ceil(
            VISITOR_STAY_MONTHS -
              (state.game.clock.elapsedMonths - cave.visitor.arrivedMonths),
          ),
        ),
        choices: visitor.choices
          .filter(
            (choice) =>
              !choice.requirements.some((requirement) => {
                if (requirement.kind === 'petNotOwned') {
                  return state.game.player.petIds.includes(requirement.petId)
                }
                if (requirement.kind === 'mountNotOwned') {
                  return state.game.player.mountIds.includes(requirement.mountId)
                }
                if (requirement.kind === 'treasureNotOwned') {
                  return state.game.player.treasureIds.includes(requirement.treasureId)
                }
                return false
              }),
          )
          .map((choice) => {
            const gate = evaluateRequirements(state.game, choice.requirements)
            const affordable = canPayCost(state.game, choice.cost)
            return {
              ...choice,
              requirementsMet: gate.ok,
              unmet: gate.unmet,
              affordable,
              costText: costText(choice.cost),
              canChoose:
                gate.ok && affordable && !state.game.campaign.ending,
            }
          }),
      }
    },
    caveDefenseValue(state): number {
      return caveDefenseBonus(state.game, registry)
    },
    caveStatus(state) {
      const cave = state.game.cave
      if (!cave) {
        return { open: false, label: '尚未寻得', detail: '寻得洞府后可养灵脉、收道童。' }
      }
      const definition = registry.caves.get(cave.id)
      const raid = caveRaidDefinition(state.game, registry)
      const visitor = caveVisitorDefinition(state.game, registry)
      if (cave.raid) {
        return {
          open: true,
          label: `来袭 · ${raid?.name ?? '不明动静'}`,
          detail: cave.raid.encounterQueued
            ? '敌手已到洞口，需在遭遇中应战。'
            : `${Math.max(0, Math.ceil(cave.raid.dueMonths - state.game.clock.elapsedMonths))} 个月后抵达，可先备阵。`,
        }
      }
      if (cave.visitor) {
        return {
          open: true,
          label: `访客 · ${visitor?.name ?? '有人来访'}`,
          detail: '洞口有人在等，去听听他要说什么。',
        }
      }
      return {
        open: true,
        label: `${definition?.name ?? '洞府'} · 灵脉 ${cave.spiritVeinLevel} 级`,
        detail: `${cave.discipleIds.length} 位道童 · 澄澈 ${Math.round(cave.purity)} · 声名 ${cave.reputation}`,
      }
    },
    caveLogViews(state) {
      const cave = state.game.cave
      if (!cave) return []
      return [...cave.log].reverse()
    },
    calendar(state) {
      return calendarFromMonths(state.game.clock.elapsedMonths)
    },
    gameTime(state): string {
      return formatGameTime(state.game.clock.elapsedMonths)
    },
    eraLabel(state): string {
      return registry.eras.get(state.game.campaign.currentEra)?.name ?? '此劫'
    },
    phaseLabel(state): string {
      return (
        registry.eras
          .get(state.game.campaign.currentEra)
          ?.phases.find((phase) => phase.id === state.game.campaign.world.phaseId)
          ?.name ?? ''
      )
    },
    realmLabel(state): string {
      return `${REALM_LABELS[state.game.player.realm]} ${state.game.player.stage} 层`
    },
    cultivationLabel(state): string {
      return formatAmount(state.game.player.cultivation)
    },
    resourceChips(state) {
      return Object.entries(RESOURCE_LABELS).map(([key, label]) => ({
        key,
        label,
        value: formatAmount(
          state.game.player.resources[
            key as keyof typeof state.game.player.resources
          ] ?? 0,
        ),
      }))
    },
    sheet(state) {
      return computeCharacterSheet(state.game, registry)
    },
    physiqueOptions() {
      return [...registry.physiques.values()].filter(
        (physique) => physique.selectable !== false,
      )
    },
    physiqueDefinition(state) {
      return registry.physiques.get(state.game.player.physiqueId)
    },
    bodyView(state) {
      return characterBodyView(state.game, registry)
    },
    cultivationRateView(state) {
      const sheet = computeCharacterSheet(state.game, registry)
      const production = caveProduction(state.game, registry)
      const base = 0.8 + (state.game.cave ? 0.4 : 0) + production.cultivationPerMonth
      const breakdown = sheet.cultivationBreakdown
      return {
        base,
        caveBase: state.game.cave ? 0.4 : 0,
        caveProduction: production.cultivationPerMonth,
        rootMultiplier: breakdown.root,
        physiqueMultiplier: breakdown.physique,
        pathMultiplier: breakdown.path,
        balanceMultiplier: breakdown.balance,
        talentBonus: breakdown.talent,
        rootBonus: breakdown.root - 1,
        modBonus: sheet.mods.cultivation,
        multiplier: sheet.cultivationMultiplier,
        total: base * sheet.cultivationMultiplier,
        bodyGainMultiplier: characterBodyView(state.game, registry).bodyTemperMultiplier,
      }
    },
    originDefinition(state) {
      return registry.origins.get(state.game.player.originId)
    },
    rootDefinition(state) {
      return registry.roots.get(state.game.player.rootId)
    },
    talentDefinitions(state) {
      return state.game.player.talentIds.flatMap((id) => {
        const talent = registry.talents.get(id)
        return talent ? [talent] : []
      })
    },
    healthLabel(state): string {
      const sheet = computeCharacterSheet(state.game, registry)
      return `${Math.ceil(state.game.player.health)} / ${sheet.maxHealth}`
    },
    healthPercent(state): number {
      const sheet = computeCharacterSheet(state.game, registry)
      return Math.max(
        0,
        Math.min(100, Math.round((state.game.player.health / sheet.maxHealth) * 100)),
      )
    },
    characterAttributes(state) {
      const sheet = computeCharacterSheet(state.game, registry)
      return [
        {
          key: 'health',
          label: '气血',
          value: `${Math.ceil(state.game.player.health)} / ${sheet.maxHealth}`,
          hint: '当前气血与上限。历练战败不会当场身死，但会重伤并散功；气血不足时别硬闯。',
        },
        {
          key: 'attack',
          label: '攻势',
          value: `${sheet.attack}`,
          hint: '每次出手的基础伤害。实际伤害还会被功法、架势、敌方护体与减伤影响。',
        },
        {
          key: 'defense',
          label: '护体',
          value: `${sheet.defense}`,
          hint: '削减对方每次命中造成的伤害。护体越高，越扛得住消耗。',
        },
        {
          key: 'speed',
          label: '身法',
          value: `${sheet.speed}`,
          hint: '决定双方出手的先后。身法高过对手时，更容易先手压制。',
        },
        {
          key: 'crit',
          label: '暴击',
          value: `${sheet.crit}%`,
          hint: '一次出手命中要害的几率。暴击造成接近两倍的伤害，部分器物还能继续放大。',
        },
        {
          key: 'spirit',
          label: '神识',
          value: `${sheet.spirit}`,
          hint: '影响冲关成功率，也代表对灵机与隐秘的感应。神识越高，冲关时越稳。',
        },
      ]
    },
    cultivationBonusLabel(state): string {
      const sheet = computeCharacterSheet(state.game, registry)
      return `×${sheet.cultivationMultiplier.toFixed(2)}`
    },
    breakthroughInfo(state) {
      return breakthroughInfo(state.game, registry)
    },
    statusViews(state) {
      return state.game.player.statuses.map((status) => ({
        ...status,
        label: statusLabel(status.id),
        description: statusDescription(status.id),
      }))
    },
    inventoryViews(state) {
      const player = state.game.player
      const itemEntries = Object.entries(player.inventory).flatMap(
        ([rawId, rawCount]) => {
          const count = rawCount ?? 0
          if (count <= 0) return []
          const id = rawId as ItemId
          const item = registry.items.get(id)
          const treasure = registry.treasures.get(id)
          if (!item && !treasure) return []
          const category = item ? item.category : 'treasure'
          const categoryLabel =
            category === 'consumable'
              ? '丹药'
              : category === 'material'
                ? '材料'
                : category === 'quest'
                  ? '任务'
                  : '法宝'
          const cooldownReadyAt =
            item?.category === 'consumable' ? (player.itemCooldowns[id] ?? 0) : 0
          return [
            {
              id,
              kind: 'item' as const,
              name: item?.name ?? treasure?.name ?? '无名之物',
              count,
              rarity: item?.rarity ?? treasure?.rarity ?? 'common',
              description: item?.description ?? treasure?.description ?? '',
              flavor: item?.flavor ?? treasure?.flavor ?? '',
              category,
              categoryLabel,
              slotLabel: '',
              equipped: false,
              usable: item?.category === 'consumable',
              cooldownMonths: Math.max(
                0,
                cooldownReadyAt - state.game.clock.elapsedMonths,
              ),
              statsText: '',
              affixText: '',
              setText: '',
              modText: '',
              source: item?.category === 'material' ? item.source : '',
              usedBy: item?.category === 'material' ? item.usedBy : [],
              drawback: item?.category === 'consumable' ? item.drawback : '',
              usePreview: item ? consumableUseText(item) : '',
              tone: '',
              gearView: undefined,
            },
          ]
        },
      )

      const gearEntries = player.gearInventory.map((gear) => {
        const view = buildGearView(player, gear)
        return {
          id: gear.id,
          kind: 'gear' as const,
          name: gear.name,
          count: 1,
          rarity: 'common',
          description: '',
          flavor: '',
          category: 'equipment' as const,
          categoryLabel: '常规装备',
          equippable: true,
          slot: gear.slot,
          slotLabel: view.slotLabel,
          equipped: view.isEquipped,
          usable: false,
          cooldownMonths: 0,
          statsText: view.statsText,
          affixText: view.affixes.map((affix) => `${affix.label}·阶${affix.tier}`).join(' · '),
          setText: view.setText,
          modText: view.modText,
          source: '',
          usedBy: [],
          drawback: '',
          usePreview: '',
          tone: view.qualityTone,
          gearView: view,
        }
      })

      return [...itemEntries, ...gearEntries]
    },
    gearViews(state) {
      const player = state.game.player
      return player.gearInventory
        .map((gear: GeneratedGear) => buildGearView(player, gear))
        .sort((left: ReturnType<typeof buildGearView>, right: ReturnType<typeof buildGearView>) => right.power - left.power)
    },
    standardGearSlotViews(state) {
      const player = state.game.player
      return GEAR_SLOTS.map((slot) => {
        const gearId = player.standardEquipment[slot]
        const gear = gearId
          ? player.gearInventory.find((entry) => entry.id === gearId)
          : undefined
        return {
          slot,
          label: GEAR_SLOT_LABELS[slot],
          equippedId: gearId,
          equipped: gear ? buildGearView(player, gear) : undefined,
          owned: player.gearInventory.filter((entry) => entry.slot === slot).length,
        }
      })
    },
    trainingView(state) {
      const session = state.game.player.training
      if (!session) return undefined
      const region = registry.regions.get(session.regionId)
      const mode = trainingMode(session.mode)
      const gearNames = session.gearIds.flatMap((id) => {
        const gear = state.game.player.gearInventory.find((entry) => entry.id === id)
        return gear ? [`${gear.name}（${buildGearView(state.game.player, gear).qualityName}）`] : []
      })
      const best = session.bestGearId
        ? state.game.player.gearInventory.find((entry) => entry.id === session.bestGearId)
        : undefined
      return {
        ...session,
        regionName: region?.name ?? '旧地',
        regionDanger: region?.danger ?? 0,
        modeName: mode.name,
        modeDescription: mode.description,
        progress: trainingProgress(session, state.game.clock.elapsedMonths),
        remainingMonths: Math.max(0, session.endsMonths - state.game.clock.elapsedMonths),
        battlesLeft: Math.max(0, mode.maxBattles - session.battles),
        gearNames,
        bestGearName: best
          ? `${best.name}（${buildGearView(state.game.player, best).qualityName}）`
          : undefined,
        secretRealms: session.secretRealms ?? [],
        log: session.log.slice(-8).reverse(),
      }
    },
    trainingRegionViews(state) {
      const player = state.game.player
      return [...registry.regions.values()]
        .filter((region) => {
          const regionState = state.game.campaign.world.regions[region.id]
          return (
            !!regionState?.unlocked &&
            trainingEncounters(state.game, region.id, registry).length > 0
          )
        })
        .map((region) => {
          const regionState = state.game.campaign.world.regions[region.id]
          const encounters = trainingEncounters(state.game, region.id, registry)
          const tiers = encounters.map((id) => registry.encounters.get(id)?.tier ?? 1)
          return {
            id: region.id,
            name: region.name,
            danger: region.danger,
            tierMin: Math.min(...tiers),
            tierMax: Math.max(...tiers),
            current: player.regionId === region.id,
            visited: regionState?.visited ?? false,
            encounterCount: encounters.length,
            encounterNames: encounters.map(
              (id) => registry.encounters.get(id)?.name ?? '无名敌手',
            ),
          }
        })
    },
    trainingModeViews() {
      return TRAINING_MODES.map((mode) => ({ ...mode }))
    },
    trainingReports(state) {
      return state.game.player.trainingReports
        .slice(-4)
        .reverse()
        .map((report) => ({
          ...report,
          modeName: trainingMode(report.mode).name,
        }))
    },
    techniqueViews(state) {
      return techniqueViews(state.game, registry)
    },
    divineAbilityViews(state) {
      return divineAbilityViews(state.game, registry)
    },
    divineSummary(state) {
      return divineSummary(state.game, registry)
    },
    professionViews(state) {
      return professionViews(state.game, registry)
    },
    treasureViews(state) {
      const player = state.game.player
      return player.treasureIds.flatMap((id) => {
        const definition = registry.treasures.get(id)
        if (!definition) return []
        const cooldownMonths = Math.max(
          0,
          (player.treasureCooldowns[id] ?? 0) - state.game.clock.elapsedMonths,
        )
        const temperLevel = treasureTemperLevel(state.game, definition)
        const nextTemperStage = definition.tempering[temperLevel]
        const temperGate = nextTemperStage
          ? evaluateRequirements(state.game, nextTemperStage.requirements)
          : { ok: false, unmet: [] }
        return [
          {
            ...definition,
            isActive: player.activeTreasureId === id,
            cooldownMonths,
            ready: cooldownMonths <= 0,
            passiveText: statsText(
              treasureEffectiveStats(definition, temperLevel),
            ),
            temperLevel,
            maxTemper: definition.tempering.length,
            currentTemperStage: definition.tempering[temperLevel - 1],
            nextTemperStage,
            temperStatsText: statsText(
              treasureEffectiveStats(definition, Math.min(temperLevel + 1, definition.tempering.length)),
            ),
            temperRequirementsMet: temperGate.ok,
            temperUnmet: temperGate.unmet,
            temperCultivation: nextTemperStage?.cultivation ?? 0,
            temperCostText: costText(nextTemperStage?.cost),
            temperAffordable:
              !!nextTemperStage &&
              player.cultivation >= nextTemperStage.cultivation &&
              canPayCost(state.game, nextTemperStage.cost),
            activeCooldownMonths: treasureActiveCooldown(definition, temperLevel),
            nextCooldownMonths: nextTemperStage
              ? treasureActiveCooldown(definition, temperLevel + 1)
              : treasureActiveCooldown(definition, temperLevel),
            canTemper:
              !!nextTemperStage &&
              !state.game.campaign.ending &&
              temperGate.ok &&
              player.cultivation >= nextTemperStage.cultivation &&
              canPayCost(state.game, nextTemperStage.cost),
            temperLockedBy: !nextTemperStage
              ? 'max'
              : !temperGate.ok
                ? 'requirements'
                : !(
                      player.cultivation >= nextTemperStage.cultivation &&
                      canPayCost(state.game, nextTemperStage.cost)
                    )
                  ? 'resources'
                  : undefined,
          },
        ]
      })
    },
    mountViews(state) {
      const player = state.game.player
      return player.mountIds.flatMap((id) => {
        const definition = registry.mounts.get(id)
        if (!definition) return []
        const stageIndex = player.mountStages[id] ?? 1
        const current = definition.stages.find((stage) => stage.stage === stageIndex)
        const next = definition.stages.find((stage) => stage.stage === stageIndex + 1)
        const cultivationCost = 60 * stageIndex
        const stoneCost = 12 * stageIndex
        return [
          {
            ...definition,
            active: player.activeMountId === id,
            stage: stageIndex,
            maxStage: definition.stages.length,
            currentStage: current,
            nextStage: next,
            travelBonus: current?.travelBonus ?? 0,
            statsText: statsText(current?.stats),
            cultivationCost,
            stoneCost,
            canGrow:
              !!next &&
              player.cultivation >= cultivationCost &&
              (player.resources.spirit_stones ?? 0) >= stoneCost,
          },
        ]
      })
    },
    petViews(state) {
      const player = state.game.player
      return player.petIds.flatMap((id) => {
        const definition = registry.pets.get(id)
        if (!definition) return []
        const evolution = player.petEvolutions[id] ?? 1
        const current = definition.evolutions[evolution - 1]
        const next = definition.evolutions[evolution]
        const cultivationCost = 80 * evolution
        const coreCost = 2 * evolution
        return [
          {
            ...definition,
            active: player.activePetId === id,
            evolution,
            maxEvolution: definition.evolutions.length,
            currentEvolution: current,
            nextEvolution: next,
            statsText: statsText(current?.stats),
            cultivationCost,
            coreCost,
            canEvolve:
              !!next &&
              player.cultivation >= cultivationCost &&
              (player.resources.beast_cores ?? 0) >= coreCost,
          },
        ]
      })
    },
    pendingEncounterViews(state) {
      return state.game.eventRuntime.pendingEncounters.map((pending) => {
        const definition = registry.encounters.get(pending.encounterId as EncounterId)
        const boss =
          pending.source === 'world_boss' && pending.bossId
            ? registry.worldBosses.get(pending.bossId)
            : undefined
        const bossStats = boss
          ? worldBossEnemyStats(boss, registry, state.game)
          : []
        const enemies = (definition?.enemyIds ?? []).flatMap((enemyId, index) => {
          const enemy = registry.enemies.get(enemyId)
          if (!enemy) return []
          return [bossStats[index] ? { ...enemy, stats: bossStats[index] } : enemy]
        })
        const regionName = definition?.regionId
          ? registry.regions.get(definition.regionId)?.name
          : undefined
        return {
          ...pending,
          name: definition?.name ?? '不明敌影',
          summary: definition?.summary ?? '',
          description: definition?.description ?? '',
          enemies,
          regionName,
          bossName: boss?.name,
          bossScale: boss ? worldBossKillScale(state.game, boss) : undefined,
          reward: definition?.reward,
          victoryEffects: definition?.victoryEffects ?? [],
          defeatEffects: definition?.defeatEffects ?? [],
          fleeAllowed: pending.fleeAllowed && (definition?.fleeAllowed ?? true),
        }
      })
    },
    worldBossViews(state) {
      const now = state.game.clock.elapsedMonths
      return [...registry.worldBosses.values()]
        .filter((boss) => boss.eraId === state.game.campaign.currentEra)
        .sort((left, right) => left.phaseOrder - right.phaseOrder)
        .map((boss) => {
          const stored = worldBossStateOf(state.game, boss.id)
          const availability = worldBossAvailability(state.game, boss, now)
          const regionName = registry.regions.get(boss.regionId)?.name ?? '旧地'
          const sigil = worldBossSigil(boss, registry)
          return {
            ...boss,
            regionName,
            attempts: stored.attempts,
            kills: stored.kills,
            firstKilledAtMonths: stored.firstKilledAtMonths,
            lastKilledAtMonths: stored.lastKilledAtMonths,
            firstKillDone: stored.kills > 0,
            scale: worldBossKillScale(state.game, boss),
            scalePercent: Math.round(worldBossKillScale(state.game, boss) * 100),
            enemyStats: worldBossEnemyStats(boss, registry, state.game),
            sigil,
            guaranteedDropViews: boss.guaranteedDrops.map((drop) => ({
              drop,
              label: describeWorldBossDrop(drop, registry),
            })),
            dropViews: boss.drops.map((drop) => ({
              drop,
              label: describeWorldBossDrop(drop, registry),
            })),
            status: availability.status,
            revealed: availability.revealed,
            requirementsMet: availability.requirementsMet,
            unmet: availability.unmet,
            coolingMonths: availability.coolingMonths,
            pending: availability.pending,
            canChallenge: availability.canChallenge,
          }
        })
    },
    worldBossSummary(state) {
      const now = state.game.clock.elapsedMonths
      const bosses = [...registry.worldBosses.values()].filter(
        (boss) => boss.eraId === state.game.campaign.currentEra,
      )
      let ready = 0
      let cooling = 0
      let kills = 0
      for (const boss of bosses) {
        const availability = worldBossAvailability(state.game, boss, now)
        if (availability.canChallenge) ready += 1
        if (availability.status === 'cooling') cooling += 1
        kills += worldBossStateOf(state.game, boss.id).kills
      }
      return { total: bosses.length, ready, cooling, kills }
    },
    pendingEncounterCount(state): number {
      return state.game.eventRuntime.pendingEncounters.length
    },
    combatLog(state) {
      return state.lastCombat?.log ?? []
    },
    paused(state): boolean {
      return isClockPaused(state.game.clock, state.game.settings.pauseMode)
    },
    manuallyPaused(state): boolean {
      return state.game.clock.tokens.some((token) => token.id === MANUAL_PAUSE_TOKEN)
    },
    blockingTokens(state) {
      return state.game.clock.tokens
    },
    speed(state): GameSpeed {
      return state.game.clock.speed
    },
    idleRates(state) {
      return buildIdleRates(state.game)
    },
    idleSlotViews(state) {
      const rates = buildIdleRates(state.game)
      const slots = state.game.idle.slots
      return (Object.keys(SLOT_LABELS) as IdleSlot[]).map((slot) => {
        let detail = ''
        if (slot === 'cultivation') {
          detail = `修为 +${formatAmount(rates.cultivationPerMonth)} / 月`
        } else if (slot === 'cave') {
          if (state.game.cave) {
            const parts = Object.entries(rates.caveYieldPerMonth)
              .filter(([, amount]) => typeof amount === 'number' && amount > 0)
              .map(
                ([key, amount]) =>
                  `${RESOURCE_LABELS[key] ?? '物料'} +${formatAmount(amount as number)}`,
              )
            const defense = caveProduction(state.game, registry).defense
            detail = `${parts.join(' · ')} / 月 · 护洞 ${defense}`
          } else {
            detail = '需先寻得洞府'
          }
        } else {
          detail = `行旅 ${Math.floor(state.game.idle.travelProgress)} / ${TRAVEL_PROGRESS_CAP}`
        }
        return {
          id: slot,
          label: SLOT_LABELS[slot],
          active: slots[slot].active,
          months: slots[slot].months,
          detail,
          disabled: slot === 'cave' && !state.game.cave,
        }
      })
    },
    travelReady(state): boolean {
      return state.game.idle.travelProgress >= TRAVEL_PROGRESS_CAP
    },
    inboxEntries(state): InboxEntry[] {
      return [...state.game.inbox]
    },
    inboxViews(state) {
      return [...state.game.inbox]
        .sort((left, right) => {
          if (left.kind !== right.kind) return left.kind === 'story' ? -1 : 1
          return left.createdMonths - right.createdMonths
        })
        .map((entry) => ({
          ...entry,
          title: registry.events.get(entry.eventId)?.title ?? '一段旧潮声',
          eventKind: registry.events.get(entry.eventId)?.kind ?? 'world',
        }))
    },
    pendingStory(state): InboxEntry[] {
      return state.game.inbox.filter((entry) => entry.kind === 'story')
    },
    pendingAmbient(state): InboxEntry[] {
      return state.game.inbox.filter((entry) => entry.kind === 'ambient')
    },
    activeEvent(state): EventDefinition | undefined {
      return state.activeEventId
        ? registry.events.get(state.activeEventId)
        : undefined
    },
    activeEntry(state): InboxEntry | undefined {
      return state.game.inbox.find((entry) => entry.eventId === state.activeEventId)
    },
    activeIsStory(state): boolean {
      return state.activeEventId
        ? registry.events.get(state.activeEventId)?.pause === 'story'
        : false
    },
    chronicle(state) {
      return [...state.game.chronicle].reverse()
    },
    rumors(state) {
      return [...state.game.eventRuntime.rumors].reverse()
    },
    memories(state) {
      return [...state.game.campaign.legacy.memories].reverse()
    },
    upcomingScheduled(state) {
      return state.game.eventRuntime.scheduled
        .filter((entry) => entry.dueMonths > state.game.clock.elapsedMonths)
        .sort((left, right) => left.dueMonths - right.dueMonths)
        .slice(0, 3)
        .map((entry) => ({
          ...entry,
          title: registry.events.get(entry.eventId)?.title ?? '一段旧潮声',
          dueIn: formatGameSpan(entry.dueMonths - state.game.clock.elapsedMonths),
        }))
    },
    memoryCount(state): number {
      return state.game.campaign.legacy.memories.length
    },
    storyCount(state): number {
      return state.game.inbox.filter((entry) => entry.kind === 'story').length
    },
    unreadCount(state): number {
      return state.game.inbox.filter((entry) => !entry.read).length
    },
    daoSummary(state) {
      const dao = state.game.player.dao
      const activePrinciple = dao.principles[0]
        ? registry.daoPrinciples.get(dao.principles[0])
        : undefined
      return {
        marks: dao.marks,
        earned: dao.earned,
        spent: daoSpentMarks(state.game, registry),
        respecs: dao.respecs,
        resetCost: DAO_RESET_COST,
        resetAffordable: dao.marks >= DAO_RESET_COST,
        canReset: dao.nodes.length > 0 || dao.principles.length > 0,
        litNodes: dao.nodes.length,
        totalNodes: registry.daoNodes.size,
        activePrinciple,
      }
    },
    daoClusterViews(state) {
      const dao = state.game.player.dao
      return [...registry.daoClusters.values()].map((cluster) => {
        const nodes = cluster.nodeIds.flatMap((id) => {
          const node = registry.daoNodes.get(id)
          return node ? [node] : []
        })
        const lit = nodes.filter((node) => dao.nodes.includes(node.id)).length
        const principle = [...registry.daoPrinciples.values()].find(
          (entry) => entry.clusterId === cluster.id,
        )
        return {
          ...cluster,
          nodes,
          lit,
          total: nodes.length,
          principle,
          principleActive: principle ? dao.principles.includes(principle.id) : false,
        }
      })
    },
    daoNodeViews(state) {
      const dao = state.game.player.dao
      return [...registry.daoNodes.values()].map((node) => {
        const lit = dao.nodes.includes(node.id)
        const required = node.requires ? registry.daoNodes.get(node.requires) : undefined
        const requiresMet = !node.requires || dao.nodes.includes(node.requires)
        const affordable = dao.marks >= node.cost
        return {
          ...node,
          lit,
          requiredName: required?.name ?? '',
          requiresMet,
          affordable,
          canBuy: !lit && requiresMet && affordable && !state.game.campaign.ending,
          statusText: lit
            ? '已点亮'
            : !requiresMet
              ? `需先点亮「${required?.name ?? '前置星'}」`
              : !affordable
                ? '星痕不足'
                : '可点亮',
        }
      })
    },
    daoPrincipleViews(state) {
      const dao = state.game.player.dao
      const activeId = dao.principles[0]
      const active = activeId ? registry.daoPrinciples.get(activeId) : undefined
      return [...registry.daoPrinciples.values()].map((principle) => {
        const cluster = registry.daoClusters.get(principle.clusterId)
        const clusterNodeIds = cluster?.nodeIds ?? []
        const lit = clusterNodeIds.filter((id) => dao.nodes.includes(id)).length
        const ready = lit >= principle.requiredNodes
        const affordable = dao.marks >= principle.cost
        const isActive = dao.principles.includes(principle.id)
        return {
          ...principle,
          active: isActive,
          clusterName: cluster?.name ?? '',
          lit,
          ready,
          affordable,
          canBuy:
            !isActive &&
            !activeId &&
            ready &&
            affordable &&
            !state.game.campaign.ending,
          statusText: isActive
            ? '已落定'
            : activeId
              ? `已择「${active?.name ?? '另一条道则'}」`
              : !ready
                ? `星位未全（${lit}/${principle.requiredNodes}）`
                : !affordable
                  ? '星痕不足'
                  : '可落定',
        }
      })
    },
    daoCannotFlee(state): boolean {
      return daoCombatRules(state.game).cannotFlee
    },
    daoMarkSources(state) {
      const game = state.game
      const realmMarks = daoRealmMilestones(game.player.realm, game.player.stage)
      const bossMarks = DAO_BOSS_MARK_IDS.filter(
        (id) => game.worldBosses[id]?.firstKilledAtMonths !== undefined,
      ).length
      const storyMarks = DAO_STORY_MARK_EVENT_IDS.filter(
        (id) => (game.eventRuntime.history[id]?.count ?? 0) > 0,
      ).length
      return [
        {
          id: 'origin',
          label: '初醒',
          current: 1,
          total: 1,
          detail: '踏入此世时，星图自己亮起的第一点',
        },
        {
          id: 'realm',
          label: '突破',
          current: realmMarks,
          total: 8,
          detail: '炼气、筑基、金丹的每一层突破都会惊动星图',
        },
        {
          id: 'boss',
          label: '劫影',
          current: bossMarks,
          total: 5,
          detail: '每位世界 Boss 的初退都会留下一枚星痕',
        },
        {
          id: 'story',
          label: '因果',
          current: storyMarks,
          total: 3,
          detail: '走完三处关键故事，星图会记下你的选择',
        },
      ]
    },
    caveDaoView(state) {
      const rules = daoProductionRules(state.game)
      const notes: Array<{ label: string; detail: string }> = []
      if (rules.tideCapBonus > 0) {
        notes.push({ label: '潮眼', detail: `洞府潮汐上限 +${rules.tideCapBonus}` })
      }
      if (rules.tidePerMonthBonus > 0) {
        notes.push({ label: '潮息', detail: `每月自然凝聚 +${rules.tidePerMonthBonus}` })
      }
      if (rules.purityLossMultiplier < 1) {
        notes.push({ label: '澄脉', detail: '蚀脉生产链每月浊染减半' })
      }
      if (rules.overflowToPurity) {
        notes.push({ label: '溢汐', detail: '潮满时溢流化为澄澈（每月至多 2 点）' })
      }
      if (rules.tideLifePurity > 0) {
        notes.push({ label: '生潮', detail: `潮汐达到 6 点时澄澈 +${rules.tideLifePurity}` })
      }
      return {
        notes,
        purityFloor: rules.noPurityFloor,
        stallText: `灵脉澄澈低于 ${rules.noPurityFloor} 时，蚀脉生产链会停转`,
      }
    },
  },

  actions: {
    async start(): Promise<void> {
      if (this.started) return
      this.started = true
      const saveStore = new SaveSlotStore(createLocalStorageSaveStorage())
      try {
        const loaded = await saveStore.load('auto')
        if (loaded.ok && isGameSaveData(loaded.envelope.data)) {
          this.game = loaded.envelope.data
          this.loadedFromSave = true
          this.lastAutosaveAt = Date.now()
          this.restoreOffline()
          if (!this.offlineReport) {
            this.toast = '已从自动存档续上这一世潮汐。'
          }
        }
      } catch {
        this.toast = '自动存档不可读，已从潮声初起处重新开始。'
      }

      this.processDue()
      this.refreshActiveEvent()
      await this.autoSave()
    },

    restoreOffline(): void {
      const savedAt = Date.parse(this.game.lastSavedAt)
      if (!Number.isFinite(savedAt)) return
      const offlineSeconds = (Date.now() - savedAt) / 1000
      if (offlineSeconds < 30) return

      const gates: OfflineGate[] = this.game.eventRuntime.scheduled.map((entry) => ({
        id: entry.id,
        kind: 'story',
        label: registry.events.get(entry.eventId)?.title ?? '一段旧潮声',
        atMonths: entry.dueMonths,
        eventId: entry.eventId,
      }))
      const result = simulateOffline({
        clock: this.game.clock,
        idle: this.game.idle,
        rates: buildIdleRates(this.game),
        gates,
        offlineSeconds,
        settings: {
          pauseMode: this.game.settings.pauseMode,
          offlineCapHours: this.game.settings.offlineCapHours,
          offlineEfficiency: this.game.settings.offlineEfficiency,
        },
      })

      this.game.clock = result.clock
      this.game.idle = result.idle
      this.game.player.cultivation += result.report.cultivation
      applyBodyTemperGain(this.game, result.report.cultivation, registry)
      addResources(this.game, result.report.resources)
      this.game = advanceCharacterTime(this.game, result.report.gameMonths, registry)
      this.game = advanceCaveTime(
        this.game,
        result.report.gameMonths,
        registry,
        result.report.efficiency,
      )
      this.game = advanceTraining(this.game, result.report.gameMonths, registry)
      const bossTime = advanceWorldBossTime(this.game, registry)
      if (bossTime.state !== this.game) this.game = bossTime.state
      this.offlineReport = result.report

      if (result.report.gameMonths > 0) {
        this.toast = `离开的潮汐已结算：${formatGameSpan(result.report.gameMonths)}，修为与洞府产出按 ${Math.round(result.report.efficiency * 100)}% 计入。`
      }
    },

    syncEraPhase(): string | null {
      const era = registry.eras.get(this.game.campaign.currentEra)
      if (!era) return null
      const result = advanceEraPhase(this.game, era)
      if (!result.advanced) return null
      this.game = result.state
      this.lastAutosaveAt = 0
      return result.phase ? `劫数推进：${result.phase.name}` : null
    },

    processDue(): void {
      const hadCave = !!this.game.cave
      const processed = processScheduledEvents(this.game, registry)
      if (processed.state !== this.game) {
        this.game = processed.state
      }
      const dispatched = processWorldDispatch(this.game, registry)
      if (dispatched.state !== this.game) {
        this.game = dispatched.state
      }
      if (!hadCave && this.game.cave) {
        this.game.idle = setIdleSlotActive(this.game.idle, 'cave', true)
        this.toast = '听潮洞已寻得，洞府槽位开始运转。'
      }
      this.game.clock.tokens = this.game.clock.tokens.filter(
        (token) => !token.id.startsWith('offline-gate:'),
      )
      const phaseNote = this.syncEraPhase()
      if (phaseNote) this.toast = phaseNote
    },

    commitWorldChange(next: GameSaveData, message: string): void {
      this.game = next
      const phaseNote = this.syncEraPhase()
      this.refreshActiveEvent()
      this.lastAutosaveAt = 0
      void this.autoSave()
      this.toast = phaseNote ? `${message}（${phaseNote}）` : message
    },

    travelTo(regionId: RegionId): void {
      if (!this.started) return
      if (this.game.player.training) {
        this.toast = '历练未束，先收束这一程再动身。'
        return
      }
      const target = registry.regions.get(regionId)
      if (!target) return
      const current = registry.regions.get(this.game.player.regionId)
      const result = travelToRegion(this.game, target, current)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.commitWorldChange(result.state, result.message)
    },

    exploreSite(siteId: SiteId): void {
      if (!this.started) return
      const region = registry.regions.get(this.game.player.regionId)
      const site = region?.sites.find((entry) => entry.id === siteId)
      if (!region || !site) return
      const encounterCandidates = (region.encounterIds ?? []).filter((id) => {
        const encounter = registry.encounters.get(id)
        if (!encounter) return false
        if (encounter.regionId && encounter.regionId !== region.id) return false
        return evaluateRequirements(this.game, encounter.requirements).ok
      })
      const result = exploreSite(this.game, region, site, encounterCandidates)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      const encounterName = result.encounterId
        ? registry.encounters.get(result.encounterId as EncounterId)?.name
        : undefined
      const message = encounterName
        ? `${result.message}暗处有动静：${encounterName}正在等你出手。`
        : result.message
      this.commitWorldChange(result.state, message)
    },

    applyCharacterAction(result: {
      ok: boolean
      state: GameSaveData
      message: string
    }): void {
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.game = result.state
      const sheet = computeCharacterSheet(this.game, registry)
      if (this.game.player.health > sheet.maxHealth) {
        this.game.player.health = sheet.maxHealth
      }
      this.lastAutosaveAt = 0
      void this.autoSave()
      this.toast = result.message
    },

    attemptBreakthrough(): void {
      if (!this.started) return
      const result = attemptBreakthroughCore(this.game, registry)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.game = result.state
      const phaseNote = this.syncEraPhase()
      this.lastAutosaveAt = 0
      void this.autoSave()
      this.toast = phaseNote ? `${result.message}（${phaseNote}）` : result.message
    },

    temperBody(): void {
      if (!this.started) return
      this.applyCharacterAction(temperBodyCore(this.game, registry))
    },

    setBodyPath(path: BodyPath): void {
      if (!this.started) return
      this.applyCharacterAction(setBodyPathCore(this.game, path))
    },

    attemptBodyBreakthrough(): void {
      if (!this.started) return
      this.applyCharacterAction(attemptBodyBreakthroughCore(this.game, registry))
    },

    acquireBloodline(bloodlineId: string): void {
      if (!this.started) return
      this.applyCharacterAction(
        acquireBloodlineCore(this.game, bloodlineId, registry),
      )
    },

    refineBloodline(): void {
      if (!this.started) return
      this.applyCharacterAction(refineBloodlineCore(this.game, registry))
    },

    awakenBloodline(): void {
      if (!this.started) return
      this.applyCharacterAction(awakenBloodlineCore(this.game, registry))
    },

    severBloodline(): void {
      if (!this.started) return
      this.applyCharacterAction(severBloodlineCore(this.game, registry))
    },

    purchaseDaoNode(nodeId: DaoNodeId): void {
      if (!this.started) return
      this.applyCharacterAction(purchaseDaoNodeCore(this.game, registry, nodeId))
    },

    purchaseDaoPrinciple(principleId: DaoPrincipleId): void {
      if (!this.started) return
      this.applyCharacterAction(
        purchaseDaoPrincipleCore(this.game, registry, principleId),
      )
    },

    resetDao(): void {
      if (!this.started) return
      this.applyCharacterAction(resetDaoCore(this.game, registry))
    },

    
    equipGeneratedGear(gearId: string): void {
      if (!this.started) return
      this.applyCharacterAction(equipGearCore(this.game, gearId))
    },

    unequipGeneratedGear(slot: GearSlot): void {
      if (!this.started) return
      this.applyCharacterAction(unequipGearCore(this.game, slot))
    },

    upgradeGeneratedGear(gearId: string): void {
      if (!this.started) return
      this.applyCharacterAction(upgradeGearCore(this.game, gearId))
    },

    reforgeGeneratedGear(gearId: string): void {
      if (!this.started) return
      this.applyCharacterAction(reforgeGearCore(this.game, gearId))
    },

    sealGeneratedAffix(gearId: string, affixIndex: number): void {
      if (!this.started) return
      this.applyCharacterAction(sealGearAffixCore(this.game, gearId, affixIndex))
    },

    unsealGeneratedAffix(gearId: string, affixIndex: number): void {
      if (!this.started) return
      this.applyCharacterAction(unsealGearAffixCore(this.game, gearId, affixIndex))
    },

    transferGeneratedAffix(fromId: string, affixIndex: number, toId: string): void {
      if (!this.started) return
      this.applyCharacterAction(
        transferGearAffixCore(this.game, fromId, affixIndex, toId),
      )
    },

    dismantleGeneratedGear(gearId: string): void {
      if (!this.started) return
      this.applyCharacterAction(dismantleGearCore(this.game, gearId))
    },

    recycleGeneratedGears(gearIds: string[]): void {
      if (!this.started) return
      this.applyCharacterAction(recycleGearCore(this.game, gearIds))
    },

    gearRecycleQuote(gearIds: string[]) {
      return quoteGearRecycle(this.game, gearIds)
    },

    toggleGeneratedGearLock(gearId: string): void {
      if (!this.started) return
      this.applyCharacterAction(toggleGearLockCore(this.game, gearId))
    },

    startTraining(regionId: RegionId, mode: TrainingMode): void {
      if (!this.started) return
      this.applyCharacterAction(startTrainingCore(this.game, regionId, mode, registry))
    },

    stopTraining(): void {
      if (!this.started) return
      this.applyCharacterAction(stopTrainingCore(this.game, registry))
    },

    useItem(itemId: ItemId): void {
      if (!this.started) return
      this.applyCharacterAction(useConsumableItem(this.game, itemId, registry))
    },

    upgradeCaveBuilding(buildingId: string): void {
      if (!this.started) return
      this.applyCharacterAction(
        upgradeCaveBuildingCore(this.game, buildingId, registry),
      )
    },

    upgradeCaveVein(): void {
      if (!this.started) return
      this.applyCharacterAction(upgradeCaveVeinCore(this.game, registry))
    },

    useCaveBuilding(buildingId: string): void {
      if (!this.started) return
      this.applyCharacterAction(useCaveVerbCore(this.game, buildingId, registry))
    },

    recruitCaveDisciple(discipleId: string): void {
      if (!this.started) return
      this.applyCharacterAction(
        recruitDiscipleCore(this.game, discipleId, registry),
      )
    },

    assignCaveDisciple(
      discipleId: string,
      assignment: DiscipleAssignment,
    ): void {
      if (!this.started) return
      this.applyCharacterAction(
        assignDiscipleCore(this.game, discipleId, assignment, registry),
      )
    },

    tendCaveVein(): void {
      if (!this.started) return
      this.applyCharacterAction(tendCaveVeinCore(this.game, registry))
    },

    toggleCaveChain(chainId: string, enabled?: boolean): void {
      if (!this.started) return
      this.applyCharacterAction(
        toggleCaveChainCore(this.game, chainId, registry, enabled),
      )
    },

    chooseCaveVisitor(choiceId: string): void {
      if (!this.started) return
      this.applyCharacterAction(
        resolveCaveVisitorCore(this.game, choiceId, registry),
      )
    },

    selectTreasure(treasureId: ItemId | undefined): void {
      if (!this.started) return
      this.applyCharacterAction(setActiveTreasureCore(this.game, treasureId))
    },

    activateTreasure(): void {
      if (!this.started) return
      this.applyCharacterAction(activateTreasureCore(this.game, registry))
    },

    temperTreasure(treasureId: ItemId): void {
      if (!this.started) return
      this.applyCharacterAction(
        temperTreasureCore(this.game, treasureId, registry),
      )
    },

    selectMount(mountId: MountId | undefined): void {
      if (!this.started) return
      this.applyCharacterAction(setActiveMountCore(this.game, mountId))
    },

    growMount(mountId: MountId): void {
      if (!this.started) return
      this.applyCharacterAction(growMountCore(this.game, mountId, registry))
    },

    selectPet(petId: PetId | undefined): void {
      if (!this.started) return
      this.applyCharacterAction(setActivePetCore(this.game, petId))
    },

    evolvePet(petId: PetId): void {
      if (!this.started) return
      this.applyCharacterAction(evolvePetCore(this.game, petId, registry))
    },

    studyTechnique(techniqueId: TechniqueId, nodeIndex: number): void {
      if (!this.started) return
      this.applyCharacterAction(
        studyTechniqueNode(this.game, techniqueId, nodeIndex, registry),
      )
    },

    equipTechnique(techniqueId: TechniqueId): void {
      if (!this.started) return
      this.applyCharacterAction(equipTechniqueCore(this.game, techniqueId, registry))
    },

    unequipTechnique(techniqueId: TechniqueId): void {
      if (!this.started) return
      this.applyCharacterAction(unequipTechniqueCore(this.game, techniqueId, registry))
    },

    fuseDivineAbility(abilityId: DivineAbilityId): void {
      if (!this.started) return
      this.applyCharacterAction(fuseDivineAbilityCore(this.game, abilityId, registry))
    },

    setDivineAbilityActive(abilityId: DivineAbilityId, active: boolean): void {
      if (!this.started) return
      this.applyCharacterAction(
        setDivineAbilityActiveCore(this.game, abilityId, active, registry),
      )
    },

    craftRecipe(recipeId: CraftRecipeId): void {
      if (!this.started) return
      this.applyCharacterAction(craftRecipeCore(this.game, recipeId, registry))
    },

    challengeWorldBoss(bossId: WorldBossId): boolean {
      if (!this.started) return false
      const result = prepareWorldBossChallenge(this.game, bossId, registry)
      if (!result.ok) {
        this.toast = result.message
        return false
      }
      this.game = result.state
      this.lastCombat = null
      this.lastAutosaveAt = 0
      void this.autoSave()
      this.toast = result.message
      return true
    },

    fightEncounter(encounterId: EncounterId, stance: CombatStance): void {
      if (!this.started) return
      const pending = this.game.eventRuntime.pendingEncounters.find(
        (entry) => entry.encounterId === encounterId,
      )
      const bossId =
        pending?.source === 'world_boss' ? pending.bossId : undefined
      const result = bossId
        ? resolveWorldBossEncounter(this.game, bossId, stance, registry)
        : resolveEncounter(this.game, encounterId, stance, registry)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.game = result.state
      this.lastCombat = result
      const phaseNote = this.syncEraPhase()
      this.refreshActiveEvent()
      this.lastAutosaveAt = 0
      void this.autoSave()
      this.toast = phaseNote ? `${result.message}（${phaseNote}）` : result.message
    },

    fleeFromEncounter(encounterId: EncounterId): void {
      if (!this.started) return
      const result = fleeEncounter(this.game, encounterId)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.game = result.state
      this.lastCombat = result
      this.lastAutosaveAt = 0
      void this.autoSave()
      this.toast = result.message
    },

    clearCombatResult(): void {
      this.lastCombat = null
    },

    joinFaction(factionId: FactionId): void {
      if (!this.started) return
      const definition = registry.factions.get(factionId)
      if (!definition) return
      const result = joinFaction(this.game, definition)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.commitWorldChange(result.state, result.message)
    },

    learnFactionTechnique(techniqueId: TechniqueId): void {
      if (!this.started) return
      const definition = this.joinedFactionId
        ? registry.factions.get(this.joinedFactionId)
        : undefined
      const technique = registry.techniques.get(techniqueId)
      if (!definition || !technique) {
        this.toast = '门中没有这一部传法。'
        return
      }
      const result = learnFactionTechnique(this.game, definition, technique)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.commitWorldChange(result.state, result.message)
    },

    promoteFaction(): void {
      if (!this.started) return
      const definition = this.joinedFactionId
        ? registry.factions.get(this.joinedFactionId)
        : undefined
      if (!definition) {
        this.toast = '你还没有可晋升的势力。'
        return
      }
      const result = promoteFaction(this.game, definition)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.commitWorldChange(result.state, result.message)
    },

    performFactionDuty(): void {
      if (!this.started) return
      const definition = this.joinedFactionId
        ? registry.factions.get(this.joinedFactionId)
        : undefined
      if (!definition) {
        this.toast = '你还没有可以领差事的势力。'
        return
      }
      const result = performFactionDuty(this.game, definition)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.commitWorldChange(result.state, result.message)
    },

    leaveFaction(): void {
      if (!this.started) return
      const definition = this.joinedFactionId
        ? registry.factions.get(this.joinedFactionId)
        : undefined
      if (!definition) {
        this.toast = '你本就不在任何势力的名册上。'
        return
      }
      const result = leaveFaction(this.game, definition)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      this.commitWorldChange(result.state, result.message)
    },

    settleEra(mode: EraTransitionMode): void {
      if (!this.started) return
      const era = registry.eras.get(this.game.campaign.currentEra)
      const result = settleEra(this.game, era, mode)
      if (!result.ok) {
        this.toast = result.message
        return
      }
      const next = result.state
      next.clock = pushPauseToken(next.clock, {
        id: 'ending',
        source: 'story',
        label: '劫末落笔',
      })
      this.game = next
      this.refreshActiveEvent()
      this.lastAutosaveAt = 0
      void this.autoSave()
      this.toast = result.message
    },

    startNewGame(choice: NewGameChoice): void {
      const origin = registry.origins.get(choice.originId)
      const talents = choice.talentIds.filter((id) => registry.talents.has(id)).slice(0, 2)
      const next = createNewGameSave({
        playerName: choice.name.trim() || '无名散修',
        origin: origin?.name ?? '四海',
        originId: choice.originId,
        rootId: choice.rootId,
        physiqueId: choice.physiqueId,
        talentIds: talents,
        lineage: '初民',
        eraId: 'era.prologue',
        phaseId: 'phase.prologue.wake',
        regionId: 'region.longhan.four_seas',
        realm: 'mortal',
        stage: 1,
        resources: {
          ...(origin?.startingResources ?? {}),
          spirit_stones: (origin?.startingResources?.spirit_stones ?? 0) + 10,
          spirit_herbs: (origin?.startingResources?.spirit_herbs ?? 0) + 2,
        },
        regions: [...registry.regions.values()].map((region) => ({
          id: region.id,
          unlocked: region.id === 'region.longhan.four_seas',
          visited: region.id === 'region.longhan.four_seas',
        })),
        factions: [...registry.factions.values()].map((faction) => ({
          id: faction.id,
          membership: false,
          rank: 0,
        })),
        idleActive: {
          cultivation: true,
          travel: true,
        },
        openingEventId: 'event.prologue.first_breath',
        seed: Math.floor(Math.random() * 0xffffffff) >>> 0,
      })
      next.player.health = computeCharacterSheet(next, registry).maxHealth
      this.game = next
      this.activeEventId = null
      this.offlineReport = null
      this.lastCombat = null
      this.loadedFromSave = false
      this.started = true
      this.lastAutosaveAt = 0
      this.syncEraPhase()
      this.processDue()
      this.refreshActiveEvent()
      void this.autoSave()
      this.toast = '潮线退去，你在开天未久的四海睁开眼。'
    },

    adoptSave(next: GameSaveData, message: string): void {
      this.game = next
      this.activeEventId = null
      this.offlineReport = null
      this.lastCombat = null
      this.loadedFromSave = true
      this.started = true
      this.lastAutosaveAt = 0
      this.syncEraPhase()
      this.processDue()
      this.refreshActiveEvent()
      this.toast = message
    },

    async saveManual(slot: ManualSaveSlot): Promise<boolean> {
      try {
        const store = new SaveSlotStore(createLocalStorageSaveStorage())
        this.game.lastSavedAt = new Date().toISOString()
        await store.save(slot, this.game)
        const savedAt = new Date(this.game.lastSavedAt)
        this.lastSavedLabel = `${String(savedAt.getHours()).padStart(2, '0')}:${String(savedAt.getMinutes()).padStart(2, '0')}:${String(savedAt.getSeconds()).padStart(2, '0')}`
        this.toast = `已写入手动存档 ${slot.replace('slot', '')}。`
        return true
      } catch {
        this.toast = '手动存档写入失败，请检查浏览器存储权限。'
        return false
      }
    },

    async loadManual(slot: ManualSaveSlot): Promise<boolean> {
      const store = new SaveSlotStore(createLocalStorageSaveStorage())
      const result = await store.load(slot, { recoverFromAuto: true })
      if (!result.ok) {
        this.toast = `读取失败：${result.message}`
        return false
      }
      if (!isGameSaveData(result.envelope.data)) {
        this.toast = '该存档不属于当前版本，无法载入。'
        return false
      }
      this.adoptSave(result.envelope.data, result.recoveredFrom === 'auto'
        ? `${slot} 已损坏，已从自动存档恢复。`
        : `已从手动存档 ${slot.replace('slot', '')} 回到此世。`)
      await this.autoSave()
      return true
    },

    async deleteManual(slot: ManualSaveSlot): Promise<void> {
      const store = new SaveSlotStore(createLocalStorageSaveStorage())
      await store.remove(slot)
      this.toast = `手动存档 ${slot.replace('slot', '')} 已抹去。`
    },

    listSaveSlots(): Promise<SaveSlotSummary[]> {
      const store = new SaveSlotStore(createLocalStorageSaveStorage())
      return store.list()
    },

    exportSave(): string {
      const envelope = createSaveEnvelope(this.game)
      this.toast = '存档已备好，可复制保存。'
      return JSON.stringify(envelope, null, 2)
    },

    async importSave(json: string): Promise<boolean> {
      const decoded = decodeSaveJson(json)
      if (!decoded.ok) {
        this.toast = `导入失败：${decoded.message}`
        return false
      }
      if (!isGameSaveData(decoded.envelope.data)) {
        this.toast = '导入内容不是有效的洪荒编年史存档。'
        return false
      }
      this.adoptSave(decoded.envelope.data, '存档已导入，潮声接着旧处响起。')
      const store = new SaveSlotStore(createLocalStorageSaveStorage())
      await store.saveAuto(this.game)
      return true
    },

    refreshActiveEvent(): void {
      const pendingStory = this.game.inbox.find((entry) => entry.kind === 'story')
      if (pendingStory) {
        this.activeEventId = pendingStory.eventId
        if (!pendingStory.read) {
          this.game = markInboxRead(this.game, pendingStory.eventId)
        }
        return
      }
      if (
        this.activeEventId &&
        !this.game.inbox.some((entry) => entry.eventId === this.activeEventId)
      ) {
        this.activeEventId = null
      }
    },

    tick(realSeconds = 1): void {
      if (!this.started) return
      const result = tickEngine({
        clock: this.game.clock,
        idle: this.game.idle,
        rates: buildIdleRates(this.game),
        pausePolicy: this.game.settings.pauseMode,
        realSeconds,
        gates: buildBlockingGates(this.game),
      })
      if (result.monthsAdvanced <= 0) return

      const next = cloneGameSaveData(this.game)
      next.clock = result.clock
      next.idle = result.idle
      next.player.cultivation += result.delta.cultivation
      applyBodyTemperGain(next, result.delta.cultivation, registry)
      addResources(next, result.delta.resources)
      this.game = advanceCaveTime(
        advanceCharacterTime(next, result.monthsAdvanced, registry),
        result.monthsAdvanced,
        registry,
      )
      this.game = advanceTraining(this.game, result.monthsAdvanced, registry)
      const bossTime = advanceWorldBossTime(this.game, registry)
      if (bossTime.state !== this.game) {
        this.game = bossTime.state
        if (bossTime.notes.length > 0) this.toast = bossTime.notes[0]
      }

      this.processDue()
      this.refreshActiveEvent()
      if (Date.now() - this.lastAutosaveAt > 8000) {
        this.lastAutosaveAt = Date.now()
        void this.autoSave()
      }
    },

    setSpeed(speed: GameSpeed): void {
      this.game.clock = setGameSpeed(this.game.clock, speed)
      this.game.settings.speed = speed
      void this.autoSave()
    },

    updateSettings(patch: Partial<GameSettings>): void {
      this.game.settings = { ...this.game.settings, ...patch }
      void this.autoSave()
    },

    toggleManualPause(): void {
      const hasToken = this.game.clock.tokens.some(
        (token) => token.id === MANUAL_PAUSE_TOKEN,
      )
      this.game.clock = hasToken
        ? releasePauseToken(this.game.clock, MANUAL_PAUSE_TOKEN)
        : pushPauseToken(this.game.clock, {
            id: MANUAL_PAUSE_TOKEN,
            source: 'manual',
            label: '手动暂停',
          })
    },

    toggleSlot(slot: IdleSlot): void {
      if (slot === 'cave' && !this.game.cave) {
        this.toast = '还没有一处能落脚的洞府。'
        return
      }
      const current = this.game.idle.slots[slot].active
      this.game.idle = setIdleSlotActive(this.game.idle, slot, !current)
    },

    openEvent(entryId: string): void {
      const entry = this.game.inbox.find((candidate) => candidate.id === entryId)
      if (!entry) return
      this.game = markInboxRead(this.game, entry.eventId)
      this.activeEventId = entry.eventId
    },

    closeEvent(): void {
      if (
        this.activeEventId &&
        registry.events.get(this.activeEventId)?.pause === 'story'
      ) {
        return
      }
      this.activeEventId = null
    },

    resolveChoice(choiceId: string): void {
      const event = this.activeEventId
        ? registry.events.get(this.activeEventId)
        : undefined
      if (!event) return
      const hadCave = !!this.game.cave
      const result = resolveEventChoice(this.game, event, choiceId, registry)
      if (!result.ok) {
        this.toast =
          result.reason === 'locked'
            ? '此刻还差一些因缘，无法作此选择。'
            : '这段潮声已经落定，无法再选。'
        return
      }

      this.game = result.state
      if (!hadCave && this.game.cave) {
        this.game.idle = setIdleSlotActive(this.game.idle, 'cave', true)
        this.toast = '听潮洞已开启，洞府槽位开始运转。'
      }
      const phaseNote = this.syncEraPhase()
      this.processDue()
      this.refreshActiveEvent()
      if (phaseNote) this.toast = phaseNote
      this.lastAutosaveAt = 0
      void this.autoSave()
    },

    async autoSave(): Promise<void> {
      if (this.saving) return
      this.saving = true
      try {
        const saveStore = new SaveSlotStore(createLocalStorageSaveStorage())
        this.game.lastSavedAt = new Date().toISOString()
        await saveStore.saveAuto(this.game)
        const savedAt = new Date(this.game.lastSavedAt)
        this.lastSavedLabel = `${String(savedAt.getHours()).padStart(2, '0')}:${String(savedAt.getMinutes()).padStart(2, '0')}:${String(savedAt.getSeconds()).padStart(2, '0')}`
      } catch {
        this.toast = '自动存档写入失败，当前进度仍保留在页面中。'
      } finally {
        this.saving = false
      }
    },

    dismissToast(): void {
      this.toast = null
    },

    dismissOfflineReport(): void {
      this.offlineReport = null
    },

    choiceEligibility(choice: ChoiceDefinition): boolean {
      return evaluateRequirements(this.game, choice.requirements).ok
    },
    choiceUnmet(choice: ChoiceDefinition) {
      return evaluateRequirements(this.game, choice.requirements).unmet
    },

    eventEligibility(eventId: EventId) {
      const event = registry.events.get(eventId)
      return event ? checkEventEligibility(this.game, event) : undefined
    },
  },
})
