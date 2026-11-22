<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { getContentRegistry } from '@/data'
import { useGameStore } from '@/stores/game'
import { regionKindLabel } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

const registry = getContentRegistry()
const game = useGameStore()

type CodexTab = 'relics' | 'arts' | 'partners' | 'regions'
type CodexSubTab =
  | 'all'
  | 'treasure'
  | 'consumable'
  | 'material'
  | 'quest'
  | 'techniques'
  | 'mounts'
  | 'pets'
  | 'partnerList'
  | 'enemyList'
  | 'seen'
  | 'unseen'

const activeTab = ref<CodexTab>('relics')
const activeSubTab = ref<CodexSubTab>('all')
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')

const tabs = computed(() => [
  { id: 'relics', label: '器物', count: registry.allItems.size },
  { id: 'arts', label: '修行', count: registry.techniques.size + registry.mounts.size + registry.pets.size },
  { id: 'partners', label: '众生', count: registry.partners.size + registry.enemies.size },
  { id: 'regions', label: '山海', count: registry.regions.size },
])

const subTabs = computed(() => {
  switch (activeTab.value) {
    case 'relics':
      return [
        { id: 'all', label: '全部', count: registry.allItems.size },
        { id: 'treasure', label: '法宝', count: treasureEntries.value.length },
        { id: 'consumable', label: '丹药', count: consumableEntries.value.length },
        { id: 'material', label: '材料', count: materialEntries.value.length },
        { id: 'quest', label: '旧物', count: questEntries.value.length },
      ]
    case 'arts':
      return [
        { id: 'techniques', label: '功法', count: artEntries.value.length },
        { id: 'mounts', label: '坐骑', count: mountEntries.value.length },
        { id: 'pets', label: '灵宠', count: petEntries.value.length },
      ]
    case 'partners':
      return [
        { id: 'partnerList', label: '道侣', count: partnerEntries.value.length },
        { id: 'enemyList', label: '敌影', count: enemyEntries.value.length },
      ]
    case 'regions':
      return [
        { id: 'all', label: '全部', count: regionEntries.value.length },
        { id: 'seen', label: '已识', count: regionEntries.value.filter((entry) => entry.owned).length },
        { id: 'unseen', label: '未识', count: regionEntries.value.filter((entry) => !entry.owned).length },
      ]
  }
})

function defaultSubTab(tab: CodexTab): CodexSubTab {
  if (tab === 'arts') return 'techniques'
  if (tab === 'partners') return 'partnerList'
  return 'all'
}

function selectTab(id: string): void {
  activeTab.value = id as CodexTab
  activeSubTab.value = defaultSubTab(activeTab.value)
}

function selectSubTab(id: string): void {
  activeSubTab.value = id as CodexSubTab
}

const RARITY_LABELS: Record<string, string> = {
  common: '凡品',
  uncommon: '良品',
  rare: '珍品',
  legendary: '传世',
}

const ELEMENT_LABELS: Record<string, string> = {
  metal: '金',
  wood: '木',
  water: '水',
  fire: '火',
  earth: '土',
  thunder: '雷',
  ice: '冰',
  wind: '风',
}

function statsText(stats?: {
  health?: number
  attack?: number
  defense?: number
  speed?: number
  crit?: number
  spirit?: number
}): string {
  if (!stats) return ''
  return (
    [
      ['health', '气血'],
      ['attack', '攻'],
      ['defense', '防'],
      ['speed', '速'],
      ['crit', '暴'],
      ['spirit', '神'],
    ] as const
  )
    .filter(([key]) => typeof stats[key] === 'number' && stats[key] !== 0)
    .map(([key, label]) => `${label} +${stats[key]}`)
    .join(' · ')
}

const ownedItemIds = computed(() => {
  const player = game.game.player
  const ids = new Set<string>(Object.keys(player.inventory))
  for (const itemId of player.treasureIds) ids.add(itemId)
  return ids
})

