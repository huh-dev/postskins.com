import type { OfferDto } from "@/composables/usePosts"
import type { TradeDto } from "@/composables/useTrade"
import { readError } from "@/composables/usePosts"

export interface SubmitOfferPayload {
  items: { inventory_item_id: number }[]
  cash_amount: number
  cash_payer: "offerer" | "poster" | null
  message: string | null
}

/**
 * Submitting and withdrawing counter-offers against a post.
 */
export function useOffers() {
  const client = useSanctumClient()

  const busy = ref(false)
  const errorMessage = ref<string | null>(null)

  async function submitOffer(postId: number, payload: SubmitOfferPayload): Promise<OfferDto | null> {
    errorMessage.value = null
    busy.value = true
    try {
      const { offer } = await client<{ offer: OfferDto }>(`/api/posts/${postId}/offers`, {
        method: "POST",
        body: payload,
      })
      return offer
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      return null
    }
    finally {
      busy.value = false
    }
  }

  async function withdrawOffer(offerId: number): Promise<boolean> {
    errorMessage.value = null
    busy.value = true
    try {
      await client(`/api/offers/${offerId}`, { method: "DELETE" })
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

  /** The caller's outgoing offers, across every post, newest first. */
  async function fetchSentOffers(): Promise<OfferDto[]> {
    return (await client<{ offers: OfferDto[] }>("/api/offers/sent")).offers
  }

  /** The caller's pending offers received across all of their posts. */
  async function fetchReceivedOffers(): Promise<OfferDto[]> {
    return (await client<{ offers: OfferDto[] }>("/api/offers/received")).offers
  }

  /** Accept a received offer, executing the trade. Returns it so the caller can navigate. */
  async function acceptOffer(offerId: number): Promise<TradeDto | null> {
    errorMessage.value = null
    busy.value = true
    try {
      return (await client<{ trade: TradeDto }>(`/api/offers/${offerId}/accept`, { method: "POST" })).trade
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      return null
    }
    finally {
      busy.value = false
    }
  }

  return { busy, errorMessage, submitOffer, withdrawOffer, fetchSentOffers, fetchReceivedOffers, acceptOffer }
}
