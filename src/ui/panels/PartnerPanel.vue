<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { describeRequirements } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type BondFilter = 'all' | 'bonded' | 'known' | 'unmet'
type RoleFilter = 'all' | 'companion' | 'guardian' | 'scout' | 'teacher'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const bondFilter = ref<BondFilter>('all')
const roleFilter = ref<RoleFilter>('all')

const partners = computed(() =>
  [...game.partnerViews].sort((left, right) => {
    if (left.bonded !== right.bonded) return left.bonded ? -1 : 1
    return right.favor - left.favor
  }),
)

const bondedCount = computed(
  () => partners.value.filter((partner) => partner.bonded).length,
)

const bondTabs = computed(() => [
  { id: 'all', label: '全部', count: partners.value.length },
  { id: 'bonded', label: '已结缘', count: bondedCount.value },
  {
    id: 'known',
    label: '有旧',
    count: partners.value.filter((partner) => !partner.bonded && partner.favor > 0).length,
  },
  {
    id: 'unmet',
    label: '未识',
    count: partners.value.filter((partner) => !partner.bonded && partner.favor <= 0).length,
  },
])

const ROLE_LABELS: Record<RoleFilter, string> = {
  all: '全部',
  companion: '同行',
  guardian: '守御',
  scout: '斥候',
  teacher: '授业',
}

const roleTabs = computed(() =>
  (Object.keys(ROLE_LABELS) as RoleFilter[])
    .filter(
      (role) =>
        role === 'all' ||
        partners.value.some((partner) => partner.roleLabel === ROLE_LABELS[role]),
    )
    .map((role) => ({
      id: role,
      label: ROLE_LABELS[role],
      count:
        role === 'all'
          ? undefined
          : partners.value.filter((partner) => partner.roleLabel === ROLE_LABELS[role]).length,
    })),
)

const visiblePartners = computed(() =>
  partners.value.filter((partner) => {
    if (bondFilter.value === 'bonded' && !partner.bonded) return false
    if (bondFilter.value === 'known' && (partner.bonded || partner.favor <= 0)) return false
    if (bondFilter.value === 'unmet' && (partner.bonded || partner.favor > 0)) return false
    if (
      roleFilter.value !== 'all' &&
      partner.roleLabel !== ROLE_LABELS[roleFilter.value]
    ) {
      return false
    }
    return true
  }),
)

function selectBond(id: string): void {
  bondFilter.value = id as BondFilter
}

function selectRole(id: string): void {
  roleFilter.value = id as RoleFilter
}
</script>

<template>
  <div class="space-y-5">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="bondTabs" :active="bondFilter" @select="selectBond" />
        <TabBar size="sm" :tabs="roleTabs" :active="roleFilter" @select="selectRole" />
      </div>
    </Teleport>

    <section class="flex flex-wrap items-center justify-between gap-2">
      <p class="max-w-xl text-[13px] leading-5 text-muted">
        缘法不限于一人。每位道侣都有自己的来处、性情与结缘之契；结缘之后，仍有各自的后续故事在潮声里等。
      </p>
      <span class="rounded-sm border border-line px-2 py-0.5 text-[12px] text-muted">
        已结缘 {{ bondedCount }} / {{ partners.length }}
      </span>
    </section>

    <p
      v-if="!visiblePartners.length"
      class="rounded-sm border border-dashed border-line px-4 py-8 text-center text-[13px] leading-5 text-muted"
    >
      这一类里还没有与你相干的人。潮声会把该来的带到该来的时候。
    </p>

    <article
      v-for="partner in visiblePartners"
      :key="partner.id"
      class="rounded-sm border p-4"
      :class="
        partner.bonded
          ? 'border-jade/45 bg-jade-soft'
          : partner.favor > 0
            ? 'border-line/80 bg-white/25'
            : 'border-dashed border-line/80 bg-paper/20'
      "
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-serif text-2xl leading-none">{{ partner.name }}</p>
            <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
              {{ partner.roleLabel }} · {{ partner.factionName }}
            </span>
          </div>
          <p class="mt-1 text-[13px] text-muted">
            情谊 {{ partner.favorLabel }} · {{ Math.floor(partner.favor) }}
          </p>
        </div>
        <span
          class="shrink-0 rounded-sm border px-2 py-1 text-[13px]"
          :class="
            partner.bonded
              ? 'border-jade/40 text-jade-deep'
              : 'border-line text-muted'
          "
        >
          {{ partner.bonded ? '已结缘' : partner.favorLabel }}
        </span>
      </div>

      <p class="mt-3 text-[14px] leading-6 text-muted">
        {{ partner.favor > 0 || partner.bonded ? partner.description : partner.eraFate }}
      </p>

      <div class="mt-3 border-t border-line/70 pt-3">
        <div class="flex items-center justify-between text-[13px]">
          <span class="text-muted">情谊深浅</span>
          <span>{{ partner.favorLabel }} · 第 {{ Math.min(4, Math.floor(partner.favor)) }} 阶</span>
        </div>
        <div class="mt-2 flex gap-1">
          <span
            v-for="tier in 4"
            :key="tier"
            class="h-1.5 flex-1 rounded-full"
            :class="partner.favor >= tier ? 'bg-jade/65' : 'bg-line'"
          ></span>
        </div>
      </div>

      <div
        v-if="!partner.bonded"
        class="mt-3 rounded-sm border border-line/60 bg-paper/30 px-3 py-2"
      >
        <p class="text-[13px] leading-5 text-ink-soft">结缘之契 · {{ partner.bondDescription }}</p>
        <p
          v-if="partner.bondUnmet.length"
          class="mt-1 text-[12px] leading-4 text-cinnabar/80"
        >
          尚缺：{{ describeRequirements(partner.bondUnmet) }}
        </p>
        <p v-else class="mt-1 text-[12px] leading-4 text-muted">
          因缘已足。{{ partner.bondEventTitle ? `「${partner.bondEventTitle}」会在合适的时候到来。` : '静候潮声。' }}
        </p>
        <p
          v-if="partner.publicEventTitles.length && partner.favor > 0"
          class="mt-1 text-[12px] leading-4 text-muted/80"
        >
          风闻：{{ partner.publicEventTitles.join(' · ') }}
        </p>
      </div>

      <div v-else class="mt-3 rounded-sm border border-jade/25 bg-jade-soft px-3 py-2">
        <p class="text-[13px] leading-5 text-jade-deep">
          结缘之后：{{ partner.postEventTitles.join(' · ') || '后续仍在潮水下酝酿' }}
        </p>
      </div>

      <div v-if="partner.logs.length" class="mt-3">
        <p class="text-[12px] tracking-[0.22em] text-muted">情谊留痕</p>
        <ul class="mt-1.5 space-y-1.5">
          <li
            v-for="(entry, index) in partner.logs"
            :key="`${partner.id}-${entry.createdAtMonths}-${index}`"
            class="border-l border-jade/25 pl-3 text-[13px] leading-5 text-muted"
          >
            {{ entry.reason }}
          </li>
        </ul>
      </div>
    </article>
  </div>
</template>
