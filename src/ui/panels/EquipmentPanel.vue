<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { Element } from '@/types/common'
import type { GearSlot } from '@/types/gear'
import type { GearView } from '@/core/gear'
import {
  gearCombatStats,
  gearPower,
  gearTransferCostText,
  MAX_GEAR_AFFIXES,
} from '@/core/gear'
import { combatModText, GEAR_ELEMENT_LABELS } from '@/data/gear/catalog'
import { useGameStore } from '@/stores/game'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type EquipmentTab = 'worn' | 'vault' | 'recycle'
type GearClass = 'all' | 'weapon' | 'armor' | 'trinket'
type QualityBand = 'all' | 'mortal' | 'spirit' | 'immortal'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const tab = ref<EquipmentTab>('worn')
const vaultClass = ref<GearClass>('all')
const recycleBand = ref<QualityBand>('all')
const expandedId = ref('')
const transferFrom = ref('')
const transferIndex = ref(-1)
const pendingDismantle = ref('')
const hoverHint = ref('')
const popupSlot = ref<GearSlot | ''>('')
const recycleSelected = ref<string[]>([])
const recycleArmed = ref(false)

const slots = computed(() => game.standardGearSlotViews)
const inventory = computed(() => game.gearViews)
const equippedCount = computed(
  () => slots.value.filter((slot) => slot.equippedId).length,
)

