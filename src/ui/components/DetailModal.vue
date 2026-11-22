<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import ArchivePanel from '../panels/ArchivePanel.vue'
import ArtsPanel from '../panels/ArtsPanel.vue'
import BeastPanel from '../panels/BeastPanel.vue'
import CavePanel from '../panels/CavePanel.vue'
import CharacterPanel from '../panels/CharacterPanel.vue'
import CodexPanel from '../panels/CodexPanel.vue'
import CombatPanel from '../panels/CombatPanel.vue'
import DaoPanel from '../panels/DaoPanel.vue'
import EquipmentPanel from '../panels/EquipmentPanel.vue'
import EraPanel from '../panels/EraPanel.vue'
import FactionPanel from '../panels/FactionPanel.vue'
import IdlePanel from '../panels/IdlePanel.vue'
import InboxPanel from '../panels/InboxPanel.vue'
import InventoryPanel from '../panels/InventoryPanel.vue'
import MapPanel from '../panels/MapPanel.vue'
import NewGamePanel from '../panels/NewGamePanel.vue'
import PartnerPanel from '../panels/PartnerPanel.vue'
import SettingsPanel from '../panels/SettingsPanel.vue'
import TrainingPanel from '../panels/TrainingPanel.vue'
import TreasurePanel from '../panels/TreasurePanel.vue'
import WorldBossPanel from '../panels/WorldBossPanel.vue'
import ModalShell from './ui/ModalShell.vue'

const game = useGameStore()
const ui = useUiStore()

const ARCHIVE_TITLES = {
  chronicle: '编年史页',
  rumors: '潮声札记',
  memories: '旧忆',
} as const

const builtBuildings = computed(
  () => game.buildingViews.filter((building) => building.level > 0).length,
)

const meta = computed<{
  eyebrow: string
  title: string
  badge: string
  size: 'sm' | 'md' | 'lg' | 'xl'
}>(() => {
  switch (ui.activePanel) {
    case 'character':
      return {
        eyebrow: '修士',
        title: game.game.player.name,
        badge: game.realmLabel,
        size: 'lg',
      }
    case 'idle':
      return {
        eyebrow: '三槽并行',
        title: '行止安排',
        badge: `${game.speed}×`,
        size: 'md',
      }
    case 'map':
      return {
        eyebrow: '潮路',
        title: game.currentRegion?.name ?? '山海图',
        badge: `行旅 ${Math.floor(game.travelProgress)}`,
        size: 'xl',
      }
    case 'era':
      return {
        eyebrow: '量劫',
        title: game.era?.name ?? '劫数',
        badge: game.ending ? '已落笔' : game.phaseLabel,
        size: 'xl',
      }
    case 'faction':
      return {
        eyebrow: '势力',
        title: game.faction?.name ?? '势力',
        badge: game.factionState?.membership ? game.factionRankTitle : '门外客',
        size: 'lg',
      }
    case 'partner':
      return {
        eyebrow: '缘法',
        title: '缘法录',
        badge: `${game.bondedPartnerCount} 位结缘`,
        size: 'lg',
      }
    case 'cave':
      return {
        eyebrow: '洞府',
        title: game.caveOpen ? (game.cave?.name ?? '洞府') : '洞府未寻',
        badge: game.caveOpen
          ? `${builtBuildings.value} / ${game.buildingViews.length} 建筑`
          : '未启',
        size: 'lg',
      }
    case 'inventory':
      return {
        eyebrow: '行囊',
        title: '随身物品',
        badge: `${game.inventoryViews.length} 种`,
        size: 'lg',
      }
    case 'equipment':
      return {
        eyebrow: '器位',
        title: '装备',
        badge: `${game.sheet.gearSets.filter((set) => set.activeThresholds.length > 0).length} 套生效`,
        size: 'lg',
      }
    case 'training':
      return {
        eyebrow: '历练',
        title: game.trainingView
          ? `${game.trainingView.regionName} · ${game.trainingView.modeName}`
          : '择地历练',
        badge: game.trainingView
          ? `余 ${Math.ceil(game.trainingView.remainingMonths)} 月`
          : `${game.trainingRegionViews.length} 处可行`,
        size: 'lg',
      }
    case 'treasure':
      return {
        eyebrow: '法宝',
        title: game.treasureViews.find((treasure) => treasure.isActive)?.name ?? '法宝',
        badge: `${game.treasureViews.length} 件`,
        size: 'lg',
      }
    case 'arts': {
      const learned = game.techniqueViews.filter((view) => view.learned).length
      return {
        eyebrow: '修行',
        title: '心法与神通',
        badge: `${learned} 门入门 · 神通 ${game.divineSummary.collected}/${game.divineSummary.total}`,
        size: 'lg',
      }
    }
    case 'beast':
      return {
        eyebrow: '灵契',
        title: '坐骑与灵宠',
        badge: `${game.mountViews.length} 骑 · ${game.petViews.length} 宠`,
        size: 'lg',
      }
    case 'combat':
      return {
        eyebrow: '遭遇',
        title: game.pendingEncounterCount > 0 ? '候你的动静' : '潮声暂息',
        badge: game.pendingEncounterCount > 0 ? `未决 ${game.pendingEncounterCount}` : '',
        size: 'lg',
      }
    case 'worldboss':
      return {
        eyebrow: '世界之影',
        title: '劫影录',
        badge: `${game.worldBossSummary.ready} 现世 · 已退 ${game.worldBossSummary.kills}`,
        size: 'lg',
      }
    case 'dao':
      return {
        eyebrow: '道途',
        title: '周天星图',
        badge: `${game.daoSummary.litNodes} / ${game.daoSummary.totalNodes} 星 · 星痕 ${game.daoSummary.marks}`,
        size: 'lg',
      }
    case 'inbox':
      return {
        eyebrow: '收件箱',
        title: `${game.inboxViews.length} 封潮声`,
        badge: game.storyCount > 0 ? `待决 ${game.storyCount}` : '',
        size: 'lg',
      }
    case 'archive':
      return {
        eyebrow: '史册',
        title: ARCHIVE_TITLES[ui.archiveTab],
        badge: '',
        size: 'lg',
      }
    case 'codex':
      return {
        eyebrow: '山海',
        title: '洪荒图鉴',
        badge: '所见与未识',
        size: 'xl',
      }
    case 'settings':
      return {
        eyebrow: '案头',
        title: '设置与存档',
        badge: game.loadedFromSave ? '旧档' : '此世',
        size: 'lg',
      }
    case 'newgame':
      return {
        eyebrow: '另起一世',
        title: '初醒',
        badge: '序章',
        size: 'lg',
      }
    default:
      return { eyebrow: '详情', title: '', badge: '', size: 'lg' }
  }
})
</script>

