<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  showWordmark?: boolean
  size?: "sm" | "md" | "lg"
  class?: HTMLAttributes["class"]
}>(), {
  showWordmark: true,
  size: "md",
})

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
} as const
</script>

<template>
  <div :class="cn('flex items-center gap-2', props.class)">
    <img
      src="/skins/postskins_logo.png"
      alt=""
      :class="cn('shrink-0 rounded-md object-cover', sizeClasses[props.size])"
      aria-hidden="true"
    >

    <span
      v-if="showWordmark"
      class="text-sm font-bold mt-0.5 tracking-tight text-foreground"
    >
      <span class="text-muted-foreground">POST</span>
      <span class="text-primary drop-shadow-[0_1px_3px_var(--primary)]">SKINS</span>
    </span>
  </div>
</template>
