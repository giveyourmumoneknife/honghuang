<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { combatModText } from '@/data/gear/catalog'
import { describeStats } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type DaoTab = 'stars' | 'principles' | 'marks'

type NodeView = (typeof game.daoNodeViews)[number]
type PrincipleView = (typeof game.daoPrincipleViews)[number]
type ClusterView = (typeof game.daoClusterViews)[number]

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const daoTab = ref<DaoTab>('stars')
const expandedNodeId = ref<string | null>(null)

const summary = computed(() => game.daoSummary)

const tabs = computed(() => [
  { id: 'stars', label: '星图', count: summary.value.litNodes },
  { id: 'principles', label: '道则', count: summary.value.activePrinciple ? 1 : 0 },
  { id: 'marks', label: '星痕', count: summary.value.marks },
])

function selectTab(id: string): void {
  daoTab.value = id as DaoTab
  expandedNodeId.value = null
}

function toggleNode(nodeId: string): void {
  expandedNodeId.value = expandedNodeId.value === nodeId ? null : nodeId
}

function nodeViewsOf(clusterId: string): NodeView[] {
  return game.daoNodeViews.filter((node) => node.clusterId === clusterId)
}

function clusterLitLabel(cluster: ClusterView): string {
  return `${cluster.lit} / ${cluster.total}`
}

function nodeTone(node: NodeView): string {
  if (node.lit) return 'border-jade/40 bg-jade/[0.06] text-jade-deep'
  if (node.canBuy) return 'border-cinnabar/40 bg-cinnabar/[0.04] text-cinnabar'
  return 'border-line bg-white/20 text-muted'
}

function principleTone(principle: PrincipleView): string {
  if (principle.active) return 'border-jade/50 bg-jade/[0.05]'
  if (principle.canBuy) return 'border-cinnabar/30 bg-white/25'
  return 'border-line/80 bg-white/25'
}

function nodeModText(node: NodeView): string {
  return node.mods ? combatModText(node.mods) : ''
}

function principleModText(principle: PrincipleView): string {
  return principle.mods ? combatModText(principle.mods) : ''
}

function nodeHint(node: NodeView): string {
  const rules = node.rules.map((rule) => rule.detail).join('；')
  if (node.lit) return `「${node.name}」已点亮：${rules}。`
  if (!node.requiresMet) return `需先点亮「${node.requiredName}」，这枚星才有落处。`
  if (!node.affordable) {
    return `点亮「${node.name}」需要 ${node.cost} 点星痕，你手里只有 ${summary.value.marks} 点。`
  }
  return `点亮「${node.name}」消耗 ${node.cost} 点星痕：${rules}。点亮后剩余 ${summary.value.marks - node.cost} 点。`
}

function principleHint(principle: PrincipleView): string {
  const rules = principle.rules.map((rule) => rule.detail).join('；')
  if (principle.active) return `「${principle.name}」已落定：${rules}。`
  if (!principle.canBuy && principle.statusText.startsWith('已择')) {
    return '道则互斥，一世只能走一条。想换道则，只能重塑星图。'
  }
  if (!principle.ready) {
    return `需要在「${principle.clusterName}」点亮 ${principle.requiredNodes} 枚星位（当前 ${principle.lit} 枚），道则才会落下。`
  }
  if (!principle.affordable) {
    return `落定「${principle.name}」需要 ${principle.cost} 点星痕，你手里只有 ${summary.value.marks} 点。`
  }
  return `落定「${principle.name}」消耗 ${principle.cost} 点星痕：${rules}。落定后不可再择另一条道则，除非重塑。`
}

function purchaseNode(node: NodeView): void {
  if (!node.canBuy) return
  game.purchaseDaoNode(node.id)
}

function purchasePrinciple(principle: PrincipleView): void {
  if (!principle.canBuy) return
  game.purchaseDaoPrinciple(principle.id)
}

