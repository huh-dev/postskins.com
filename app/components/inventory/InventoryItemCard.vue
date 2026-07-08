<script setup lang="ts">
import { RiLock2Line, RiSearchLine } from '@remixicon/vue'
import {
  type InventoryItemStack,
  stackHasTradableItem,
  stackTradeLockLabel,
  stackTradeLockTitle,
} from '@/composables/useInventory'
import { itemIconGlowFilter, itemRarityGlowStyle } from '@/lib/itemRarity'
import {
  formatWearFloat,
  parseWearTier,
  placeholderFloat,
  placeholderPattern,
  stripWearFromName,
  wearMarkerPercent,
} from '@/lib/itemWear'

const { stack } = defineProps<{ stack: InventoryItemStack }>()

const lockLabel = computed(() => stackTradeLockLabel(stack))
const lockTitle = computed(() => stackTradeLockTitle(stack))
const isTradable = computed(() => stackHasTradableItem(stack))
const displayName = computed(() =>
  stripWearFromName(stack.item.market_name, stack.item.name ?? 'Unknown item'),
)
const wearTier = computed(() => parseWearTier(stack.item.market_name))
const floatValue = computed(() =>
  wearTier.value ? placeholderFloat(stack.item.asset_id, wearTier.value) : null,
)
const patternIndex = computed(() =>
  wearTier.value ? placeholderPattern(stack.item.asset_id) : null,
)
const rarityGlowStyle = computed(() => itemRarityGlowStyle(stack.item.type))
const iconGlowFilter = computed(() => itemIconGlowFilter(stack.item.type))
const wearMarkerStyle = computed(() => ({
  left: `${wearMarkerPercent(floatValue.value ?? 0)}%`,
}))
</script>

<template>
  <article
    class="surface-panel relative flex flex-col rounded-lg border-0"
    :class="{ 'opacity-75': !isTradable }"
  >
    <header class="relative px-3 pt-2.5 pb-1">
      <span
        v-if="stack.count > 1"
        class="absolute top-2 right-2 rounded-md bg-sidebar-accent/90 px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-foreground"
      >
        ×{{ stack.count }}
      </span>

      <p class="truncate pr-8 text-xs font-semibold leading-tight text-foreground" :title="displayName">
        {{ displayName }}
      </p>
      <p v-if="wearTier" class="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">
        {{ wearTier }}
      </p>
    </header>

    <div class="relative mx-3 flex aspect-[4/3] items-center justify-center overflow-visible">
      <div
        class="pointer-events-none absolute top-1/2 left-1/2 size-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[32px]"
        :style="rarityGlowStyle"
        aria-hidden="true"
      />

      <span
        v-if="lockLabel"
        :title="lockTitle ?? undefined"
        class="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-md border border-border/60 bg-sidebar-accent/90 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-500 backdrop-blur-sm"
      >
        <RiLock2Line class="size-2.5" />
        {{ lockLabel }}
      </span>

      <img
        v-if="stack.item.icon_url"
        :src="stack.item.icon_url"
        :alt="displayName"
        loading="lazy"
        class="relative z-[1] max-h-[78%] max-w-[88%] object-contain"
        :style="{ filter: iconGlowFilter }"
      >
      <div v-else class="relative z-[1] text-xs text-muted-foreground">No image</div>

      <button
        type="button"
        class="absolute right-1.5 bottom-1.5 z-10 flex size-6 items-center justify-center rounded-full border border-border/50 bg-sidebar-accent/80 text-muted-foreground backdrop-blur-sm"
        aria-label="Inspect item"
        tabindex="-1"
      >
        <RiSearchLine class="size-3" />
      </button>
    </div>

    <div v-if="wearTier && floatValue !== null" class="space-y-1.5 px-3 pt-2">
      <div class="relative h-1 overflow-visible rounded-full bg-[linear-gradient(to_right,#22c55e_0%,#22c55e_7%,#a3e635_15%,#fbbf24_38%,#f97316_45%,#ef4444_100%)]">
        <span
          class="absolute top-1/2 h-2.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_4px_oklch(1_0_0/0.6)]"
          :style="wearMarkerStyle"
        />
      </div>

      <div class="flex items-center justify-between gap-2 text-[0.625rem] tabular-nums">
        <span class="truncate text-muted-foreground">{{ formatWearFloat(floatValue) }}</span>
        <span class="shrink-0 text-muted-foreground">{{ patternIndex }}</span>
      </div>
    </div>

    <div class="mt-auto px-3 pt-2 pb-2.5">
      <button
        type="button"
        class="shine-btn shine-btn--primary flex h-7 w-full items-center justify-center gap-1.5 rounded-md text-[0.6875rem] font-medium"
        :disabled="!isTradable"
      >
        <Icon name="solar:tag-price-bold" class="relative z-10 size-3.5" />
        <span class="relative z-10">Sell</span>
      </button>
    </div>
  </article>
</template>