const relicEntries = computed(() =>
  [...registry.allItems.values()].map((item) => {
    const owned = ownedItemIds.value.has(item.id)
    const categoryLabel =
      item.category === 'treasure'
        ? '法宝'
        : item.category === 'consumable'
          ? '丹药'
          : item.category === 'quest'
            ? '旧物'
            : '材料'
    const detail =
      item.category === 'treasure'
        ? [`神通 · ${item.active.name}`, statsText(item.passiveStats)]
        : item.category === 'consumable'
          ? [`药性 · ${item.drawback}`]
          : item.category === 'material'
            ? [`出处 · ${item.source}`]
            : item.tags?.includes('relic')
              ? ['旧器 · 不再着身，只留来历']
              : []
    return {
      id: item.id,
      category: item.category,
      name: owned ? item.name : '未识之物',
      subtitle: `${categoryLabel} · ${RARITY_LABELS[item.rarity] ?? '未鉴'}`,
      owned,
      description: owned ? item.description : '此物尚未入你眼中。潮声偶尔提起它的形状，却没有说名字。',
      flavor: owned ? (item.flavor ?? '') : '',
      detail: owned
        ? detail.filter(Boolean).join(' · ')
        : '试炼、旧事与故人手中，或许能见到它。',
    }
  }),
)

const treasureEntries = computed(() =>
  relicEntries.value.filter((entry) => entry.category === 'treasure'),
)
const consumableEntries = computed(() =>
  relicEntries.value.filter((entry) => entry.category === 'consumable'),
)
const materialEntries = computed(() =>
  relicEntries.value.filter((entry) => entry.category === 'material'),
)
const questEntries = computed(() =>
  relicEntries.value.filter((entry) => entry.category === 'quest'),
)

const artEntries = computed(() =>
  [...registry.techniques.values()].map((technique) => {
    const learned = game.game.player.techniqueIds.includes(technique.id)
    const progress = game.game.player.techniqueProgress[technique.id] ?? 0
    return {
      id: technique.id,
      name: learned ? technique.name : '残篇未识',
      subtitle: `${technique.tier} 阶 · ${technique.nodes.length} 层`,
      owned: learned,
      description: learned ? technique.description : '你还没有真正读懂这门心法。它可能藏在某段旧忆、某位故人或某一处幽微里。',
      flavor: '',
      detail: learned
        ? [
            `已参 ${progress} / ${technique.nodes.length} 层`,
            technique.skill ? `招式 · ${technique.skill.name}` : '',
          ]
            .filter(Boolean)
            .join(' · ')
        : technique.passive.slice(0, 1).join(' · '),
    }
  }),
)

const mountEntries = computed(() =>
  [...registry.mounts.values()].map((mount) => {
    const owned = game.game.player.mountIds.includes(mount.id)
    const stage = game.game.player.mountStages[mount.id] ?? 1
    const current = mount.stages[stage - 1]
    return {
      id: mount.id,
      name: owned ? mount.name : '未见其形',
      subtitle: `坐骑 · ${mount.terrain === 'sea' ? '涉水' : mount.terrain === 'cloud' ? '腾云' : '陆行'}`,
      owned,
      description: owned ? mount.description : '荒原或潮下似乎有这样的身影，还没有人替你把它牵回来。',
      flavor: '',
      detail: owned
        ? `${current?.name ?? ''} · ${statsText(current?.stats)}${current?.travelBonus ? ` · 行旅 +${Math.round(current.travelBonus * 100)}%` : ''}`
        : '',
    }
  }),
)

const petEntries = computed(() =>
  [...registry.pets.values()].map((pet) => {
    const owned = game.game.player.petIds.includes(pet.id)
    const evolution = game.game.player.petEvolutions[pet.id] ?? 1
    const current = pet.evolutions[evolution - 1]
    return {
      id: pet.id,
      name: owned ? pet.name : '未结灵契',
      subtitle: `灵宠 · ${pet.role === 'gather' ? '采集' : pet.role === 'cave' ? '守洞' : pet.role === 'guard' ? '护主' : '行旅'}`,
      owned,
      description: owned ? pet.description : '有生灵在洞府外徘徊过，但还没有与你立下灵契。',
      flavor: '',
      detail: owned
        ? `${current?.name ?? ''} · ${current?.description ?? ''}`
        : pet.temperament,
    }
  }),
)

const partnerEntries = computed(() =>
  [...registry.partners.values()].map((partner) => {
    const favor = game.game.player.partnerFavor[partner.id] ?? 0
    const bonded = game.game.player.partnerIds.includes(partner.id)
    return {
      id: partner.id,
      name: favor > 0 || bonded ? partner.name : '未遇之人',
      subtitle: bonded ? '已结缘' : favor > 0 ? `情谊 ${Math.floor(favor)}` : '尚未相识',
      owned: favor > 0 || bonded,
      description: favor > 0 || bonded
        ? partner.description
        : partner.eraFates[game.game.campaign.currentEra] ?? '此人的故事还没有与你相接。',
      flavor: '',
      detail: bonded ? '后续故事仍在潮声里等' : '',
    }
  }),
)

