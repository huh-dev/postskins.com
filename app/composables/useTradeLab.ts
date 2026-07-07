import type { TradeDto } from "@/composables/useTrade"

export interface LabParty {
  id: number
  name: string
  steam_id: string | null
  suspended: boolean
  suspension_reason: string | null
  balance: number
  locked_balance: number
  currency: string
}

export interface LabListing {
  inventory_item_id: number
  name: string | null
  market_hash_name: string | null
  icon_url: string | null
  tradable: boolean
}

export interface LabState {
  seller: LabParty | null
  buyer: LabParty | null
  listings: LabListing[]
  seller_inventory_status: "ok" | "private" | "error" | null
  trade: TradeDto | null
}

/**
 * Drives the local-only /api/dev/trade-lab harness: sync a real seller's Steam
 * inventory, create an offer from one of those items, and simulate the buyer's
 * receipt/reversal — so the whole P2P lifecycle can be watched without a real
 * Steam trade. Every endpoint returns the full lab state.
 */
export function useTradeLab() {
  const client = useSanctumClient()

  const state = ref<LabState | null>(null)
  const busy = ref(false)
  const errorMessage = ref<string | null>(null)

  async function call(
    path: string,
    method: "GET" | "POST",
    body?: Record<string, unknown>,
  ): Promise<void> {
    errorMessage.value = null

    try {
      state.value = await client<LabState>(`/api/dev/trade-lab/${path}`, { method, body })
    }
    catch (error: unknown) {
      const response = error as { data?: { message?: string } }
      errorMessage.value = response.data?.message
        ?? "Trade lab request failed. Make sure the API is running locally (APP_ENV=local)."
    }
  }

  async function action(path: string, body?: Record<string, unknown>): Promise<void> {
    busy.value = true
    await call(path, "POST", body)
    busy.value = false
  }

  return {
    state,
    busy,
    errorMessage,
    refresh: () => call("state", "GET"),
    reset: () => action("reset"),
    loadDemo: () => action("demo-seller"),
    syncSeller: (steamId: string) => action("sync-seller", { steam_id: steamId }),
    buy: (inventoryItemId: number, price: number) =>
      action("buy", { inventory_item_id: inventoryItemId, price }),
    simulateReceived: () => action("simulate-received"),
    simulateReversal: () => action("simulate-reversal"),
  }
}
