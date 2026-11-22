<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    title: string
    detail?: string
    badge?: string
    accent?: boolean
    disabled?: boolean
  }>(),
  {
    detail: '',
    badge: '',
    accent: false,
    disabled: false,
  },
)

defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="group flex min-h-[86px] flex-col justify-between rounded-sm border px-3.5 py-3 text-left transition"
    :class="
      disabled
        ? 'cursor-not-allowed border-dashed border-line/80 bg-paper/20'
        : 'border-line bg-white/30 hover:border-jade/45 hover:bg-white/50'
    "
    :disabled="disabled"
    @click="$emit('select')"
  >
    <span class="flex items-center justify-between gap-2">
      <span
        class="text-[12px] tracking-[0.26em]"
        :class="accent && !disabled ? 'text-jade' : 'text-muted'"
      >
        {{ label }}
      </span>
      <span
        v-if="badge"
        class="rounded-sm border px-1.5 py-0.5 text-[12px] tracking-[0.1em]"
        :class="
          disabled
            ? 'border-line text-muted'
            : 'border-cinnabar/30 bg-cinnabar-soft text-cinnabar'
        "
      >
        {{ badge }}
      </span>
    </span>
    <span
      class="mt-2 block truncate font-serif text-xl leading-tight"
      :class="disabled ? 'text-muted' : 'text-ink'"
    >
      {{ title }}
    </span>
    <span v-if="detail" class="mt-1 block truncate text-[13px] text-muted">{{ detail }}</span>
  </button>
</template>