<template>
  <ModalShell
    v-if="ui.activePanel"
    :title="meta.title"
    :eyebrow="meta.eyebrow"
    :badge="meta.badge"
    :size="meta.size"
    :layer="ui.activePanel === 'newgame' ? 70 : 40"
    @close="ui.closePanel()"
  >
    <CharacterPanel v-if="ui.activePanel === 'character'" />
    <IdlePanel v-else-if="ui.activePanel === 'idle'" />
    <MapPanel v-else-if="ui.activePanel === 'map'" />
    <EraPanel v-else-if="ui.activePanel === 'era'" />
    <FactionPanel v-else-if="ui.activePanel === 'faction'" />
    <PartnerPanel v-else-if="ui.activePanel === 'partner'" />
    <CavePanel v-else-if="ui.activePanel === 'cave'" />
    <InventoryPanel v-else-if="ui.activePanel === 'inventory'" />
    <EquipmentPanel v-else-if="ui.activePanel === 'equipment'" />
    <TrainingPanel v-else-if="ui.activePanel === 'training'" />
    <TreasurePanel v-else-if="ui.activePanel === 'treasure'" />
    <ArtsPanel v-else-if="ui.activePanel === 'arts'" />
    <BeastPanel v-else-if="ui.activePanel === 'beast'" />
    <CombatPanel v-else-if="ui.activePanel === 'combat'" />
    <WorldBossPanel v-else-if="ui.activePanel === 'worldboss'" />
    <DaoPanel v-else-if="ui.activePanel === 'dao'" />
    <InboxPanel v-else-if="ui.activePanel === 'inbox'" />
    <ArchivePanel v-else-if="ui.activePanel === 'archive'" />
    <CodexPanel v-else-if="ui.activePanel === 'codex'" />
    <SettingsPanel v-else-if="ui.activePanel === 'settings'" />
    <NewGamePanel v-else-if="ui.activePanel === 'newgame'" />
  </ModalShell>
</template>
