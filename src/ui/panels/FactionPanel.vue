<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import {
  describeRequirements,
  formatCost,
  standingLabel,
} from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type FactionFilter = 'all' | 'joined' | 'open' | 'hidden'
type ArchetypeFilter = 'all' | 'race' | 'teaching' | 'court' | 'dynasty' | 'local' | 'rogue'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const factionFilter = ref<FactionFilter>('all')
const archetypeFilter = ref<ArchetypeFilter>('all')

const ARCHETYPE_LABELS: Record<string, string> = {
  race: '种族',
  teaching: '教门',
  court: '朝廷',
  dynasty: '王朝',
  local: '地方',
  rogue: '散修',
}

const joinedView = computed(() =>
  game.factionViews.find((entry) => entry.membership),
)

const factionTabs = computed(() => [
  { id: 'all', label: '全部', count: game.factionViews.length },
  { id: 'joined', label: '门中', count: game.factionViews.filter((entry) => entry.membership).length },
  { id: 'open', label: '已显', count: game.factionViews.filter((entry) => entry.revealed).length },
  { id: 'hidden', label: '未明', count: game.factionViews.filter((entry) => !entry.revealed).length },
])

const archetypeTabs = computed(() =>
  (Object.keys(ARCHETYPE_LABELS) as ArchetypeFilter[])
    .filter(
      (archetype) =>
        game.factionViews.some((entry) => entry.revealed && entry.archetype === archetype),
    )
    .map((archetype) => ({
      id: archetype,
      label: ARCHETYPE_LABELS[archetype],
    })),
)

const archetypeTabViews = computed(() => [
  { id: 'all', label: '全部' },
  ...archetypeTabs.value,
])

const visibleFactions = computed(() =>
  game.factionViews.filter((entry) => {
    if (factionFilter.value === 'joined' && !entry.membership) return false
    if (factionFilter.value === 'open' && !entry.revealed) return false
    if (factionFilter.value === 'hidden' && entry.revealed) return false
    if (archetypeFilter.value !== 'all' && entry.archetype !== archetypeFilter.value) return false
    return true
  }),
)

function selectFactionFilter(id: string): void {
  factionFilter.value = id as FactionFilter
  if (factionFilter.value === 'joined') archetypeFilter.value = 'all'
}

function selectArchetype(id: string): void {
  archetypeFilter.value = id as ArchetypeFilter
}

function join(factionId: string): void {
  game.joinFaction(factionId as Parameters<typeof game.joinFaction>[0])
}

function leave(): void {
  if (!window.confirm('退出势力会失去当前职阶与全部贡献，并留下一段背誓之痕。确定吗？')) return
  game.leaveFaction()
}

type FactionView = (typeof game.factionViews)[number]
type TeachingView = FactionView['teachings'][number]

function learnTechnique(techniqueId: string): void {
  game.learnFactionTechnique(
    techniqueId as Parameters<typeof game.learnFactionTechnique>[0],
  )
}

function teachHint(entry: FactionView, teaching: TeachingView): string {
  if (teaching.learned) {
    return `《${teaching.name}》的入门已在身，余下各层要去功法页以修为与灵石自行参透。`
  }
  const parts = [
    `求传《${teaching.name}》（${teaching.tier} 阶）：耗贡献 ${teaching.contribution}、灵石 ${teaching.spiritStones}`,
  ]
  if (teaching.skillName) parts.push(`入门后得战中招式「${teaching.skillName}」`)
  if (entry.rank < teaching.requiredRank) {
    parts.push(`门中只将此诀传至「${teaching.requiredRankTitle}」及以上`)
  } else if (entry.contribution < teaching.contribution) {
    parts.push(`尚缺贡献 ${teaching.contribution - entry.contribution}`)
  } else if (game.game.player.resources.spirit_stones < teaching.spiritStones) {
    parts.push(`尚缺灵石 ${teaching.spiritStones - game.game.player.resources.spirit_stones}`)
  }
  parts.push('传法只给入门，后续层数仍需自行参悟')
  return `${parts.join('；')}。`
}

