<script setup lang="ts">
import { RiArrowRightLine, RiDownloadLine, RiFlaskLine, RiLock2Line, RiLoopRightLine, RiRefreshLine } from "@remixicon/vue"
import { formatMoney } from "@/lib/format"

const { state, busy, errorMessage, refresh, reset, loadDemo, syncSeller, buy, simulateReceived, simulateReversal } = useTradeLab()

const sellerSteamId = ref("")
const selectedItemId = ref<number | null>(null)
const priceInput = ref<number>(25)

const trade = computed(() => state.value?.trade ?? null)
const listings = computed(() => state.value?.listings ?? [])
const hasActiveTrade = computed(() => !!trade.value && ["pending_delivery", "accepted"].includes(trade.value.status))

const canCreateOffer = computed(() =>
  !hasActiveTrade.value && selectedItemId.value !== null && priceInput.value > 0,
)
const canReceive = computed(() => trade.value?.status === "pending_delivery")
const canReverse = computed(() => trade.value?.status === "accepted")

async function createOffer(): Promise<void> {
  if (selectedItemId.value !== null) {
    await buy(selectedItemId.value, Math.round(priceInput.value * 100))
  }
}

// Drop the selection if the item is no longer in the loaded inventory.
watch(listings, (items) => {
  if (selectedItemId.value !== null && !items.some(item => item.inventory_item_id === selectedItemId.value)) {
    selectedItemId.value = null
  }
})

