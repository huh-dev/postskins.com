<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import { type InventoryItemStack, stackHasTradableItem } from '@/composables/useInventory'
import { itemIconGlowFilter, itemRarityGlowStyle } from '@/lib/itemRarity'
import { parseWearTier, stripWearFromName } from '@/lib/itemWear'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const { stack, busy = false } = defineProps<{
  stack: InventoryItemStack | null
  busy?: boolean
}>()

const emit = defineEmits<{ submit: [price: number] }>()

const open = defineModel<boolean>('open', { default: false })

const priceInput = ref<number | null>(null)
const priceField = ref<HTMLInputElement | null>(null)

const displayName = computed(() =>
  stack ? stripWearFromName(stack.item.market_name, stack.item.name ?? 'Unknown item') : '',
)
const wearTier = computed(() => (stack ? parseWearTier(stack.item.market_name) : null))
const isTradable = computed(() => (stack ? stackHasTradableItem(stack) : false))
const canSubmit = computed(() => !busy && isTradable.value && !!priceInput.value && priceInput.value > 0)

/** Reset to an empty field each time a new item is opened, then focus it. */
watch(open, async (isOpen) => {
  if (!isOpen) {
    return
  }

  priceInput.value = null
  await nextTick()
  priceField.value?.focus()
})

function submit(): void {
  if (canSubmit.value && priceInput.value) {
    emit('submit', priceInput.value)
  }
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="gap-0">
      <SheetHeader>
        <SheetTitle>List for sale</SheetTitle>
        <SheetDescription>
          Set your asking price. The item stays in your Steam inventory until someone buys it.
        </SheetDescription>
      </SheetHeader>

      <div v-if="stack" class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
        <div class="surface-panel relative flex items-center gap-3 overflow-hidden rounded-lg border-0 p-3">
          <div class="relative flex size-16 shrink-0 items-center justify-center">
            <div
              class="pointer-events-none absolute inset-0"
              :style="itemRarityGlowStyle(stack.item.type)"
              aria-hidden="true"
            />
            <img
              v-if="stack.item.icon_url"
              :src="stack.item.icon_url"
              :alt="displayName"
              class="relative z-[1] max-h-full max-w-full object-contain"
              :style="{ filter: itemIconGlowFilter(stack.item.type) }"
            >
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-foreground">{{ displayName }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ wearTier ?? stack.item.type }}</p>
          </div>
        </div>

        <label class="block">
          <span class="text-xs font-medium text-foreground">Your price</span>
          <div class="relative mt-1">
            <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              ref="priceField"
              v-model.number="priceInput"
              type="number"
              min="0.01"
              step="0.01"
              inputmode="decimal"
              placeholder="0.00"
              class="h-10 w-full rounded-md border border-border bg-background pl-7 pr-3 font-mono text-sm tabular-nums outline-none transition-colors focus:border-ring"
              @keydown.enter="submit()"
            >
          </div>
        </label>

        <p class="flex gap-2 rounded-md bg-sidebar-accent/40 p-2.5 text-xs leading-relaxed text-muted-foreground">
          <RiInformationLine class="mt-px size-4 shrink-0" />
          <span>
            When it sells, you approve one trade offer in your Steam mobile app. Your payout unlocks after Steam's
            7-day trade-protection window closes.
            <NuxtLink to="/support" class="text-foreground underline underline-offset-2">Learn more</NuxtLink>
          </span>
        </p>

        <p v-if="!isTradable" class="text-xs text-destructive">
          This item is trade locked and cannot be listed yet.
        </p>
      </div>

      <SheetFooter>
        <Button size="lg" :disabled="!canSubmit" @click="submit()">List item</Button>
        <Button variant="ghost" size="lg" @click="open = false">Cancel</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
