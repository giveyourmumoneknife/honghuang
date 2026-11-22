<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide } from 'vue'
import { PANEL_TOOLBAR_KEY, nextPanelToolbarId } from './modal-toolbar'

const props = withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    badge?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closable?: boolean
    layer?: number
  }>(),
  {
    eyebrow: '',
    badge: '',
    size: 'lg',
    closable: true,
    layer: 50,
  },
)

const emit = defineEmits<{ close: [] }>()

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
} as const

let previousOverflow = ''
const toolbarId = nextPanelToolbarId()
provide(PANEL_TOOLBAR_KEY, toolbarId)

function requestClose(): void {
  if (props.closable) emit('close')
}

function handleKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') requestClose()
}

onMounted(() => {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  window.removeEventListener('keydown', handleKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        class="fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-6"
        :style="{ zIndex: layer }"
      >
        <div
          class="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
          @click="requestClose"
        ></div>

        <section
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="modal-card paper-panel-solid relative flex max-h-[90vh] w-full flex-col overflow-hidden sm:max-h-[86vh]"
          :class="SIZES[size]"
        >
          <header class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div class="min-w-0">
              <p v-if="eyebrow" class="text-[12px] tracking-[0.3em] text-jade">
                {{ eyebrow }}
              </p>
              <h2 class="mt-1 truncate font-serif text-2xl leading-tight">{{ title }}</h2>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <span
                v-if="badge"
                class="rounded-sm border border-jade/35 bg-jade-soft px-2 py-1 text-[12px] tracking-[0.14em] text-jade-deep"
              >
                {{ badge }}
              </span>
              <button
                v-if="closable"
                type="button"
                class="grid h-8 w-8 place-items-center rounded-sm border border-line text-sm text-muted transition hover:border-jade/40 hover:text-jade-deep"
                aria-label="关闭"
                @click="requestClose"
              >
                ×
              </button>
            </div>
          </header>

          <div :id="toolbarId" class="panel-toolbar shrink-0"></div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="border-t border-line px-5 py-3">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