let timer: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  await refresh()
  // Only poll while a trade is live (to watch delivery/completion/reversal).
  // While idle, polling is off so item selection and inputs stay stable.
  timer = setInterval(() => {
    if (hasActiveTrade.value) {
      refresh()
    }
  }, 2000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-5xl p-4 sm:p-6">
    <header class="mb-6 flex items-start justify-between gap-3">
      <div>
        <h1 class="flex items-center gap-2 text-lg font-semibold">
          <RiFlaskLine class="size-5 text-muted-foreground" />
          Trade lab
        </h1>
        <p class="mt-1 max-w-2xl text-xs text-muted-foreground">
          Load a real Steam account's public inventory as the seller, create an offer from one of its
          items, then simulate the buyer receiving it — and watch the payout lock, release, or reverse.
        </p>
      </div>
      <Button variant="outline" size="sm" :disabled="busy" @click="reset()">
        <RiRefreshLine :class="{ 'animate-spin': busy }" />
        Reset
      </Button>
    </header>

    <p v-if="errorMessage" class="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {{ errorMessage }}
    </p>

    <!-- Parties -->
    <div class="grid gap-3 sm:grid-cols-2">
      <section
        v-for="party in [{ key: 'seller', data: state?.seller, title: 'Seller (real account)' }, { key: 'buyer', data: state?.buyer, title: 'Buyer (simulated)' }]"
        :key="party.key"
        class="rounded-lg border border-border bg-card p-4"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold">{{ party.title }}</h2>
          <span
            v-if="party.data?.suspended"
            class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
            :title="party.data?.suspension_reason ?? undefined"
          >
            Suspended
          </span>
        </div>
        <p class="mt-0.5 truncate text-xs text-muted-foreground">
          {{ party.data ? `${party.data.name} · ${party.data.steam_id}` : "—" }}
        </p>

        <dl class="mt-3 space-y-1.5">
          <div class="flex items-center justify-between">
            <dt class="text-xs text-muted-foreground">Spendable</dt>
            <dd class="font-mono text-sm font-medium tabular-nums">
              {{ formatMoney(party.data?.balance, party.data?.currency) }}
            </dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-xs text-muted-foreground">Locked (in protection)</dt>
            <dd class="font-mono text-sm tabular-nums" :class="party.data?.locked_balance ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'">
              {{ formatMoney(party.data?.locked_balance, party.data?.currency) }}
            </dd>
          </div>
        </dl>
      </section>
    </div>

    <!-- Create the offer -->
    <section class="mt-4 rounded-lg border border-border bg-card p-4">
      <h2 class="text-sm font-semibold">1 · Create the offer</h2>

      <!-- Load seller inventory -->
      <div class="mt-3 flex flex-wrap items-end gap-2">
        <label class="flex flex-col gap-1 text-xs">
          <span class="text-muted-foreground">Seller SteamID64 (public inventory)</span>
          <input
            v-model="sellerSteamId"
            inputmode="numeric"
            placeholder="7656119…"
            class="h-9 w-64 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
        </label>
        <Button variant="outline" size="sm" :disabled="busy || sellerSteamId.length !== 17" @click="syncSeller(sellerSteamId)">
          <RiDownloadLine />
          Load inventory
        </Button>
        <Button variant="secondary" size="sm" :disabled="busy" @click="loadDemo()">
          Load demo inventory
        </Button>
      </div>

      <p v-if="state?.seller_inventory_status === 'private'" class="mt-2 text-xs text-amber-600 dark:text-amber-400">
        That inventory is private — set it to public on Steam, then load again.
      </p>
      <p v-else-if="state?.seller_inventory_status === 'error'" class="mt-2 text-xs text-destructive">
        Couldn't reach Steam for that account. Check the SteamID and your inventory driver.
      </p>

      <!-- Listings -->
      <div v-if="listings.length" class="mt-4">
        <p class="mb-2 text-xs text-muted-foreground">
          Pick an item to sell ({{ listings.length }} loaded<span v-if="selectedItemId"> · 1 selected</span>):
        </p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          <button
            v-for="item in listings"
            :key="item.inventory_item_id"
            type="button"
            class="group relative flex flex-col overflow-hidden rounded-lg border bg-card p-0 text-left transition-colors"
            :class="selectedItemId === item.inventory_item_id ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-ring/60'"
            @click="selectedItemId = item.inventory_item_id"
          >
            <span v-if="!item.tradable" class="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-600 backdrop-blur-sm dark:text-amber-400">
              <RiLock2Line class="size-2.5" /> Locked
            </span>
            <div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-2">
              <img v-if="item.icon_url" :src="item.icon_url" :alt="item.name ?? 'Item'" loading="lazy" class="max-h-full max-w-full object-contain">
              <span v-else class="text-xs text-muted-foreground">No image</span>
            </div>
            <p class="truncate border-t border-border px-2 py-1.5 text-xs font-medium" :title="item.name ?? ''">
              {{ item.name ?? "Unknown item" }}
            </p>
          </button>
        </div>

        <!-- Price + create -->
        <div class="mt-3 flex flex-wrap items-end gap-2">
          <label class="flex flex-col gap-1 text-xs">
            <span class="text-muted-foreground">Price ({{ state?.buyer?.currency ?? "USD" }})</span>
            <input
              v-model.number="priceInput"
              type="number"
              min="0.01"
              step="0.01"
              class="h-9 w-32 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
            >
          </label>
          <Button size="sm" :disabled="busy || !canCreateOffer" @click="createOffer()">
            <RiLoopRightLine v-if="busy" class="animate-spin" />
            Create offer (hold funds)
          </Button>
        </div>
        <p v-if="hasActiveTrade" class="mt-2 text-xs text-amber-600 dark:text-amber-400">
          A trade is already in progress — Reset (top right) to create a new offer.
        </p>
      </div>
      <p v-else-if="state?.seller" class="mt-3 text-xs text-muted-foreground">
        No CS2 items found for that account.
      </p>
    </section>

    <!-- Trade -->
    <section class="mt-4 rounded-lg border border-border bg-card p-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold">2 · Track the trade</h2>
        <TradeStatusBadge v-if="trade" :status="trade.status" />
        <span v-else class="text-xs text-muted-foreground">No trade yet</span>
      </div>

      <template v-if="trade">
        <div class="mt-3 flex items-center gap-3 rounded-md border border-border bg-background/50 p-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ trade.item.name }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ trade.market_hash_name }}</p>
          </div>
          <span class="shrink-0 font-mono text-sm font-semibold tabular-nums">
            {{ formatMoney(trade.price, trade.currency) }}
          </span>
        </div>

        <div v-if="trade.status === 'pending_delivery' && trade.steam_trade_link" class="mt-3 rounded-md border border-dashed border-border p-3 text-xs">
          <p class="text-muted-foreground">The seller opens this link in Steam to deliver the item, then confirms on their mobile authenticator:</p>
          <a :href="trade.steam_trade_link" target="_blank" rel="noopener" class="mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline">
            Open Steam trade offer <RiArrowRightLine class="size-3.5" />
          </a>
        </div>

        <ol v-if="trade.events?.length" class="mt-4 space-y-2 border-t border-border pt-4">
          <li v-for="event in trade.events" :key="event.id" class="flex items-start gap-2.5 text-xs">
            <span class="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
            <div class="flex-1">
              <p class="font-medium">{{ tradeEventLabel(event.type) }}</p>
              <p class="text-muted-foreground">{{ event.created_at ? new Date(event.created_at).toLocaleTimeString() : "" }}</p>
            </div>
          </li>
        </ol>

        <div class="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button size="sm" variant="secondary" :disabled="busy || !canReceive" @click="simulateReceived()">
            Simulate item received
          </Button>
          <Button size="sm" variant="destructive" :disabled="busy || !canReverse" @click="simulateReversal()">
            Simulate reversal
          </Button>
        </div>
      </template>

      <p class="mt-3 text-xs text-muted-foreground">
        <strong>Simulate item received</strong> locks the payout to the seller; wait out the protection
        window to complete it, or <strong>Simulate reversal</strong> to suspend the seller and refund the buyer.
      </p>
    </section>
  </div>
</template>
