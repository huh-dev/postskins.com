<script setup lang="ts">
import { RiArrowLeftRightLine, RiCheckLine, RiCopperCoinLine, RiInboxLine, RiSteamFill, RiUser3Line } from "@remixicon/vue"
import type { OfferDto, OfferStatus } from "@/composables/usePosts"
import { readError } from "@/composables/usePosts"
import { formatMoney } from "@/lib/format"

const { isAuthenticated, user, loginWithSteam, saveTradeUrl } = useAuth()
const { busy, errorMessage: actionError, fetchSentOffers, fetchReceivedOffers, acceptOffer, withdrawOffer } = useOffers()

type Tab = "received" | "sent"
const tabs: Tab[] = ["received", "sent"]
const tab = ref<Tab>("received")

const sent = ref<OfferDto[]>([])
const received = ref<OfferDto[]>([])
const loadingOffers = ref(false)
const offersError = ref<string | null>(null)

// --- Trade URL form ---------------------------------------------------------
const tradeUrlInput = ref("")
const savingUrl = ref(false)
const urlError = ref<string | null>(null)
const urlSaved = ref(false)

watchEffect(() => {
  tradeUrlInput.value = user.value?.trade_url ?? ""
})

const urlDirty = computed(() => tradeUrlInput.value.trim() !== (user.value?.trade_url ?? ""))

async function submitTradeUrl(): Promise<void> {
  urlError.value = null
  urlSaved.value = false
  savingUrl.value = true
  try {
    await saveTradeUrl(tradeUrlInput.value.trim())
    urlSaved.value = true
  }
  catch (error: unknown) {
    urlError.value = readError(error)
  }
  finally {
    savingUrl.value = false
  }
}

// --- Offers -----------------------------------------------------------------
async function loadOffers(): Promise<void> {
  loadingOffers.value = true
  offersError.value = null
  try {
    const [receivedOffers, sentOffers] = await Promise.all([fetchReceivedOffers(), fetchSentOffers()])
    received.value = receivedOffers
    sent.value = sentOffers
  }
  catch (error: unknown) {
    offersError.value = readError(error)
  }
  finally {
    loadingOffers.value = false
  }
}

async function accept(offer: OfferDto): Promise<void> {
  const trade = await acceptOffer(offer.id)
  if (trade) await navigateTo(`/trade/${trade.id}`)
}

async function withdraw(offer: OfferDto): Promise<void> {
  if (await withdrawOffer(offer.id)) await loadOffers()
}

/** What the offerer hands over / wants as cash. */
function offerGivesCash(offer: OfferDto): boolean {
  return offer.cash_amount > 0 && offer.cash_payer === "offerer"
}
function offerWantsCash(offer: OfferDto): boolean {
  return offer.cash_amount > 0 && offer.cash_payer === "poster"
}

const STATUS_STYLES: Record<OfferStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  declined: "bg-muted text-muted-foreground",
  withdrawn: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
}

