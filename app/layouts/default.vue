<script setup lang="ts">
import { RiFlaskLine, RiStore2Line, RiSteamFill, RiWallet3Line } from "@remixicon/vue"
import { formatMoney } from "@/lib/format"

const { user, isAuthenticated, loginWithSteam, logout } = useAuth()
const { wallet, load: loadWallet } = useWallet()
const route = useRoute()
</script>

<template>
  <div class="min-h-svh">
    <NavigationNavbar />
    <main class="pt-14">
      <slot />
    </main>
  </div>
</template>
