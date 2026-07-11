<script setup lang="ts">
import { RiArrowRightLine, RiErrorWarningLine, RiLoopRightLine, RiShieldCheckLine, RiSteamFill } from "@remixicon/vue"
import { legsGivenBy } from "@/composables/useTrade"
import { formatMoney } from "@/lib/format"

const route = useRoute()
const { isAuthenticated, loginWithSteam, user } = useAuth()
const { trade, status, isLoading, isActive, errorMessage, load } = useTrade(() => route.params.id as string)

// The initiator is the party that sends the Steam offer.
const isInitiator = computed(() => !!user.value && trade.value?.initiator?.id === user.value.id)

const myLegs = computed(() => (trade.value ? legsGivenBy(trade.value, user.value?.id) : []))
const theirLegs = computed(() =>
  trade.value ? trade.value.items.filter(leg => leg.giver_id !== user.value?.id) : [],
)

// Cash relative to the signed-in user: positive = they receive, negative = they pay.
const cashLabel = computed(() => {
  const t = trade.value
  if (!t || t.cash_amount <= 0) return null
  if (t.cash_payee_id === user.value?.id) return `+${formatMoney(t.cash_amount, t.currency)}`
  if (t.cash_payer_id === user.value?.id) return `-${formatMoney(t.cash_amount, t.currency)}`
  return formatMoney(t.cash_amount, t.currency)
})

let timer: ReturnType<typeof setInterval> | undefined
let clock: ReturnType<typeof setInterval> | undefined
const now = ref(Date.now())

function startPolling(): void {
  stopPolling()
  timer = setInterval(() => {
    if (isActive.value) load()
  }, 2000)
}
function stopPolling(): void {
  if (timer) { clearInterval(timer); timer = undefined }
}

const refreshing = ref(false)
async function refresh(): Promise<void> {
  refreshing.value = true
  try { await load() }
  finally { refreshing.value = false }
}

onMounted(() => {
  clock = setInterval(() => (now.value = Date.now()), 1000)
  if (isAuthenticated.value) load().then(startPolling)
})

watch(isAuthenticated, (authenticated) => {
  if (authenticated) load().then(startPolling)
})

onUnmounted(() => {
  stopPolling()
  if (clock) clearInterval(clock)
})

const protectionRemainingMs = computed(() => {
  if (!trade.value?.protection_expires_at) return null
  return new Date(trade.value.protection_expires_at).getTime() - now.value
})

const protectionCountdown = computed(() => {
  const ms = protectionRemainingMs.value
  if (ms === null) return null
  if (ms <= 0) return "releasing…"

  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86_400)
  const hours = Math.floor((total % 86_400) / 3_600)
  const mins = Math.floor((total % 3_600) / 60)
  const secs = total % 60
  const pad = (n: number): string => String(n).padStart(2, "0")

  if (days >= 1) return `${days}d ${pad(hours)}h ${pad(mins)}m`
  if (hours >= 1) return `${hours}:${pad(mins)}:${pad(secs)}`
  return `${pad(mins)}:${pad(secs)}`
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-2xl p-4 sm:p-6">
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <div>
        <h1 class="text-lg font-semibold">Sign in to view this trade</h1>
        <p class="mt-1 text-sm text-muted-foreground">You must be a party to the trade to see it.</p>
      </div>
      <Button variant="outline" @click="loginWithSteam()"><RiSteamFill /> Sign in with Steam</Button>
    </div>

    <template v-else>
      <div v-if="isLoading" class="flex min-h-[50svh] items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>

      <div v-else-if="status === 'error'" class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">
        <RiErrorWarningLine class="size-10 text-destructive" />
        <p class="max-w-md text-sm text-muted-foreground">{{ errorMessage }}</p>
        <Button variant="outline" size="sm" @click="load()">Try again</Button>
      </div>

      <div v-else-if="trade" class="space-y-4">
        <header class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-lg font-semibold">Trade #{{ trade.id }}</h1>
            <p class="text-xs text-muted-foreground">
              with {{ isInitiator ? trade.counterparty?.name : trade.initiator?.name }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <TradeStatusBadge :status="trade.status" />
            <Button variant="outline" size="icon-sm" :disabled="refreshing" title="Refresh now" @click="refresh()">
              <RiLoopRightLine :class="{ 'animate-spin': refreshing }" />
            </Button>
          </div>
        </header>

        <!-- Both sides, relative to you -->
        <div class="rounded-lg border border-border bg-card p-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="mb-2 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">You give</p>
              <div class="flex flex-wrap gap-2">
                <MarketItemThumb v-for="leg in myLegs" :key="leg.id" :item="leg.item" />
                <span v-if="!myLegs.length" class="text-xs text-muted-foreground">—</span>
              </div>
            </div>
            <div>
              <p class="mb-2 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">You receive</p>
              <div class="flex flex-wrap gap-2">
                <MarketItemThumb v-for="leg in theirLegs" :key="leg.id" :item="leg.item" />
                <span v-if="!theirLegs.length" class="text-xs text-muted-foreground">—</span>
              </div>
            </div>
          </div>
          <div v-if="cashLabel" class="mt-3 border-t border-border/60 pt-3 text-sm">
            <span class="text-muted-foreground">Cash: </span>
            <span class="font-mono font-semibold tabular-nums">{{ cashLabel }}</span>
          </div>
        </div>

        <!-- Protection window -->
        <div v-if="trade.status === 'accepted'" class="flex items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
          <div class="flex items-center gap-2">
            <RiShieldCheckLine class="size-4 shrink-0" />
            <span>Protected — payout releases once this passes with no reversal.</span>
          </div>
          <span class="shrink-0 font-mono text-base font-semibold tabular-nums">{{ protectionCountdown }}</span>
        </div>

        <!-- Delivery -->
        <div v-if="trade.status === 'pending_delivery'" class="rounded-lg border border-dashed border-border p-4 text-sm">
          <template v-if="isInitiator">
            <p class="font-medium">Confirm the offer to complete the trade</p>
            <p class="mt-0.5 text-muted-foreground">
              The Steam offer is sent for you with all items attached — just confirm it on your Steam mobile authenticator.
            </p>
            <a v-if="trade.steam_trade_link" :href="trade.steam_trade_link" target="_blank" rel="noopener" class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
              Fallback: open in Steam <RiArrowRightLine class="size-3.5" />
            </a>
          </template>
          <template v-else>
            <p class="text-muted-foreground">
              Waiting for {{ trade.initiator?.name }} to send the Steam offer. It will arrive in your Steam inbox to accept.
            </p>
          </template>
        </div>

        <div v-if="trade.needs_review" class="rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
          This trade was reversed and is under manual review.
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
