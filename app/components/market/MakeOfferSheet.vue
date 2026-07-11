<script setup lang="ts">
import { RiCheckLine } from "@remixicon/vue"
import type { InventoryItemStack } from "@/composables/useInventory"
import { stackHasTradableItem } from "@/composables/useInventory"
import type { OfferDto, PostDto } from "@/composables/usePosts"
import { searchInventoryStacks } from "@/lib/inventoryFilters"
import { formatMoney } from "@/lib/format"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const open = defineModel<boolean>("open", { default: false })
const { post } = defineProps<{ post: PostDto | null }>()
const emit = defineEmits<{ submitted: [offer: OfferDto] }>()

const { groupedItems, status, load } = useInventory()
const { busy, errorMessage, submitOffer } = useOffers()

const search = ref("")
const selected = ref<Set<number>>(new Set())
const cashInput = ref("")
const cashPayer = ref<"offerer" | "poster">("offerer")
const message = ref("")

const tradableStacks = computed(() =>
  searchInventoryStacks(groupedItems.value.filter(stackHasTradableItem), search.value),
)

function firstTradableId(stack: InventoryItemStack): number | null {
  return stack.items.find(entry => entry.tradable)?.id ?? null
}

function toggle(stack: InventoryItemStack): void {
  const id = firstTradableId(stack)
  if (id === null) return
  const next = new Set(selected.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selected.value = next
}

const cashAmount = computed(() => Math.round((Number.parseFloat(cashInput.value) || 0) * 100))
const hasSomething = computed(() => selected.value.size > 0 || (cashAmount.value > 0 && cashPayer.value === "offerer"))

watch(open, (isOpen) => {
  if (isOpen) {
    selected.value = new Set()
    cashInput.value = ""
    cashPayer.value = "offerer"
    message.value = ""
    search.value = ""
    if (status.value === "idle") load()
  }
})

async function submit(): Promise<void> {
  if (!post || !hasSomething.value) return

  const offer = await submitOffer(post.id, {
    items: [...selected.value].map(id => ({ inventory_item_id: id })),
    cash_amount: cashAmount.value,
    cash_payer: cashAmount.value > 0 ? cashPayer.value : null,
    message: message.value.trim() || null,
  })

  if (offer) {
    open.value = false
    emit("submitted", offer)
  }
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="gap-0">
      <SheetHeader>
        <SheetTitle>Make an offer</SheetTitle>
        <SheetDescription v-if="post">
          Offer to {{ post.owner?.name }} for their trade. Pick items from your inventory and add cash to balance it.
        </SheetDescription>
      </SheetHeader>

      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-2">
        <!-- Cash -->
        <div>
          <label class="mb-1 block text-xs font-medium">Cash</label>
          <div class="flex gap-2">
            <input
              v-model="cashInput"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="h-9 w-28 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
            >
            <div class="flex overflow-hidden rounded-md border border-border text-xs">
              <button
                type="button"
                class="px-2.5 py-1 transition-colors"
                :class="cashPayer === 'offerer' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
                @click="cashPayer = 'offerer'"
              >
                I add cash
              </button>
              <button
                type="button"
                class="px-2.5 py-1 transition-colors"
                :class="cashPayer === 'poster' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
                @click="cashPayer = 'poster'"
              >
                They add cash
              </button>
            </div>
          </div>
        </div>

        <!-- Item picker -->
        <div>
          <label class="mb-1 block text-xs font-medium">Your items ({{ selected.size }} selected)</label>
          <input
            v-model="search"
            type="search"
            placeholder="Search your items…"
            class="mb-2 h-8 w-full rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-ring"
          >

          <div v-if="status === 'loading'" class="py-6 text-center text-xs text-muted-foreground">Loading inventory…</div>
          <div v-else-if="!tradableStacks.length" class="py-6 text-center text-xs text-muted-foreground">No tradable items found.</div>
          <div v-else class="grid grid-cols-3 gap-1.5">
            <button
              v-for="stack in tradableStacks"
              :key="stack.key"
              type="button"
              class="relative flex flex-col items-center gap-1 rounded-md border p-1.5 text-center transition-colors"
              :class="firstTradableId(stack) !== null && selected.has(firstTradableId(stack)!)
                ? 'border-primary bg-primary/10'
                : 'border-border/60 hover:border-border'"
              @click="toggle(stack)"
            >
              <span
                v-if="firstTradableId(stack) !== null && selected.has(firstTradableId(stack)!)"
                class="absolute right-1 top-1 z-10 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <RiCheckLine class="size-3" />
              </span>
              <MarketItemThumb :item="stack.item" size="sm" />
              <span class="line-clamp-1 text-[0.625rem] text-muted-foreground">{{ stack.item.name }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium">Message (optional)</label>
          <input
            v-model="message"
            type="text"
            maxlength="280"
            placeholder="Say something to the trader…"
            class="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
        </div>

        <p v-if="errorMessage" class="text-xs text-destructive">{{ errorMessage }}</p>
      </div>

      <SheetFooter>
        <p v-if="cashAmount > 0" class="mb-1 text-xs text-muted-foreground">
          {{ cashPayer === "offerer" ? "You pay" : "You receive" }} {{ formatMoney(cashAmount, post?.currency) }}
        </p>
        <Button :disabled="busy || !hasSomething" @click="submit()">Send offer</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
