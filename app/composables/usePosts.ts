import type { ItemThumbDto, TradePartyDto } from "@/composables/useTrade"

export type PostStatus = "open" | "fulfilled" | "cancelled" | "expired"

export interface PostItemDto {
  id: number
  side: "offering" | "wanting"
  market_hash_name: string
  asset_id: string | null
  quantity: number
  item: ItemThumbDto
}

export interface OfferItemDto {
  id: number
  side: "from_offerer" | "from_poster"
  market_hash_name: string
  asset_id: string
  item: ItemThumbDto
}

export type OfferStatus = "pending" | "accepted" | "declined" | "withdrawn" | "expired"

/** The post an offer is against — only present when listing a user's own offers. */
export interface OfferPostDto {
  id: number
  status: PostStatus
  owner: TradePartyDto | null
}

export interface OfferDto {
  id: number
  status: OfferStatus
  cash_amount: number
  cash_payer: "offerer" | "poster" | null
  currency: string
  message: string | null
  offerer: TradePartyDto | null
  giving: OfferItemDto[]
  wanting: OfferItemDto[]
  post?: OfferPostDto
  trade_id: number | null
  created_at: string | null
}

export interface PostDto {
  id: number
  status: PostStatus
  app_id: number
  context_id: number
  offer_cash: number
  want_cash: number
  currency: string
  wants_anything: boolean
  note: string | null
  owner: TradePartyDto | null
  offering: PostItemDto[]
  wanting: PostItemDto[]
  offers_count?: number
  offers?: OfferDto[]
  expires_at: string | null
  created_at: string | null
}

export interface PostFilters {
  search?: string
  sort?: "newest" | "offer_cash" | "want_cash"
  has_cash?: boolean
  min_cash?: number
  max_cash?: number
}

export interface CreatePostPayload {
  offering: { inventory_item_id: number }[]
  wanting: { item_description_id: number, quantity?: number }[]
  offer_cash: number
  want_cash: number
  wants_anything: boolean
  note: string | null
}

interface FeedResponse {
  posts: PostDto[]
  meta: { current_page: number, last_page: number, per_page: number, total: number }
}

/**
 * The market feed of open trade posts, plus the caller's own posts. Feed data is
 * per-visit, so this uses plain refs (not shared useState).
 */
export function usePosts() {
  const client = useSanctumClient()

  const posts = ref<PostDto[]>([])
  const mine = ref<PostDto[]>([])
  const meta = ref<FeedResponse["meta"] | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function loadFeed(filters: PostFilters = {}): Promise<void> {
    loading.value = true
    errorMessage.value = null

    const query: Record<string, string | number> = {}
    if (filters.search) query.search = filters.search
    if (filters.sort) query.sort = filters.sort
    if (filters.has_cash) query.has_cash = 1
    if (filters.min_cash != null) query.min_cash = filters.min_cash
    if (filters.max_cash != null) query.max_cash = filters.max_cash

    try {
      const data = await client<FeedResponse>("/api/posts", { query })
      posts.value = data.posts
      meta.value = data.meta
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
    }
    finally {
      loading.value = false
    }
  }

  async function loadMine(): Promise<void> {
    mine.value = (await client<{ posts: PostDto[] }>("/api/posts/mine")).posts
  }

  async function createPost(payload: CreatePostPayload): Promise<PostDto | null> {
    errorMessage.value = null
    loading.value = true
    try {
      const { post } = await client<{ post: PostDto }>("/api/posts", { method: "POST", body: payload })
      return post
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function cancelPost(id: number): Promise<void> {
    await client(`/api/posts/${id}`, { method: "DELETE" })
    await loadMine()
  }

  return { posts, mine, meta, loading, errorMessage, loadFeed, loadMine, createPost, cancelPost }
}

export function readError(error: unknown): string {
  return (error as { data?: { message?: string } }).data?.message ?? "Something went wrong. Please try again."
}
