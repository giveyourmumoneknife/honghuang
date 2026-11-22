<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import {
  MANUAL_SAVE_SLOTS,
  type ManualSaveSlot,
  type SaveSlotSummary,
} from '@/core/saveSlots'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type SettingsTab = 'saves' | 'flow' | 'transfer' | 'newgame'
type SavesSub = 'manual' | 'auto'
type FlowSub = 'pause' | 'offline'
type TransferSub = 'export' | 'import'

const game = useGameStore()
const ui = useUiStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const settingsTab = ref<SettingsTab>('saves')
const savesSub = ref<SavesSub>('manual')
const flowSub = ref<FlowSub>('pause')
const transferSub = ref<TransferSub>('export')

const settingsTabs = [
  { id: 'saves', label: '存档' },
  { id: 'flow', label: '潮声' },
  { id: 'transfer', label: '迁移' },
  { id: 'newgame', label: '轮回' },
]
const savesTabs = [
  { id: 'manual', label: '手动槽' },
  { id: 'auto', label: '自动存档' },
]
const flowTabs = [
  { id: 'pause', label: '暂缓' },
  { id: 'offline', label: '离线' },
]
const transferTabs = [
  { id: 'export', label: '导出' },
  { id: 'import', label: '导入' },
]

function selectSettingsTab(id: string): void {
  settingsTab.value = id as SettingsTab
}
function selectSavesSub(id: string): void {
  savesSub.value = id as SavesSub
}
function selectFlowSub(id: string): void {
  flowSub.value = id as FlowSub
}
function selectTransferSub(id: string): void {
  transferSub.value = id as TransferSub
}

const SLOT_LABELS: Record<ManualSaveSlot, string> = {
  slot1: '手动一',
  slot2: '手动二',
  slot3: '手动三',
}

const slots = ref<Record<ManualSaveSlot, SaveSlotSummary | undefined>>({
  slot1: undefined,
  slot2: undefined,
  slot3: undefined,
})
const busySlot = ref<ManualSaveSlot | null>(null)
const exportText = ref('')
const importText = ref('')
const notice = ref('')
const importInput = ref<HTMLInputElement | null>(null)

