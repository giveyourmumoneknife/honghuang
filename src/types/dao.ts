import type { CombatStats } from './content'
import type { CombatMods } from './gear'
import type { DaoClusterId, DaoNodeId, DaoPrincipleId } from './common'

/** 道途词条的结构化描述，用于界面逐条展示。 */
export interface DaoRuleLine {
  label: string
  detail: string
}

export interface DaoNodeDefinition {
  id: DaoNodeId
  clusterId: DaoClusterId
  name: string
  epithet: string
  description: string
  /** 点亮这枚星所需的星痕。 */
  cost: number
  /** 同簇内必须先点亮的星。 */
  requires?: DaoNodeId
  stats?: CombatStats
  mods?: Partial<CombatMods>
  rules: DaoRuleLine[]
}

export interface DaoPrincipleDefinition {
  id: DaoPrincipleId
  clusterId: DaoClusterId
  name: string
  title: string
  description: string
  /** 道则所需星痕。 */
  cost: number
  /** 需要在所属簇点亮的星数。 */
  requiredNodes: number
  stats?: CombatStats
  mods?: Partial<CombatMods>
  rules: DaoRuleLine[]
}

export interface DaoClusterDefinition {
  id: DaoClusterId
  name: string
  subtitle: string
  glyph: string
  description: string
  nodeIds: DaoNodeId[]
}
