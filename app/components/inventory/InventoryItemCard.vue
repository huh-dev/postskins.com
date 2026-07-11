<script setup lang="ts">
import { RiCheckLine, RiLock2Line, RiSearchLine } from '@remixicon/vue'
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

const { stack, selected = false } = defineProps<{
  stack: InventoryItemStack
  /** The item is part of the current offer selection. */
  selected?: boolean
}>()

const emit = defineEmits<{ toggle: [stack: InventoryItemStack] }>()

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

function toggle(): void {
  if (isTradable.value) {
    emit('toggle', stack)
  }
}
</script>

<template>
  <article
    class="item-card relative flex h-full flex-col rounded-lg text-left transition-colors"
    :class="[
      { 'opacity-75': !isTradable, 'cursor-pointer': isTradable },
      selected ? 'is-selected' : '',
    ]"
    role="button"
    :aria-pressed="selected"
    :aria-disabled="!isTradable"
    :tabindex="isTradable ? 0 : -1"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <span
      v-if="selected"
      class="absolute right-2 top-2 z-20 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
      aria-hidden="true"
    >
      <RiCheckLine class="size-3" />
    </span>

    <header class="relative px-3 pt-2.5 pb-1">
      <p class="truncate pr-6 text-xs font-semibold leading-tight text-foreground" :title="displayName">
        {{ displayName }}
      </p>
      <p v-if="wearTier" class="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">
        {{ wearTier }}
      </p>
    </header>

    <div class="relative mx-3 flex aspect-[4/3] items-center justify-center overflow-visible">
      <!-- Soft, contained rarity haze behind the icon (not a full-card wash). -->
      <div
        class="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[26px]"
        :style="rarityGlowStyle"
        aria-hidden="true"
      />

      <span
        v-if="stack.count > 1"
        class="absolute right-1 top-1 z-10 rounded-md bg-sidebar-accent/90 px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-foreground"
      >
        ×{{ stack.count }}
      </span>

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

    <div v-if="wearTier && floatValue !== null" class="space-y-1.5 px-3 pt-2 pb-2.5">
      <div class="relative h-1 overflow-visible rounded-full bg-[linear-gradient(to_right,#22c55e_0%,#22c55e_7%,#a3e635_15%,#fbbf24_38%,#f97316_45%,#ef4444_100%)]">
        <span
          class="absolute top-1/2 h-2.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_4px_oklch(1_0_0/0.6)]"
          :style="wearMarkerStyle"
        />
      </div>

      <div class="flex items-center justify-between gap-2 text-[0.625rem] tabular-nums text-muted-foreground">
        <span class="truncate" :title="floatValue.toFixed(12)">{{ formatWearFloat(floatValue) }}</span>
        <span class="shrink-0">#{{ patternIndex }}</span>
      </div>
    </div>
    <div v-else class="pb-2.5" />
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

.item-card.is-selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
  background-color: color-mix(in oklch, var(--primary) 10%, var(--sidebar));
}
</style>