function formatStamp(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function refreshSlots(): Promise<void> {
  const list = await game.listSaveSlots()
  for (const slot of MANUAL_SAVE_SLOTS) {
    slots.value[slot] = list.find((summary) => summary.slot === slot)
  }
}

async function writeSlot(slot: ManualSaveSlot): Promise<void> {
  if (busySlot.value) return
  busySlot.value = slot
  await game.saveManual(slot)
  await refreshSlots()
  busySlot.value = null
}

async function readSlot(slot: ManualSaveSlot): Promise<void> {
  if (busySlot.value) return
  if (!slots.value[slot]?.present) {
    notice.value = '此槽尚空。'
    return
  }
  if (!window.confirm(`读取${SLOT_LABELS[slot]}？当前未存档的进度会被覆盖。`)) return
  busySlot.value = slot
  const ok = await game.loadManual(slot)
  busySlot.value = null
  if (ok) {
    notice.value = `${SLOT_LABELS[slot]}已接上此世。`
    await refreshSlots()
  }
}

async function eraseSlot(slot: ManualSaveSlot): Promise<void> {
  if (busySlot.value) return
  if (!window.confirm(`彻底抹去${SLOT_LABELS[slot]}？此举不可复原。`)) return
  busySlot.value = slot
  await game.deleteManual(slot)
  await refreshSlots()
  busySlot.value = null
}

function prepareExport(): void {
  exportText.value = game.exportSave()
  notice.value = '存档已展开，复制或下载后妥善保管。'
}

async function copyExport(): Promise<void> {
  if (!exportText.value) return
  try {
    await navigator.clipboard.writeText(exportText.value)
    notice.value = '存档文本已抄入剪贴板。'
  } catch {
    notice.value = '浏览器未允许复制，请手动选取文本。'
  }
}

function downloadExport(): void {
  if (!exportText.value) prepareExport()
  if (!exportText.value) return
  const blob = new Blob([exportText.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `honghuang-save-${Date.now()}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  notice.value = '存档文件已送出。'
}

async function importFromText(text: string): Promise<void> {
  if (!text.trim()) return
  if (!window.confirm('导入会替换当前此世，确定继续？')) return
  const ok = await game.importSave(text)
  if (ok) {
    importText.value = ''
    exportText.value = ''
    notice.value = '存档已导入，潮声接着旧处响起。'
    await refreshSlots()
  } else {
    notice.value = game.toast ?? '导入失败。'
  }
}

async function onImportFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    await importFromText(await file.text())
  }
  input.value = ''
}

function setPauseMode(mode: string): void {
  if (mode === 'all' || mode === 'story' || mode === 'none') {
    game.updateSettings({ pauseMode: mode })
  }
}

function setOfflineCap(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) {
    game.updateSettings({ offlineCapHours: Math.max(0, Math.min(48, value)) })
  }
}

function setOfflineEfficiency(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) {
    game.updateSettings({ offlineEfficiency: Math.max(0.1, Math.min(1, value)) })
  }
}

function openNewGame(): void {
  ui.openPanel('newgame')
}

function writeHint(slot: ManualSaveSlot): string {
  return slots.value[slot]?.present
    ? `写入${SLOT_LABELS[slot]}：以当前进度覆盖该槽原有存档，自动存档不受影响`
    : `写入${SLOT_LABELS[slot]}：把当前此世存入这个空槽，自动存档不受影响`
}

function readHint(slot: ManualSaveSlot): string {
  return slots.value[slot]?.present
    ? `读取${SLOT_LABELS[slot]}：以槽中进度替换当前此世，未存档的进度会丢失`
    : `${SLOT_LABELS[slot]}尚空，无档可读`
}

function eraseHint(slot: ManualSaveSlot): string {
  return `抹去${SLOT_LABELS[slot]}：清空该槽存档，不可复原；自动存档不受影响`
}

const surfaceHints = {
  export: '展开存档：把当前此世导出为可保存的文本，不会改动进度',
  copy: '复制存档文本到剪贴板，便于备份或转移到其他设备',
  download: '下载存档为 JSON 文件；尚未展开时会先自动展开',
  import: '导入文本：以存档内容替换当前此世并写入自动存档，不可撤销；建议先导出一份当前存档',
  importFile: '选择本地存档文件导入：同样会替换当前此世并写入自动存档',
  pauseMode:
    '故事暂缓：故事事件必定凝滞时间；「所有异动」连潮声小事件也暂停；「从不」则不自动停时',
  offlineCap: '离线结算上限：离开游戏时最多替你结算多少小时，设 0 则完全不结算',
  offlineEfficiency: '离线效率：离线期间闭关与洞府产出的折扣，100% 与在线相同',
  newGame: '入轮回：以新的根骨与天赋重入序章，会替换当前此世并覆盖自动存档',
} as const

onMounted(() => {
  void refreshSlots()
})
</script>

<template>
  <div class="space-y-5">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="settingsTabs" :active="settingsTab" @select="selectSettingsTab" />
        <TabBar
          v-if="settingsTab === 'saves'"
          size="sm"
          :tabs="savesTabs"
          :active="savesSub"
          @select="selectSavesSub"
        />
        <TabBar
          v-else-if="settingsTab === 'flow'"
          size="sm"
          :tabs="flowTabs"
          :active="flowSub"
          @select="selectFlowSub"
        />
        <TabBar
          v-else-if="settingsTab === 'transfer'"
          size="sm"
          :tabs="transferTabs"
          :active="transferSub"
          @select="selectTransferSub"
        />
      </div>
    </Teleport>

    <section v-if="settingsTab === 'saves' && savesSub === 'manual'" class="space-y-2">
      <div class="flex items-baseline justify-between gap-2">
        <h3 class="font-serif text-base text-ink">手动存档</h3>
        <span class="text-[12px] text-muted">
          自动存档始终随潮声写入 · 上次 {{ game.lastSavedLabel || '尚未写入' }}
        </span>
      </div>
      <div class="space-y-2">
        <div
          v-for="slot in MANUAL_SAVE_SLOTS"
          :key="slot"
          class="flex flex-wrap items-center gap-2 rounded-sm border border-line/80 bg-white/20 px-3 py-2"
        >
          <div class="min-w-0 flex-1">
            <p class="text-[14px] text-ink">{{ SLOT_LABELS[slot] }}</p>
            <p class="mt-0.5 text-[12px] text-muted">
              <template v-if="slots[slot]?.present">
                {{ formatStamp(slots[slot]?.updatedAt) || '时间不明' }}
                <span v-if="slots[slot]?.valid === false" class="text-cinnabar"> · 已损坏</span>
                <span v-else-if="slots[slot]?.version" class="text-muted"> · v{{ slots[slot]?.version }}</span>
              </template>
              <template v-else>空槽</template>
            </p>
          </div>
          <div class="flex gap-1.5">
            <button
              type="button"
              class="rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar disabled:opacity-40"
              :disabled="busySlot !== null"
              v-hint="writeHint(slot)"
              @click="writeSlot(slot)"
            >
              写入
            </button>
            <button
              type="button"
              class="rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar disabled:opacity-40"
              :disabled="busySlot !== null || !slots[slot]?.present"
              v-hint="readHint(slot)"
              @click="readSlot(slot)"
            >
              读取
            </button>
            <button
              type="button"
              class="rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar disabled:opacity-40"
              :disabled="busySlot !== null || !slots[slot]?.present"
              v-hint="eraseHint(slot)"
              @click="eraseSlot(slot)"
            >
              抹去
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="settingsTab === 'saves' && savesSub === 'auto'" class="space-y-3">
      <h3 class="font-serif text-base text-ink">自动存档</h3>
      <div class="rounded-sm border border-line/80 bg-white/20 px-3 py-3">
        <p class="text-[14px] text-ink">随潮声写入，无需手动触发</p>
        <p class="mt-1 text-[13px] leading-5 text-muted">
          上次写入：{{ game.lastSavedLabel || '尚未写入' }}。自动存档只有一个位置，会被新的进度覆盖；想留住某个时刻，请写入手动槽或导出。
        </p>
      </div>
      <p class="text-[12px] leading-4 text-muted">
        手动槽与自动存档互不影响。读取手动槽会替换当前此世，并写入自动存档。
      </p>
    </section>

    <section v-if="settingsTab === 'flow'" class="space-y-2">
      <h3 class="font-serif text-base text-ink">潮声缓急</h3>
      <div class="grid gap-3 sm:grid-cols-2">
        <label v-if="flowSub === 'pause'" class="space-y-1 text-[13px] text-muted">
          <span>故事暂缓</span>
          <select
            class="w-full rounded-sm border border-line bg-paper/60 px-2 py-1.5 text-[14px] text-ink outline-none focus:border-cinnabar/40"
            :value="game.game.settings.pauseMode"
            v-hint="surfaceHints.pauseMode"
            @change="setPauseMode(($event.target as HTMLSelectElement).value)"
          >
            <option value="story">仅故事事件暂停（推荐）</option>
            <option value="all">所有异动皆暂缓</option>
            <option value="none">从不自动暂缓</option>
          </select>
        </label>
        <label v-if="flowSub === 'offline'" class="space-y-1 text-[13px] text-muted">
          <span>离线结算上限（小时）</span>
          <input
            type="number"
            min="0"
            max="48"
            step="1"
            class="w-full rounded-sm border border-line bg-paper/60 px-2 py-1.5 text-[14px] text-ink outline-none focus:border-cinnabar/40"
            :value="game.game.settings.offlineCapHours"
            v-hint="surfaceHints.offlineCap"
            @change="setOfflineCap"
          />
        </label>
      </div>
      <label v-if="flowSub === 'offline'" class="block space-y-1 text-[13px] text-muted">
        <span class="flex justify-between">
          <span>离线效率</span>
          <span>{{ Math.round(game.game.settings.offlineEfficiency * 100) }}%</span>
        </span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          class="w-full accent-cinnabar"
          :value="game.game.settings.offlineEfficiency"
          v-hint="surfaceHints.offlineEfficiency"
          @change="setOfflineEfficiency"
        />
      </label>
      <p class="text-[12px] leading-4 text-muted">
        离线时，洞府与闭关仍会运转，但潮声里的故事不会替你作选择。触发故事时若开启暂缓，时间会停在那一刻等你。
      </p>
    </section>

    <section v-if="settingsTab === 'transfer' && transferSub === 'export'" class="space-y-2">
      <h3 class="font-serif text-base text-ink">存档导出</h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          class="rounded-sm border border-line px-2.5 py-1.5 text-[13px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar"
          v-hint="surfaceHints.export"
          @click="prepareExport"
        >
          展开存档
        </button>
        <button
          type="button"
          class="rounded-sm border border-line px-2.5 py-1.5 text-[13px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar disabled:opacity-40"
          :disabled="!exportText"
          v-hint="surfaceHints.copy"
          @click="copyExport"
        >
          复制
        </button>
        <button
          type="button"
          class="rounded-sm border border-line px-2.5 py-1.5 text-[13px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar"
          v-hint="surfaceHints.download"
          @click="downloadExport"
        >
          下载文件
        </button>
      </div>
      <textarea
        v-if="exportText"
        readonly
        class="h-32 w-full resize-y rounded-sm border border-line bg-paper/60 p-2 font-mono text-[12px] leading-4 text-muted outline-none"
        :value="exportText"
      />
    </section>

    <section v-if="settingsTab === 'transfer' && transferSub === 'import'" class="space-y-2">
      <h3 class="font-serif text-base text-ink">存档导入</h3>
      <textarea
        v-model="importText"
        placeholder="将导出的存档文本贴在这里"
        class="h-24 w-full resize-y rounded-sm border border-line bg-paper/60 p-2 font-mono text-[12px] leading-4 text-ink outline-none focus:border-cinnabar/40"
      />
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          class="rounded-sm border border-cinnabar/40 bg-cinnabar/[0.05] px-2.5 py-1.5 text-[13px] text-cinnabar transition hover:bg-cinnabar/10 disabled:opacity-40"
          :disabled="!importText.trim()"
          v-hint="surfaceHints.import"
          @click="importFromText(importText)"
        >
          导入文本
        </button>
        <button
          type="button"
          class="rounded-sm border border-line px-2.5 py-1.5 text-[13px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar"
          v-hint="surfaceHints.importFile"
          @click="importInput?.click()"
        >
          选择存档文件
        </button>
        <input
          ref="importInput"
          type="file"
          accept="application/json,.json"
          class="hidden"
          @change="onImportFile"
        />
      </div>
      <p class="text-[12px] leading-4 text-muted">
        导入会替换当前此世并写入自动存档。请在导入前先导出一份当前存档作为退路。
      </p>
    </section>

    <section v-if="settingsTab === 'newgame'" class="space-y-2 border-t border-line/70 pt-4">
      <h3 class="font-serif text-base text-ink">另起一世</h3>
      <p class="text-[12px] leading-4 text-muted">
        重入序章会以新的根骨与天赋落生四海。旧世不会自动保留，请先写入手动存档或导出。
      </p>
      <button
        type="button"
        class="rounded-sm border border-cinnabar/40 bg-cinnabar/[0.05] px-3 py-1.5 text-[13px] tracking-[0.1em] text-cinnabar transition hover:bg-cinnabar/10"
        v-hint="surfaceHints.newGame"
        @click="openNewGame"
      >
        入轮回 · 新建角色
      </button>
    </section>

    <p v-if="notice" class="rounded-sm border border-line/70 bg-paper/40 px-3 py-2 text-[13px] leading-4 text-muted">
      {{ notice }}
    </p>
  </div>
</template>
