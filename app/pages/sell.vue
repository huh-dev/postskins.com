<script setup lang="ts">
import { RiCheckLine, RiLock2Line, RiLoopRightLine, RiSteamFill } from "@remixicon/vue"
import { formatMoney } from "@/lib/format"

const { isAuthenticated, loginWithSteam } = useAuth()
const { items, status, isLoading, load } = useInventory()
const { mine, errorMessage, busy, loadMine, createListing, cancelListing } = useMarket()
const seller = useSeller()

// Draft price (major units) per inventory item id.
const priceDrafts = reactive<Record<number, number>>({})

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
  }, 2000)
}

async function reconnectSteam(): Promise<void> {
  await seller.disconnect()
  await connectSteam()
}

onUnmounted(() => {
  if (connectPoll) {
    clearInterval(connectPoll)
  }
})

const tradableItems = computed(() => items.value.filter(item => item.tradable))
const listedAssetIds = computed(() => new Set(mine.value.filter(l => l.status === "active").map(l => l.market_hash_name)))

async function refresh(): Promise<void> {
  await Promise.all([load(), loadMine()])
}

async function list(itemId: number): Promise<void> {
  const price = priceDrafts[itemId]
  if (price && price > 0) {
    const ok = await createListing(itemId, Math.round(price * 100))
    if (ok) {
      delete priceDrafts[itemId]
    }
  }
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
  <div class="mx-auto min-h-svh w-full max-w-5xl p-4 sm:p-6">
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <h1 class="text-lg font-semibold">Sign in to sell</h1>
      <Button variant="outline" @click="loginWithSteam()">
        <RiSteamFill /> Sign in with Steam
      </Button>
    </div>

    <template v-else>
      <header class="mb-5">
        <h1 class="text-lg font-semibold">Sell</h1>
      </header>

      <!-- Connect Steam for selling -->
      <section v-if="!seller.connected.value" class="mb-6 rounded-lg border border-amber-300 bg-card p-4 dark:border-amber-500/30">
        <h2 class="text-sm font-semibold">Connect your Steam account to sell</h2>
        <p class="mt-0.5 text-xs text-muted-foreground">
          This authorizes Postskins to send the trade offer for you when an item sells — you'll just confirm it on your Steam mobile app. We never see your password.
        </p>

        <div v-if="seller.qrImageSrc.value" class="mt-3 flex flex-col items-center gap-2">
          <img :src="seller.qrImageSrc.value" alt="Steam login QR code" width="200" height="200" class="rounded-md bg-white p-2">
          <p class="text-xs text-muted-foreground">Scan with the Steam mobile app, then tap <strong>Approve</strong>. Waiting…</p>
        </div>
        <Button v-else size="sm" class="mt-3" :disabled="seller.connecting.value" @click="connectSteam()">
          <RiSteamFill /> Connect Steam
        </Button>

        <p v-if="seller.errorMessage.value" class="mt-2 text-xs text-destructive">{{ seller.errorMessage.value }}</p>
      </section>
      <div v-else class="mb-4 flex items-center gap-2">
        <span class="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <RiCheckLine class="size-3.5" /> Steam connected for selling
        </span>
        <Button variant="ghost" size="xs" :disabled="seller.connecting.value" @click="reconnectSteam()">Reconnect</Button>
      </div>

      <p v-if="errorMessage" class="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>

      <!-- Your active listings -->
      <section v-if="mine.length" class="mb-6">
        <h2 class="mb-2 text-sm font-semibold">Your listings</h2>
        <ul class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          <li v-for="listing in mine" :key="listing.id" class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span class="min-w-0 flex-1 truncate">{{ listing.item.name }}</span>
            <span class="font-mono text-xs tabular-nums">{{ formatMoney(listing.price, listing.currency) }}</span>
            <span class="w-16 text-right text-xs capitalize" :class="listing.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'">{{ listing.status }}</span>
            <Button v-if="listing.status === 'active'" variant="ghost" size="xs" :disabled="busy" @click="cancelListing(listing.id)">Cancel</Button>
            <span v-else class="w-[52px]" />
          </li>
        </ul>
      </section>

      <!-- List an item (only once connected for selling) -->
      <template v-if="seller.connected.value">
      <h2 class="mb-2 text-sm font-semibold">List an item</h2>
      <div v-if="isLoading && items.length === 0" class="flex min-h-[30svh] items-center justify-center">
        <RiLoopRightLine class="size-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="status === 'private'" class="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
        Your Steam inventory is private — make it public to list items.
      </div>
      <div v-else-if="tradableItems.length === 0" class="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
        No tradable CS2 items to list.
      </div>
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <div v-for="item in tradableItems" :key="item.id" class="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-3">
            <img v-if="item.icon_url" :src="item.icon_url" :alt="item.market_name ?? item.name ?? 'Item'" loading="lazy" class="max-h-full max-w-full object-contain">
            <span v-else class="text-xs text-muted-foreground">No image</span>
          </div>
          <div class="flex flex-1 flex-col gap-2 border-t border-border p-2.5">
            <p class="truncate text-xs font-medium" :title="item.market_name ?? item.name ?? ''">{{ item.market_name ?? item.name ?? "Unknown item" }}</p>
            <div v-if="listedAssetIds.has(item.market_hash_name ?? '')" class="mt-auto flex items-center gap-1 text-[0.625rem] text-muted-foreground">
              <RiLock2Line class="size-3" /> Already listed
            </div>
            <div v-else class="mt-auto flex items-center gap-1.5">
              <input
                v-model.number="priceDrafts[item.id]"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Price"
                class="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
              <Button size="xs" :disabled="busy || !priceDrafts[item.id]" @click="list(item.id)">List</Button>
            </div>
          </div>
        </div>
      </div>
      </template>
    </template>
  </div>
</template>
