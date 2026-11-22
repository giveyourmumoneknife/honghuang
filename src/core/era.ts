import type { EraDefinition, EraPhase } from '@/types/content'
import type { Requirement } from '@/types/dsl'
import type { EraEnding, EraTransitionMode, GameSaveData } from '@/types/state'
import { evaluateRequirements } from './conditions'
import { applyEffects } from './effects'
import { cloneGameSaveData } from './state'
import { calendarFromMonths } from './time'

export interface EraPhaseAdvance {
  state: GameSaveData
  advanced: boolean
  phase?: EraPhase
}

export interface SettlementReadiness {
  ready: boolean
  isFinalPhase: boolean
  phase?: EraPhase
  unmet: Requirement[]
  reason?:
    | 'ending'
    | 'not-final-phase'
    | 'missing-era'
    | 'no-rules'
    | 'requirements'
}

export interface SettlementResult {
  ok: boolean
  state: GameSaveData
  ending?: EraEnding
  message: string
  reason?: 'ending' | 'not-ready'
}

export const TRANSITION_MODE_LABELS: Record<EraTransitionMode, string> = {
  continue: '续世',
  reincarnate: '转世',
  stay: '留世',
}

export const TRANSITION_MODE_DESCRIPTIONS: Record<EraTransitionMode, string> = {
  continue: '带着这一劫的名字与因缘继续向前。旧盟约仍算数，旧债也会跟来。',
  reincarnate: '把此世所得炼成道果，再以新身入下一劫。人情与旧物未必还能带走。',
  stay: '留在此劫余烬中，替旧人守一段潮声。世界的下一步会先把你留在身后。',
}

function sortedPhases(era: EraDefinition): EraPhase[] {
  return [...era.phases].sort((left, right) => left.order - right.order)
}

export function eraPhase(era: EraDefinition, phaseId: string): EraPhase | undefined {
  return era.phases.find((phase) => phase.id === phaseId)
}

export function nextEraPhase(era: EraDefinition, phaseId: string): EraPhase | undefined {
  const phases = sortedPhases(era)
  const index = phases.findIndex((phase) => phase.id === phaseId)
  if (index < 0) return phases[0]
  return phases[index + 1]
}

export function isFinalEraPhase(era: EraDefinition, phaseId: string): boolean {
  const phases = sortedPhases(era)
  return phases.length > 0 && phases[phases.length - 1]?.id === phaseId
}

export function advanceEraPhase(
  state: GameSaveData,
  era: EraDefinition,
): EraPhaseAdvance {
  if (state.campaign.ending) return { state, advanced: false }
  const current = eraPhase(era, state.campaign.world.phaseId)
  if (!current) {
    const first = sortedPhases(era)[0]
    if (!first) return { state, advanced: false }
    const next = cloneGameSaveData(state)
    next.campaign.world.phaseId = first.id
    return { state: next, advanced: true, phase: first }
  }
  const nextPhase = nextEraPhase(era, current.id)
  if (!nextPhase) return { state, advanced: false }
  const gate = evaluateRequirements(state, nextPhase.gateRequirements)
  if (!gate.ok) return { state, advanced: false }

  const next = cloneGameSaveData(state)
  next.campaign.world.phaseId = nextPhase.id
  next.campaign.world.flags[`era.phase.${nextPhase.id}`] = next.clock.elapsedMonths
  next.chronicle.push({
    id: `chronicle:phase:${era.id}:${nextPhase.id}`,
    eraId: era.id,
    title: `${era.name} · ${nextPhase.name}`,
    text: nextPhase.summary,
    year: calendarFromMonths(next.clock.elapsedMonths).year,
  })
  return { state: next, advanced: true, phase: nextPhase }
}