const enemyEntries = computed(() =>
  [...registry.enemies.values()].map((enemy) => ({
    id: enemy.id,
    name: enemy.name,
    subtitle: `${enemy.title} · ${enemy.element ? (ELEMENT_LABELS[enemy.element] ?? '无属') : '无属'}`,
    owned: true,
    description: enemy.description,
    flavor: '',
    detail: `${statsText(enemy.stats)} · 特性 ${enemy.traits.join(' / ') || '无'}`,
  })),
)

const regionEntries = computed(() =>
  [...registry.regions.values()].map((region) => {
    const state = game.game.campaign.world.regions[region.id]
    const seen = state?.unlocked === true || state?.visited === true
    return {
      id: region.id,
      name: seen ? region.name : '未通之地',
      subtitle: `${regionKindLabel(region.kind)} · 险度 ${region.danger}`,
      owned: seen,
      description: seen ? region.description : '潮路还没有指向这里。它的名字在山海图边缘，被雾遮住。',
      flavor: '',
      detail: seen ? `幽微 ${region.sites.length} 处 · ${region.factionPresence.length} 族往来` : '',
    }
  }),
)

const activeEntries = computed(() => {
  switch (activeTab.value) {
    case 'relics':
      switch (activeSubTab.value) {
        case 'treasure':
          return treasureEntries.value
        case 'consumable':
          return consumableEntries.value
        case 'material':
          return materialEntries.value
        case 'quest':
          return questEntries.value
        default:
          return relicEntries.value
      }
    case 'arts':
      switch (activeSubTab.value) {
        case 'mounts':
          return mountEntries.value
        case 'pets':
          return petEntries.value
        default:
          return artEntries.value
      }
    case 'partners':
      return activeSubTab.value === 'enemyList'
        ? enemyEntries.value
        : partnerEntries.value
    case 'regions':
      return regionEntries.value.filter((entry) => {
        if (activeSubTab.value === 'seen') return entry.owned
        if (activeSubTab.value === 'unseen') return !entry.owned
        return true
      })
  }
})
</script>

<template>
  <div class="space-y-4">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="tabs" :active="activeTab" @select="selectTab" />
        <TabBar size="sm" :tabs="subTabs" :active="activeSubTab" @select="selectSubTab" />
      </div>
    </Teleport>

    <p class="text-[13px] leading-5 text-muted">
      图鉴只记你真正见过、读过或亲手握过的东西。未识之物会保留一个位置，提醒洪荒仍有未见之处。
    </p>

    <p
      v-if="!activeEntries.length"
      class="rounded-sm border border-dashed border-line px-4 py-8 text-center text-[13px] text-muted"
    >
      这一页还没有可记之物。
    </p>

    <div v-else class="grid gap-2 sm:grid-cols-2">
      <article
        v-for="entry in activeEntries"
        :key="entry.id"
        class="rounded-sm border p-3"
        :class="
          entry.owned
            ? 'border-line/80 bg-white/25'
            : 'border-dashed border-line/80 bg-paper/20'
        "
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p
              class="truncate font-serif text-lg leading-tight"
              :class="entry.owned ? 'text-ink' : 'text-muted'"
            >
              {{ entry.name }}
            </p>
            <p class="mt-0.5 text-[12px] text-muted">{{ entry.subtitle }}</p>
          </div>
          <span
            class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
            :class="entry.owned ? 'border-jade/35 text-jade-deep/90' : 'border-line text-muted'"
          >
            {{ entry.owned ? '已识' : '未识' }}
          </span>
        </div>
        <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ entry.description }}</p>
        <p v-if="entry.detail" class="mt-1 text-[12px] leading-4 text-ink-soft">
          {{ entry.detail }}
        </p>
        <p
          v-if="entry.owned && entry.flavor"
          class="mt-1.5 border-t border-line/60 pt-1.5 text-[12px] italic leading-4 text-muted/80"
        >
          {{ entry.flavor }}
        </p>
      </article>
    </div>
  </div>
</template>
