<script setup lang="ts">
import { RiEqualizerLine, RiSearchLine } from '@remixicon/vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/**
 * Simple top filter bar for the inventory.
 * Design only — no filtering logic is wired up yet.
 */

const searchQuery = ref('')
const filtersOpen = ref(false)

const priceSort = ref('high-to-low')
const itemType = ref('all')
const exterior = ref('any')
const rarity = ref('any')

const priceSortOptions = [
  { value: 'high-to-low', label: 'Price: High to Low' },
  { value: 'low-to-high', label: 'Price: Low to High' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
] as const

const typeOptions = [
  { value: 'all', label: 'All types' },
  { value: 'rifle', label: 'Rifles' },
  { value: 'pistol', label: 'Pistols' },
  { value: 'smg', label: 'SMGs' },
  { value: 'knife', label: 'Knives' },
  { value: 'gloves', label: 'Gloves' },
] as const

const exteriorOptions = [
  { value: 'any', label: 'Any exterior' },
  { value: 'factory-new', label: 'Factory New' },
  { value: 'minimal-wear', label: 'Minimal Wear' },
  { value: 'field-tested', label: 'Field-Tested' },
  { value: 'well-worn', label: 'Well-Worn' },
  { value: 'battle-scarred', label: 'Battle-Scarred' },
] as const

const rarityOptions = [
  { value: 'any', label: 'Any rarity' },
  { value: 'consumer', label: 'Consumer Grade' },
  { value: 'industrial', label: 'Industrial Grade' },
  { value: 'mil-spec', label: 'Mil-Spec' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'classified', label: 'Classified' },
  { value: 'covert', label: 'Covert' },
] as const

const filterSurfaceBg =
  '!bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))] dark:!bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))]'

const filterControlClass =
  `h-9 shrink-0 border-0 ${filterSurfaceBg} px-3 text-xs text-foreground !shadow-none transition-colors hover:!bg-[color-mix(in_oklch,var(--sidebar-accent)_55%,var(--background))] dark:hover:!bg-[color-mix(in_oklch,var(--sidebar-accent)_55%,var(--background))] focus-visible:border-primary/60 focus-visible:ring-0 data-[size=default]:h-9`

const filterMenuClass =
  `inventory-filter-menu w-(--reka-select-trigger-width) box-border px-2 py-1.5 text-xs text-foreground !shadow-none ring-0 backdrop-blur-none [backdrop-filter:none] [&_[data-reka-select-viewport]]:max-w-full [&_[data-reka-select-viewport]]:min-w-0 [&_[data-reka-select-viewport]]:p-0 [&_[data-reka-select-viewport]]:w-full ${filterSurfaceBg}`

const filterMenuItemClass =
  'box-border min-h-8 w-full rounded-md py-1.5 pl-2 pr-7 text-xs text-foreground focus:bg-background focus:text-foreground data-[highlighted]:bg-background data-[highlighted]:text-foreground [&>span:first-of-type]:right-2'

const sheetFilterControlClass =
  `h-9 w-full border-0 ${filterSurfaceBg} px-3 text-xs text-foreground !shadow-none transition-colors hover:!bg-[color-mix(in_oklch,var(--sidebar-accent)_55%,var(--background))] dark:hover:!bg-[color-mix(in_oklch,var(--sidebar-accent)_55%,var(--background))] focus-visible:border-primary/60 focus-visible:ring-0 data-[size=default]:h-9`

const sheetFilterMenuClass =
  `inventory-filter-menu w-(--reka-select-trigger-width) box-border px-2 py-1.5 text-xs text-foreground !shadow-none ring-0 backdrop-blur-none [backdrop-filter:none] [&_[data-reka-select-viewport]]:max-w-full [&_[data-reka-select-viewport]]:min-w-0 [&_[data-reka-select-viewport]]:p-0 [&_[data-reka-select-viewport]]:w-full ${filterSurfaceBg}`

const activeFilterCount = computed(() => {
  let count = 0

  if (itemType.value !== 'all') {
    count++
  }

  if (exterior.value !== 'any') {
    count++
  }

  if (rarity.value !== 'any') {
    count++
  }

  return count
})

const activeFilterSummary = computed(() => {
  const labels: string[] = []

  if (itemType.value !== 'all') {
    labels.push(typeOptions.find(option => option.value === itemType.value)?.label ?? itemType.value)
  }

  if (exterior.value !== 'any') {
    labels.push(exteriorOptions.find(option => option.value === exterior.value)?.label ?? exterior.value)
  }

  if (rarity.value !== 'any') {
    labels.push(rarityOptions.find(option => option.value === rarity.value)?.label ?? rarity.value)
  }

  return labels
})

function clearSheetFilters() {
  itemType.value = 'all'
  exterior.value = 'any'
  rarity.value = 'any'
}
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <!-- Search -->
    <div class="relative min-w-[12rem] flex-1 sm:max-w-sm">
      <RiSearchLine class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search items…"
        class="h-9 w-full rounded-md bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))] pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary/60 focus:outline-none"
      >
    </div>

    <div class="flex items-center gap-2">
      <Select v-model="priceSort">
        <SelectTrigger :class="filterControlClass">
          <SelectValue placeholder="Price: High to Low" />
        </SelectTrigger>
        <SelectContent :class="filterMenuClass">
          <SelectItem
            v-for="option in priceSortOptions"
            :key="option.value"
            :class="filterMenuItemClass"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Sheet v-model:open="filtersOpen">
        <SheetTrigger as-child>
          <button
            type="button"
            :class="[
              'flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              activeFilterCount > 0
                ? 'bg-primary/15 text-foreground hover:bg-primary/20'
                : 'bg-[color-mix(in_oklch,var(--sidebar-accent)_40%,var(--background))] text-muted-foreground hover:border-border hover:text-foreground',
            ]"
          >
            <RiEqualizerLine class="size-4" />
            <span class="hidden sm:inline">More filters</span>
            <span
              v-if="activeFilterCount > 0"
              class="inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground"
            >
              {{ activeFilterCount }}
            </span>
          </button>
        </SheetTrigger>

        <SheetContent side="right" class="gap-0 border-border/60 p-0 sm:max-w-md">
          <SheetHeader class="border-b border-border/60 px-5 py-4">
            <SheetTitle>Inventory filters</SheetTitle>
            <SheetDescription>
              Refine which CS2 items appear in your inventory. Search and sort stay in the toolbar above.
            </SheetDescription>
          </SheetHeader>

          <div class="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div
              v-if="activeFilterSummary.length > 0"
              class="rounded-md border border-primary/20 bg-primary/10 px-3 py-2.5"
            >
              <p class="text-[11px] font-medium uppercase tracking-wide text-primary">
                Active filters
              </p>
              <p class="mt-1 text-xs text-foreground">
                {{ activeFilterSummary.join(' · ') }}
              </p>
            </div>

            <div class="space-y-2">
              <div class="space-y-1">
                <p class="text-xs font-medium text-foreground">
                  Item type
                </p>
                <p class="text-[11px] leading-relaxed text-muted-foreground">
                  Narrow results to a weapon or equipment category.
                </p>
              </div>

              <Select v-model="itemType">
                <SelectTrigger :class="sheetFilterControlClass">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent :class="sheetFilterMenuClass">
                  <SelectItem
                    v-for="option in typeOptions"
                    :key="option.value"
                    :class="filterMenuItemClass"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <div class="space-y-1">
                <p class="text-xs font-medium text-foreground">
                  Exterior
                </p>
                <p class="text-[11px] leading-relaxed text-muted-foreground">
                  Wear condition from Factory New (pristine) to Battle-Scarred (heavily worn).
                </p>
              </div>

              <Select v-model="exterior">
                <SelectTrigger :class="sheetFilterControlClass">
                  <SelectValue placeholder="Any exterior" />
                </SelectTrigger>
                <SelectContent :class="sheetFilterMenuClass">
                  <SelectItem
                    v-for="option in exteriorOptions"
                    :key="option.value"
                    :class="filterMenuItemClass"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <div class="space-y-1">
                <p class="text-xs font-medium text-foreground">
                  Rarity
                </p>
                <p class="text-[11px] leading-relaxed text-muted-foreground">
                  Color tier from Consumer Grade up to Covert.
                </p>
              </div>

              <Select v-model="rarity">
                <SelectTrigger :class="sheetFilterControlClass">
                  <SelectValue placeholder="Any rarity" />
                </SelectTrigger>
                <SelectContent :class="sheetFilterMenuClass">
                  <SelectItem
                    v-for="option in rarityOptions"
                    :key="option.value"
                    :class="filterMenuItemClass"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter class="border-t border-border/60 px-5 py-4">
            <div class="flex w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                class="flex-1"
                :disabled="activeFilterCount === 0"
                @click="clearSheetFilters"
              >
                Clear filters
              </Button>
              <SheetClose as-child>
                <Button size="sm" class="flex-1">
                  Done
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
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
