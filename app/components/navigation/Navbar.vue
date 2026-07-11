<script setup lang="ts">
import { useTransition, useWindowScroll } from "@vueuse/core"
import {
  RiLogoutBoxRLine,
  RiSteamFill,
  RiUser3Line,
} from "@remixicon/vue"
import WalletMenu from "@/components/wallet/WalletMenu.vue"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const { user, isAuthenticated, loginWithSteam, logout } = useAuth()
const { load: loadWallet } = useWallet()
const route = useRoute()

const navLinks = [
  { to: "/market", label: "Market" },
  { to: "/sell", label: "Sell" },
  { to: "/support", label: "Support" },
] as const

const isNavActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

const { y: scrollY } = useWindowScroll()

const NAV_SCROLL_RANGE = 80

const navElevationTarget = computed(() => {
  const progress = Math.min(1, Math.max(0, scrollY.value / NAV_SCROLL_RANGE))
  return 1 - (1 - progress) ** 4
})

const navElevation = useTransition(navElevationTarget, {
  duration: 420,
  transition: [0.22, 1, 0.36, 1],
})

const headerSurfaceStyle = computed(() => {
  const elevation = navElevation.value

  return {
    "--header-blur": `${elevation * 16}px`,
    "--header-border-alpha": String(elevation * 0.45),
  }
})

const sectionSurfaceStyle = computed(() => {
  const elevation = navElevation.value

  return {
    "--section-blur": `${4 + elevation * 10}px`,
    "--section-border-alpha": String(elevation * 0.62),
    "--section-shadow-alpha": String(elevation * 0.24),
    "--section-shadow-blur": `${elevation * 18}px`,
    "--section-shadow-y": `${elevation * 4}px`,
    "--section-bg-alpha": String(0.9 + elevation * 0.08),
    "--shine-border-alpha": String(elevation * 0.62),
    "--shine-shadow-alpha": String(elevation * 0.24),
    "--shine-shadow-blur": `${elevation * 18}px`,
    "--shine-shadow-y": `${elevation * 4}px`,
  }
})

onMounted(() => {
  if (isAuthenticated.value) {
    loadWallet()
  }
})

watch(isAuthenticated, (authed) => {
  if (authed) {
    loadWallet()
  }
})

</script>

<template>
  <header
    class="bg-sidebar fixed inset-x-0 top-0 z-50 flex items-center px-3 py-2 sm:px-4"
    :style="headerSurfaceStyle"
  >
  
  <!-- Logo -->
  <div class="flex items-center gap-2">
    <NuxtImg src="/skins/postskins_logo.png" alt="Logo" class="w-10 h-10 rounded-lg" />
  </div>

  <!-- Navigation Links -->
  <nav class="ml-10 flex items-center gap-1">
    <NuxtLink
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      class="relative flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors duration-200"
      :class="isNavActive(link.to)
        ? 'text-sidebar-foreground'
        : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/65'"
    >
      <span class="relative">
        {{ link.label }}
        <span
          aria-hidden="true"
          class="absolute inset-x-0 -bottom-1 h-px origin-right bg-primary transition-transform duration-300 ease-out"
          :class="isNavActive(link.to) ? 'scale-x-100' : 'scale-x-0'"
        />
      </span>
    </NuxtLink>

  </nav>

  <!-- Auth -->
  <div class="ml-auto flex items-center gap-1">
    <template v-if="isAuthenticated">
      <WalletMenu />

      <span class="mx-1 h-4 w-px bg-sidebar-foreground/15" aria-hidden="true" />

      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="flex items-center rounded-md p-1 transition-colors duration-200 hover:bg-accent"
            :aria-label="`Account menu for ${user?.name ?? 'user'}`"
          >
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="user.name"
              class="size-7 rounded-md object-cover ring-1 ring-sidebar-foreground/10"
            >
            <span
              v-else
              class="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground"
            >
              <RiUser3Line class="size-3.5" />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="min-w-48">
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2.5 px-2 py-2">
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.name"
                class="size-8 rounded-md object-cover ring-1 ring-border"
              >
              <span
                v-else
                class="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <RiUser3Line class="size-4" />
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-foreground">
                  {{ user?.name }}
                </p>
                <p class="text-xs text-muted-foreground">
                  Steam account
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem as-child>
            <NuxtLink to="/account" class="w-full cursor-pointer">
              Account
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NuxtLink to="/sell" class="w-full cursor-pointer">
              Sell
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NuxtLink to="/market" class="w-full cursor-pointer">
              Market
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NuxtLink to="/support" class="w-full cursor-pointer">
              Support
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="logout()">
            <RiLogoutBoxRLine />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </template>

    <button
      v-else
      type="button"
      class="shine-btn shine-btn--primary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground"
      @click="loginWithSteam()"
    >
      <RiSteamFill class="relative z-10 size-4" />
      <span class="relative z-10 hidden sm:inline">Sign in</span>
    </button>
  </div>
  </header>
</template>
