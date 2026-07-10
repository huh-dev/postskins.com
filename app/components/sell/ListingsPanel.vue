<script setup lang="ts">
import { RiDeleteBinLine, RiPriceTag3Line } from '@remixicon/vue'
import type { Listing } from '@/composables/useMarket'
import { formatMoney } from '@/lib/format'

const { listings, busy = false } = defineProps<{
  listings: Listing[]
  busy?: boolean
}>()

const emit = defineEmits<{ cancel: [id: number] }>()

/** Active listings first — they are the ones the seller can still act on. */
const orderedListings = computed(() =>
  [...listings].sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active')),
)

const activeCount = computed(() => listings.filter(listing => listing.status === 'active').length)

const STATUS_STYLES: Record<Listing['status'], string> = {
  active: 'bg-emerald-400',
  sold: 'bg-primary',
  cancelled: 'bg-muted-foreground/50',
}
</script>

<template>
  <div class="flex min-h-0 flex-col">
    <header class="flex items-baseline justify-between gap-2 px-0.5 pb-2">
      <h2 class="text-xs font-semibold text-foreground">Your listings</h2>
      <span v-if="activeCount" class="text-[0.625rem] tabular-nums text-muted-foreground">{{ activeCount }} active</span>
    </header>

    <div v-if="!listings.length" class="surface-panel flex flex-col items-center gap-2 rounded-lg border-0 px-4 py-8 text-center">
      <RiPriceTag3Line class="size-6 text-muted-foreground/60" />
      <p class="text-[0.6875rem] leading-relaxed text-muted-foreground">
        Nothing listed yet.<br>Pick an item to set your price.
      </p>
    </div>

    <ul v-else class="inventory-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
      <li
        v-for="listing in orderedListings"
        :key="listing.id"
        class="surface-panel group flex items-center gap-2 rounded-lg border-0 p-1.5"
        :class="{ 'opacity-60': listing.status !== 'active' }"
      >
        <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent/50">
          <img
            v-if="listing.item.icon_url"
            :src="listing.item.icon_url"
            :alt="listing.item.name ?? 'Item'"
            loading="lazy"
            class="max-h-7 max-w-7 object-contain"
          >
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-[0.6875rem] font-medium leading-tight text-foreground" :title="listing.item.name ?? ''">
            {{ listing.item.name ?? 'Unknown item' }}
          </p>
          <p class="mt-0.5 flex items-center gap-1 text-[0.625rem] leading-tight text-muted-foreground">
            <span class="size-1.5 rounded-full" :class="STATUS_STYLES[listing.status]" aria-hidden="true" />
            <span class="capitalize">{{ listing.status }}</span>
          </p>
        </div>

        <span class="shrink-0 font-mono text-[0.6875rem] font-semibold tabular-nums text-foreground">
          {{ formatMoney(listing.price, listing.currency) }}
        </span>

        <!-- Cancel stays out of the way until the row is hovered or focused. -->
        <Button
          v-if="listing.status === 'active'"
          variant="ghost"
          size="icon-xs"
          class="shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:text-destructive"
          :disabled="busy"
          :aria-label="`Cancel listing for ${listing.item.name ?? 'item'}`"
          @click="emit('cancel', listing.id)"
        >
          <RiDeleteBinLine />
        </Button>
      </li>
    </ul>
  </div>
</template>