export function settlementReadiness(
  state: GameSaveData,
  era: EraDefinition | undefined,
): SettlementReadiness {
  if (state.campaign.ending) {
    return { ready: false, isFinalPhase: false, unmet: [], reason: 'ending' }
  }
  if (!era) {
    return { ready: false, isFinalPhase: false, unmet: [], reason: 'missing-era' }
  }
  const phase = eraPhase(era, state.campaign.world.phaseId)
  const isFinalPhase = phase
    ? isFinalEraPhase(era, phase.id)
    : false
  if (!isFinalPhase) {
    return { ready: false, isFinalPhase, phase, unmet: [], reason: 'not-final-phase' }
  }
  if (era.settlement.length === 0) {
    return { ready: false, isFinalPhase, phase, unmet: [], reason: 'no-rules' }
  }
  const gate = evaluateRequirements(state, era.settlementRequirements ?? [])
  if (!gate.ok) {
    return {
      ready: false,
      isFinalPhase,
      phase,
      unmet: gate.unmet,
      reason: 'requirements',
    }
  }
  return { ready: true, isFinalPhase, phase, unmet: [] }
}

function modeTitle(mode: EraTransitionMode): string {
  if (mode === 'continue') return '续世 · 潮声未歇'
  if (mode === 'reincarnate') return '转世 · 旧名入海'
  return '留世 · 为旧人守潮'
}

function modeSummary(mode: EraTransitionMode): string {
  if (mode === 'continue') {
    return '你带着龙汉的名字走进余烬。下一劫的风已经起了，但旧潮仍认得你的脚步。'
  }
  if (mode === 'reincarnate') {
    return '你把这一劫的名字交还给海。来世再听见潮声时，会有一些不属于此生的记忆先醒来。'
  }
  return '你没有走向下一劫，只留在旧宫门前听潮。潮水会替你把后来者的名字带回来。'
}

function modeDaoguo(mode: EraTransitionMode): number {
  if (mode === 'continue') return 8
  if (mode === 'reincarnate') return 12
  return 5
}

export function settleEra(
  state: GameSaveData,
  era: EraDefinition | undefined,
  mode: EraTransitionMode,
): SettlementResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已经落笔，不能再结算第二次。', reason: 'ending' }
  }
  const readiness = settlementReadiness(state, era)
  if (!era || !readiness.ready) {
    return { ok: false, state, message: '劫数尚未走到可以结算的那一步。', reason: 'not-ready' }
  }

  let next = cloneGameSaveData(state)
  for (const rule of era.settlement) {
    if (rule.effects.length > 0) {
      next = applyEffects(next, rule.effects, {
        sourceEventId: undefined,
      })
    }
  }

  const daoguoGained = modeDaoguo(mode)
  next.campaign.legacy.daoguo += daoguoGained
  next.campaign.legacy.lineage =
    mode === 'reincarnate' ? '转世之身' : next.campaign.legacy.lineage ?? next.player.lineage
  for (const partnerId of next.player.partnerIds) {
    next.campaign.legacy.partnerFates[partnerId] =
      mode === 'stay'
        ? '与你一同留在此劫余烬中，听着下一劫的风声。'
        : '把归期交给下一劫的潮水，尚未相见。'
  }

  const ending: EraEnding = {
    eraId: era.id,
    mode,
    title: modeTitle(mode),
    summary: modeSummary(mode),
    settledAtMonths: next.clock.elapsedMonths,
    daoguoGained,
    nextEraId: era.transition.nextEraId,
  }
  next.campaign.ending = ending
  next.campaign.world.flags['era.ended'] = true
  next.campaign.world.flags[`era.ended.${era.id}`] = mode
  next.campaign.history.push({
    eraId: era.id,
    entry: era.summary,
    exit: modeSummary(mode),
    settlementNotes: [
      ...era.settlement.map((rule) => `${rule.label}：${rule.description}`),
      `${TRANSITION_MODE_LABELS[mode]}：道果 +${daoguoGained}`,
    ],
  })
  next.campaign.legacy.memories.push({
    id: `memory.era.${era.id}.${mode}`,
    text: `${modeTitle(mode)}。${modeSummary(mode)}`,
    createdAtMonths: next.clock.elapsedMonths,
  })
  next.chronicle.push({
    id: `chronicle:ending:${era.id}:${mode}`,
    eraId: era.id,
    title: `${era.name} · 劫末`,
    text: modeSummary(mode),
    year: calendarFromMonths(next.clock.elapsedMonths).year,
  })

  return {
    ok: true,
    state: next,
    ending,
    message: `${modeTitle(mode)}。此劫已写入编年，道果 +${daoguoGained}。`,
  }
}
