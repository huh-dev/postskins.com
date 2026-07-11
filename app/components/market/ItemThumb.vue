<script setup lang="ts">
import type { ItemThumbDto } from "@/composables/useTrade"
import { itemIconGlowFilter, itemRarityGlowStyle } from "@/lib/itemRarity"

const { item, size = "md" } = defineProps<{
  item: ItemThumbDto
  size?: "sm" | "md"
}>()

const glow = computed(() => itemRarityGlowStyle(item.type ?? null))
const iconFilter = computed(() => itemIconGlowFilter(item.type ?? null))

const box = computed(() => (size === "sm" ? "size-12" : "size-16"))
</script>

<template>
  <div
    class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-sidebar-accent/40"
    :class="box"
    :title="item.name ?? item.market_hash_name ?? 'Item'"
  >
    <div class="pointer-events-none absolute inset-0" :style="glow" aria-hidden="true" />
    <img
      v-if="item.icon_url"
      :src="item.icon_url"
      :alt="item.name ?? 'Item'"
      loading="lazy"
      class="relative z-[1] max-h-[86%] max-w-[90%] object-contain"
      :style="{ filter: iconFilter }"
    >
    <span v-else class="relative z-[1] px-1 text-center text-[0.5rem] leading-tight text-muted-foreground">
      {{ item.name ?? "?" }}
    </span>
  </div>
</template>
