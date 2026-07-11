<script setup lang="ts">
import { RiAddLine, RiInboxLine, RiSteamFill, RiWallet3Line } from "@remixicon/vue"
import type { PostDto, PostFilters } from "@/composables/usePosts"
import { formatMoney } from "@/lib/format"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const { isAuthenticated, user, loginWithSteam } = useAuth()
const { wallet, load: loadWallet, addTestFunds } = useWallet()
const { posts, loading, errorMessage, loadFeed } = usePosts()

const search = ref("")
const sort = ref<PostFilters["sort"]>("newest")
const hasCash = ref(false)

const offerSheetOpen = ref(false)
const activePost = ref<PostDto | null>(null)

const hasTradeUrl = computed(() => !!user.value?.trade_url)

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "want_cash", label: "Wanted cash: high to low" },
  { value: "offer_cash", label: "Offered cash: high to low" },
] as const

let searchTimer: ReturnType<typeof setTimeout> | undefined

function refresh(): void {
  loadFeed({ search: search.value, sort: sort.value, has_cash: hasCash.value })
}

watch([sort, hasCash], refresh)
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(refresh, 250)
})

function onMakeOffer(post: PostDto): void {
  activePost.value = post
  offerSheetOpen.value = true
}

function openPost(post: PostDto): void {
  navigateTo(`/post/${post.id}`)
}

onMounted(() => {
  if (isAuthenticated.value) {
    refresh()
    loadWallet()
  }
})

watch(isAuthenticated, (authed) => {
  if (authed) {
    refresh()
    loadWallet()
  }
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-6xl p-4 sm:p-6">
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <h1 class="text-lg font-semibold">Sign in to browse trades</h1>
      <Button variant="outline" @click="loginWithSteam()">
        <RiSteamFill /> Sign in with Steam
      </Button>
    </div>

    <template v-else>
      <header class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold">Market</h1>
          <p class="text-xs text-muted-foreground">Browse trades — swap items, add cash, or buy for cash.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-sm">
            <RiWallet3Line class="size-4 text-muted-foreground" />
            <span class="font-mono font-medium tabular-nums">{{ formatMoney(wallet?.balance, wallet?.currency) }}</span>
          </span>
          <Button variant="secondary" size="sm" @click="addTestFunds()">Add test funds</Button>
          <Button size="sm" as-child>
            <NuxtLink to="/sell"><RiAddLine /> New post</NuxtLink>
          </Button>
        </div>
      </header>

      <p
        v-if="!hasTradeUrl"
        class="mb-4 rounded-md border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2 text-xs text-amber-200/90"
      >
        Add your Steam trade URL on the <NuxtLink to="/sell" class="font-medium underline">Sell page</NuxtLink> before making offers.
      </p>

      <div class="flex flex-col gap-4 lg:flex-row">
        <!-- Filters -->
        <aside class="lg:w-56 lg:shrink-0">
          <div class="surface-panel flex flex-col gap-3 rounded-lg p-3">
            <input
              v-model="search"
              type="search"
              placeholder="Search items…"
              class="h-8 w-full rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-ring"
            >
            <Select v-model="sort">
              <SelectTrigger class="h-8 w-full text-xs" aria-label="Sort posts">
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="o in sortOptions" :key="o.value" :value="o.value" class="text-xs">
                  {{ o.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              :aria-pressed="hasCash"
              class="flex h-8 items-center justify-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors"
              :class="hasCash ? 'bg-primary/15 text-foreground' : 'bg-sidebar-accent/40 text-muted-foreground hover:text-foreground'"
              @click="hasCash = !hasCash"
            >
              Has cash
            </button>
          </div>
        </aside>

        <!-- Feed -->
        <div class="min-w-0 flex-1">
          <p v-if="errorMessage" class="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {{ errorMessage }}
          </p>

          <div v-if="loading && !posts.length" class="space-y-3">
            <div v-for="n in 4" :key="n" class="surface-panel h-32 animate-pulse rounded-lg" />
          </div>

          <div v-else-if="posts.length" class="space-y-3">
            <MarketTradePostRow
              v-for="post in posts"
              :key="post.id"
              :post="post"
              :own="post.owner?.id === user?.id"
              @offer="onMakeOffer"
              @open="openPost"
            />
          </div>

          <div v-else class="surface-panel flex min-h-[40svh] flex-col items-center justify-center gap-3 rounded-lg text-center">
            <RiInboxLine class="size-10 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">No trades yet.</p>
            <Button size="sm" as-child>
              <NuxtLink to="/sell">Create the first one</NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </template>

    <MarketMakeOfferSheet v-model:open="offerSheetOpen" :post="activePost" @submitted="refresh()" />
  </div>
</template>
