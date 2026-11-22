<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { ItemId } from '@/types/common'
import type { GearSlot } from '@/types/gear'
import { GEAR_ELEMENT_LABELS } from '@/data/gear/catalog'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

const game = useGameStore()
const ui = useUiStore()

type BagLayer = 'bag' | 'gear'
type BagFilter = 'all' | 'consumable' | 'material' | 'other'
type GearClass = 'all' | 'weapon' | 'armor' | 'trinket'

const SLOT_CLASS: Record<GearSlot, Exclude<GearClass, 'all'>> = {
  weapon: 'weapon',
  armor: 'armor',
  head: 'armor',
  cloak: 'armor',
  waist: 'armor',
  boots: 'armor',
  neck: 'trinket',
  ring: 'trinket',
  accessory: 'trinket',
  talisman: 'trinket',
}

const RARITY_LABELS: Record<string, string> = {
  common: '凡品',
  uncommon: '良品',
  rare: '珍品',
  epic: '秘品',
  legendary: '传世',
}

const RARITY_TONES: Record<string, string> = {
  common: 'text-ink-soft',
  uncommon: 'text-jade',
  rare: 'text-gold-deep',
  epic: 'text-cinnabar',
  legendary: 'text-cinnabar',
}

const layer = ref<BagLayer>('bag')
const bagFilter = ref<BagFilter>('all')
const gearClass = ref<GearClass>('all')
const selectedId = ref('')
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')

const items = computed(() => game.inventoryViews)
const bagItems = computed(() => items.value.filter((item) => item.kind !== 'gear'))
const gearItems = computed(() =>
  items.value.filter((item) => item.kind === 'gear'),
)
const selected = computed(() =>
  items.value.find((item) => item.id === selectedId.value),
)
const selectedGear = computed(() => selected.value?.gearView)
const selectedElement = computed(() => {
  const element = selectedGear.value?.gear.element
  return element ? (GEAR_ELEMENT_LABELS[element] ?? '') : ''
})
const hoverHint = ref('')

const selectedCompare = computed(() => {
  const item = selected.value
  if (!item || item.equipped) return []
  return item.gearView?.compare ?? []
})

const selectedEquippedName = computed(
  () => selected.value?.gearView?.equippedInSlotName ?? '',
)

function deltaTone(delta: number): string {
  return delta > 0
    ? 'text-jade'
    : delta < 0
      ? 'text-cinnabar'
      : 'text-muted'
}

function compareDeltaText(): string {
  const changed = selectedCompare.value.filter((row) => row.delta !== 0)
  if (!changed.length) return '六项属性皆无增减'
  return changed
    .map((row) => `${row.label} ${row.delta > 0 ? '+' : ''}${row.delta}`)
    .join('、')
}

const equipPreview = computed(() => {
  const item = selected.value
  if (!item) return ''
  const replaced = selectedEquippedName.value
    ? `替换「${selectedEquippedName.value}」`
    : '该位置原为空'
  const extras = [
    item.modText ? `器理 ${item.modText}` : '',
    item.setText ? `套装 ${item.setText}` : '',
  ]
    .filter(Boolean)
    .join('；')
  return `换上后：${compareDeltaText()}；${replaced}${extras ? `；${extras}` : ''}。`
})

const unequipPreview = computed(() => {
  const item = selected.value
  if (!item) return ''
  const parts = [
    item.statsText || '无基础属性',
    item.modText ? `器理 ${item.modText}` : '',
  ].filter(Boolean)
  return `卸下后失去：${parts.join('；')}。`
})

const usePreview = computed(() => {
  const item = selected.value
  if (!item) return ''
  if (item.cooldownMonths > 0) {
    return `药性未散，还需 ${Math.ceil(item.cooldownMonths)} 月才能再服。`
  }
  return `服下后：${item.usePreview}。`
})

const panelHint = computed(
  () => '前往器位可继续淬炼、洗练、封印或拓印装备。',
)

function matchesBagFilter(
  item: (typeof items.value)[number],
  filter: BagFilter,
): boolean {
  if (filter === 'all') return true
  if (filter === 'other') {
    return item.category === 'quest' || item.category === 'treasure'
  }
  return item.category === filter
}

const layerTabs = computed(() => [
  { id: 'bag', label: '行囊', count: bagItems.value.length },
  { id: 'gear', label: '装备', count: gearItems.value.length },
])

