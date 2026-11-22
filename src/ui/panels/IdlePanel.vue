<script setup lang="ts">
import { inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type IdleTab = 'slots' | 'guide'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const idleTab = ref<IdleTab>('slots')
const tabs = [
  { id: 'slots', label: '潮水三槽' },
  { id: 'guide', label: '运转规则' },
]

function selectTab(id: string): void {
  idleTab.value = id as IdleTab
}

type SlotView = (typeof game.idleSlotViews)[number]

function slotHint(slot: SlotView): string {
  if (slot.disabled) return `${slot.label}尚未可启：需先寻得洞府，才能运转此槽`
  const parts = [
    slot.active
      ? `点击停驻「${slot.label}」，不再累积新的月份，已积累的 ${Math.floor(slot.months)} 月保留`
      : `点击启运「${slot.label}」，随潮水逐月累积（当前 ${Math.floor(slot.months)} 月）`,
    slot.detail,
    '故事待决时全部槽位与时间一同凝滞',
  ]
  return parts.join('。')
}
</script>

<template>
  <div>
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <TabBar :tabs="tabs" :active="idleTab" @select="selectTab" />
    </Teleport>

    <template v-if="idleTab === 'slots'">
    <div class="flex items-center justify-between">
      <p class="text-[13px] tracking-[0.24em] text-jade">潮水三槽</p>
      <span class="text-[13px] text-muted">{{ game.speed }}× · 1 分钟 ≈ {{ game.speed }} 月</span>
    </div>

    <div class="mt-3 grid gap-2">
      <button
        v-for="slot in game.idleSlotViews"
        :key="slot.id"
        type="button"
        class="flex items-center justify-between gap-3 rounded-sm border px-3 py-3 text-left transition disabled:cursor-not-allowed"
        :class="
          slot.active
            ? 'border-jade/45 bg-jade-soft'
            : slot.disabled
              ? 'border-line/80 bg-paper-deep/60'
              : 'border-line bg-paper hover:border-jade/35'
        "
        :disabled="slot.disabled"
        v-hint="slotHint(slot)"
        @click="game.toggleSlot(slot.id)"
      >
        <span class="min-w-0">
          <span class="flex items-center gap-2">
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="slot.active ? 'bg-jade' : 'bg-line'"
            ></span>
            <span class="text-sm font-medium">{{ slot.label }}</span>
            <span class="text-[12px] tracking-[0.12em] text-muted">
              {{ slot.active ? '运转' : slot.disabled ? '未启' : '停驻' }}
            </span>
          </span>
          <span class="mt-1 block truncate text-[13px] text-muted">{{ slot.detail }}</span>
        </span>
        <span class="shrink-0 text-[13px] text-muted">{{ Math.floor(slot.months) }} 月</span>
      </button>
    </div>

    <p
      v-if="game.travelReady"
      class="mt-3 border-t border-line/70 pt-2 text-[13px] leading-5 text-jade-deep"
    >
      行旅已足够走一段潮路；可在地图中启程，或就近探一处幽微。
    </p>
    </template>

    <template v-else>
      <div class="space-y-3 text-[14px] leading-6 text-muted">
        <p>
          三槽各管一摊：闭关攒修为，洞府攒资财与灵脉，游历攒行旅。槽位停驻时，已积累的月份不会消散，再启运便接着走。
        </p>
        <p>
          故事事件会凝滞全部槽位与时间；待决故事落定后，三槽才随潮水继续运转。潮声小事件则只进收件箱，不拦时间。
        </p>
        <p>
          速度 {{ game.speed }}× 时，现实一分钟约合游戏内 {{ game.speed }} 个月。行旅足够时，地图上才走得动潮路；幽微也会消耗行旅。
        </p>
        <p class="border-t border-line/70 pt-3 text-[13px]">
          离线时，闭关与洞府仍按设定效率结算；故事不会替你作选择。可在设置中调整暂缓方式与离线上限。
        </p>
      </div>
    </template>
  </div>
</template>
