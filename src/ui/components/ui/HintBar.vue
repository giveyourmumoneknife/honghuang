<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { hintAnchor, hintText } from '@/ui/hint'

const bar = ref<HTMLElement | null>(null)
const position = ref<{ top: number; left: number } | null>(null)

function place(): void {
  const anchor = hintAnchor.value
  const el = bar.value
  if (!anchor || !el || !anchor.isConnected) return
  const rect = anchor.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 8
  const gap = 10
  const width = el.offsetWidth
  const height = el.offsetHeight
  const topFor = (value: number) =>
    Math.max(margin, Math.min(viewportHeight - height - margin, value))

  const dialog = anchor.closest('[role="dialog"]')
  if (dialog) {
    const panel = dialog.getBoundingClientRect()
    if (panel.right + gap + width <= viewportWidth - margin) {
      position.value = { top: topFor(rect.top), left: panel.right + gap }
      return
    }
    if (panel.left - gap - width >= margin) {
      position.value = { top: topFor(rect.top), left: panel.left - width - gap }
      return
    }
  }

  let left = rect.right + gap
  let top = topFor(rect.top)

  if (left + width > viewportWidth - margin) {
    left = rect.left - width - gap
  }
  if (left < margin) {
    left = Math.max(margin, Math.min(viewportWidth - width - margin, rect.left + rect.width / 2 - width / 2))
    top = rect.top - height - gap
    if (top < margin) top = rect.bottom + gap
    if (top + height > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - height - margin)
    }
  }

  position.value = { top, left }
}

function schedule(): void {
  if (!hintText.value) {
    position.value = null
    return
  }
  void nextTick(place)
}

watch([hintText, hintAnchor], schedule)

function onViewportChange(): void {
  if (hintText.value) place()
}

onMounted(() => {
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="hint">
      <div
        v-if="hintText"
        class="pointer-events-none fixed z-[90]"
        :style="
          position
            ? { top: `${position.top}px`, left: `${position.left}px` }
            : { top: '0px', left: '0px', visibility: 'hidden' }
        "
        role="status"
        aria-live="polite"
      >
        <p
          ref="bar"
          class="max-w-[min(22rem,calc(100vw-1.5rem))] rounded-sm border border-jade/30 bg-surface px-3.5 py-2 text-[13px] leading-5 text-ink-soft shadow-lg shadow-ink/15"
        >
          <span class="mr-1.5 text-[12px] tracking-[0.18em] text-jade">预览</span>
          {{ hintText }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>