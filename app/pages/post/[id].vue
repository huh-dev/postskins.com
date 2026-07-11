<script setup lang="ts">
import { RiArrowLeftRightLine, RiCopperCoinLine, RiErrorWarningLine, RiInboxLine, RiSteamFill, RiUser3Line } from "@remixicon/vue"
import type { OfferDto } from "@/composables/usePosts"
import { formatMoney } from "@/lib/format"

const route = useRoute()
const { isAuthenticated, user, loginWithSteam } = useAuth()
const { post, offers, status, errorMessage, busy, load, acceptOffer, cancel } = usePost(() => route.params.id as string)

const offerSheetOpen = ref(false)

const isOwner = computed(() => !!user.value && post.value?.owner?.id === user.value.id)
const isOpen = computed(() => post.value?.status === "open")

async function accept(offer: OfferDto): Promise<void> {
  const trade = await acceptOffer(offer.id)
  if (trade) await navigateTo(`/trade/${trade.id}`)
}

/** What the offerer hands over: their items plus cash if they're the payer. */
function offerGivesCash(offer: OfferDto): boolean {
  return offer.cash_amount > 0 && offer.cash_payer === "offerer"
}
function offerWantsCash(offer: OfferDto): boolean {
  return offer.cash_amount > 0 && offer.cash_payer === "poster"
}

onMounted(() => {
  if (isAuthenticated.value) load()
})
watch(isAuthenticated, (authed) => {
  if (authed) load()
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-3xl p-4 sm:p-6">
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <h1 class="text-lg font-semibold">Sign in to view this trade</h1>
      <Button variant="outline" @click="loginWithSteam()"><RiSteamFill /> Sign in with Steam</Button>
    </div>

    <template v-else>
      <div v-if="status === 'loading'" class="flex min-h-[50svh] items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>

      <div v-else-if="status === 'error' || !post" class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">
        <RiErrorWarningLine class="size-10 text-destructive" />
        <p class="text-sm text-muted-foreground">{{ errorMessage ?? "This post could not be found." }}</p>
        <Button variant="outline" size="sm" as-child><NuxtLink to="/market">Back to market</NuxtLink></Button>
      </div>

      <div v-else class="space-y-5">
        <!-- The post -->
        <article class="surface-panel rounded-lg p-4">
          <header class="mb-3 flex items-center gap-2">
            <img v-if="post.owner?.avatar" :src="post.owner.avatar" :alt="post.owner.name" class="size-7 rounded-md object-cover ring-1 ring-border">
            <span v-else class="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground"><RiUser3Line class="size-4" /></span>
            <div>
              <p class="text-sm font-medium">{{ post.owner?.name }}</p>
              <p class="text-xs capitalize text-muted-foreground">{{ post.status }}</p>
            </div>
          </header>

          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <p class="mb-2 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">Offering</p>
              <div class="flex flex-wrap items-center gap-2">
                <MarketItemThumb v-for="i in post.offering" :key="i.id" :item="i.item" />
                <span v-if="post.offer_cash > 0" class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <RiCopperCoinLine class="size-3.5" />{{ formatMoney(post.offer_cash, post.currency) }}
                </span>
              </div>
            </div>
            <RiArrowLeftRightLine class="size-5 text-muted-foreground/60" />
            <div>
              <p class="mb-2 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">Wanting</p>
              <div class="flex flex-wrap items-center gap-2">
                <MarketItemThumb v-for="i in post.wanting" :key="i.id" :item="i.item" />
                <span v-if="post.want_cash > 0" class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <RiCopperCoinLine class="size-3.5" />{{ formatMoney(post.want_cash, post.currency) }}
                </span>
                <span v-if="post.wants_anything" class="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">Open to offers</span>
              </div>
            </div>
          </div>

          <p v-if="post.note" class="mt-3 text-xs text-muted-foreground">"{{ post.note }}"</p>

          <footer class="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
            <template v-if="isOwner">
              <Button v-if="isOpen" variant="destructive" size="sm" :disabled="busy" @click="cancel()">Cancel post</Button>
            </template>
            <Button v-else-if="isOpen" size="sm" class="ml-auto" @click="offerSheetOpen = true">Make offer</Button>
          </footer>
        </article>

        <!-- Owner's offers inbox -->
        <section v-if="isOwner">
          <h2 class="mb-2 text-sm font-semibold">Offers</h2>
          <p v-if="errorMessage" class="mb-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{{ errorMessage }}</p>

          <div v-if="offers.length" class="space-y-2.5">
            <article v-for="offer in offers" :key="offer.id" class="surface-panel flex flex-col gap-2.5 rounded-lg p-3">
              <header class="flex items-center gap-2">
                <img v-if="offer.offerer?.avatar" :src="offer.offerer.avatar" :alt="offer.offerer.name" class="size-5 rounded object-cover ring-1 ring-border">
                <span class="text-sm font-medium">{{ offer.offerer?.name }}</span>
                <span v-if="offer.message" class="truncate text-xs text-muted-foreground">· "{{ offer.message }}"</span>
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
          <div v-else class="surface-panel flex flex-col items-center gap-2 rounded-lg py-8 text-center">
            <RiInboxLine class="size-8 text-muted-foreground" />
            <p class="text-xs text-muted-foreground">No offers yet.</p>
          </div>
        </section>
      </div>
    </template>

    <MarketMakeOfferSheet v-model:open="offerSheetOpen" :post="post" @submitted="load()" />
  </div>
</template>
