<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { describeEffects, describeStatsDelta } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type BeastTab = 'mount' | 'pet'
type BeastFilter = 'all' | 'active' | 'idle'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const beastTab = ref<BeastTab>('mount')
const beastFilter = ref<BeastFilter>('all')

const mountTabs = computed(() => [
  { id: 'mount', label: '坐骑', count: game.mountViews.length },
  { id: 'pet', label: '灵宠', count: game.petViews.length },
])

const filterTabs = computed(() => [
  { id: 'all', label: '全部' },
  { id: 'active', label: beastTab.value === 'mount' ? '随行' : '随身' },
  { id: 'idle', label: beastTab.value === 'mount' ? '在厩' : '留守' },
])

const visibleMounts = computed(() =>
  game.mountViews.filter((mount) => {
    if (beastFilter.value === 'active') return mount.active
    if (beastFilter.value === 'idle') return !mount.active
    return true
  }),
)

const visiblePets = computed(() =>
  game.petViews.filter((pet) => {
    if (beastFilter.value === 'active') return pet.active
    if (beastFilter.value === 'idle') return !pet.active
    return true
  }),
)

function selectBeastTab(id: string): void {
  beastTab.value = id as BeastTab
  beastFilter.value = 'all'
}

function selectBeastFilter(id: string): void {
  beastFilter.value = id as BeastFilter
}

type MountView = (typeof game.mountViews)[number]
type PetView = (typeof game.petViews)[number]

function mountSelectHint(mount: MountView): string {
  const active = game.mountViews.find((entry) => entry.active)
  const replaced = active && active.id !== mount.id
    ? `替换现随行的「${active.name}」；`
    : ''
  return `随行：${replaced}获得属性 ${mount.statsText || '无'}，每月行旅 +${(mount.currentStage?.travelBonus ?? 0).toFixed(1)}；只有随行坐骑的属性会计入角色。`
}

function mountDismissHint(): string {
  const active = game.mountViews.find((entry) => entry.active)
  if (!active) return '让坐骑留下。'
  return `让「${active.name}」留下：失去随行属性 ${active.statsText || '无'}与每月行旅 +${(active.currentStage?.travelBonus ?? 0).toFixed(1)}；它的成长阶段不会倒退。`
}

function mountGrowHint(mount: MountView): string {
  const next = mount.nextStage
  if (!next) return '这头坐骑已长至尽头。'
  return `养形至「${next.name}」：耗修为 ${mount.cultivationCost}、灵石 ${mount.stoneCost}；${describeStatsDelta(mount.currentStage?.stats, next.stats)}；每月行旅 +${(next.travelBonus ?? 0).toFixed(1)}；${describeEffects(next.effects, '形态更进')}${mount.active ? '' : '。养形后还需设为随行，属性才会计入'}。`
}

function petSelectHint(pet: PetView): string {
  const active = game.petViews.find((entry) => entry.active)
  const replaced = active && active.id !== pet.id
    ? `替换现随身的「${active.name}」；`
    : ''
  return `带在身边：${replaced}获得属性 ${pet.statsText || '无'}；只有随身灵宠的属性会计入角色。`
}

function petDismissHint(): string {
  const active = game.petViews.find((entry) => entry.active)
  if (!active) return '让灵宠自己待着。'
  return `让「${active.name}」自己待着：失去随身属性 ${active.statsText || '无'}；已完成的蜕变不会倒退。`
}

function petEvolveHint(pet: PetView): string {
  const next = pet.nextEvolution
  if (!next) return '这只灵宠已至此世尽头。'
  return `助它蜕变为「${next.name}」：耗修为 ${pet.cultivationCost}、兽核 ${pet.coreCost}；${describeStatsDelta(pet.currentEvolution?.stats, next.stats)}；${describeEffects(next.effects, '灵性更进')}${pet.active ? '' : '。蜕变后还需带在身边，属性才会计入'}。`
}

const TERRAIN_LABELS: Record<string, string> = {
  land: '山野',
  sea: '水域',
  cloud: '云路',
}

const ROLE_LABELS: Record<string, string> = {
  gather: '采集',
  guard: '守御',
  cave: '洞府',
  travel: '行旅',
}

function selectMount(id: string): void {
  game.selectMount(id as Parameters<typeof game.selectMount>[0])
}

function dismissMount(): void {
  game.selectMount(undefined)
}

function growMount(id: string): void {
  game.growMount(id as Parameters<typeof game.growMount>[0])
}

function selectPet(id: string): void {
  game.selectPet(id as Parameters<typeof game.selectPet>[0])
}

function dismissPet(): void {
  game.selectPet(undefined)
}

function evolvePet(id: string): void {
  game.evolvePet(id as Parameters<typeof game.evolvePet>[0])
}
</script>

