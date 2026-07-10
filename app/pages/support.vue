<script setup lang="ts">
import {
  RiAddLine,
  RiExchangeDollarLine,
  RiMailLine,
  RiShieldCheckLine,
  RiSteamFill,
  RiTimeLine,
} from "@remixicon/vue"

const SUPPORT_EMAIL = "support@postskins.com"

/**
 * The three stages every trade passes through, mirroring the trade statuses in
 * the API: pending_delivery → accepted → completed.
 */
const steps = [
  {
    icon: RiExchangeDollarLine,
    title: "The buyer pays into a hold",
    body: "The price leaves the buyer's balance the moment they buy, but nobody can spend it. The seller has not been paid yet, and the buyer cannot spend it either.",
  },
  {
    icon: RiSteamFill,
    title: "The seller sends the skin",
    body: "Postskins prepares a Steam trade offer from the seller's own account to the buyer. The seller approves it in their Steam mobile app and the skin goes straight to the buyer. It never passes through a Postskins account.",
  },
  {
    icon: RiTimeLine,
    title: "The payout unlocks after 7 days",
    body: "Steam can roll a trade back for 7 days. We watch both inventories for that entire window. If nothing is rolled back, the seller is paid. If the skin comes back, the buyer is refunded automatically.",
  },
] as const

const faqs = [
  {
    question: "Does Postskins ever hold my skin?",
    answer: "No. The trade offer goes directly from the seller's Steam account to the buyer's. There is no Postskins bot inventory in the middle, so there is no account we could lose your item from, and nothing to withdraw afterwards. Until someone buys it, a listed item simply sits in your own Steam inventory as normal.",
  },
  {
    question: "What happens if the seller never sends the item?",
    answer: "Nothing is lost. The trade waits for delivery, and if the offer is declined, expires, or is never sent, the trade is cancelled and the buyer's hold is refunded in full. If no item has arrived after 15 days, we cancel and refund automatically without anyone needing to open a ticket.",
  },
  {
    question: "What is the 7-day protection window?",
    answer: "Since 2024, Steam can reverse a completed trade for up to 7 days if the sending account turns out to have been compromised. That is why the seller's payout stays locked for exactly that long. We re-check both Steam inventories on a schedule for the whole window, so a rollback is caught by us rather than discovered by the buyer weeks later.",
  },
  {
    question: "What happens if a trade gets reversed?",
    answer: "The buyer is refunded the full amount automatically, the seller's locked payout is voided, and the seller's account is suspended from selling pending review. A buyer never ends up without both the skin and the money.",
  },
  {
    question: "Do you ever see my Steam password?",
    answer: "Never. Signing in uses Steam's own login, and authorizing sales uses a QR code that you approve inside the Steam mobile app. You are typing your password into Steam, not into Postskins. There is no password field anywhere in our system and no place for one to be stored.",
  },
  {
    question: "What am I authorizing when I connect Steam for selling?",
    answer: "A token that lets us create the trade offer for you when one of your items sells, so you do not have to be at your computer to catch the sale. That token cannot confirm the offer on its own: you still have to approve every outgoing trade in your Steam mobile authenticator. We store the token encrypted, and you can revoke it any time by disconnecting on the Sell page.",
  },
  {
    question: "What if I receive the wrong item?",
    answer: "The trade is flagged as disputed instead of completing, the buyer's money stays held, and a human reviews it. Money is never released to a seller on a trade that did not deliver what was listed.",
  },
  {
    question: "What does Postskins charge?",
    answer: "Nothing today. The seller receives the full asking price, and the buyer pays exactly the listed price. There is no commission taken out of a sale.",
  },
  {
    question: "Why can't I list one of my skins?",
    answer: "Steam applies its own trade lock to newly traded or newly opened items, usually for 7 days. Locked items show a countdown in your inventory and can be listed as soon as the lock expires. Items that are not tradable at all, such as medals and coins, are never listable.",
  },
  {
    question: "My inventory looks empty.",
    answer: "Steam hides private inventories from everyone, including us. Set your inventory privacy to Public in your Steam profile settings, then reload the Sell page.",
  },
] as const
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
    <section class="text-center">
      <span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
        <RiShieldCheckLine class="size-3.5" />
        Protected end-to-end
      </span>
      <h1 class="mt-4 text-2xl font-semibold sm:text-3xl">How Postskins keeps a trade safe</h1>
      <p class="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        Every trade is peer-to-peer: the skin moves from one Steam account to the other, and the money waits until
        Steam can no longer take the skin back.
      </p>
    </section>

    <section class="mt-10 space-y-3">
      <article
        v-for="(step, index) in steps"
        :key="step.title"
        class="surface-panel flex items-start gap-4 rounded-xl border-0 p-4"
      >
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-foreground">
          <component :is="step.icon" class="size-5" />
        </span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-foreground">
            <span class="mr-1.5 font-mono text-xs text-muted-foreground">{{ index + 1 }}</span>
            {{ step.title }}
          </p>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ step.body }}</p>
        </div>
      </article>
    </section>

    <section class="mt-12">
      <h2 class="text-lg font-semibold">Frequently asked questions</h2>

      <div class="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
        <details v-for="faq in faqs" :key="faq.question" class="group bg-card">
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {{ faq.question }}
            <RiAddLine class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" />
          </summary>
          <p class="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section class="surface-panel mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border-0 p-5">
      <div>
        <h2 class="text-sm font-semibold text-foreground">Still stuck?</h2>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Send us the trade link and we will look at it directly.
        </p>
      </div>
      <Button as="a" :href="`mailto:${SUPPORT_EMAIL}`" variant="outline" size="lg">
        <RiMailLine />
        {{ SUPPORT_EMAIL }}
      </Button>
    </section>
  </div>
</template>
