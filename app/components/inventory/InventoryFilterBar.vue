<script setup lang="ts">
import { RiCloseLine, RiLock2Line, RiSearchLine } from '@remixicon/vue'
import { INVENTORY_SORTS, type InventorySort } from '@/lib/inventoryFilters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const search = defineModel<string>('search', { default: '' })
const sort = defineModel<InventorySort>('sort', { default: 'rarity' })
const hideLocked = defineModel<boolean>('hideLocked', { default: false })

const filterSurfaceBg
  = '!bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))] dark:!bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))]'

const filterControlClass
  = `h-8 shrink-0 border-0 ${filterSurfaceBg} px-2.5 text-xs text-foreground !shadow-none transition-colors hover:!bg-[color-mix(in_oklch,var(--sidebar-accent)_55%,var(--background))] dark:hover:!bg-[color-mix(in_oklch,var(--sidebar-accent)_55%,var(--background))] focus-visible:border-primary/60 focus-visible:ring-0 data-[size=default]:h-8`

const filterMenuClass
  = `inventory-filter-menu w-(--reka-select-trigger-width) box-border px-2 py-1.5 text-xs text-foreground !shadow-none ring-0 backdrop-blur-none [backdrop-filter:none] [&_[data-reka-select-viewport]]:max-w-full [&_[data-reka-select-viewport]]:min-w-0 [&_[data-reka-select-viewport]]:p-0 [&_[data-reka-select-viewport]]:w-full ${filterSurfaceBg}`

const filterMenuItemClass
  = 'box-border min-h-7 w-full rounded-md py-1.5 pl-2 pr-7 text-xs text-foreground focus:bg-background focus:text-foreground data-[highlighted]:bg-background data-[highlighted]:text-foreground [&>span:first-of-type]:right-2'
</script>

<template>
  <div class="flex items-center gap-1.5">
    <!-- Search -->
    <div class="relative min-w-0 flex-1 sm:max-w-xs">
      <RiSearchLine class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        v-model="search"
        type="search"
        placeholder="Search items…"
        aria-label="Search your inventory"
        class="h-8 w-full rounded-md bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))] pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/70 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 [&::-webkit-search-cancel-button]:appearance-none"
      >
      <button
        v-if="search"
        type="button"
        aria-label="Clear search"
        class="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        @click="search = ''"
      >
        <RiCloseLine class="size-3.5" />
      </button>
    </div>

    <!-- Hide trade-locked items, which cannot be listed anyway. -->
    <button
      type="button"
      :aria-pressed="hideLocked"
      class="flex h-8 shrink-0 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      :class="hideLocked
        ? 'bg-primary/15 text-foreground'
        : 'bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))] text-muted-foreground hover:text-foreground'"
      @click="hideLocked = !hideLocked"
    >
      <RiLock2Line class="size-3.5" />
      <span class="hidden sm:inline">Hide locked</span>
    </button>

    <!-- Sort -->
    <Select v-model="sort">
      <SelectTrigger :class="filterControlClass" aria-label="Sort items">
        <SelectValue placeholder="Rarity" />
      </SelectTrigger>
      <SelectContent :class="filterMenuClass">
        <SelectItem
          v-for="option in INVENTORY_SORTS"
          :key="option.value"
          :class="filterMenuItemClass"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>

<style scoped>
.inventory-filter-menu :deep([data-reka-select-viewport]) {
  box-sizing: border-box;
  max-width: 100% !important;
  min-width: 0 !important;
  width: 100% !important;
  padding: 0 !important;
}
</style>
