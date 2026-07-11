<script setup lang="ts">
import {
  RiArrowDownSLine,
  RiCloseLine,
  RiEqualizerLine,
  RiGlobalLine,
  RiInboxLine,
  RiLink,
  RiLock2Line,
  RiSearchLine,
  RiShieldCheckLine,
  RiSteamFill,
  RiTimeLine,
} from "@remixicon/vue"
import type { InventoryItemStack } from "@/composables/useInventory"
import type { CatalogItem } from "@/composables/useCatalog"
import type { InventorySort } from "@/lib/inventoryFilters"
import { searchInventoryStacks, sortInventoryStacks } from "@/lib/inventoryFilters"
import { formatMoney } from "@/lib/format"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const { isAuthenticated, loginWithSteam } = useAuth()
const { groupedItems, status, isLoading, load } = useInventory()
const { createPost, errorMessage, loading: creating } = usePosts()
const catalog = useCatalog()
const seller = useSeller()

const connectSheetOpen = ref(false)

// Inventory filters (mirrors the old inventory page: search + sort).
const search = ref("")
const sort = ref<InventorySort>("rarity")

// The offering side: selected inventory items keyed by id.
const offering = ref<Map<number, InventoryItemStack>>(new Map())
// The wanting side: catalog items the user wants back.
const wanting = ref<CatalogItem[]>([])
const wantsAnything = ref(false)
const offerCashInput = ref("")
const wantCashInput = ref("")
const note = ref("")
const catalogQuery = ref("")

// Post options. Static for now — surfaced in the UI but not yet sent to the API.
type Visibility = "public" | "unlisted" | "private"
const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", icon: RiGlobalLine, hint: "Shown in the market feed for everyone." },
  { value: "unlisted", label: "Unlisted", icon: RiLink, hint: "Hidden from the feed — only people with the link can see it." },
  { value: "private", label: "Private", icon: RiLock2Line, hint: "Only you can see it. Share offers manually." },
] as const satisfies ReadonlyArray<{ value: Visibility, label: string, icon: unknown, hint: string }>

const EXPIRY_OPTIONS = [
  { value: "1d", label: "24 hours" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "never", label: "No expiry" },
] as const

const visibility = ref<Visibility>("public")
const expiry = ref<(typeof EXPIRY_OPTIONS)[number]["value"]>("7d")
const acceptPartial = ref(true)
const notifyOnOffer = ref(true)
const showAdvanced = ref(false)

const activeVisibility = computed(() => VISIBILITY_OPTIONS.find(option => option.value === visibility.value)!)

let connectPoll: ReturnType<typeof setInterval> | undefined
let catalogTimer: ReturnType<typeof setTimeout> | undefined

/** The inventory grid: all stacks, searched and sorted. */
const visibleStacks = computed(() =>
  sortInventoryStacks(searchInventoryStacks(groupedItems.value, search.value), sort.value),
)

const hasNoMatches = computed(() =>
  status.value === "success" && groupedItems.value.length > 0 && visibleStacks.value.length === 0,
)

function clearFilters(): void {
  search.value = ""
}

function clearOffering(): void {
  offering.value = new Map()
}

function firstTradableId(stack: InventoryItemStack): number | null {
  return stack.items.find(entry => entry.tradable)?.id ?? null
}

function toggleOffering(stack: InventoryItemStack): void {
  const id = firstTradableId(stack)
  if (id === null) return
  const next = new Map(offering.value)
  next.has(id) ? next.delete(id) : next.set(id, stack)
  offering.value = next
}

function isSelected(stack: InventoryItemStack): boolean {
  const id = firstTradableId(stack)
  return id !== null && offering.value.has(id)
}

watch(catalogQuery, () => {
  clearTimeout(catalogTimer)
  catalogTimer = setTimeout(() => catalog.search(catalogQuery.value), 250)
})

function addWanted(item: CatalogItem): void {
  if (!wanting.value.some(w => w.item_description_id === item.item_description_id)) {
    wanting.value = [...wanting.value, item]
  }
  catalogQuery.value = ""
  catalog.results.value = []
}

