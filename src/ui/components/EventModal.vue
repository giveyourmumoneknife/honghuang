<script setup lang="ts">
import { computed } from 'vue'
import { getContentRegistry } from '@/data'
import { useGameStore } from '@/stores/game'
import { describeEffects, describeRequirements } from '../labels'
import ModalShell from './ui/ModalShell.vue'

const registry = getContentRegistry()
const game = useGameStore()

const activeEvent = computed(() => game.activeEvent)
const paragraphs = computed(
  () => activeEvent.value?.body.split(/\n{2,}/).filter(Boolean) ?? [],
)

const EVENT_KIND_LABELS: Record<string, string> = {
  main: '主线',
  faction: '势力',
  partner: '道侣',
  cave: '洞府',
  world: '天下',
  hidden: '隐闻',
  ambient: '潮声',
}

function kindLabel(kind: string): string {
  return EVENT_KIND_LABELS[kind] ?? '潮声'
}

function isLocked(choiceId: string): boolean {
  const choice = activeEvent.value?.choices.find(
    (candidate) => candidate.id === choiceId,
  )
  return choice ? !game.choiceEligibility(choice) : true
}

function lockedText(choiceId: string): string {
  const choice = activeEvent.value?.choices.find(
    (candidate) => candidate.id === choiceId,
  )
  if (!choice) return '因缘未足'
  const unmet = game.choiceUnmet(choice)
  return unmet.length ? `因缘未足 · ${describeRequirements(unmet)}` : '因缘未足'
}

function choiceHint(choiceId: string): string {
  const choice = activeEvent.value?.choices.find(
    (candidate) => candidate.id === choiceId,
  )
  if (!choice) return ''
  const parts = [`落定后果：${describeEffects(choice.effects)}`]
  if (choice.nextEventId) {
    const next = registry.events.get(choice.nextEventId)
    parts.push(next ? `随后接「${next.title}」` : '随后另起下文')
  }
  if (!game.choiceEligibility(choice)) {
    parts.push(`因缘尚缺：${describeRequirements(game.choiceUnmet(choice))}`)
  }
  if (game.activeIsStory) parts.push('此为故事抉择，落定前时光停驻')
  return `${parts.join('；')}。`
}
</script>

<template>
  <ModalShell
    v-if="activeEvent"
    :title="activeEvent.title"
    :eyebrow="`${kindLabel(activeEvent.kind)} · 当下`"
    :badge="activeEvent.pause === 'story' ? '时光凝滞' : '可稍后处理'"
    :closable="!game.activeIsStory"
    :layer="60"
    size="xl"
    @close="game.closeEvent()"
  >
    <p class="text-sm leading-7 text-jade-deep">{{ activeEvent.summary }}</p>

    <div class="mt-5 space-y-4 border-l border-line pl-4 sm:pl-5">
      <p
        v-for="(paragraph, index) in paragraphs"
        :key="index"
        class="whitespace-pre-line text-[15px] leading-8 text-ink-soft"
      >
        {{ paragraph }}
      </p>
    </div>

    <div class="mt-6 border-t border-line pt-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-[13px] tracking-[0.3em] text-jade">当下之择</p>
        <p class="text-[13px] text-muted">选择一旦落定，会写入编年史</p>
      </div>

      <div class="mt-3 grid gap-2.5">
        <button
          v-for="choice in activeEvent.choices"
          :key="choice.id"
          type="button"
          class="group flex w-full items-start justify-between gap-4 rounded-sm border border-line bg-paper px-4 py-3.5 text-left transition hover:border-jade/50 hover:bg-white/70 disabled:cursor-not-allowed disabled:border-line/80 disabled:bg-paper-deep/60 disabled:hover:border-line/80 disabled:hover:bg-paper-deep/60"
          :disabled="isLocked(choice.id)"
          v-hint="choiceHint(choice.id)"
          @click="game.resolveChoice(choice.id)"
        >
          <span class="min-w-0">
            <span class="block text-sm leading-6">{{ choice.text }}</span>
            <span
              v-if="isLocked(choice.id)"
              class="mt-1 block text-[13px] leading-5 tracking-[0.14em] text-cinnabar/70"
            >
              {{ lockedText(choice.id) }}
            </span>
          </span>
          <span
            class="mt-0.5 shrink-0 text-[13px] tracking-[0.2em] text-muted transition group-hover:text-jade-deep"
          >
            择此 →
          </span>
        </button>
      </div>
    </div>

    <template #footer>
      <div v-if="game.activeIsStory" class="text-[13px] leading-5 text-muted">
        此间时光为你停驻；选择落定后，潮水与三槽才会继续。
      </div>
      <button
        v-else
        type="button"
        class="text-[13px] tracking-[0.16em] text-muted transition hover:text-jade-deep"
        v-hint="'暂且合上此事，稍后再读；未落定的潮声仍会留在收件箱。'"
        @click="game.closeEvent()"
      >
        暂且合上，稍后再读
      </button>
    </template>
  </ModalShell>
</template>
