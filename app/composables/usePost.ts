import type { MaybeRefOrGetter } from "vue"
import type { OfferDto, PostDto } from "@/composables/usePosts"
import type { TradeDto } from "@/composables/useTrade"
import { readError } from "@/composables/usePosts"

/**
 * A single trade post: its full detail plus, for the owner, the pending-offer
 * inbox and the accept action that executes the trade.
 */
export function usePost(id: MaybeRefOrGetter<number | string>) {
  const client = useSanctumClient()

  const post = ref<PostDto | null>(null)
  const status = ref<"idle" | "loading" | "success" | "error">("idle")
  const errorMessage = ref<string | null>(null)
  const busy = ref(false)

  const offers = computed<OfferDto[]>(() => post.value?.offers ?? [])

  async function load(): Promise<void> {
    if (post.value === null) {
      status.value = "loading"
    }
    try {
      post.value = (await client<{ post: PostDto }>(`/api/posts/${toValue(id)}`)).post
      status.value = "success"
    }
    catch (error: unknown) {
      status.value = "error"
      errorMessage.value = readError(error)
    }
  }

  /**
   * Accept an offer. Returns the created trade so the caller can navigate to it.
   */
  async function acceptOffer(offerId: number): Promise<TradeDto | null> {
    errorMessage.value = null
    busy.value = true
    try {
      const { trade } = await client<{ trade: TradeDto }>(`/api/offers/${offerId}/accept`, { method: "POST" })
      return trade
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      await load()
      return null
    }
    finally {
      busy.value = false
    }
  }

  async function cancel(): Promise<void> {
    if (post.value) {
      await client(`/api/posts/${post.value.id}`, { method: "DELETE" })
      await load()
    }
  }

  return { post, offers, status, errorMessage, busy, load, acceptOffer, cancel }
}
