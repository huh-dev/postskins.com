<script setup lang="ts">
import { RiLock2Line } from '@remixicon/vue'
import { type InventoryItem, tradeLockLabel, tradeLockTitle } from '@/composables/useInventory'

const { item } = defineProps<{ item: InventoryItem }>()

const lockLabel = computed(() => tradeLockLabel(item))
const lockTitle = computed(() => tradeLockTitle(item))
</script>

<template>
  <div
    class="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-ring/60"
    :class="{ 'opacity-90': !item.tradable }"
  >
    <!-- Trade-lock badge -->
    <span
      v-if="lockLabel"
      :title="lockTitle ?? undefined"
      class="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-600 backdrop-blur-sm dark:text-amber-400"
    >
      <RiLock2Line class="size-2.5" />
      {{ lockLabel }}
    </span>

    <!-- Item image -->
    <div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-3">
      <img
        v-if="item.icon_url"
        :src="item.icon_url"
        :alt="item.market_name ?? item.name ?? 'Item'"
        loading="lazy"
        class="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
      >
      <div v-else class="text-xs text-muted-foreground">No image</div>
    </div>

    <!-- Item meta -->
    <div class="flex flex-1 flex-col gap-0.5 border-t border-border px-2.5 py-2">
      <p class="truncate text-xs font-medium" :title="item.market_name ?? item.name ?? ''">
        {{ item.market_name ?? item.name ?? 'Unknown item' }}
      </p>
      <div class="flex items-center justify-between gap-1">
        <p class="truncate text-[0.625rem] text-muted-foreground" :title="item.type ?? ''">
          {{ item.type ?? '—' }}
        </p>
        <span
          v-if="item.amount > 1"
          class="shrink-0 rounded-sm bg-muted px-1 text-[0.625rem] font-medium text-muted-foreground"
        >
          ×{{ item.amount }}
        </span>
      </div>
    </div>
  </div>
</template>