onMounted(() => {
  if (isAuthenticated.value) loadOffers()
})
watch(isAuthenticated, (authed) => {
  if (authed) loadOffers()
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-3xl p-4 sm:p-6">
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <h1 class="text-lg font-semibold">Sign in to manage your account</h1>
      <Button variant="outline" @click="loginWithSteam()"><RiSteamFill /> Sign in with Steam</Button>
    </div>

    <template v-else>
      <header class="mb-5 flex items-center gap-3">
        <img v-if="user?.avatar" :src="user.avatar" :alt="user.name" class="size-10 rounded-lg object-cover ring-1 ring-border">
        <span v-else class="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"><RiUser3Line class="size-5" /></span>
        <div>
          <h1 class="text-lg font-semibold">{{ user?.name }}</h1>
          <p class="text-xs text-muted-foreground">Your account</p>
        </div>
      </header>

      <!-- Trade URL -->
      <section class="surface-panel mb-6 rounded-lg p-4">
        <h2 class="text-sm font-semibold">Steam trade URL</h2>
        <p class="mt-1 text-xs text-muted-foreground">
          Sellers use this to send items to you. Copy it from Steam → Inventory → Trade Offers → "Who can send me Trade Offers".
        </p>

        <form class="mt-3 flex flex-col gap-2 sm:flex-row" @submit.prevent="submitTradeUrl">
          <input
            v-model="tradeUrlInput"
            type="url"
            inputmode="url"
            placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…&token=…"
            class="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:border-ring"
          >
          <Button type="submit" size="sm" :disabled="savingUrl || !urlDirty || !tradeUrlInput.trim()">
            {{ savingUrl ? "Saving…" : "Save" }}
          </Button>
        </form>

        <p v-if="urlError" class="mt-2 text-xs text-destructive">{{ urlError }}</p>
        <p v-else-if="urlSaved" class="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <RiCheckLine class="size-3.5" /> Trade URL saved.
        </p>
        <p v-else-if="!user?.trade_url" class="mt-2 text-xs text-amber-600 dark:text-amber-400">
          You need a trade URL before you can make offers.
        </p>
      </section>

      <!-- Offers -->
      <section>
        <div class="mb-3 flex items-center gap-1 border-b border-border">
          <button
            v-for="option in tabs"
            :key="option"
            type="button"
            class="relative -mb-px px-3 py-2 text-sm font-medium capitalize transition-colors"
            :class="tab === option ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'"
            @click="tab = option"
          >
            {{ option }}
            <span class="ml-1 text-xs text-muted-foreground">({{ option === "received" ? received.length : sent.length }})</span>
            <span
              aria-hidden="true"
              class="absolute inset-x-0 -bottom-px h-0.5 bg-primary transition-opacity"
              :class="tab === option ? 'opacity-100' : 'opacity-0'"
            />
          </button>
        </div>

        <p v-if="offersError || actionError" class="mb-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{{ offersError || actionError }}</p>

        <div v-if="loadingOffers" class="flex min-h-[30svh] items-center justify-center">
          <div class="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>

        <template v-else>
          <!-- Received: pending offers on my posts -->
          <div v-show="tab === 'received'">
            <div v-if="received.length" class="space-y-2.5">
              <article v-for="offer in received" :key="offer.id" class="surface-panel flex flex-col gap-2.5 rounded-lg p-3">
                <header class="flex items-center gap-2">
                  <img v-if="offer.offerer?.avatar" :src="offer.offerer.avatar" :alt="offer.offerer.name" class="size-5 rounded object-cover ring-1 ring-border">
                  <span class="text-sm font-medium">{{ offer.offerer?.name }}</span>
                  <span v-if="offer.message" class="truncate text-xs text-muted-foreground">· "{{ offer.message }}"</span>
                  <NuxtLink v-if="offer.post" :to="`/post/${offer.post.id}`" class="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline">View post</NuxtLink>
                </header>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[0.625rem] font-semibold uppercase text-muted-foreground">Gives</span>
                  <MarketItemThumb v-for="i in offer.giving" :key="i.id" :item="i.item" size="sm" />
                  <span v-if="offerGivesCash(offer)" class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <RiCopperCoinLine class="size-3.5" />{{ formatMoney(offer.cash_amount, offer.currency) }}
                  </span>
                  <span v-if="offerWantsCash(offer)" class="text-xs text-muted-foreground">wants {{ formatMoney(offer.cash_amount, offer.currency) }} from you</span>
                </div>
                <footer class="flex justify-end">
                  <Button size="sm" :disabled="busy" @click="accept(offer)">Accept</Button>
                </footer>
              </article>
            </div>
            <div v-else class="surface-panel flex flex-col items-center gap-2 rounded-lg py-10 text-center">
              <RiInboxLine class="size-8 text-muted-foreground" />
              <p class="text-xs text-muted-foreground">No pending offers on your posts.</p>
            </div>
          </div>

          <!-- Sent: my offers on other people's posts -->
          <div v-show="tab === 'sent'">
            <div v-if="sent.length" class="space-y-2.5">
              <article v-for="offer in sent" :key="offer.id" class="surface-panel flex flex-col gap-2.5 rounded-lg p-3">
                <header class="flex items-center gap-2">
                  <img v-if="offer.post?.owner?.avatar" :src="offer.post.owner.avatar" :alt="offer.post.owner.name" class="size-5 rounded object-cover ring-1 ring-border">
                  <span v-else class="flex size-5 items-center justify-center rounded bg-muted text-muted-foreground"><RiUser3Line class="size-3" /></span>
                  <span class="text-sm font-medium">{{ offer.post?.owner?.name ?? "Post owner" }}</span>
                  <span
                    class="rounded px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide"
                    :class="STATUS_STYLES[offer.status]"
                  >{{ offer.status }}</span>
                  <NuxtLink v-if="offer.post" :to="`/post/${offer.post.id}`" class="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline">View post</NuxtLink>
                </header>
                <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="w-full text-[0.625rem] font-semibold uppercase text-muted-foreground">You give</span>
                    <MarketItemThumb v-for="i in offer.giving" :key="i.id" :item="i.item" size="sm" />
                    <span v-if="offerGivesCash(offer)" class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <RiCopperCoinLine class="size-3.5" />{{ formatMoney(offer.cash_amount, offer.currency) }}
                    </span>
                  </div>
                  <RiArrowLeftRightLine class="size-4 text-muted-foreground/60" />
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="w-full text-[0.625rem] font-semibold uppercase text-muted-foreground">You get</span>
                    <MarketItemThumb v-for="i in offer.wanting" :key="i.id" :item="i.item" size="sm" />
                    <span v-if="offerWantsCash(offer)" class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <RiCopperCoinLine class="size-3.5" />{{ formatMoney(offer.cash_amount, offer.currency) }}
                    </span>
                  </div>
                </div>
                <footer v-if="offer.status === 'pending'" class="flex justify-end">
                  <Button variant="outline" size="sm" :disabled="busy" @click="withdraw(offer)">Withdraw</Button>
                </footer>
              </article>
            </div>
            <div v-else class="surface-panel flex flex-col items-center gap-2 rounded-lg py-10 text-center">
              <RiInboxLine class="size-8 text-muted-foreground" />
              <p class="text-xs text-muted-foreground">You haven't made any offers yet.</p>
              <Button variant="outline" size="sm" as-child><NuxtLink to="/market">Browse the market</NuxtLink></Button>
            </div>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>
