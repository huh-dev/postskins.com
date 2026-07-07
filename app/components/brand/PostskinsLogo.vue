<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  showWordmark?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  showWordmark: true,
})
</script>

<template>
  <div :class="cn('flex items-center gap-2', props.class)">
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="size-7 shrink-0"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" class="fill-[oklch(0.74_0.06_72)]" />
      <path
        d="M8 20.5 16 24.5 24 20.5V17.5L16 21.5 8 17.5v3z"
        class="fill-[oklch(0.18_0.02_70)]"
        opacity="0.45"
      />
      <path
        d="M8 15.5 16 19.5 24 15.5V12.5L16 16.5 8 12.5v3z"
        class="fill-[oklch(0.18_0.02_70)]"
        opacity="0.72"
      />
      <path
        d="M8 10.5 16 14.5 24 10.5 16 6.5 8 10.5z"
        class="fill-[oklch(0.18_0.02_70)]"
      />
    </svg>

    <span
      v-if="showWordmark"
      class="text-sm font-bold mt-0.5 tracking-tight text-foreground"
    >
      <span class="text-muted-foreground">POST</span>
      <span class="text-primary drop-shadow-[0_1px_3px_var(--primary)]">SKINS</span>
    </span>
  </div>
</template>