function resetDao(): void {
  const current = summary.value
  if (!current.canReset || !current.resetAffordable) return
  const confirmed = window.confirm(
    `重塑星图会退还 ${current.spent} 点星痕（耗去 ${current.resetCost} 点稳住神魂），并清空已点的星位与道则。确定吗？`,
  )
  if (!confirmed) return
  game.resetDao()
}

const resetHint = computed(() => {
  const current = summary.value
  if (!current.canReset) return '星图还空着，没有什么可重塑的。'
  if (!current.resetAffordable) {
    return `重塑需要 ${current.resetCost} 点星痕压住反噬，你手里只有 ${current.marks} 点。`
  }
  return `清空星图与道则，退还 ${current.spent} 点星痕，实得 ${current.spent - current.resetCost} 点。`
})
</script>

<template>
  <div class="space-y-4">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <TabBar :tabs="tabs" :active="daoTab" @select="selectTab" />
    </Teleport>

    <template v-if="daoTab === 'stars'">
      <section class="rounded-sm border border-line/70 bg-white/20 px-3 py-2.5">
        <p class="text-[13px] leading-5 text-muted">
          星图不是外物，是你这一世走过的路凝成的光。点亮九枚星位，再择一条道则；道则互斥，落定便不能回头——除非重塑。
        </p>
        <p class="mt-1 text-[12px] text-muted">
          已点亮 {{ summary.litNodes }} / {{ summary.totalNodes }} 星 · 已用
          {{ summary.spent }} 点 · 手中 {{ summary.marks }} 点
        </p>
      </section>

      <section
        v-for="cluster in game.daoClusterViews"
        :key="cluster.id"
        class="rounded-sm border border-line/80 bg-white/25"
      >
        <header class="flex items-start gap-2.5 border-b border-line/60 px-3 py-2.5">
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-jade/40 bg-jade/[0.06] font-serif text-[15px] text-jade-deep"
          >
            {{ cluster.glyph }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="font-serif text-[15px] leading-tight">{{ cluster.name }}</p>
              <span
                class="shrink-0 text-[12px]"
                :class="cluster.lit === cluster.total ? 'text-jade-deep' : 'text-muted'"
              >
                {{ clusterLitLabel(cluster) }}
              </span>
            </div>
            <p class="mt-0.5 text-[12px] text-muted">{{ cluster.subtitle }}</p>
          </div>
        </header>

        <p class="px-3 pt-2 text-[12px] leading-4 text-muted">
          {{ cluster.description }}
        </p>

        <div class="space-y-2 p-3 pt-2">
          <article
            v-for="node in nodeViewsOf(cluster.id)"
            :key="node.id"
            class="rounded-sm border border-line/70 bg-white/20"
          >
            <button
              type="button"
              class="flex w-full items-start justify-between gap-2 px-2.5 py-2 text-left"
              @click="toggleNode(node.id)"
            >
              <div class="min-w-0">
                <p class="font-serif text-[14px] leading-tight">
                  {{ node.name }}
                  <span class="text-[12px] text-muted">{{ node.epithet }}</span>
                </p>
                <p class="mt-0.5 text-[12px] leading-4 text-muted">
                  {{ node.rules[0]?.detail }}
                </p>
              </div>
              <span
                class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
                :class="nodeTone(node)"
              >
                {{ node.lit ? '已点亮' : `${node.cost} 星痕` }}
              </span>
            </button>

            <div v-if="expandedNodeId === node.id" class="space-y-2 border-t border-line/60 px-2.5 py-2">
              <p class="text-[12px] leading-4 text-muted">{{ node.description }}</p>
              <ul class="space-y-1">
                <li
                  v-for="rule in node.rules"
                  :key="rule.label"
                  class="text-[12px] leading-4 text-ink-soft"
                >
                  <span class="text-jade-deep">{{ rule.label }}</span>
                  <span class="text-muted"> · </span>{{ rule.detail }}
                </li>
              </ul>
              <p v-if="describeStats(node.stats)" class="text-[12px] leading-4 text-muted">
                星位滋养：{{ describeStats(node.stats) }}
              </p>
              <p v-if="nodeModText(node)" class="text-[12px] leading-4 text-muted">
                星位加持：{{ nodeModText(node) }}
              </p>
              <div class="flex items-center justify-between gap-2">
                <span class="text-[12px] text-muted">
                  {{ node.statusText }} · 点亮需 {{ node.cost }} 点星痕
                </span>
                <button
                  type="button"
                  class="rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
                  :class="
                    node.canBuy
                      ? 'border-cinnabar/40 bg-cinnabar/[0.04] text-cinnabar hover:border-cinnabar/70'
                      : 'cursor-not-allowed border-line bg-white/20 text-muted'
                  "
                  :disabled="!node.canBuy"
                  v-hint="nodeHint(node)"
                  @click="purchaseNode(node)"
                >
                  {{ node.lit ? '已点亮' : node.canBuy ? `以 ${node.cost} 星痕点亮` : node.statusText }}
                </button>
              </div>
            </div>
          </article>

          <p
            v-if="cluster.principle"
            class="rounded-sm border border-dashed border-line/70 px-2.5 py-1.5 text-[12px] leading-4 text-muted"
          >
            此脉道则：{{ cluster.principle.name }}
            <span class="text-ink-soft">
              （需点亮 {{ cluster.principle.requiredNodes }} 枚星位）
            </span>
            <span v-if="cluster.principleActive" class="text-jade-deep"> · 已落定</span>
          </p>
        </div>
      </section>
    </template>

    <template v-else-if="daoTab === 'principles'">
      <section class="rounded-sm border border-line/70 bg-white/20 px-3 py-2.5">
        <p class="text-[13px] leading-5 text-muted">
          道则是星图尽头的那一条路。两条路互相排斥，一世只能择一；落定之后，若要换路，只能重塑星图。
        </p>
        <p class="mt-1 text-[12px] text-muted">
          {{ summary.activePrinciple ? `已落定「${summary.activePrinciple.name}」` : '道则未定' }} ·
          手中 {{ summary.marks }} 点星痕
        </p>
      </section>

      <article
        v-for="principle in game.daoPrincipleViews"
        :key="principle.id"
        class="rounded-sm border p-3 transition"
        :class="principleTone(principle)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-serif text-lg leading-tight">{{ principle.name }}</p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">{{ principle.title }}</p>
          </div>
          <span
            class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
            :class="
              principle.active
                ? 'border-jade/40 bg-jade/[0.06] text-jade-deep'
                : principle.canBuy
                  ? 'border-cinnabar/40 bg-cinnabar/[0.04] text-cinnabar'
                  : 'border-line bg-white/20 text-muted'
            "
          >
            {{ principle.active ? '已落定' : `${principle.cost} 星痕` }}
          </span>
        </div>

        <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ principle.description }}</p>

        <ul class="mt-1.5 space-y-1">
          <li
            v-for="rule in principle.rules"
            :key="rule.label"
            class="text-[12px] leading-4 text-ink-soft"
          >
            <span class="text-jade-deep">{{ rule.label }}</span>
            <span class="text-muted"> · </span>{{ rule.detail }}
          </li>
        </ul>

        <p v-if="describeStats(principle.stats)" class="mt-1.5 text-[12px] leading-4 text-muted">
          道则滋养：{{ describeStats(principle.stats) }}
        </p>
        <p v-if="principleModText(principle)" class="text-[12px] leading-4 text-muted">
          道则加持：{{ principleModText(principle) }}
        </p>

        <div class="mt-2 flex items-center justify-between gap-2">
          <span class="text-[12px]" :class="principle.ready ? 'text-jade-deep' : 'text-muted'">
            星位 {{ principle.lit }} / {{ principle.requiredNodes }} ·
            {{ principle.statusText }}
          </span>
          <button
            type="button"
            class="rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
            :class="
              principle.canBuy
                ? 'border-cinnabar/40 bg-cinnabar/[0.04] text-cinnabar hover:border-cinnabar/70'
                : 'cursor-not-allowed border-line bg-white/20 text-muted'
            "
            :disabled="!principle.canBuy"
            v-hint="principleHint(principle)"
            @click="purchasePrinciple(principle)"
          >
            {{
              principle.active
                ? '已落定'
                : principle.canBuy
                  ? `以 ${principle.cost} 星痕落定`
                  : principle.statusText
            }}
          </button>
        </div>
      </article>
    </template>

    <template v-else>
      <section class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5">
        <p class="text-[13px] leading-5 text-muted">
          星痕是走过路之后留下的光，不会凭空生出来。突破、初退劫影、走完关键因果，都会让星图多亮一点。
        </p>
        <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div class="rounded-sm border border-line/60 px-2 py-1.5 text-center">
            <p class="font-serif text-lg leading-tight text-jade-deep">{{ summary.earned }}</p>
            <p class="text-[12px] text-muted">累计获得</p>
          </div>
          <div class="rounded-sm border border-line/60 px-2 py-1.5 text-center">
            <p class="font-serif text-lg leading-tight">{{ summary.spent }}</p>
            <p class="text-[12px] text-muted">已点用</p>
          </div>
          <div class="rounded-sm border border-line/60 px-2 py-1.5 text-center">
            <p class="font-serif text-lg leading-tight text-cinnabar">{{ summary.marks }}</p>
            <p class="text-[12px] text-muted">手中星痕</p>
          </div>
          <div class="rounded-sm border border-line/60 px-2 py-1.5 text-center">
            <p class="font-serif text-lg leading-tight">{{ summary.respecs }}</p>
            <p class="text-[12px] text-muted">重塑次数</p>
          </div>
        </div>
      </section>

      <section class="rounded-sm border border-line/80 bg-white/25">
        <header class="border-b border-line/60 px-3 py-2">
          <p class="font-serif text-[15px] leading-tight">星痕来处</p>
          <p class="mt-0.5 text-[12px] text-muted">每一枚星痕都对应一处走过的路</p>
        </header>
        <div class="divide-y divide-line/50">
          <article
            v-for="source in game.daoMarkSources"
            :key="source.id"
            class="flex items-start justify-between gap-2 px-3 py-2"
          >
            <div class="min-w-0">
              <p class="text-[13px] leading-5">{{ source.label }}</p>
              <p class="text-[12px] leading-4 text-muted">{{ source.detail }}</p>
            </div>
            <span
              class="shrink-0 text-[12px]"
              :class="source.current >= source.total ? 'text-jade-deep' : 'text-muted'"
            >
              {{ source.current }} / {{ source.total }}
            </span>
          </article>
        </div>
      </section>

      <section class="rounded-sm border border-cinnabar/25 bg-cinnabar/[0.02] px-3 py-2.5">
        <p class="font-serif text-[15px] leading-tight text-cinnabar">重塑星图</p>
        <p class="mt-1 text-[12px] leading-4 text-muted">
          星图不是刻死的。你可以亲手让它暗下去，退还已点的星痕，再走一遍。重塑会耗去
          {{ summary.resetCost }} 点星痕稳住神魂，已择的道则也会一并散去。
        </p>
        <div class="mt-2 flex items-center justify-between gap-2">
          <span class="text-[12px] text-muted">{{ resetHint }}</span>
          <button
            type="button"
            class="rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
            :class="
              summary.canReset && summary.resetAffordable
                ? 'border-cinnabar/40 bg-cinnabar/[0.04] text-cinnabar hover:border-cinnabar/70'
                : 'cursor-not-allowed border-line bg-white/20 text-muted'
            "
            :disabled="!summary.canReset || !summary.resetAffordable"
            v-hint="resetHint"
            @click="resetDao"
          >
            重塑星图 · {{ summary.resetCost }} 星痕
          </button>
        </div>
      </section>
    </template>
  </div>
</template>
