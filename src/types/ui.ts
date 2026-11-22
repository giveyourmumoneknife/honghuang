export interface MilestoneCheck {
  label: string
  detail: string
  done: boolean
}

export interface PillarCard {
  kicker: string
  title: string
  body: string
}

export interface StatItem {
  label: string
  value: number
}

export interface EngineSpec {
  label: string
  value: string
}