<template>
  <div class="space-y-5">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="mountTabs" :active="beastTab" @select="selectBeastTab" />
        <TabBar size="sm" :tabs="filterTabs" :active="beastFilter" @select="selectBeastFilter" />
      </div>
    </Teleport>

    <section v-if="beastTab === 'mount'">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[13px] tracking-[0.22em] text-jade">坐骑</p>
          <p class="mt-1 text-[13px] text-muted">
            坐骑会随你走路而长。让它留在原地，行旅仍照旧，只是少一段脚力。
          </p>
        </div>
        <button
          v-if="game.game.player.activeMountId"
          type="button"
          class="shrink-0 rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
          v-hint="mountDismissHint()"
          @click="dismissMount"
        >
          让坐骑留下
        </button>
      </div>

      <p
          v-if="!visibleMounts.length"
          class="mt-2.5 rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
        >
          这个分类里没有坐骑。
        </p>

        <div v-else class="mt-2.5 space-y-2">
        <article
          v-for="mount in visibleMounts"
          :key="mount.id"
          class="rounded-sm border p-3"
          :class="
            mount.active
              ? 'border-jade/40 bg-jade-soft'
              : 'border-line/80 bg-white/25'
          "
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-serif text-lg leading-tight">{{ mount.name }}</p>
              <p class="mt-0.5 text-[12px] text-muted">
                {{ TERRAIN_LABELS[mount.terrain] ?? '无名之地' }} ·
                {{ mount.currentStage?.name ?? '初形' }}（{{ mount.stage }} / {{ mount.maxStage }}）
                · 行旅 +{{ (mount.currentStage?.travelBonus ?? 0).toFixed(1) }} / 月
              </p>
            </div>
            <span
              class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
              :class="
                mount.active
                  ? 'border-jade/40 text-jade-deep'
                  : 'border-line text-muted'
              "
            >
              {{ mount.active ? '随行' : '在厩' }}
            </span>
          </div>
          <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ mount.description }}</p>
          <p v-if="mount.currentStage" class="mt-1 text-[12px] leading-4 text-muted">
            {{ mount.currentStage.description }}
          </p>
          <p v-if="mount.statsText" class="mt-0.5 text-[12px] leading-4 text-ink-soft">
            {{ mount.statsText }}
          </p>
          <div v-if="mount.nextStage" class="mt-2 rounded-sm border border-line/60 px-2.5 py-1.5">
            <p class="text-[12px] text-muted">
              下一形 · {{ mount.nextStage.name }} · 修为 {{ mount.cultivationCost }} · 灵石 {{ mount.stoneCost }}
            </p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">{{ mount.nextStage.description }}</p>
          </div>

          <div class="mt-2 flex gap-2">
            <button
              v-if="!mount.active"
              type="button"
              class="flex-1 rounded-sm border border-line bg-paper/40 px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-ink-soft transition hover:border-jade/40 hover:text-jade"
              v-hint="mountSelectHint(mount)"
              @click="selectMount(mount.id)"
            >
              随行
            </button>
            <button
              v-if="mount.nextStage"
              type="button"
              class="flex-1 rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
              :class="
                mount.canGrow
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!mount.canGrow"
              v-hint="mountGrowHint(mount)"
              @click="growMount(mount.id)"
            >
              {{ mount.canGrow ? '养形' : '修为或灵石不足' }}
            </button>
            <span
              v-else
              class="flex-1 self-center text-center text-[12px] text-muted"
            >
              已长至尽头
            </span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="beastTab === 'pet'">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[13px] tracking-[0.22em] text-jade">灵宠</p>
          <p class="mt-1 text-[13px] text-muted">
            灵宠会记住你怎么待它。带在身边的，才会把力气借给你。
          </p>
        </div>
        <button
          v-if="game.game.player.activePetId"
          type="button"
          class="shrink-0 rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
          v-hint="petDismissHint()"
          @click="dismissPet"
        >
          让它自己待着
        </button>
      </div>

      <p
          v-if="!visiblePets.length"
          class="mt-2.5 rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
        >
          这个分类里没有灵宠。
        </p>

        <div v-else class="mt-2.5 space-y-2">
        <article
          v-for="pet in visiblePets"
          :key="pet.id"
          class="rounded-sm border p-3"
          :class="
            pet.active
              ? 'border-jade/40 bg-jade-soft'
              : 'border-line/80 bg-white/25'
          "
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-serif text-lg leading-tight">{{ pet.name }}</p>
              <p class="mt-0.5 text-[12px] text-muted">
                {{ ROLE_LABELS[pet.role] ?? '待命' }} ·
                {{ pet.currentEvolution?.name ?? '初生' }}（{{ pet.evolution }} / {{ pet.maxEvolution }}）
              </p>
            </div>
            <span
              class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
              :class="
                pet.active
                  ? 'border-jade/40 text-jade-deep'
                  : 'border-line text-muted'
              "
            >
              {{ pet.active ? '随身' : '留守' }}
            </span>
          </div>
          <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ pet.description }}</p>
          <p class="mt-1 text-[12px] leading-4 text-muted">
            性情 · {{ pet.temperament }}
          </p>
          <p v-if="pet.currentEvolution" class="mt-0.5 text-[12px] leading-4 text-muted">
            {{ pet.currentEvolution.description }}
          </p>
          <p v-if="pet.statsText" class="mt-0.5 text-[12px] leading-4 text-ink-soft">
            {{ pet.statsText }}
          </p>
          <div v-if="pet.nextEvolution" class="mt-2 rounded-sm border border-line/60 px-2.5 py-1.5">
            <p class="text-[12px] text-muted">
              下一蜕 · {{ pet.nextEvolution.name }} · 修为 {{ pet.cultivationCost }} · 兽核 {{ pet.coreCost }}
            </p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">{{ pet.nextEvolution.description }}</p>
          </div>

          <div class="mt-2 flex gap-2">
            <button
              v-if="!pet.active"
              type="button"
              class="flex-1 rounded-sm border border-line bg-paper/40 px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-ink-soft transition hover:border-jade/40 hover:text-jade"
              v-hint="petSelectHint(pet)"
              @click="selectPet(pet.id)"
            >
              带在身边
            </button>
            <button
              v-if="pet.nextEvolution"
              type="button"
              class="flex-1 rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
              :class="
                pet.canEvolve
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!pet.canEvolve"
              v-hint="petEvolveHint(pet)"
              @click="evolvePet(pet.id)"
            >
              {{ pet.canEvolve ? '助它蜕变' : '修为或兽核不足' }}
            </button>
            <span
              v-else
              class="flex-1 self-center text-center text-[12px] text-muted"
            >
              已至此世尽头
            </span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