function teachLockLabel(entry: FactionView, teaching: TeachingView): string {
  if (entry.rank < teaching.requiredRank) return '位次未至'
  if (entry.contribution < teaching.contribution) return '贡献不足'
  if (game.game.player.resources.spirit_stones < teaching.spiritStones) return '灵石不足'
  return '暂不可传'
}

function joinHint(entry: FactionView): string {
  if (!entry.join) return `${entry.name}眼下不纳外客。`
  const firstRank = [...entry.ranks].sort((left, right) => left.order - right.order)[0]
  const unmet = entry.joinUnmet.length
    ? `；尚缺：${describeRequirements(entry.joinUnmet)}`
    : ''
  return `落名入谱：${entry.join.description}；耗 ${formatCost(entry.join.entryCost)}；入门后得「${firstRank?.title ?? '初阶'}」，声望 +5，并在两月后牵出入门后续。一身只可先受一家的印${unmet}。`
}

function promoteHint(entry: FactionView): string {
  const next = entry.nextRank
  if (!next) return '已至此门最高职阶。'
  return `呈上晋升：耗贡献 ${entry.promotionCost.contribution}、声望 ${entry.promotionCost.reputation}；位次升至「${next.title}」，声望再 +5，并在三月后引出这一阶的试炼后续。`
}

function dutyHint(entry: FactionView): string {
  const rank = Math.max(1, entry.rank)
  return `领一份差事：贡献 +${3 + rank * 2}、声望 +${1 + rank}、灵石 +${2 + rank * 2}；办完后会进入 6 个月冷却。`
}

function leaveHint(entry: FactionView): string {
  return `退出${entry.name}：失去「${entry.rankTitle}」与全部贡献（${entry.contribution}），声望 -8，并留下「背誓之痕」6 月。`
}
</script>

