<script setup lang="ts">
import { RiArrowRightLine, RiPriceTag3Line, RiShieldCheckLine, RiStore2Line } from "@remixicon/vue"

const { user, isAuthenticated, loginWithSteam } = useAuth()

const actions = [
  { to: "/market", title: "Market", description: "Browse every skin listed by other players and buy it peer-to-peer.", icon: RiStore2Line },
  { to: "/sell", title: "Sell", description: "Pick items from your Steam inventory and set your price.", icon: RiPriceTag3Line },
  { to: "/support", title: "Support", description: "How the escrow and 7-day protection window keep a trade safe.", icon: RiShieldCheckLine },
]
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-10 sm:py-16">
    <section class="text-center">
      <div class="mb-5 flex justify-center">
        <BrandPostskinsLogo size="lg" />
      </div>
      <h1 class="text-2xl font-semibold sm:text-3xl">Trade CS2 skins, protected end-to-end</h1>
      <p class="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        Peer-to-peer trades with balance held until Steam's 7-day trade-protection window passes — reversals are caught and refunded automatically.
      </p>

      <div v-if="!isAuthenticated" class="mt-6 flex justify-center">
        <Button size="lg" @click="loginWithSteam()">Sign in with Steam</Button>
      </div>
      <p v-else class="mt-4 text-sm">
        Signed in as <strong>{{ user?.name }}</strong>
      </p>
    </section>

    <section class="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        class="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/60"
      >
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <component :is="action.icon" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-1 font-medium">
            {{ action.title }}
            <RiArrowRightLine class="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </p>
          <p class="mt-0.5 text-sm text-muted-foreground">{{ action.description }}</p>
        </div>
      </NuxtLink>
    </section>
  </div>
</template>
