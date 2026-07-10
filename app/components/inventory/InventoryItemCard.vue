<script setup lang="ts">
import { RiLock2Line, RiPriceTag3Line, RiSearchLine } from '@remixicon/vue'
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

const { stack, listed = false } = defineProps<{
  stack: InventoryItemStack
  /** The item already has an active listing, so selling is not offered again. */
  listed?: boolean
}>()

const emit = defineEmits<{ sell: [stack: InventoryItemStack] }>()

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
    class="item-card relative flex h-full flex-col overflow-hidden rounded-lg"
    :class="{ 'opacity-70': !isTradable }"
  >
    <header class="relative px-2.5 pt-2 pb-1">
      <span
        v-if="stack.count > 1"
        class="absolute top-1.5 right-2 rounded bg-sidebar-accent/90 px-1 py-px text-[0.625rem] font-semibold tabular-nums text-muted-foreground"
      >
        ×{{ stack.count }}
      </span>

      <p class="truncate pr-6 text-[0.6875rem] font-semibold leading-tight text-foreground" :title="displayName">
        {{ displayName }}
      </p>
      <p class="mt-px truncate text-[0.625rem] leading-tight text-muted-foreground">
        {{ wearTier ?? stack.item.type ?? ' ' }}
      </p>
    </header>

    <div class="relative mx-2.5 flex aspect-[4/3] items-center justify-center overflow-visible">
      <!-- Fills the frame: the gradient fades out on its own, so nothing crops it. -->
      <div
        class="pointer-events-none absolute inset-0"
        :style="rarityGlowStyle"
        aria-hidden="true"
      />

      <span
        v-if="lockLabel"
        :title="lockTitle ?? undefined"
        class="absolute left-0 top-0 z-10 inline-flex items-center gap-1 rounded border border-border/60 bg-sidebar-accent px-1 py-px text-[0.625rem] font-medium text-amber-500"
      >
        <RiLock2Line class="size-2.5" />
        {{ lockLabel }}
      </span>

      <img
        v-if="stack.item.icon_url"
        :src="stack.item.icon_url"
        :alt="displayName"
        loading="lazy"
        class="relative z-[1] max-h-[86%] max-w-[92%] object-contain"
        :style="{ filter: iconGlowFilter }"
      >
      <div v-else class="relative z-[1] text-[0.625rem] text-muted-foreground">No image</div>

      <button
        type="button"
        class="absolute right-0 bottom-0 z-10 flex size-5 items-center justify-center rounded-full border border-border/50 bg-sidebar-accent text-muted-foreground"
        aria-label="Inspect item"
        tabindex="-1"
      >
        <RiSearchLine class="size-2.5" />
      </button>
    </div>

    <div v-if="wearTier && floatValue !== null" class="space-y-1 px-2.5 pt-1.5">
      <div class="relative h-0.5 rounded-full bg-[linear-gradient(to_right,#22c55e_0%,#22c55e_7%,#a3e635_15%,#fbbf24_38%,#f97316_45%,#ef4444_100%)]">
        <span
          class="absolute top-1/2 h-2 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_4px_oklch(1_0_0/0.6)]"
          :style="wearMarkerStyle"
        />
      </div>

      <div class="flex items-center justify-between gap-1.5 text-[0.625rem] tabular-nums text-muted-foreground">
        <span class="truncate" :title="floatValue.toFixed(12)">{{ formatWearFloat(floatValue) }}</span>
        <span class="shrink-0">#{{ patternIndex }}</span>
      </div>
    </div>

    <div class="mt-auto px-2.5 pt-1.5 pb-2">
      <div
        v-if="listed"
        class="flex h-6 w-full items-center justify-center gap-1 rounded-md bg-sidebar-accent/70 text-[0.625rem] font-medium text-muted-foreground"
      >
        <RiPriceTag3Line class="size-3" />
        Listed
      </div>
      <button
        v-else
        type="button"
        class="shine-btn shine-btn--primary flex h-6 w-full items-center justify-center gap-1 rounded-md text-[0.625rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        :disabled="!isTradable"
        @click="emit('sell', stack)"
      >
        <Icon name="solar:tag-price-bold" class="relative z-10 size-3" />
        <span class="relative z-10">Sell</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
/*
  A flat, opaque surface — `surface-panel`'s backdrop-filter would force a
  compositing layer per card, and the grid renders hundreds of them.
*/
.item-card {
  border: 1px solid color-mix(in oklch, var(--border) 62%, transparent);
  background-color: var(--sidebar);

  /*
    Skip layout, style and paint for cards outside the viewport. `auto` keeps
    each card's real height once measured, so the scrollbar stays stable.
  */
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}
</style>