const bagFilterTabs = computed(() => [
  { id: 'all', label: '全部', count: bagItems.value.length },
  { id: 'consumable', label: '丹药', count: bagItems.value.filter((item) => item.category === 'consumable').length },
  { id: 'material', label: '材料', count: bagItems.value.filter((item) => item.category === 'material').length },
  { id: 'other', label: '旧物', count: bagItems.value.filter((item) => item.category === 'quest' || item.category === 'treasure').length },
])

const gearFilterTabs = computed(() => [
  { id: 'all', label: '全部', count: gearItems.value.length },
  { id: 'weapon', label: '兵刃', count: gearItems.value.filter((item) => item.gearView?.gear.slot === 'weapon').length },
  { id: 'armor', label: '护体', count: gearItems.value.filter((item) => item.gearView && SLOT_CLASS[item.gearView.gear.slot] === 'armor').length },
  { id: 'trinket', label: '饰物', count: gearItems.value.filter((item) => item.gearView && SLOT_CLASS[item.gearView.gear.slot] === 'trinket').length },
])

const visibleItems = computed(() => {
  if (layer.value === 'bag') {
    return bagItems.value.filter((item) => matchesBagFilter(item, bagFilter.value))
  }
  return gearItems.value.filter((item) => {
    if (gearClass.value === 'all') return true
    const slot = item.gearView?.gear.slot
    return slot ? SLOT_CLASS[slot] === gearClass.value : false
  })
})

function selectLayer(id: string): void {
  layer.value = id as BagLayer
}

function selectBagFilter(id: string): void {
  bagFilter.value = id as BagFilter
}

function selectGearClass(id: string): void {
  gearClass.value = id as GearClass
}

function itemTone(item: (typeof items.value)[number]): string {
  return item.kind === 'gear'
    ? item.tone || 'text-ink-soft'
    : (RARITY_TONES[item.rarity] ?? 'text-ink-soft')
}

function openItem(id: string): void {
  selectedId.value = id
  hoverHint.value = ''
}

function backToBag(): void {
  selectedId.value = ''
  hoverHint.value = ''
}

function equipRegular(): void {
  const item = selected.value
  if (!item) return
  hoverHint.value = ''
  game.equipGeneratedGear(item.id)
}

function unequipRegular(): void {
  const slot = selectedGear.value?.gear.slot
  if (!slot) return
  hoverHint.value = ''
  game.unequipGeneratedGear(slot)
}

function useSelected(): void {
  const item = selected.value
  if (!item) return
  hoverHint.value = ''
  game.useItem(item.id as ItemId)
}

function openEquipment(): void {
  selectedId.value = ''
  hoverHint.value = ''
  ui.openPanel('equipment')
}
</script>

