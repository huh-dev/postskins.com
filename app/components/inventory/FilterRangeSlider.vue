<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'

withDefaults(defineProps<{
  modelValue: number[]
  min?: number
  max?: number
  step?: number
  /** CSS background for the track (e.g. a gradient). When set, the range fill is hidden. */
  trackStyle?: string
  /** Tailwind classes for the selected range fill. Used when no trackStyle is given. */
  rangeClass?: string
}>(), {
  min: 0,
  max: 100,
  step: 1,
  rangeClass: 'bg-primary',
})

const emit = defineEmits<{
  'update:modelValue': [number[]]
}>()

function onUpdate(value: number[] | undefined): void {
  if (value) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <SliderRoot
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :min-steps-between-thumbs="0"
    class="relative flex w-full touch-none items-center py-2 select-none"
    @update:model-value="onUpdate"
  >
    <SliderTrack
      class="relative h-2 w-full grow overflow-hidden rounded-full bg-[color-mix(in_oklch,var(--sidebar-accent)_65%,var(--background))]"
      :style="trackStyle ? { background: trackStyle } : undefined"
    >
      <SliderRange
        v-if="!trackStyle"
        :class="['absolute h-full', rangeClass]"
      />
    </SliderTrack>

    <SliderThumb
      v-for="(_, index) in modelValue"
      :key="index"
      class="filter-slider-thumb"
    />
  </SliderRoot>
</template>

<style scoped>
.filter-slider-thumb {
  display: block;
  width: 15px;
  height: 11px;
  background: #fff;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.45));
  cursor: grab;
  outline: none;
}

.filter-slider-thumb:focus-visible {
  filter: drop-shadow(0 0 3px var(--ring));
}

.filter-slider-thumb:active {
  cursor: grabbing;
}
</style>
