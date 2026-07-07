import type { TradeDto } from "@/composables/useTrade"

export interface Listing {
  id: number
  status: "active" | "sold" | "cancelled"
  price: number
  currency: string
  market_hash_name: string
  item: {
    name: string | null
    market_hash_name: string | null
    icon_url: string | null
  }
  seller?: {
    id: number
    name: string
    avatar: string | null
  }
  created_at: string | null
}

interface ListingsResponse {
  listings: Listing[]
}

/**
 * Marketplace: browse active listings, manage your own, and buy. Buying holds
 * the buyer's funds and returns the opened trade so the caller can navigate to
 * its tracking page.
 */
export function useMarket() {
  const client = useSanctumClient()

  const listings = ref<Listing[]>([])
  const mine = ref<Listing[]>([])
  const errorMessage = ref<string | null>(null)
  const busy = ref(false)

  async function loadMarket(): Promise<void> {
    listings.value = (await client<ListingsResponse>("/api/listings")).listings
  }

  async function loadMine(): Promise<void> {
    mine.value = (await client<ListingsResponse>("/api/listings/mine")).listings
  }

  async function createListing(inventoryItemId: number, price: number): Promise<boolean> {
    return run(async () => {
      await client("/api/listings", { method: "POST", body: { inventory_item_id: inventoryItemId, price } })
      await loadMine()
    })
  }

  async function cancelListing(id: number): Promise<boolean> {
    return run(async () => {
      await client(`/api/listings/${id}`, { method: "DELETE" })
      await loadMine()
    })
  }

  async function purchase(id: number): Promise<TradeDto | null> {
    errorMessage.value = null
    busy.value = true
    try {
      const { trade } = await client<{ trade: TradeDto }>(`/api/listings/${id}/purchase`, { method: "POST" })
      return trade
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      return null
    }
    finally {
      busy.value = false
    }
  }

  async function run(fn: () => Promise<void>): Promise<boolean> {
    errorMessage.value = null
    busy.value = true
    try {
      await fn()
      return true
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      return false
    }
    finally {
      busy.value = false
    }
  }

  function readError(error: unknown): string {
    return (error as { data?: { message?: string } }).data?.message ?? "Something went wrong. Please try again."
  }

  return { listings, mine, errorMessage, busy, loadMarket, loadMine, createListing, cancelListing, purchase }
}
