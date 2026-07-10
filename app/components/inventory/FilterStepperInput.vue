<script setup lang="ts">
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
}>(), {
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [number]
}>()

function clamp(value: number): number {
  let next = value

  if (props.min !== undefined) {
    next = Math.max(props.min, next)
  }

  if (props.max !== undefined) {
    next = Math.min(props.max, next)
  }

  return next
}

function commit(value: number): void {
  emit('update:modelValue', clamp(Number(value.toFixed(4))))
}

function onInput(event: Event): void {
  const raw = Number.parseFloat((event.target as HTMLInputElement).value)

  if (!Number.isNaN(raw)) {
    commit(raw)
  }
}

function stepBy(direction: 1 | -1): void {
  commit(props.modelValue + direction * props.step)
}
</script>

<template>
  <div class="flex h-11 items-center rounded-md bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))] pr-1.5 pl-3 transition-shadow focus-within:ring-1 focus-within:ring-primary/60">
    <input
      :value="modelValue"
      type="text"
      inputmode="decimal"
      class="w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
      @input="onInput"
    >
    <div class="ml-1 flex shrink-0 flex-col">
      <button
        type="button"
        tabindex="-1"
        class="flex h-4 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Increase"
        @click="stepBy(1)"
      >
        <RiArrowUpSLine class="size-3.5" />
      </button>
      <button
        type="button"
        tabindex="-1"
        class="flex h-4 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Decrease"
        @click="stepBy(-1)"
      >
        <RiArrowDownSLine class="size-3.5" />
      </button>
    </div>
  </div>
</template>
