import type { MaybeRefOrGetter } from "vue"

export type TradeStatus
  = | "pending_delivery"
    | "accepted"
    | "completed"
    | "reversed"
    | "cancelled"
    | "disputed"

export interface TradeEventDto {
  id: number
  type: string
  payload: Record<string, unknown> | null
  created_at: string | null
}

export interface TradePartyDto {
  id: number
  name: string
  avatar: string | null
  suspended: boolean
}

export interface TradeItemDto {
  name: string | null
  market_hash_name: string | null
  icon_url: string | null
}

export interface TradeDto {
  id: number
  status: TradeStatus
  price: number
  currency: string
  app_id: number
  context_id: number
  market_hash_name: string
  item: TradeItemDto
  seller: TradePartyDto | null
  buyer: TradePartyDto | null
  steam_trade_link?: string | null
  escrow: boolean
  protection_expires_at: string | null
  accepted_at: string | null
  completed_at: string | null
  reversed_at: string | null
  events: TradeEventDto[]
  created_at: string | null
}

interface TradeResponse {
  trade: TradeDto
}

/**
 * Loads and tracks a single P2P trade from the Laravel API. The consumer polls
 * `load()` while the trade is active to watch it move through delivery →
 * protection window → completion (or reversal).
 */
export function useTrade(id: MaybeRefOrGetter<number | string>) {
  const client = useSanctumClient()

  const trade = ref<TradeDto | null>(null)
  const status = ref<"idle" | "loading" | "success" | "error">("idle")
  const errorMessage = ref<string | null>(null)

  const isLoading = computed(() => status.value === "loading")
  const isActive = computed(
    () => trade.value?.status === "pending_delivery" || trade.value?.status === "accepted",
  )

  async function load(): Promise<void> {
    if (trade.value === null) {
      status.value = "loading"
    }

    try {
      const data = await client<TradeResponse>(`/api/trades/${toValue(id)}`)
      trade.value = data.trade
      status.value = "success"
    }
    catch (error: unknown) {
      const response = error as { data?: { message?: string } }
      status.value = "error"
      errorMessage.value = response.data?.message ?? "We could not load this trade."
    }
  }

  return { trade, status, isLoading, isActive, errorMessage, load }
}

/**
 * Human label for a trade event type shown in the timeline.
 */
export function tradeEventLabel(type: string): string {
  const labels: Record<string, string> = {
    created: "Trade created · funds held",
    accepted: "Item received · payout locked",
    completed: "Protection window passed · seller paid",
    reversal: "Reversal detected · seller suspended",
    cancelled: "Not delivered · buyer refunded",
    disputed: "Wrong item · under review",
  }

  return labels[type] ?? type
}
