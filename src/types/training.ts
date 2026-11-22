import type { RegionId, ResourceKey, SecretRealmId } from './common'

export type TrainingMode = 'steady' | 'deep' | 'perilous'

export interface TrainingSecretRealmEntry {
  id: SecretRealmId
  name: string
  rewardText: string
}

export interface TrainingLogEntry {
  months: number
  text: string
  tone: 'plain' | 'good' | 'bad' | 'fate'
}

export interface TrainingSession {
  id: string
  regionId: RegionId
  mode: TrainingMode
  startedMonths: number
  endsMonths: number
  nextBattleMonths: number
  wins: number
  losses: number
  battles: number
  cultivation: number
  resources: Partial<Record<ResourceKey, number>>
  gearIds: string[]
  log: TrainingLogEntry[]
  bestGearId?: string
  secretRealms?: TrainingSecretRealmEntry[]
}

export interface TrainingReport {
  id: string
  regionId: RegionId
  regionName: string
  mode: TrainingMode
  startedMonths: number
  endedMonths: number
  wins: number
  losses: number
  cultivation: number
  resources: Partial<Record<ResourceKey, number>>
  gearNames: string[]
  bestGearName?: string
  summary: string
  earlyStopped: boolean
  secretRealms?: TrainingSecretRealmEntry[]
}