function removeWanted(id: number): void {
  wanting.value = wanting.value.filter(w => w.item_description_id !== id)
}

const offerCash = computed(() => Math.round((Number.parseFloat(offerCashInput.value) || 0) * 100))
const wantCash = computed(() => Math.round((Number.parseFloat(wantCashInput.value) || 0) * 100))

const canSubmit = computed(() =>
  (offering.value.size > 0 || offerCash.value > 0)
  && (wanting.value.length > 0 || wantsAnything.value || wantCash.value > 0),
)

async function connectSteam(): Promise<void> {
  const id = await seller.startConnect()
  if (!id) return
  connectPoll = setInterval(async () => {
    const s = await seller.checkConnect(id)
    if (s !== "pending") clearInterval(connectPoll)
    if (s === "connected") connectSheetOpen.value = false
  }, 2000)
}

async function submit(): Promise<void> {
  if (!seller.connected.value) {
    connectSheetOpen.value = true
    return
  }
  if (!canSubmit.value) return

  const post = await createPost({
    offering: [...offering.value.keys()].map(id => ({ inventory_item_id: id })),
    wanting: wanting.value.map(w => ({ item_description_id: w.item_description_id })),
    offer_cash: offerCash.value,
    want_cash: wantCash.value,
    wants_anything: wantsAnything.value,
    note: note.value.trim() || null,
  })

  if (post) {
    await navigateTo(`/post/${post.id}`)
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    load()
    seller.loadStatus()
  }
})

watch(isAuthenticated, (authed) => {
  if (authed) {
    load()
    seller.loadStatus()
  }
})

