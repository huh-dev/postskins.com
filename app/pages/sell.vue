<script setup lang="ts">
import {
  RiErrorWarningLine,
  RiEyeOffLine,
  RiInboxLine,
  RiLoopRightLine,
  RiPriceTag3Line,
  RiSearchLine,
  RiShieldCheckLine,
  RiSteamFill,
} from "@remixicon/vue"
import type { InventoryItemStack } from "@/composables/useInventory"
import { stackHasTradableItem } from "@/composables/useInventory"
import { type InventorySort, searchInventoryStacks, sortInventoryStacks } from "@/lib/inventoryFilters"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const { isAuthenticated, loginWithSteam } = useAuth()
const { items, groupedItems, totalCount, status, isLoading, errorMessage: inventoryError, load } = useInventory()
const { mine, errorMessage, busy, loadMine, createListing, cancelListing } = useMarket()
const seller = useSeller()

/** The stack whose price sheet is open, if any. */
const sellingStack = ref<InventoryItemStack | null>(null)
const priceSheetOpen = ref(false)
const connectSheetOpen = ref(false)
const listingsSheetOpen = ref(false)

const search = ref("")
const sort = ref<InventorySort>("rarity")
const hideLocked = ref(false)

let connectPoll: ReturnType<typeof setInterval> | undefined

async function connectSteam(): Promise<void> {
  const id = await seller.startConnect()
  if (!id) {
    return
  }
  connectPoll = setInterval(async () => {
    const status = await seller.checkConnect(id)
    if (status !== "pending") {
      clearInterval(connectPoll)
    }
    if (status === "connected") {
      connectSheetOpen.value = false
    }
  }, 2000)
}

async function reconnectSteam(): Promise<void> {
  connectSheetOpen.value = true
  await seller.disconnect()
  await connectSteam()
}

onUnmounted(() => {
  if (connectPoll) {
    clearInterval(connectPoll)
  }
})

/** Market hash names that already have an active listing. */
const listedNames = computed(() =>
  new Set(mine.value.filter(listing => listing.status === "active").map(listing => listing.market_hash_name)),
)

const isStackListed = (stack: InventoryItemStack): boolean =>
  listedNames.value.has(stack.item.market_hash_name ?? "")

const activeListingCount = computed(() => mine.value.filter(listing => listing.status === "active").length)

const visibleStacks = computed(() => {
  const stacks = hideLocked.value ? groupedItems.value.filter(stackHasTradableItem) : groupedItems.value

  return sortInventoryStacks(searchInventoryStacks(stacks, search.value), sort.value)
})

const hasNoMatches = computed(() =>
  status.value === "success" && items.value.length > 0 && visibleStacks.value.length === 0,
)

/**
 * Selling requires an authorized Steam session, so an unconnected seller is
 * walked through the connect flow instead of being shown a dead button.
 */
function openSell(stack: InventoryItemStack): void {
  if (!seller.connected.value) {
    connectSheetOpen.value = true
    return
  }

  sellingStack.value = stack
  priceSheetOpen.value = true
}

/**
 * List the first tradable entry in the stack. Locked duplicates stay untouched.
 */
async function submitListing(price: number): Promise<void> {
  const stack = sellingStack.value

  if (!stack) {
    return
  }

  const tradable = stack.items.find(entry => entry.tradable)
  if (!tradable) {
    return
  }

  const listed = await createListing(tradable.id, Math.round(price * 100))
  if (listed) {
    priceSheetOpen.value = false
  }
}

async function refresh(): Promise<void> {
  await Promise.all([load(), loadMine()])
}

onMounted(() => {
  if (isAuthenticated.value) {
    refresh()
    seller.loadStatus()
  }
})

watch(isAuthenticated, (authed) => {
  if (authed) {
    refresh()
    seller.loadStatus()
  }
})
</script>