const SLOT_CLASS: Record<GearSlot, GearClass> = {
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

const GEAR_CLASS_LABELS: Record<GearClass, string> = {
  all: '全部',
  weapon: '兵刃',
  armor: '衣甲',
  trinket: '饰物',
}

const QUALITY_BAND_LABELS: Record<QualityBand, string> = {
  all: '全部',
  mortal: '凡俗',
  spirit: '灵玄',
  immortal: '仙圣',
}

function qualityBand(quality: number): Exclude<QualityBand, 'all'> {
  if (quality <= 3) return 'mortal'
  if (quality <= 7) return 'spirit'
  return 'immortal'
}

const vaultTabs = computed<
  Array<{ id: GearClass; label: string; count: number }>
>(() => {
  const classes: GearClass[] = ['all', 'weapon', 'armor', 'trinket']
  return classes.map((id) => ({
    id,
    label: GEAR_CLASS_LABELS[id],
    count:
      id === 'all'
        ? inventory.value.length
        : inventory.value.filter((view) => SLOT_CLASS[view.gear.slot] === id)
            .length,
  }))
})

const vaultInventory = computed(() =>
  [...inventory.value]
    .filter(
      (view) =>
        vaultClass.value === 'all' ||
        SLOT_CLASS[view.gear.slot] === vaultClass.value,
    )
    .sort(
      (left, right) =>
        Number(right.isEquipped) - Number(left.isEquipped) ||
        right.gear.quality - left.gear.quality ||
        right.power - left.power,
    ),
)

const recycleTabs = computed<
  Array<{ id: QualityBand; label: string; count: number }>
>(() => {
  const bands: QualityBand[] = ['all', 'mortal', 'spirit', 'immortal']
  return bands.map((id) => ({
    id,
    label: QUALITY_BAND_LABELS[id],
    count:
      id === 'all'
        ? inventory.value.length
        : inventory.value.filter(
            (view) => qualityBand(view.gear.quality) === id,
          ).length,
  }))
})

const recycleList = computed(() =>
  [...inventory.value]
    .filter(
      (view) =>
        recycleBand.value === 'all' ||
        qualityBand(view.gear.quality) === recycleBand.value,
    )
    .sort(
      (left, right) =>
        right.gear.quality - left.gear.quality || right.power - left.power,
    ),
)

const recycleSelectedSet = computed(() => new Set(recycleSelected.value))

const recyclableVisible = computed(() =>
  recycleList.value.filter(
    (view) => !view.isEquipped && !view.gear.locked,
  ),
)

const recycleQuote = computed(() =>
  game.gearRecycleQuote(recycleSelected.value),
)

const equippedCountForPopup = computed(() => {
  if (!popupSlot.value) return 0
  return inventory.value.filter((view) => view.gear.slot === popupSlot.value)
    .length
})

const popupSlotMeta = computed(() =>
  slots.value.find((slot) => slot.slot === popupSlot.value),
)

const popupCandidates = computed(() =>
  popupSlot.value
    ? [...inventory.value]
        .filter((view) => view.gear.slot === popupSlot.value)
        .sort(
          (left, right) =>
            Number(right.isEquipped) - Number(left.isEquipped) ||
            right.power - left.power,
        )
    : [],
)

const primaryTabTabs = computed<
  Array<{ id: EquipmentTab; label: string; count: number | string }>
>(() => [
  {
    id: 'worn',
    label: '穿戴',
    count: `${equippedCount.value}/${slots.value.length}`,
  },
  { id: 'vault', label: '器匣', count: inventory.value.length },
  {
    id: 'recycle',
    label: '回收',
    count: recycleQuote.value.count || recycleSelected.value.length,
  },
])

const hintPlaceholder = computed(() => {
  if (tab.value === 'recycle') {
    return '勾选器匣中的器物；已着身与已锁的器物不会入选，整批回收另加一成。'
  }
  if (tab.value === 'worn') {
    return '点击任一器位，可查看同位置器物并直接换上或就地淬炼。'
  }
  return '把鼠标停在选项上，可先看收益或影响。'
})

const transferSource = computed(() =>
  game.gearViews.find((view) => view.gear.id === transferFrom.value),
)
const transferAffix = computed(() =>
  transferSource.value?.affixes[transferIndex.value],
)
const transferTargets = computed(() =>
  game.gearViews.filter(
    (view) =>
      !view.isEquipped &&
      view.gear.id !== transferFrom.value &&
      view.gear.affixes.length < MAX_GEAR_AFFIXES,
  ),
)
const activeSets = computed(() =>
  game.sheet.gearSets.filter((set) => set.count > 0),
)
const modSummary = computed(() => combatModText(game.sheet.mods))

function equip(id: string): void {
  transferFrom.value = ''
  transferIndex.value = -1
  hoverHint.value = ''
  game.equipGeneratedGear(id)
}

function unequip(slot: string): void {
  hoverHint.value = ''
  game.unequipGeneratedGear(slot as GearSlot)
}

function selectTab(id: string): void {
  tab.value = id as EquipmentTab
  hoverHint.value = ''
}

function selectVaultClass(id: string): void {
  vaultClass.value = id as GearClass
  expandedId.value = ''
  pendingDismantle.value = ''
  hoverHint.value = ''
}

function selectRecycleBand(id: string): void {
  recycleBand.value = id as QualityBand
  recycleArmed.value = false
  hoverHint.value = ''
}

function openSlot(slot: GearSlot, label: string): void {
  popupSlot.value = slot
  hoverHint.value = `${label}：查看同位置器物，可换上、淬炼或洗练。`
}

function closeSlotPopup(): void {
  popupSlot.value = ''
  hoverHint.value = ''
}

function toggleRecycle(id: string): void {
  recycleSelected.value = recycleSelected.value.includes(id)
    ? recycleSelected.value.filter((entry) => entry !== id)
    : [...recycleSelected.value, id]
  recycleArmed.value = false
}

function selectAllRecyclable(): void {
  recycleSelected.value = recyclableVisible.value.map((view) => view.gear.id)
  recycleArmed.value = false
}

function clearRecycle(): void {
  recycleSelected.value = []
  recycleArmed.value = false
}

function runRecycle(): void {
  if (recycleQuote.value.count === 0) return
  if (!recycleArmed.value) {
    recycleArmed.value = true
    return
  }
  game.recycleGeneratedGears([...recycleSelected.value])
  recycleSelected.value = []
  recycleArmed.value = false
  hoverHint.value = ''
}

function recycleHint(view: GearView): string {
  if (view.isEquipped) return '先卸下这件器物，才能回收。'
  if (view.gear.locked) return '器物已锁，先解锁才能回收。'
  const selected = recycleSelectedSet.value.has(view.gear.id)
  return `${selected ? '移出回收' : '选入回收'}：返还灵石 ${view.dismantleYield.spirit_stones}、灵矿 ${view.dismantleYield.ore}；整批回收另加一成。`
}

function toggle(id: string): void {
  expandedId.value = expandedId.value === id ? '' : id
  if (expandedId.value !== id) pendingDismantle.value = ''
  hoverHint.value = ''
}

function startTransfer(id: string, affixIndex: number): void {
  transferFrom.value = transferFrom.value === id && transferIndex.value === affixIndex
    ? ''
    : id
  transferIndex.value = transferFrom.value ? affixIndex : -1
}

function applyTransfer(targetId: string): void {
  if (!transferFrom.value) return
  game.transferGeneratedAffix(transferFrom.value, transferIndex.value, targetId)
  transferFrom.value = ''
  transferIndex.value = -1
}

function dismantle(id: string): void {
  hoverHint.value = ''
  if (pendingDismantle.value !== id) {
    pendingDismantle.value = id
    return
  }
  pendingDismantle.value = ''
  game.dismantleGeneratedGear(id)
}

function deltaTone(delta: number): string {
  if (delta > 0) return 'text-jade'
  if (delta < 0) return 'text-cinnabar'
  return 'text-muted'
}

function deltaText(delta: number): string {
  if (delta > 0) return `+${delta}`
  return `${delta}`
}

function elementLabel(element?: Element): string {
  return element ? (GEAR_ELEMENT_LABELS[element] ?? '') : ''
}

function compareText(rows: GearView['compare']): string {
  const changed = rows.filter((row) => row.delta !== 0)
  if (!changed.length) return '六项属性皆无增减'
  return changed
    .map((row) => `${row.label} ${row.delta > 0 ? '+' : ''}${row.delta}`)
    .join('、')
}

function equipHint(view: GearView): string {
  const replaced = view.equippedInSlotName
    ? `替换「${view.equippedInSlotName}」`
    : '该位置原为空'
  const mods = view.modText ? `；器理 ${view.modText}` : ''
  return `换上后：${compareText(view.compare)}；${replaced}${mods}。`
}

function unequipHint(view?: GearView): string {
  if (!view) return ''
  const mods = view.modText ? `；器理 ${view.modText}` : ''
  return `卸下后失去：${view.statsText || '无基础属性'}${mods}。`
}

function upgradeHint(view: GearView): string {
  if (!view.canUpgrade) return '已经淬炼到顶，无法再提升。'
  const nextGear = { ...view.gear, upgrade: view.gear.upgrade + 1 }
  const nextPower = Math.round(gearPower(nextGear))
  const gain = nextPower - view.power
  const before = gearCombatStats(view.gear)
  const after = gearCombatStats(nextGear)
  const changes = (
    [
      ['attack', '攻势'],
      ['defense', '护体'],
      ['health', '气血'],
      ['speed', '身法'],
      ['crit', '暴击'],
      ['spirit', '神识'],
    ] as const
  )
    .filter(([key]) => after[key] !== before[key])
    .map(([key, label]) => `${label} ${after[key] - before[key] > 0 ? '+' : ''}${after[key] - before[key]}`)
    .join('、')
  const statText = changes || '基础属性本轮未跨过取整'
  return `淬炼至 +${view.gear.upgrade + 1}：${statText}；器力 ${view.power} → ${nextPower}（${
    gain >= 0 ? '+' : ''
  }${gain}）；消耗灵石 ${view.upgradeCost.spirit_stones}、灵矿 ${view.upgradeCost.ore}。`
}

function reforgeHint(view: GearView): string {
  const sealed = view.gear.sealed.length
  const free = view.gear.affixes.length - sealed
  const note = sealed ? `${sealed} 道封印器纹不受影响` : '包括全部器纹与基础属性'
  return `洗练重排 ${free} 道器纹与基础属性，${note}；结果随机。消耗灵石 ${view.reforgeCost.spirit_stones}、灵矿 ${view.reforgeCost.ore}。`
}

function sealHint(view: GearView, label: string): string {
  return `封住「${label}」后，洗练不会再改变它；消耗灵石 ${view.sealCost.spirit_stones}、灵矿 ${view.sealCost.ore}。`
}

function unsealHint(view: GearView, label: string): string {
  return `解封「${label}」后，它会重新受洗练影响；消耗灵石 ${view.sealCost.spirit_stones}、灵矿 ${view.sealCost.ore}。`
}

function transferHint(label: string): string {
  return `把「${label}」拓到另一件未着身器物，原器会失去此纹；需先卸下两件器物。`
}

function dismantleHint(view: GearView): string {
  if (view.isEquipped) return '先卸下这件器物，才能拆解。'
  if (view.gear.locked) return '器物已锁，先解锁才能拆解。'
  return `拆解后失去此器，返还灵石 ${view.dismantleYield.spirit_stones}、灵矿 ${view.dismantleYield.ore}；需再按一次确认。`
}

</script>

<template>
  <div class="space-y-4">
    <section class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-[13px] leading-5 text-muted">
          十处器位各有其用。装备可淬炼、洗练、封印与拓印；旧器不再着身，只作为剧情旧物留在行囊里。
        </p>
        <p class="mt-1 text-[12px] leading-5 text-muted">
          {{ slots.filter((slot) => slot.equippedId).length }} / {{ slots.length }} 器位已着身
          <template v-if="modSummary"> · {{ modSummary }}</template>
        </p>
      </div>
      <span class="shrink-0 rounded-sm border border-line px-2 py-0.5 text-[12px] text-muted">
        {{ game.sheet.attack }} 攻 · {{ game.sheet.defense }} 防 · {{ game.sheet.speed }} 速
      </span>
    </section>

    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="primaryTabTabs" :active="tab" @select="selectTab" />
        <TabBar
          v-if="tab === 'vault'"
          size="sm"
          :tabs="vaultTabs"
          :active="vaultClass"
          @select="selectVaultClass"
        />
        <TabBar
          v-else-if="tab === 'recycle'"
          size="sm"
          :tabs="recycleTabs"
          :active="recycleBand"
          @select="selectRecycleBand"
        />
        <p
          class="min-h-8 text-[12px] leading-5"
          :class="hoverHint ? 'text-ink-soft' : 'text-muted'"
        >
          {{ hoverHint || hintPlaceholder }}
        </p>
      </div>
    </Teleport>

    <div>
      <section v-if="activeSets.length && tab !== 'recycle'" class="mb-2 flex flex-wrap gap-1.5">
        <span
          v-for="set in activeSets"
          :key="set.name"
          class="rounded-sm border px-2 py-0.5 text-[12px]"
          :class="
            set.activeThresholds.length
              ? 'border-jade/40 text-jade-deep'
              : 'border-line text-muted'
          "
        >
          {{ set.name }} {{ set.count }} / {{ set.size }}
          <template v-if="set.activeThresholds.length"> · 已生效</template>
        </span>
      </section>

      <template v-if="tab === 'worn'">
        <section class="grid grid-cols-2 gap-2">
          <button
            v-for="slot in slots"
            :key="slot.slot"
            type="button"
            class="rounded-sm border border-line/80 bg-white/25 px-2.5 py-2 text-left transition hover:border-jade/35"
            @click="openSlot(slot.slot, slot.label)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-[12px] tracking-[0.2em] text-muted">{{ slot.label }}</p>
                <p class="mt-0.5 truncate font-serif text-base leading-tight">
                  {{ slot.equipped?.gear.name ?? '空位' }}
                </p>
              </div>
              <span class="shrink-0 text-[12px] text-muted">查看</span>
            </div>
            <template v-if="slot.equipped">
              <p class="mt-1 text-[12px] text-muted">
                <span :class="slot.equipped.qualityTone.split(' ').slice(0, 1).join(' ')">
                  {{ slot.equipped.qualityName }}
                </span>
                · +{{ slot.equipped.gear.upgrade }} ·
                {{ slot.equipped.statsText || '无属性' }}
              </p>
              <p v-if="slot.equipped.modText" class="mt-0.5 text-[12px] text-gold-deep">
                {{ slot.equipped.modText }}
              </p>
            </template>
            <p v-else class="mt-1 text-[12px] text-muted">
              匣中 {{ slot.owned }} 件可换
            </p>
          </button>
        </section>
        <p class="mt-2 text-[12px] leading-5 text-muted">
          点击器位可打开同位置器选：比较属性、换上，或直接对身上器物淬炼与洗练。卸下也在这里。
        </p>
      </template>

      <template v-if="tab === 'vault'">
        <section v-if="transferFrom" class="mb-3 rounded-sm border border-gold/35 bg-gold/[0.05] px-3 py-2.5">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-[13px] text-gold-deep">拓印器纹</p>
              <p class="mt-1 text-[12px] leading-5 text-ink-soft">
                从{{ transferSource?.gear.name }}拓出「{{ transferAffix?.label }}」，选择一件未着身的器物承接。
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 text-[12px] text-muted transition hover:text-jade-deep"
              @click="transferFrom = ''; transferIndex = -1"
            >
              取消
            </button>
          </div>
          <div class="mt-2 max-h-44 space-y-1.5 overflow-y-auto pr-1">
            <button
              v-for="target in transferTargets"
              :key="target.gear.id"
              type="button"
              class="flex w-full items-center justify-between gap-2 rounded-sm border border-line/70 bg-paper/30 px-2 py-1.5 text-left transition hover:border-jade/40"
              @click="applyTransfer(target.gear.id)"
            >
              <span class="min-w-0">
                <span class="block truncate text-[13px]">
                  {{ target.gear.name }} · {{ target.qualityName }}
                </span>
                <span class="block text-[12px] text-muted">
                  {{ target.gear.affixes.length }} 道器纹 · 需
                  {{ gearTransferCostText(transferSource!.gear, transferIndex, target.gear) }}
                </span>
              </span>
              <span class="shrink-0 text-[12px] text-gold-deep">拓入</span>
            </button>
            <p v-if="!transferTargets.length" class="text-[12px] text-muted">
              没有其他未着身、且还能承载器纹的器物。
            </p>
          </div>
        </section>

        <section>
          <div class="flex items-end justify-between gap-3">
            <p class="text-[13px] tracking-[0.2em] text-muted">
              {{ GEAR_CLASS_LABELS[vaultClass] }}器匣
            </p>
            <p class="text-[12px] text-muted">共 {{ vaultInventory.length }} 件</p>
          </div>

          <div class="mt-2 space-y-2">
            <article
              v-for="view in vaultInventory"
              :key="view.gear.id"
              class="rounded-sm border bg-white/25 transition"
              :class="
                expandedId === view.gear.id
                  ? 'border-jade/40'
                  : 'border-line/80 hover:border-jade/30'
              "
            >
              <button type="button" class="block w-full px-3 py-2.5 text-left" @click="toggle(view.gear.id)">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="flex flex-wrap items-center gap-1.5">
                      <span class="rounded-sm border px-1.5 py-0.5 text-[12px]" :class="view.qualityTone">
                        {{ view.qualityName }}
                      </span>
                      <span class="font-serif text-base leading-tight">{{ view.gear.name }}</span>
                      <span class="text-[12px] text-muted">+{{ view.gear.upgrade }}</span>
                      <span
                        v-if="view.isEquipped"
                        class="rounded-sm border border-jade/40 bg-jade-soft px-1 py-0.5 text-[12px] text-jade-deep"
                      >
                        已着身
                      </span>
                      <span
                        v-if="view.gear.locked"
                        class="rounded-sm border border-line px-1 py-0.5 text-[12px] text-muted"
                      >
                        已锁
                      </span>
                    </p>
                    <p class="mt-1 text-[12px] text-muted">
                      {{ view.slotLabel }} · {{ view.tierName }} · 器力 {{ view.power }}
                      <template v-if="view.gear.element"> · {{ elementLabel(view.gear.element) }}行</template>
                    </p>
                  </div>
                  <span class="shrink-0 text-[12px] text-muted">
                    {{ expandedId === view.gear.id ? '收起' : '展开' }}
                  </span>
                </div>

                <p class="mt-1.5 text-[13px] leading-5 text-ink-soft">
                  {{ view.statsText || '无基础属性' }}
                </p>
                <p v-if="view.modText" class="mt-0.5 text-[12px] leading-5 text-gold-deep">
                  器理 · {{ view.modText }}
                </p>
                <p v-if="view.setText" class="mt-0.5 text-[12px] text-muted">{{ view.setText }}</p>
                <div class="mt-1.5 flex flex-wrap gap-1">
                  <span
                    v-for="affix in view.affixes"
                    :key="affix.index"
                    class="rounded-sm border px-1.5 py-0.5 text-[12px]"
                    :class="affix.tone"
                  >
                    {{ affix.label }} · 阶{{ affix.tier }}
                    <template v-if="affix.sealed"> · 封</template>
                  </span>
                </div>
                <p v-if="view.equippedInSlotName" class="mt-1 text-[12px] text-muted">
                  同位置现有：{{ view.equippedInSlotName }}
                </p>
              </button>

              <div
                v-if="expandedId === view.gear.id"
                class="border-t border-line/60 px-3 pb-3 pt-2.5"
                @mouseleave="hoverHint = ''"
              >
                <div v-if="!view.isEquipped" class="grid grid-cols-3 gap-1.5">
                  <div
                    v-for="row in view.compare"
                    :key="row.key"
                    class="rounded-sm border border-line/60 px-2 py-1"
                    :title="`现有 ${row.current} → 换上 ${row.next}`"
                  >
                    <p class="text-[12px] text-muted">{{ row.label }}</p>
                    <p class="mt-0.5 text-[13px] tabular-nums">
                      {{ row.next }}
                      <span class="text-[12px]" :class="deltaTone(row.delta)">
                        ({{ deltaText(row.delta) }})
                      </span>
                    </p>
                  </div>
                </div>

                <div v-if="view.affixes.length" class="mt-2.5 space-y-1">
                  <div
                    v-for="affix in view.affixes"
                    :key="affix.index"
                    class="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-line/50 px-2 py-1"
                  >
                    <p class="min-w-0 text-[12px] leading-4">
                      <span class="text-ink-soft">{{ affix.label }}·阶{{ affix.tier }}</span>
                      <span class="text-muted">：{{ affix.description }}</span>
                    </p>
                    <div class="flex shrink-0 items-center gap-1.5">
                      <button
                        v-if="affix.sealed"
                        type="button"
                        class="text-[12px] text-muted transition hover:text-jade-deep"
                        :title="unsealHint(view, affix.label)"
                        @mouseenter="hoverHint = unsealHint(view, affix.label)"
                        @focus="hoverHint = unsealHint(view, affix.label)"
                        @click="game.unsealGeneratedAffix(view.gear.id, affix.index)"
                      >
                        解封
                      </button>
                      <template v-else>
                        <button
                          type="button"
                          class="text-[12px] text-muted transition hover:text-jade-deep"
                          :title="sealHint(view, affix.label)"
                          :disabled="view.gear.sealed.length >= view.maxSealed"
                          @mouseenter="hoverHint = sealHint(view, affix.label)"
                          @focus="hoverHint = sealHint(view, affix.label)"
                          @click="game.sealGeneratedAffix(view.gear.id, affix.index)"
                        >
                          封印
                        </button>
                        <button
                          v-if="!view.isEquipped"
                          type="button"
                          class="text-[12px] text-muted transition hover:text-jade-deep"
                          :title="transferHint(affix.label)"
                          @mouseenter="hoverHint = transferHint(affix.label)"
                          @focus="hoverHint = transferHint(affix.label)"
                          @click="startTransfer(view.gear.id, affix.index)"
                        >
                          拓印
                        </button>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="mt-2.5 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    class="rounded-sm border px-2 py-1.5 text-[12px] transition"
                    :class="
                      view.isEquipped
                        ? 'cursor-default border-line text-muted'
                        : 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                    "
                    :title="view.isEquipped ? '已着身，卸下后才能更换。' : equipHint(view)"
                    :disabled="view.isEquipped"
                    @mouseenter="hoverHint = equipHint(view)"
                    @focus="hoverHint = equipHint(view)"
                    @click="equip(view.gear.id)"
                  >
                    {{ view.isEquipped ? '已着身' : '装备' }}
                  </button>
                  <button
                    type="button"
                    class="rounded-sm border border-line px-2 py-1.5 text-[12px] text-ink-soft transition hover:border-jade/40"
                    :title="upgradeHint(view)"
                    :disabled="!view.canUpgrade"
                    :class="{ 'cursor-not-allowed text-muted': !view.canUpgrade }"
                    @mouseenter="hoverHint = upgradeHint(view)"
                    @focus="hoverHint = upgradeHint(view)"
                    @click="game.upgradeGeneratedGear(view.gear.id)"
                  >
                    淬炼 +{{ view.gear.upgrade + 1 }}
                    <span class="text-muted">
                      （灵石{{ view.upgradeCost.spirit_stones }}·矿{{ view.upgradeCost.ore }}）
                    </span>
                  </button>
                  <button
                    type="button"
                    class="rounded-sm border border-line px-2 py-1.5 text-[12px] text-ink-soft transition hover:border-jade/40"
                    :title="reforgeHint(view)"
                    @mouseenter="hoverHint = reforgeHint(view)"
                    @focus="hoverHint = reforgeHint(view)"
                    @click="game.reforgeGeneratedGear(view.gear.id)"
                  >
                    洗练
                    <span class="text-muted">
                      （灵石{{ view.reforgeCost.spirit_stones }}·矿{{ view.reforgeCost.ore }}）
                    </span>
                  </button>
                  <button
                    type="button"
                    class="rounded-sm border border-line px-2 py-1.5 text-[12px] text-ink-soft transition hover:border-jade/40"
                    :title="
                      view.gear.locked
                        ? '解锁后，这件器物可被分解或转移。'
                        : '锁定后，拆解会先拦下确认，避免误拆。'
                    "
                    @mouseenter="
                      hoverHint = view.gear.locked
                        ? '解锁后，这件器物可被分解或转移。'
                        : '锁定后，拆解会先拦下确认，避免误拆。'
                    "
                    @focus="
                      hoverHint = view.gear.locked
                        ? '解锁后，这件器物可被分解或转移。'
                        : '锁定后，拆解会先拦下确认，避免误拆。'
                    "
                    @click="game.toggleGeneratedGearLock(view.gear.id)"
                  >
                    {{ view.gear.locked ? '解锁' : '锁定' }}
                  </button>
                  <button
                    type="button"
                    class="rounded-sm border px-2 py-1.5 text-[12px] transition"
                    :class="
                      pendingDismantle === view.gear.id
                        ? 'border-cinnabar/60 bg-cinnabar/[0.08] text-cinnabar'
                        : 'border-line text-muted hover:border-cinnabar/40 hover:text-cinnabar'
                    "
                    :title="dismantleHint(view)"
                    :disabled="view.gear.locked || view.isEquipped"
                    @mouseenter="hoverHint = dismantleHint(view)"
                    @focus="hoverHint = dismantleHint(view)"
                    @click="dismantle(view.gear.id)"
                  >
                    {{
                      view.isEquipped
                        ? '先卸下再拆'
                        : view.gear.locked
                        ? '已锁不可拆'
                        : pendingDismantle === view.gear.id
                          ? '再按一次分解'
                          : `分解（灵石${view.dismantleYield.spirit_stones}·矿${view.dismantleYield.ore}）`
                    }}
                  </button>
                </div>
                <p class="mt-2 text-[12px] leading-4 text-muted">
                  洗练会重排未封印的器纹与基础属性；封印最多 {{ view.maxSealed }} 道，拓印需先卸下两件器物。
                </p>
              </div>
            </article>

            <p
              v-if="!vaultInventory.length"
              class="rounded-sm border border-line/70 px-3 py-3 text-[13px] leading-5 text-muted"
            >
              这一类器匣空着。去历练走一程，或赢下一场遭遇，都会有器物留下。
            </p>
          </div>
        </section>
      </template>

      <template v-if="tab === 'recycle'">
        <section class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-[13px] leading-5 text-muted">
              旧器不再着身，也能拆回灵石与灵矿。整批回收比逐件分解多一成；已着身与已锁的器物会自动跳过。
            </p>
            <div class="flex shrink-0 gap-2 text-[12px]">
              <button
                type="button"
                class="text-muted transition hover:text-jade-deep"
                @click="selectAllRecyclable"
              >
                全选可回收
              </button>
              <button
                type="button"
                class="text-muted transition hover:text-jade-deep"
                @click="clearRecycle"
              >
                清空
              </button>
            </div>
          </div>

          <div
            v-if="recycleSelected.length"
            class="rounded-sm border border-jade/35 bg-jade-soft/50 px-3 py-2.5"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[13px] text-jade-deep">
                已选 {{ recycleQuote.count }} 件可回收
                <span v-if="recycleQuote.skipped" class="text-muted">
                  · 另有 {{ recycleQuote.skipped }} 件因已着身或已锁被跳过
                </span>
              </p>
              <p class="text-[12px] text-muted">含整批加成 10%</p>
            </div>
            <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p class="text-[13px]">
                预计返还：灵石 {{ recycleQuote.yield.spirit_stones }} · 灵矿 {{ recycleQuote.yield.ore }}
              </p>
              <button
                type="button"
                class="rounded-sm border px-3 py-1.5 text-[13px] tracking-[0.08em] transition"
                :class="
                  recycleArmed && recycleQuote.count
                    ? 'border-cinnabar/60 bg-cinnabar/[0.08] text-cinnabar'
                    : 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                "
                :disabled="recycleQuote.count === 0"
                @click="runRecycle"
              >
                {{ recycleArmed ? '再按一次，确认回收' : '回收所选器物' }}
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <button
              v-for="view in recycleList"
              :key="view.gear.id"
              type="button"
              class="flex w-full items-start gap-2 rounded-sm border px-2.5 py-2 text-left transition"
              :class="[
                view.isEquipped || view.gear.locked
                  ? 'cursor-not-allowed border-line/60 bg-paper/20 opacity-70'
                  : recycleSelectedSet.has(view.gear.id)
                    ? 'border-jade/50 bg-jade-soft/40'
                    : 'border-line/80 bg-white/25 hover:border-jade/35',
              ]"
              :disabled="view.isEquipped || view.gear.locked"
              v-hint="recycleHint(view)"
              @click="toggleRecycle(view.gear.id)"
            >
              <span
                class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[11px]"
                :class="
                  recycleSelectedSet.has(view.gear.id)
                    ? 'border-jade/60 bg-jade-deep text-white'
                    : 'border-line text-transparent'
                "
              >
                ✓
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-center gap-1.5">
                  <span class="rounded-sm border px-1.5 py-0.5 text-[12px]" :class="view.qualityTone">
                    {{ view.qualityName }}
                  </span>
                  <span class="font-serif text-base leading-tight">{{ view.gear.name }}</span>
                  <span class="text-[12px] text-muted">+{{ view.gear.upgrade }}</span>
                  <span
                    v-if="view.isEquipped"
                    class="rounded-sm border border-jade/40 px-1 py-0.5 text-[12px] text-jade-deep"
                  >
                    已着身
                  </span>
                  <span
                    v-if="view.gear.locked"
                    class="rounded-sm border border-line px-1 py-0.5 text-[12px] text-muted"
                  >
                    已锁
                  </span>
                </span>
                <span class="mt-0.5 block text-[12px] text-muted">
                  {{ view.slotLabel }} · 器力 {{ view.power }} · {{ view.statsText || '无属性' }}
                </span>
              </span>
              <span class="shrink-0 text-right text-[12px] leading-5 text-muted">
                灵石 {{ view.dismantleYield.spirit_stones }}
                <br />
                灵矿 {{ view.dismantleYield.ore }}
              </span>
            </button>
            <p
              v-if="!recycleList.length"
              class="rounded-sm border border-line/70 px-3 py-3 text-[13px] leading-5 text-muted"
            >
              这一档没有可回收的器物。
            </p>
          </div>

          <p class="text-[12px] leading-4 text-muted">
            回收不可撤回。想留作纪念或留给后来人的器物，先锁上再整理器匣。
          </p>
        </section>
      </template>
    </div>

    <Teleport to="body">
      <div
        v-if="popupSlot"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-3"
        @click.self="closeSlotPopup"
      >
        <section class="flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-sm border border-line bg-paper shadow-2xl">
          <header class="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div class="min-w-0">
              <p class="font-serif text-xl leading-tight">{{ popupSlotMeta?.label ?? '器位' }}</p>
              <p class="mt-0.5 text-[12px] text-muted">
                同位置共 {{ equippedCountForPopup }} 件；点击淬炼可直接作用于身上这件器物。
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 text-[13px] text-muted transition hover:text-jade-deep"
              @click="closeSlotPopup"
            >
              收起
            </button>
          </header>

          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            <p
              v-if="!popupCandidates.length"
              class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] leading-5 text-muted"
            >
              这处器位还空着，器匣里也没有同位置的器物。去历练走一程，也许会遇见一件。
            </p>
            <article
              v-for="view in popupCandidates"
              :key="view.gear.id"
              class="rounded-sm border p-3"
              :class="
                view.isEquipped
                  ? 'border-jade/40 bg-jade-soft/40'
                  : 'border-line/80 bg-white/30'
              "
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="flex flex-wrap items-center gap-1.5">
                    <span class="rounded-sm border px-1.5 py-0.5 text-[12px]" :class="view.qualityTone">
                      {{ view.qualityName }}
                    </span>
                    <span class="font-serif text-base leading-tight">{{ view.gear.name }}</span>
                    <span class="text-[12px] text-muted">+{{ view.gear.upgrade }}</span>
                  </p>
                  <p class="mt-1 text-[12px] text-muted">
                    {{ view.tierName }} · 器力 {{ view.power }}
                    <template v-if="view.gear.element"> · {{ elementLabel(view.gear.element) }}行</template>
                  </p>
                </div>
                <span
                  v-if="view.isEquipped"
                  class="shrink-0 rounded-sm border border-jade/40 px-1.5 py-0.5 text-[12px] text-jade-deep"
                >
                  已着身
                </span>
              </div>

              <p class="mt-1.5 text-[13px] leading-5 text-ink-soft">{{ view.statsText || '无基础属性' }}</p>
              <p v-if="view.modText" class="mt-0.5 text-[12px] leading-5 text-gold-deep">
                器理 · {{ view.modText }}
              </p>
              <p v-if="view.setText" class="mt-0.5 text-[12px] text-muted">{{ view.setText }}</p>

              <div v-if="view.affixes.length" class="mt-1.5 space-y-1">
                <p
                  v-for="affix in view.affixes"
                  :key="affix.index"
                  class="text-[12px] leading-4 text-muted"
                >
                  <span class="text-ink-soft">{{ affix.label }}·阶{{ affix.tier }}</span>
                  ：{{ affix.description }}
                  <template v-if="affix.sealed">（已封）</template>
                </p>
              </div>

              <div v-if="!view.isEquipped" class="mt-2 grid grid-cols-3 gap-1.5">
                <div
                  v-for="row in view.compare"
                  :key="row.key"
                  class="rounded-sm border border-line/60 px-2 py-1"
                >
                  <p class="text-[12px] text-muted">{{ row.label }}</p>
                  <p class="mt-0.5 text-[13px] tabular-nums">
                    {{ row.next }}
                    <span class="text-[12px]" :class="deltaTone(row.delta)">
                      ({{ deltaText(row.delta) }})
                    </span>
                  </p>
                </div>
              </div>
              <p v-else class="mt-2 text-[12px] leading-4 text-muted">
                已在身。直接淬炼或洗练，改动会立刻计入角色。
              </p>

              <div class="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <button
                  v-if="!view.isEquipped"
                  type="button"
                  class="rounded-sm border border-jade/40 bg-jade-soft px-2 py-1.5 text-[12px] text-jade-deep transition hover:bg-jade/15"
                  :title="equipHint(view)"
                  @mouseenter="hoverHint = equipHint(view)"
                  @focus="hoverHint = equipHint(view)"
                  @click="equip(view.gear.id)"
                >
                  换上
                </button>
                <button
                  v-else
                  type="button"
                  class="rounded-sm border border-line bg-paper/40 px-2 py-1.5 text-[12px] text-ink-soft transition hover:border-jade/40 hover:text-jade"
                  :title="unequipHint(view)"
                  @mouseenter="hoverHint = unequipHint(view)"
                  @focus="hoverHint = unequipHint(view)"
                  @click="unequip(view.gear.slot)"
                >
                  卸下
                </button>
                <button
                  type="button"
                  class="rounded-sm border border-line px-2 py-1.5 text-[12px] text-ink-soft transition hover:border-jade/40 disabled:cursor-not-allowed disabled:text-muted"
                  :disabled="!view.canUpgrade"
                  :title="upgradeHint(view)"
                  @mouseenter="hoverHint = upgradeHint(view)"
                  @focus="hoverHint = upgradeHint(view)"
                  @click="game.upgradeGeneratedGear(view.gear.id)"
                >
                  淬炼 +{{ view.gear.upgrade + 1 }}
                </button>
                <button
                  type="button"
                  class="rounded-sm border border-line px-2 py-1.5 text-[12px] text-ink-soft transition hover:border-jade/40"
                  :title="reforgeHint(view)"
                  @mouseenter="hoverHint = reforgeHint(view)"
                  @focus="hoverHint = reforgeHint(view)"
                  @click="game.reforgeGeneratedGear(view.gear.id)"
                >
                  洗练
                </button>
                <button
                  type="button"
                  class="rounded-sm border border-line px-2 py-1.5 text-[12px] text-ink-soft transition hover:border-jade/40"
                  @click="game.toggleGeneratedGearLock(view.gear.id)"
                >
                  {{ view.gear.locked ? '解锁' : '锁定' }}
                </button>
              </div>
              <p class="mt-1.5 text-[12px] text-muted">
                淬炼耗灵石 {{ view.upgradeCost.spirit_stones }}、灵矿 {{ view.upgradeCost.ore }}；洗练耗灵石
                {{ view.reforgeCost.spirit_stones }}、灵矿 {{ view.reforgeCost.ore }}。
              </p>
            </article>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>