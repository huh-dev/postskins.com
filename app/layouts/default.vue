<script setup lang="ts">
import { RiFlaskLine, RiStore2Line, RiSteamFill, RiWallet3Line } from "@remixicon/vue"
import { formatMoney } from "@/lib/format"

const { user, isAuthenticated, loginWithSteam, logout } = useAuth()
const { wallet, load: loadWallet } = useWallet()
const route = useRoute()

const links = [
  { to: "/inventory", label: "Inventory" },
  { to: "/market", label: "Market" },
  { to: "/sell", label: "Sell" },
  { to: "/trade-lab", label: "Lab", icon: RiFlaskLine },
]

// Keep the nav wallet balance fresh as you move around the app.
watch(
  [() => route.fullPath, isAuthenticated],
  () => {
    if (isAuthenticated.value) {
      loadWallet()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-svh">
    <header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4">
        <!-- Left: brand + nav -->
        <div class="flex items-center gap-1">
          <NuxtLink to="/" class="mr-2 flex items-center gap-1.5 font-semibold">
            <RiStore2Line class="size-5 text-primary" />
            <span class="hidden sm:inline">Postskins</span>
          </NuxtLink>
          <nav class="flex items-center gap-0.5">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              active-class="bg-muted text-foreground"
              class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <component :is="link.icon" v-if="link.icon" class="size-3.5" />
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Right: wallet + account -->
        <div class="flex items-center gap-2">
          <template v-if="isAuthenticated">
            <NuxtLink
              to="/market"
              class="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-sm transition-colors hover:border-ring/60"
              title="Wallet balance"
            >
              <RiWallet3Line class="size-4 text-muted-foreground" />
              <span class="font-mono font-medium tabular-nums">{{ formatMoney(wallet?.balance, wallet?.currency) }}</span>
            </NuxtLink>
            <img v-if="user?.avatar" :src="user.avatar" :alt="user.name" class="size-7 rounded-full">
            <Button variant="ghost" size="sm" @click="logout()">Sign out</Button>
          </template>
          <Button v-else variant="outline" size="sm" @click="loginWithSteam()">
            <RiSteamFill /> Sign in
          </Button>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