<template>
  <div class="space-y-4">
    <template v-if="selected">
      <button
        type="button"
        class="rounded-sm border border-line px-2.5 py-1.5 text-[13px] text-muted transition hover:border-jade/40 hover:text-jade-deep"
        @click="backToBag"
      >
        ← 返回行囊
      </button>

      <section class="rounded-sm border border-line/80 bg-white/25 px-3 py-3">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[12px] text-muted">
              {{ selected.categoryLabel }}
              <template v-if="selected.kind === 'gear' && selectedGear">
                · {{ selectedGear.qualityName }} · {{ selectedGear.tierName }}
              </template>
              <template v-else>
                · {{ RARITY_LABELS[selected.rarity] ?? '未鉴' }}
              </template>
              <template v-if="selected.slotLabel"> · {{ selected.slotLabel }}</template>
            </p>
            <h3 class="mt-1 font-serif text-2xl leading-tight">{{ selected.name }}</h3>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-1.5">
            <span
              v-if="selected.equipped"
              class="rounded-sm border border-cinnabar/30 px-2 py-0.5 text-[12px] text-cinnabar"
            >
              已着身
            </span>
            <span
              v-if="selected.count > 1"
              class="rounded-sm border border-line px-2 py-0.5 text-[12px] text-muted"
            >
              持有 ×{{ selected.count }}
            </span>
          </div>
        </div>

        <template v-if="selected.kind === 'gear' && selectedGear">
          <p class="mt-3 text-[13px] leading-5 text-ink-soft">
            {{ selectedGear.statsText || '无基础属性' }}
          </p>
          <p
            v-if="selectedElement"
            class="mt-0.5 text-[12px] text-muted"
          >
            {{ selectedElement }}行灵机 · 器力 {{ selectedGear.power }}
            <template v-if="selectedGear.gear.upgrade > 0">
              · 淬炼 +{{ selectedGear.gear.upgrade }}
            </template>
          </p>
          <p
            v-else
            class="mt-0.5 text-[12px] text-muted"
          >
            器力 {{ selectedGear.power }}
            <template v-if="selectedGear.gear.upgrade > 0">
              · 淬炼 +{{ selectedGear.gear.upgrade }}
            </template>
          </p>
          <p
            v-if="selectedGear.modText"
            class="mt-1 text-[13px] leading-5 text-gold-deep"
          >
            器理 · {{ selectedGear.modText }}
          </p>
          <p
            v-if="selectedGear.setText"
            class="mt-1 text-[12px] text-gold-deep"
          >
            套装 · {{ selectedGear.setText }}
          </p>

          <div v-if="selectedGear.affixes.length" class="mt-2.5 space-y-1">
            <p class="text-[12px] tracking-[0.18em] text-muted">器纹</p>
            <div
              v-for="affix in selectedGear.affixes"
              :key="affix.index"
              class="rounded-sm border border-line/60 px-2.5 py-1.5"
            >
              <p class="text-[13px] leading-5">
                <span class="text-ink-soft">{{ affix.label }}·阶{{ affix.tier }}</span>
                <span class="text-muted">：{{ affix.description }}</span>
              </p>
              <p v-if="affix.sealed" class="mt-0.5 text-[12px] text-muted">已封印</p>
            </div>
          </div>

          <p class="mt-2.5 text-[12px] leading-5 text-muted">
            淬炼至 +{{ selectedGear.gear.upgrade + 1 }} 需灵石
            {{ selectedGear.upgradeCost.spirit_stones }}、灵矿
            {{ selectedGear.upgradeCost.ore }}；洗练需灵石
            {{ selectedGear.reforgeCost.spirit_stones }}、灵矿
            {{ selectedGear.reforgeCost.ore }}。
          </p>
        </template>

        <template v-else>
          <p class="mt-3 text-[13px] leading-6 text-ink-soft">{{ selected.description }}</p>
          <p v-if="selected.drawback" class="mt-1.5 text-[12px] leading-5 text-cinnabar">
            偏性 · {{ selected.drawback }}
          </p>
          <p v-if="selected.usable" class="mt-1.5 text-[12px] text-muted">
            {{
              selected.cooldownMonths > 0
                ? `药性未散，还需 ${Math.ceil(selected.cooldownMonths)} 月`
                : '此刻可以服用'
            }}
          </p>
          <p v-if="selected.source" class="mt-1.5 text-[12px] leading-5 text-muted">
            来处 · {{ selected.source }}
          </p>
          <p v-if="selected.usedBy.length" class="mt-0.5 text-[12px] leading-5 text-muted">
            所用 · {{ selected.usedBy.join('、') }}
          </p>
          <p v-if="selected.flavor" class="mt-1.5 border-t border-line/60 pt-1.5 text-[12px] italic leading-5 text-muted">
            {{ selected.flavor }}
          </p>
        </template>

        <template v-if="selected.kind === 'gear'">
          <p v-if="selectedEquippedName" class="mt-2 text-[12px] text-muted">
            同位置现有：{{ selectedEquippedName }}
          </p>
          <div v-if="selectedCompare.length" class="mt-2.5">
            <p class="text-[12px] tracking-[0.18em] text-muted">同位置对比</p>
            <div class="mt-1 grid grid-cols-3 gap-1.5">
              <div
                v-for="row in selectedCompare"
                :key="row.key"
                class="rounded-sm border border-line/60 px-2 py-1"
                :title="`现有 ${row.current} → 换上 ${row.next}`"
              >
                <p class="text-[12px] text-muted">{{ row.label }}</p>
                <p class="mt-0.5 text-[13px] tabular-nums">
                  {{ row.next }}
                  <span class="text-[12px]" :class="deltaTone(row.delta)">
                    ({{ row.delta > 0 ? '+' : '' }}{{ row.delta }})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </template>

        <p
          v-if="selected.kind === 'gear' || selected.usable"
          class="mt-2.5 min-h-10 rounded-sm border border-dashed border-line/70 bg-white/15 px-2.5 py-1.5 text-[12px] leading-5"
          :class="hoverHint ? 'text-ink-soft' : 'text-muted'"
        >
          {{ hoverHint || '把鼠标停在选项上，可先看收益或影响。' }}
        </p>

        <div
          class="mt-2 flex flex-wrap items-center gap-2 border-t border-line/60 pt-2.5"
          @mouseleave="hoverHint = ''"
        >
          <template v-if="selected.kind === 'gear'">
            <button
              type="button"
              class="rounded-sm border px-3 py-1.5 text-[13px] transition"
              :class="
                selected.equipped
                  ? 'border-line text-muted hover:border-jade/40 hover:text-jade-deep'
                  : 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
              "
              :title="selected.equipped ? unequipPreview : equipPreview"
              @mouseenter="hoverHint = selected.equipped ? unequipPreview : equipPreview"
              @focus="hoverHint = selected.equipped ? unequipPreview : equipPreview"
              @click="selected.equipped ? unequipRegular() : equipRegular()"
            >
              {{ selected.equipped ? '卸下' : '装备' }}
            </button>
            <button
              type="button"
              class="rounded-sm border border-line px-3 py-1.5 text-[13px] text-muted transition hover:border-jade/40 hover:text-jade-deep"
              :title="panelHint"
              @mouseenter="hoverHint = panelHint"
              @focus="hoverHint = panelHint"
              @click="openEquipment"
            >
              前往器位
            </button>
          </template>
          <button
            v-else-if="selected.usable"
            type="button"
            class="rounded-sm border px-3 py-1.5 text-[13px] transition"
            :class="
              selected.cooldownMonths > 0
                ? 'cursor-not-allowed border-line text-muted'
                : 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
            "
            :title="usePreview"
            :disabled="selected.cooldownMonths > 0"
            @mouseenter="hoverHint = usePreview"
            @focus="hoverHint = usePreview"
            @click="useSelected"
          >
            {{ selected.cooldownMonths > 0 ? '药性未散' : '服用' }}
          </button>
        </div>
      </section>
    </template>

    <template v-else>
      <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
        <div class="space-y-1.5" role="tablist" aria-label="背包分类">
          <TabBar :tabs="layerTabs" :active="layer" @select="selectLayer" />
          <TabBar
            v-if="layer === 'bag'"
            size="sm"
            :tabs="bagFilterTabs"
            :active="bagFilter"
            @select="selectBagFilter"
          />
          <TabBar
            v-else
            size="sm"
            :tabs="gearFilterTabs"
            :active="gearClass"
            @select="selectGearClass"
          />
        </div>
      </Teleport>

      <section>
        <p class="text-[13px] leading-5 text-muted">
          行囊收着杂物与装备。这里只列名字，点开再看全部详情；装备的淬炼与替换在器位中处理。
        </p>
      </section>

      <p
        v-if="!visibleItems.length"
        class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        {{
          layer === 'bag'
            ? '行囊空空。去探一处幽微，或在势力里领一份差事。'
            : '器匣里还没有这一类装备。'
        }}
      </p>

      <div v-else class="grid gap-1.5 sm:grid-cols-2">
        <button
          v-for="item in visibleItems"
          :key="item.id"
          type="button"
          class="flex min-w-0 items-center justify-between gap-2 rounded-sm border border-line/70 bg-white/20 px-2.5 py-2 text-left transition hover:border-jade/35 hover:bg-white/35"
          @click="openItem(item.id)"
        >
          <span class="flex min-w-0 items-center gap-1.5">
            <span class="truncate text-[13px] leading-5" :class="itemTone(item)">
              {{ item.name }}
            </span>
            <span
              v-if="item.kind === 'gear' && item.gearView"
              class="shrink-0 rounded-sm border px-1 py-0.5 text-[11px] leading-none"
              :class="item.gearView.qualityTone"
            >
              {{ item.gearView.qualityName }}
            </span>
            </span>
          <span v-if="item.count > 1" class="shrink-0 text-[12px] tabular-nums text-muted">
            ×{{ item.count }}
          </span>
        </button>
      </div>

      <p class="border-t border-line/70 pt-3 text-[12px] leading-5 text-muted">
        装备的淬炼、洗练、封印与拓印，仍可在器位中处理；旧器只作为故事里的旧物留存。
      </p>
    </template>
  </div>
</template>
