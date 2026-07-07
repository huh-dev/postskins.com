<script setup lang="ts">
import { RiArrowRightLine, RiErrorWarningLine, RiLoopRightLine, RiShieldCheckLine, RiSteamFill } from "@remixicon/vue"
import { formatMoney } from "@/lib/format"

const route = useRoute()
const { isAuthenticated, loginWithSteam, user } = useAuth()
const { trade, status, isLoading, isActive, errorMessage, load } = useTrade(() => route.params.id as string)

const isSeller = computed(() => !!user.value && trade.value?.seller?.id === user.value.id)

let timer: ReturnType<typeof setInterval> | undefined
let clock: ReturnType<typeof setInterval> | undefined

// Ticks every second so the countdown stays live between the 2s data polls.
const now = ref(Date.now())

function startPolling(): void {
  stopPolling()
  timer = setInterval(() => {
    if (isActive.value) {
      load()
    }
  }, 2000)
}

function stopPolling(): void {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

const refreshing = ref(false)

async function refresh(): Promise<void> {
  refreshing.value = true
  try {
    await load()
  }
  finally {
    refreshing.value = false
  }
}

onMounted(() => {
  clock = setInterval(() => (now.value = Date.now()), 1000)
  if (isAuthenticated.value) {
    load().then(startPolling)
  }
})

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    load().then(startPolling)
  }
})

onUnmounted(() => {
  stopPolling()
  if (clock) {
    clearInterval(clock)
  }
})

/** Live remaining time in the protection window, or null if not applicable. */
const protectionRemainingMs = computed(() => {
  if (!trade.value?.protection_expires_at) {
    return null
  }
  return new Date(trade.value.protection_expires_at).getTime() - now.value
})

/** Formatted ticking countdown, e.g. "6d 23h 04m" or "00:59". */
const protectionCountdown = computed(() => {
  const ms = protectionRemainingMs.value
  if (ms === null) {
    return null
  }
  if (ms <= 0) {
    return "releasing…"
  }

  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86_400)
  const hours = Math.floor((total % 86_400) / 3_600)
  const mins = Math.floor((total % 3_600) / 60)
  const secs = total % 60
  const pad = (n: number): string => String(n).padStart(2, "0")

  if (days >= 1) {
    return `${days}d ${pad(hours)}h ${pad(mins)}m`
  }
  if (hours >= 1) {
    return `${hours}:${pad(mins)}:${pad(secs)}`
  }
  return `${pad(mins)}:${pad(secs)}`
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-2xl p-4 sm:p-6">
    <!-- Signed-out gate -->
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <div>
        <h1 class="text-lg font-semibold">Sign in to view this trade</h1>
        <p class="mt-1 text-sm text-muted-foreground">You must be a party to the trade to see it.</p>
      </div>
      <Button variant="outline" @click="loginWithSteam()">
        <RiSteamFill />
        Sign in with Steam
      </Button>
    </div>

    <template v-else>
      <!-- Loading -->
      <div v-if="isLoading" class="flex min-h-[50svh] items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>

      <!-- Error / not found -->
      <div v-else-if="status === 'error'" class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">
        <RiErrorWarningLine class="size-10 text-destructive" />
        <p class="max-w-md text-sm text-muted-foreground">{{ errorMessage }}</p>
        <Button variant="outline" size="sm" @click="load()">Try again</Button>
      </div>

      <!-- Trade -->
      <div v-else-if="trade" class="space-y-4">
        <header class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-lg font-semibold">Trade #{{ trade.id }}</h1>
            <p class="text-xs text-muted-foreground">
              {{ trade.buyer?.name }} buying from {{ trade.seller?.name }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <TradeStatusBadge :status="trade.status" />
            <Button variant="outline" size="icon-sm" :disabled="refreshing" title="Refresh now" @click="refresh()">
              <RiLoopRightLine :class="{ 'animate-spin': refreshing }" />
            </Button>
          </div>
        </header>

        <!-- Item -->
        <div class="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
          <div class="flex size-20 shrink-0 items-center justify-center rounded-md bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-2">
            <img v-if="trade.item.icon_url" :src="trade.item.icon_url" :alt="trade.item.name ?? 'Item'" class="max-h-full max-w-full object-contain">
            <span v-else class="text-xs text-muted-foreground">No image</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ trade.item.name }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ trade.market_hash_name }}</p>
          </div>
          <span class="shrink-0 font-mono text-base font-semibold tabular-nums">
            {{ formatMoney(trade.price, trade.currency) }}
          </span>
        </div>

        <!-- Protection window (live countdown) -->
        <div v-if="trade.status === 'accepted'" class="flex items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
          <div class="flex items-center gap-2">
            <RiShieldCheckLine class="size-4 shrink-0" />
            <span>Protected — the seller is paid once this passes with no reversal.</span>
          </div>
          <span class="shrink-0 font-mono text-base font-semibold tabular-nums">{{ protectionCountdown }}</span>
        </div>

        <!-- Delivery: the seller sends the item; the buyer only waits. -->
        <div v-if="trade.status === 'pending_delivery'" class="rounded-lg border border-dashed border-border p-4 text-sm">
          <template v-if="isSeller">
            <p class="font-medium">Send the item to complete the sale</p>
            <p class="mt-0.5 text-muted-foreground">
              The offer is sent for you with the item already attached — just confirm the outgoing offer on your Steam mobile authenticator.
            </p>
            <a
              v-if="trade.steam_trade_link"
              :href="trade.steam_trade_link"
              target="_blank"
              rel="noopener"
              class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Fallback: send manually in Steam <RiArrowRightLine class="size-3.5" />
            </a>
          </template>
          <template v-else>
            <p class="text-muted-foreground">
              Waiting for the seller to send the trade offer. It will arrive in your Steam inbox — you don't need to open or create anything.
            </p>
          </template>
        </div>

        <!-- Timeline -->
        <section v-if="trade.events?.length" class="rounded-lg border border-border bg-card p-4">
          <h2 class="mb-3 text-sm font-semibold">History</h2>
          <ol class="space-y-2.5">
            <li v-for="event in trade.events" :key="event.id" class="flex items-start gap-2.5 text-xs">
              <span class="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              <div class="flex-1">
                <p class="font-medium">{{ tradeEventLabel(event.type) }}</p>
                <p class="text-muted-foreground">{{ event.created_at ? new Date(event.created_at).toLocaleString() : "" }}</p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </div>
</template>
