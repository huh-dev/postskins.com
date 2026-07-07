<script setup lang="ts">
import { RiCheckLine, RiSteamFill, RiWallet3Line } from "@remixicon/vue"
import { formatMoney } from "@/lib/format"

const { isAuthenticated, user, loginWithSteam, saveTradeUrl } = useAuth()
const { wallet, load: loadWallet, addTestFunds } = useWallet()
const { listings, errorMessage, busy, loadMarket, purchase } = useMarket()

const tradeUrlInput = ref("")
const savingTradeUrl = ref(false)

const hasTradeUrl = computed(() => !!user.value?.trade_url)

async function refresh(): Promise<void> {
  await Promise.all([loadMarket(), loadWallet()])
}

async function onSaveTradeUrl(): Promise<void> {
  savingTradeUrl.value = true
  try {
    await saveTradeUrl(tradeUrlInput.value)
  }
  finally {
    savingTradeUrl.value = false
  }
}

async function buy(id: number): Promise<void> {
  const trade = await purchase(id)
  if (trade) {
    await navigateTo(`/trade/${trade.id}`)
  }
  else {
    await refresh()
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    refresh()
    tradeUrlInput.value = user.value?.trade_url ?? ""
  }
})

watch(isAuthenticated, (authed) => {
  if (authed) {
    refresh()
    tradeUrlInput.value = user.value?.trade_url ?? ""
  }
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-6xl p-4 sm:p-6">
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <h1 class="text-lg font-semibold">Sign in to browse the market</h1>
      <Button variant="outline" @click="loginWithSteam()">
        <RiSteamFill /> Sign in with Steam
      </Button>
    </div>

    <template v-else>
      <header class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-lg font-semibold">Market</h1>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-sm">
            <RiWallet3Line class="size-4 text-muted-foreground" />
            <span class="font-mono font-medium tabular-nums">{{ formatMoney(wallet?.balance, wallet?.currency) }}</span>
          </span>
          <Button variant="secondary" size="sm" @click="addTestFunds()">Add test funds</Button>
        </div>
      </header>

      <!-- Trade URL gate -->
      <section class="mb-5 rounded-lg border border-border bg-card p-4" :class="{ 'border-amber-300 dark:border-amber-500/30': !hasTradeUrl }">
        <h2 class="flex items-center gap-1.5 text-sm font-semibold">
          Your Steam trade URL
          <RiCheckLine v-if="hasTradeUrl" class="size-4 text-emerald-600 dark:text-emerald-400" />
        </h2>
        <p class="mt-0.5 text-xs text-muted-foreground">
          Required so a seller can send you the item. Steam → Inventory → Trade Offers → “Who can send me Trade Offers” → copy your Trade URL.
        </p>
        <div class="mt-2 flex flex-wrap gap-2">
          <input
            v-model="tradeUrlInput"
            placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…&token=…"
            class="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
          <Button size="sm" :disabled="savingTradeUrl || !tradeUrlInput" @click="onSaveTradeUrl()">Save</Button>
        </div>
      </section>

      <p v-if="errorMessage" class="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>

      <!-- Listings -->
      <div v-if="listings.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div v-for="listing in listings" :key="listing.id" class="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-3">
            <img v-if="listing.item.icon_url" :src="listing.item.icon_url" :alt="listing.item.name ?? 'Item'" loading="lazy" class="max-h-full max-w-full object-contain">
            <span v-else class="text-xs text-muted-foreground">No image</span>
          </div>
          <div class="flex flex-1 flex-col gap-2 border-t border-border p-2.5">
            <div class="min-w-0">
              <p class="truncate text-xs font-medium" :title="listing.item.name ?? ''">{{ listing.item.name ?? "Unknown item" }}</p>
              <p class="truncate text-[0.625rem] text-muted-foreground">by {{ listing.seller?.name ?? "—" }}</p>
            </div>
            <div class="mt-auto flex items-center justify-between gap-1">
              <span class="font-mono text-sm font-semibold tabular-nums">{{ formatMoney(listing.price, listing.currency) }}</span>
              <Button size="xs" :disabled="busy || !hasTradeUrl" @click="buy(listing.id)">Buy</Button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex min-h-[40svh] items-center justify-center text-sm text-muted-foreground">
        No items for sale yet — <NuxtLink to="/sell" class="ml-1 text-primary hover:underline">list one</NuxtLink>.
      </div>
    </template>
  </div>
</template>