<template>
  <div class="flex h-[calc(100svh-3.5rem)] w-full flex-col overflow-hidden px-3 pt-3 sm:px-4">
    <div v-if="!isAuthenticated" class="flex flex-1 items-center justify-center text-center">
      <div class="surface-panel flex max-w-sm flex-col items-center gap-4 rounded-lg px-6 py-8">
        <RiSteamFill class="size-10 text-muted-foreground" />
        <div>
          <h1 class="text-sm font-semibold text-foreground">Sell your skins</h1>
          <p class="mt-1 text-xs text-muted-foreground">Sign in with Steam to pick the items you want to list.</p>
        </div>
        <Button variant="outline" size="sm" @click="loginWithSteam()">
          <RiSteamFill />
          Sign in with Steam
        </Button>
      </div>
    </div>

    <template v-else>
      <!--
        Page chrome stays fixed: title, Steam status and filters never scroll
        away from the grid they control.
      -->
      <header class="flex shrink-0 flex-col gap-2 pb-2.5">
        <div class="flex items-center gap-2">
          <h1 class="text-sm font-semibold text-foreground">Sell</h1>
          <span v-if="totalCount" class="text-[0.6875rem] tabular-nums text-muted-foreground">
            {{ totalCount }} items
          </span>

          <div class="ml-auto flex items-center gap-1.5">
            <!-- Connected is a quiet status, not a banner. -->
            <div
              v-if="seller.connected.value"
              class="flex h-8 items-center gap-1.5 rounded-md bg-sidebar-accent/40 pl-2.5 pr-1"
            >
              <span class="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153/0.7)]" aria-hidden="true" />
              <span class="hidden text-[0.6875rem] text-muted-foreground sm:inline">Steam connected</span>
              <Button
                variant="ghost"
                size="icon-xs"
                title="Reconnect Steam"
                aria-label="Reconnect Steam"
                :disabled="seller.connecting.value"
                @click="reconnectSteam()"
              >
                <RiLoopRightLine />
              </Button>
            </div>
            <Button v-else size="sm" @click="connectSheetOpen = true">
              <RiSteamFill /> Connect Steam
            </Button>

            <!-- The rail is always visible on xl; below that it opens on demand. -->
            <Button variant="outline" size="sm" class="xl:hidden" @click="listingsSheetOpen = true">
              <RiPriceTag3Line />
              Listings
              <span v-if="activeListingCount" class="ml-0.5 rounded bg-primary/20 px-1 tabular-nums">{{ activeListingCount }}</span>
            </Button>
          </div>
        </div>

        <InventoryFilterBar
          v-model:search="search"
          v-model:sort="sort"
          v-model:hide-locked="hideLocked"
        />

        <p
          v-if="!seller.connected.value"
          class="rounded-md border border-amber-500/25 bg-amber-500/[0.07] px-2.5 py-1.5 text-[0.6875rem] leading-relaxed text-amber-200/90"
        >
          Connect your Steam account to start listing — you approve each sale from your Steam mobile app.
        </p>

        <p v-if="errorMessage" class="rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
          {{ errorMessage }}
        </p>
      </header>

      <div class="flex min-h-0 flex-1 gap-3">
        <div class="inventory-scroll min-h-0 flex-1 overflow-y-auto pb-4">
          <div v-if="status === 'private'" class="surface-panel flex min-h-[50svh] flex-col items-center justify-center gap-4 rounded-lg px-4 py-10 text-center">
            <RiEyeOffLine class="size-10 text-muted-foreground" />
            <div class="max-w-md">
              <h3 class="text-sm font-semibold text-foreground">Your inventory is private</h3>
              <p class="mt-1 text-xs text-muted-foreground">
                Steam hides private inventories from everyone. Set your inventory privacy to
                <strong class="font-medium text-foreground">Public</strong>, then reload.
              </p>
            </div>
            <div class="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" as="a" href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener">
                Open Steam privacy settings
              </Button>
              <Button size="sm" @click="load({ fresh: true })">I've made it public</Button>
            </div>
          </div>

          <div v-else-if="status === 'error'" class="surface-panel flex min-h-[50svh] flex-col items-center justify-center gap-4 rounded-lg px-4 py-10 text-center">
            <RiErrorWarningLine class="size-10 text-destructive" />
            <p class="max-w-md text-xs text-muted-foreground">{{ inventoryError }}</p>
            <Button variant="outline" size="sm" @click="load({ fresh: true })">Try again</Button>
          </div>

          <div v-else-if="isLoading && items.length === 0" class="item-grid">
            <div v-for="n in 24" :key="n" class="surface-panel animate-pulse overflow-hidden rounded-lg border-0">
              <div class="space-y-1.5 px-2.5 pt-2">
                <div class="h-2.5 w-4/5 rounded bg-sidebar-accent" />
                <div class="h-2 w-2/5 rounded bg-sidebar-accent/70" />
              </div>
              <div class="mx-2.5 mt-1.5 aspect-[4/3] rounded-md bg-sidebar-accent/50" />
              <div class="space-y-1.5 px-2.5 py-2">
                <div class="h-0.5 w-full rounded bg-sidebar-accent/70" />
                <div class="h-2 w-3/5 rounded bg-sidebar-accent/70" />
              </div>
            </div>
          </div>

          <div v-else-if="status === 'success' && items.length === 0" class="surface-panel flex min-h-[50svh] flex-col items-center justify-center gap-3 rounded-lg px-4 py-10 text-center">
            <RiInboxLine class="size-10 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">No CS2 items found in this inventory.</p>
          </div>

          <div v-else-if="hasNoMatches" class="surface-panel flex min-h-[50svh] flex-col items-center justify-center gap-3 rounded-lg px-4 py-10 text-center">
            <RiSearchLine class="size-8 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">No items match your filters.</p>
            <Button variant="outline" size="sm" @click="search = ''; hideLocked = false">Clear filters</Button>
          </div>

          <div v-else class="item-grid">
            <InventoryItemCard
              v-for="stack in visibleStacks"
              :key="stack.key"
              :stack="stack"
              :listed="isStackListed(stack)"
              @sell="openSell"
            />
          </div>
        </div>

        <aside class="hidden min-h-0 w-64 shrink-0 xl:flex xl:flex-col">
          <SellListingsPanel :listings="mine" :busy="busy" @cancel="cancelListing" />
        </aside>
      </div>
    </template>

    <!-- Listings rail, on screens too narrow to keep it alongside the grid -->
    <Sheet v-model:open="listingsSheetOpen">
      <SheetContent side="right" class="gap-0">
        <SheetHeader>
          <SheetTitle>Your listings</SheetTitle>
          <SheetDescription>Items you have up for sale right now.</SheetDescription>
        </SheetHeader>
        <div class="min-h-0 flex-1 overflow-hidden px-4 pb-4">
          <SellListingsPanel :listings="mine" :busy="busy" @cancel="cancelListing" />
        </div>
      </SheetContent>
    </Sheet>

    <!-- Authorize the trade service to send offers on the seller's behalf -->
    <Sheet v-model:open="connectSheetOpen">
      <SheetContent side="right" class="gap-0">
        <SheetHeader>
          <SheetTitle class="flex items-center gap-1.5">
            <RiShieldCheckLine class="size-4 text-muted-foreground" />
            Connect Steam to sell
          </SheetTitle>
          <SheetDescription>
            This lets Postskins create the trade offer for you when an item sells — you approve it in your Steam
            mobile app, and the skin goes straight to the buyer. We never see your password.
          </SheetDescription>
        </SheetHeader>

        <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div v-if="seller.qrImageSrc.value" class="flex flex-col items-center gap-3">
            <img :src="seller.qrImageSrc.value" alt="Steam login QR code" width="200" height="200" class="rounded-md bg-white p-2">
            <p class="flex items-center gap-2 text-xs text-muted-foreground">
              <span class="size-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
              Scan with the Steam mobile app, then tap <strong class="font-medium text-foreground">Approve</strong>
            </p>
          </div>
          <Button v-else size="lg" :disabled="seller.connecting.value" @click="connectSteam()">
            <RiSteamFill /> Show QR code
          </Button>

          <p v-if="seller.errorMessage.value" class="text-xs text-destructive">{{ seller.errorMessage.value }}</p>

          <p class="mt-auto pb-4 text-xs text-muted-foreground">
            <NuxtLink to="/support" class="text-foreground underline underline-offset-2">How it stays safe</NuxtLink>
          </p>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Price entry for the selected item -->
    <SellPriceSheet
      v-model:open="priceSheetOpen"
      :stack="sellingStack"
      :busy="busy"
      @submit="submitListing"
    />
  </div>
</template>

<style scoped>
/*
  Uniform, aligned grid — cards share a row height so the Sell buttons line up.
  Tight gutters keep the inventory dense without touching.
*/
.item-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 0.375rem;
}

@media (min-width: 640px) {
  .item-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .item-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .item-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .item-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 1536px) {
  .item-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