<template>
  <div class="space-y-5">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="factionTabs" :active="factionFilter" @select="selectFactionFilter" />
        <TabBar size="sm" :tabs="archetypeTabViews" :active="archetypeFilter" @select="selectArchetype" />
      </div>
    </Teleport>

    <section>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-serif text-2xl leading-none">
            {{ joinedView?.name ?? '尚未择木而栖' }}
          </p>
          <p class="mt-1.5 text-[14px] text-muted">
            <template v-if="joinedView">
              {{ joinedView.rankTitle }} · 声望 {{ joinedView.reputation }} · 贡献
              {{ joinedView.contribution }}
            </template>
            <template v-else>
              一门之籍只可落一处。入谱之后，别家的门会先记住你的选择。
            </template>
          </p>
        </div>
        <span
          class="shrink-0 rounded-sm border px-2 py-1 text-[13px]"
          :class="
            joinedView
              ? 'border-jade/40 text-jade-deep'
              : 'border-line text-muted'
          "
        >
          {{ joinedView ? joinedView.rankTitle : '门外客' }}
        </span>
      </div>
    </section>

    <p
      v-if="!visibleFactions.length"
      class="rounded-sm border border-dashed border-line px-4 py-8 text-center text-[13px] leading-5 text-muted"
    >
      这一册里没有对得上的名字。换个分类，或等潮水揭开新的一页。
    </p>

    <div v-else class="space-y-3">
      <article
        v-for="entry in visibleFactions"
        :key="entry.id"
        class="rounded-sm border p-3.5"
        :class="
          entry.membership
            ? 'border-jade/40 bg-jade-soft'
            : entry.revealed
              ? 'border-line/80 bg-white/25'
              : 'border-dashed border-line/80 bg-paper/20'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-serif text-xl leading-tight">
                {{ entry.revealed ? entry.name : '潮下无名' }}
              </p>
              <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                {{ entry.revealed ? ARCHETYPE_LABELS[entry.archetype] ?? '势力' : '未明' }}
              </span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">
              {{ entry.revealed
                ? entry.description
                : '水面下另有一份名册，但还没有哪一页愿意让你看见。' }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
            :class="
              entry.membership
                ? 'border-jade/40 text-jade-deep'
                : entry.revealed
                  ? 'border-line text-ink-soft'
                  : 'border-line text-muted'
            "
          >
            {{ entry.membership ? entry.rankTitle : entry.revealed ? '可访' : '隐' }}
          </span>
        </div>

        <template v-if="entry.revealed">
          <div
            v-if="entry.membership"
            class="mt-3 border-t border-line/70 pt-3"
          >
            <div class="grid grid-cols-3 gap-2 text-center text-[13px]">
              <div class="rounded-sm bg-paper/50 px-2 py-1.5">
                <p class="text-muted">职阶</p>
                <p class="mt-0.5 font-medium">{{ entry.rankTitle }}</p>
              </div>
              <div class="rounded-sm bg-paper/50 px-2 py-1.5">
                <p class="text-muted">声望</p>
                <p class="mt-0.5 font-medium">{{ entry.reputation }}</p>
              </div>
              <div class="rounded-sm bg-paper/50 px-2 py-1.5">
                <p class="text-muted">贡献</p>
                <p class="mt-0.5 font-medium">{{ entry.contribution }}</p>
              </div>
            </div>

            <div
              v-if="entry.teachings.length"
              class="mt-3 rounded-sm border border-line/70 px-2.5 py-2"
            >
              <p class="text-[13px] font-medium">门中传授</p>
              <p class="mt-0.5 text-[12px] leading-4 text-muted">
                位次够了，还需以贡献与灵石请门中开卷。传的是入门，余下几层仍要自行参透。
              </p>
              <div class="mt-1.5 space-y-1.5">
                <div
                  v-for="teaching in entry.teachings"
                  :key="teaching.id"
                  class="flex items-center gap-2 border-t border-line/50 pt-1.5"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-[13px] leading-4">
                      《{{ teaching.name }}》
                      <span class="text-[12px] text-muted">
                        {{ teaching.tier }} 阶 · 需「{{ teaching.requiredRankTitle }}」
                      </span>
                    </p>
                    <p
                      v-if="!teaching.learned"
                      class="mt-0.5 text-[12px] leading-4 text-muted"
                    >
                      贡献 {{ teaching.contribution }} · 灵石 {{ teaching.spiritStones }}
                    </p>
                  </div>
                  <span
                    v-if="teaching.learned"
                    class="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted"
                  >
                    已入门
                  </span>
                  <button
                    v-else
                    type="button"
                    class="shrink-0 rounded-sm border px-2 py-1 text-[12px] tracking-[0.08em] transition"
                    :class="
                      teaching.canLearn
                        ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                        : 'cursor-not-allowed border-line text-muted'
                    "
                    :disabled="!teaching.canLearn"
                    v-hint="teachHint(entry, teaching)"
                    @click="learnTechnique(teaching.id)"
                  >
                    {{ teaching.canLearn ? '求传' : teachLockLabel(entry, teaching) }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="entry.nextRank" class="mt-3 rounded-sm border border-line/70 px-2.5 py-2">
              <div class="flex items-start justify-between gap-2">
                <p class="text-[14px] font-medium">
                  下一阶 · {{ entry.nextRank.title }}
                </p>
                <span class="shrink-0 text-[12px] text-muted">
                  贡献 {{ entry.promotionCost.contribution }} · 声望 {{ entry.promotionCost.reputation }}
                </span>
              </div>
              <p class="mt-1 text-[13px] leading-5 text-muted">{{ entry.nextRank.trial }}</p>
              <p
                v-if="entry.promotionUnmet.length"
                class="mt-1 text-[12px] leading-4 text-cinnabar/80"
              >
                尚缺：{{ describeRequirements(entry.promotionUnmet) }}
              </p>
              <button
                type="button"
                class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
                :class="
                  entry.canPromote
                    ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                    : 'cursor-not-allowed border-line text-muted'
                "
                :disabled="!entry.canPromote"
                v-hint="promoteHint(entry)"
                @click="game.promoteFaction()"
              >
                {{ entry.canPromote ? '呈上晋升' : '资历未足' }}
              </button>
            </div>
            <p v-else class="mt-3 text-[13px] text-muted">
              已是本族最高职阶。往上没有名号，只有更多需要你负责的事。
            </p>

            <div class="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                class="flex-1 rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
                :class="
                  entry.canDuty
                    ? 'border-line bg-paper/40 text-ink-soft hover:border-jade/40 hover:text-jade-deep'
                    : 'cursor-not-allowed border-line text-muted'
                "
                :disabled="!entry.canDuty"
                v-hint="dutyHint(entry)"
                @click="game.performFactionDuty()"
              >
                {{
                  entry.canDuty
                    ? '领一份差事'
                    : `差事冷却 ${Math.ceil(entry.dutyCooldownRemaining)} 月`
                }}
              </button>
              <button
                v-if="entry.exit?.allowed"
                type="button"
                class="rounded-sm border border-line px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-muted transition hover:border-cinnabar/35 hover:text-cinnabar"
                v-hint="leaveHint(entry)"
                @click="leave"
              >
                退出
              </button>
            </div>
            <p v-if="entry.exit" class="mt-2 text-[12px] leading-4 text-muted">
              {{ entry.exit.consequence }}
            </p>
          </div>

          <div v-else class="mt-3 border-t border-line/70 pt-3">
            <p v-if="entry.otherMembership" class="text-[13px] leading-5 text-muted">
              你已身在{{ game.faction?.name }}，一名不可事二主。
            </p>
            <template v-else>
              <p class="text-[13px] leading-5 text-muted">
                {{ entry.join?.description }}
              </p>
              <p class="mt-1.5 text-[12px] leading-4 text-muted">
                入门条件：{{ describeRequirements(entry.join?.requirements ?? []) }}
              </p>
              <p class="mt-0.5 text-[12px] leading-4 text-muted">
                入门所费：{{ formatCost(entry.join?.entryCost) }}
              </p>
              <p
                v-if="entry.joinUnmet.length"
                class="mt-1 text-[12px] leading-4 text-cinnabar/80"
              >
                尚缺：{{ describeRequirements(entry.joinUnmet) }}
              </p>
              <button
                type="button"
                class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
                :class="
                  entry.canJoin
                    ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                    : 'cursor-not-allowed border-line text-muted'
                "
                :disabled="!entry.canJoin"
                v-hint="joinHint(entry)"
                @click="join(entry.id)"
              >
                {{
                  entry.canJoin
                    ? '落名入谱'
                    : !entry.joinRequirementsMet
                      ? '因缘未至'
                      : !entry.canPayJoin
                        ? '束脩未备'
                        : entry.joinable
                          ? '暂不可入'
                          : '不纳外客'
                }}
              </button>
            </template>
          </div>

          <div v-if="entry.relationshipViews.length" class="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            <span
              v-for="relation in entry.relationshipViews"
              :key="relation.factionId"
              class="text-[12px] text-muted"
            >
              {{ relation.factionName }}
              <span
                :class="
                  relation.standing === 'ally'
                    ? 'text-ink-soft'
                    : relation.standing === 'enemy'
                      ? 'text-cinnabar/80'
                      : ''
                "
              >
                {{ standingLabel(relation.standing) }}
              </span>
            </span>
          </div>
        </template>
      </article>
    </div>

    <p class="border-t border-line/70 pt-3 text-[12px] leading-5 text-muted">
      势力只看你做过什么。声望来自差事与探幽，贡献可用于晋升；退出门籍会留下六个月的背誓之痕。
    </p>
  </div>
</template>
