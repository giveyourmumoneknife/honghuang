<script setup lang="ts">
export interface TabBarItem {
  id: string
  label: string
  count?: string | number
  hint?: string
}

withDefaults(
  defineProps<{
    tabs: TabBarItem[]
    active: string
    size?: 'md' | 'sm'
  }>(),
  { size: 'md' },
)

const emit = defineEmits<{ select: [id: string] }>()
</script>

<template>
  <div
    class="flex gap-1 rounded-sm border border-line bg-paper/40 p-1"
    :class="size === 'sm' ? 'flex-wrap' : ''"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-2 transition"
      :class="[
        size === 'sm'
          ? 'flex-1 px-1.5 py-1 text-[12px]'
          : 'flex-1 py-2 text-[14px] tracking-[0.08em]',
        active === tab.id
          ? size === 'sm'
            ? 'bg-jade/15 text-jade-deep'
            : 'bg-jade-deep text-white'
          : 'text-muted hover:bg-jade/[0.05] hover:text-jade-deep',
      ]"
      v-hint="tab.hint"
      @click="emit('select', tab.id)"
    >
      {{ tab.label }}
      <span
        v-if="tab.count !== undefined && tab.count !== ''"
        class="text-[12px]"
        :class="
          active === tab.id
            ? size === 'sm'
              ? 'text-jade-deep/70'
              : 'text-white/70'
            : 'text-muted'
        "
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>