onUnmounted(() => {
  if (connectPoll) clearInterval(connectPoll)
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-6xl p-4 sm:p-6">
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <h1 class="text-lg font-semibold">Create a trade post</h1>
      <Button variant="outline" @click="loginWithSteam()">
        <RiSteamFill /> Sign in with Steam
      </Button>
    </div>

    <template v-else>
      <header class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold">New trade post</h1>
          <p class="text-xs text-muted-foreground">Pick what you'll give, then say what you want in return.</p>
        </div>
        <div
          v-if="seller.connected.value"
          class="flex h-8 items-center gap-1.5 rounded-md bg-sidebar-accent/40 px-2.5 text-[0.6875rem] text-muted-foreground"
        >
          <span class="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Steam connected
        </div>
        <Button v-else size="sm" @click="connectSheetOpen = true">
          <RiSteamFill /> Connect Steam
        </Button>
      </header>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
        <!-- Offering: inventory picker -->
        <section class="min-w-0 flex-1">
          <div class="mb-3 flex items-center gap-2">
            <InventoryFilterBar
              class="min-w-0 flex-1"
              v-model:search="search"
              v-model:sort="sort"
            />
            <span
              v-if="offering.size"
              class="inline-flex shrink-0 items-center rounded-full bg-primary/15 px-2 py-0.5 text-[0.625rem] font-semibold text-primary"
            >
              {{ offering.size }} selected
            </span>
            <button
              v-if="offering.size"
              type="button"
              class="shrink-0 text-[0.6875rem] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
              @click="clearOffering"
            >
              Clear
            </button>
          </div>

          <div v-if="isLoading" class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <div v-for="n in 12" :key="n" class="aspect-[3/4] animate-pulse rounded-lg bg-sidebar-accent/50" />
          </div>
          <div v-else-if="status === 'private'" class="surface-panel flex flex-col items-center gap-2 rounded-lg px-4 py-12 text-center">
            <RiLock2Line class="size-8 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">Your Steam inventory is private. Make it public, then reload.</p>
          </div>
          <div v-else-if="!groupedItems.length" class="surface-panel flex flex-col items-center gap-2 rounded-lg px-4 py-12 text-center">
            <RiInboxLine class="size-8 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">No CS2 items found in this inventory.</p>
          </div>
          <div v-else-if="hasNoMatches" class="surface-panel flex flex-col items-center gap-3 rounded-lg px-4 py-12 text-center">
            <RiSearchLine class="size-8 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">No items match your filters.</p>
            <Button variant="outline" size="sm" @click="clearFilters">Clear filters</Button>
          </div>
          <div v-else class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <InventoryItemCard
              v-for="stack in visibleStacks"
              :key="stack.key"
              :stack="stack"
              :selected="isSelected(stack)"
              @toggle="toggleOffering"
            />
          </div>
        </section>

        <!-- Wanting: terms. Sticky so it stays in view while the grid scrolls. -->
        <aside class="lg:sticky lg:top-16 lg:w-80 lg:shrink-0">
          <div class="surface-panel flex max-h-[calc(100svh-5rem)] flex-col rounded-lg">
            <header class="border-b border-border/60 px-4 py-3">
              <h2 class="text-sm font-semibold">You want</h2>
              <p class="mt-0.5 text-[0.6875rem] text-muted-foreground">Set your terms, then post to the market.</p>
            </header>

            <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
              <!-- Wanted items -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted-foreground">Specific items</label>
                <div class="relative">
                  <RiSearchLine class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    v-model="catalogQuery"
                    type="search"
                    placeholder="Search the catalog…"
                    class="h-9 w-full rounded-md border border-border bg-background pl-8 pr-2.5 text-xs outline-none transition-colors focus:border-ring [&::-webkit-search-cancel-button]:appearance-none"
                  >
                  <ul v-if="catalog.results.value.length" class="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg">
                    <li v-for="item in catalog.results.value" :key="item.item_description_id">
                      <button type="button" class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted" @click="addWanted(item)">
                        <MarketItemThumb :item="item" size="sm" />
                        <span class="line-clamp-2">{{ item.market_hash_name }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
                <div v-if="wanting.length" class="mt-2 flex flex-wrap gap-1.5">
                  <span v-for="w in wanting" :key="w.item_description_id" class="inline-flex items-center gap-1 rounded-md bg-sidebar-accent/60 py-1 pl-2 pr-1 text-[0.625rem]">
                    {{ w.name ?? w.market_hash_name }}
                    <button type="button" class="rounded text-muted-foreground transition-colors hover:text-foreground" aria-label="Remove" @click="removeWanted(w.item_description_id)"><RiCloseLine class="size-3" /></button>
                  </span>
                </div>
              </div>

              <label class="flex cursor-pointer items-center gap-2 text-xs">
                <input v-model="wantsAnything" type="checkbox" class="size-3.5 rounded border-border accent-primary">
                Open to any offer
              </label>

              <!-- Cash -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-muted-foreground">Cash you want</label>
                  <input v-model="wantCashInput" type="number" min="0" step="0.01" placeholder="0.00" class="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs tabular-nums outline-none transition-colors focus:border-ring">
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-muted-foreground">Cash you add</label>
                  <input v-model="offerCashInput" type="number" min="0" step="0.01" placeholder="0.00" class="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs tabular-nums outline-none transition-colors focus:border-ring">
                </div>
              </div>

              <div class="border-t border-border/60" />

              <!-- Listing visibility (static for now) -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted-foreground">Visibility</label>
                <div class="grid grid-cols-3 gap-1 rounded-lg bg-sidebar-accent/40 p-1">
                  <button
                    v-for="option in VISIBILITY_OPTIONS"
                    :key="option.value"
                    type="button"
                    class="flex flex-col items-center gap-1 rounded-md py-2 text-[0.625rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    :class="visibility === option.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'"
                    :aria-pressed="visibility === option.value"
                    @click="visibility = option.value"
                  >
                    <component :is="option.icon" class="size-4" />
                    {{ option.label }}
                  </button>
                </div>
                <p class="mt-1.5 text-[0.625rem] leading-snug text-muted-foreground">{{ activeVisibility.hint }}</p>
              </div>

              <!-- Advanced options (static for now) -->
              <div class="rounded-lg border border-border/60">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-sidebar-accent/30"
                  :aria-expanded="showAdvanced"
                  @click="showAdvanced = !showAdvanced"
                >
                  <RiEqualizerLine class="size-3.5 text-muted-foreground" />
                  More options
                  <RiArrowDownSLine class="ml-auto size-4 text-muted-foreground transition-transform" :class="showAdvanced ? 'rotate-180' : ''" />
                </button>

                <div v-show="showAdvanced" class="space-y-3 border-t border-border/60 px-3 py-3">
                  <div>
                    <label class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <RiTimeLine class="size-3.5" /> Expires after
                    </label>
                    <div class="grid grid-cols-2 gap-1">
                      <button
                        v-for="option in EXPIRY_OPTIONS"
                        :key="option.value"
                        type="button"
                        class="h-8 rounded-md border text-[0.6875rem] font-medium transition-colors"
                        :class="expiry === option.value
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/60 text-muted-foreground hover:text-foreground'"
                        @click="expiry = option.value"
                      >
                        {{ option.label }}
                      </button>
                    </div>
                  </div>

                  <label class="flex cursor-pointer items-start justify-between gap-3 text-xs">
                    <span>
                      Accept partial offers
                      <span class="mt-0.5 block text-[0.625rem] text-muted-foreground">Let buyers offer some of what you want.</span>
                    </span>
                    <input v-model="acceptPartial" type="checkbox" class="mt-0.5 size-3.5 shrink-0 rounded border-border accent-primary">
                  </label>

                  <label class="flex cursor-pointer items-start justify-between gap-3 text-xs">
                    <span>
                      Notify me on new offers
                      <span class="mt-0.5 block text-[0.625rem] text-muted-foreground">Get a heads-up when someone responds.</span>
                    </span>
                    <input v-model="notifyOnOffer" type="checkbox" class="mt-0.5 size-3.5 shrink-0 rounded border-border accent-primary">
                  </label>
                </div>
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted-foreground">Note (optional)</label>
                <input v-model="note" type="text" maxlength="280" placeholder="Anything to add…" class="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-none transition-colors focus:border-ring">
              </div>
            </div>

            <!-- Sticky action footer -->
            <footer class="border-t border-border/60 px-4 py-3">
              <p v-if="errorMessage" class="mb-2 text-xs text-destructive">{{ errorMessage }}</p>
              <Button class="w-full" :disabled="creating || !canSubmit" @click="submit()">
                {{ seller.connected.value ? "Create post" : "Connect Steam & post" }}
              </Button>
              <p v-if="offerCash > 0 || wantCash > 0" class="mt-2 text-center text-[0.625rem] text-muted-foreground">
                <template v-if="wantCash > 0">You receive up to {{ formatMoney(wantCash) }}. </template>
                <template v-if="offerCash > 0">You add up to {{ formatMoney(offerCash) }}.</template>
              </p>
            </footer>
          </div>
        </aside>
      </div>
    </template>

    <!-- Connect Steam -->
    <Sheet v-model:open="connectSheetOpen">
      <SheetContent side="right" class="gap-0">
        <SheetHeader>
          <SheetTitle class="flex items-center gap-1.5">
            <RiShieldCheckLine class="size-4 text-muted-foreground" /> Connect Steam
          </SheetTitle>
          <SheetDescription>
            This lets Postskins send the trade offer for you when you accept — you approve it in your Steam mobile app.
          </SheetDescription>
        </SheetHeader>
        <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div v-if="seller.qrImageSrc.value" class="flex flex-col items-center gap-3">
            <img :src="seller.qrImageSrc.value" alt="Steam login QR" width="200" height="200" class="rounded-md bg-white p-2">
            <p class="flex items-center gap-2 text-xs text-muted-foreground">
              <span class="size-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
              Scan with the Steam app, then <strong class="font-medium text-foreground">Approve</strong>
            </p>
          </div>
          <Button v-else size="lg" :disabled="seller.connecting.value" @click="connectSteam()">
            <RiSteamFill /> Show QR code
          </Button>
          <p v-if="seller.errorMessage.value" class="text-xs text-destructive">{{ seller.errorMessage.value }}</p>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

<style scoped>
.item-grid { display: grid; }
</style>
