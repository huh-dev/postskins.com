<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { useResizeObserver, useTransition, useWindowScroll } from "@vueuse/core"
import {
  RiLogoutBoxRLine,
  RiNotification3Line,
  RiShoppingCart2Line,
  RiSteamFill,
  RiUser3Line,
} from "@remixicon/vue"
import { formatMoney } from "@/lib/format"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const { user, isAuthenticated, loginWithSteam, logout } = useAuth()
const { wallet, load: loadWallet } = useWallet()
const route = useRoute()

const navLinks = [
  { to: "/market", label: "Market" },
  { to: "/sell", label: "Sell" },
  { to: "/inventory", label: "Inventory" },
  { to: "/trade-lab", label: "Trade lab" },
] as const

const navRef = ref<HTMLElement | null>(null)
const linkRefs = ref<Record<string, HTMLElement>>({})

const indicator = reactive({
  width: 0,
  x: 0,
  visible: false,
})

const isNavActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

const activeLink = computed(() =>
  navLinks.find(link => isNavActive(link.to))?.to ?? null,
)

const indicatorStyle = computed(() => ({
  width: `${indicator.width}px`,
  transform: `translateX(${indicator.x}px)`,
  opacity: indicator.visible ? 1 : 0,
}))

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
    "--header-bg-alpha": String(elevation * 0.42),
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
  }
})

const balanceDisplay = computed(() =>
  formatMoney(wallet.value?.balance, wallet.value?.currency ?? "USD"),
)

function setLinkRef(to: string, el: Element | ComponentPublicInstance | null) {
  if (!el) {
    delete linkRefs.value[to]
    return
  }

  linkRefs.value[to] = el instanceof HTMLElement
    ? el
    : (el as ComponentPublicInstance).$el as HTMLElement
}

function updateIndicator() {
  const target = activeLink.value
  const nav = navRef.value
  const link = target ? linkRefs.value[target] : null

  if (!target || !nav || !link) {
    indicator.visible = false
    return
  }

  const navRect = nav.getBoundingClientRect()
  const linkRect = link.getBoundingClientRect()

  indicator.width = linkRect.width
  indicator.x = linkRect.left - navRect.left
  indicator.visible = true
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadWallet()
  }

  nextTick(updateIndicator)
})

watch(isAuthenticated, (authed) => {
  if (authed) {
    loadWallet()
  }
})

watch(activeLink, () => nextTick(updateIndicator))
watch(() => route.path, () => nextTick(updateIndicator))

useResizeObserver(navRef, () => updateIndicator())
</script>

<template>
  <header
    class="navbar-header fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3"
    :style="headerSurfaceStyle"
  >
    <div class="col-start-1 flex items-center gap-1.5 justify-self-start">
      <div
        class="navbar-section flex items-center gap-1 rounded-lg p-1"
        :style="sectionSurfaceStyle"
      >
        <NuxtLink
          to="/"
          class="flex h-8 items-center rounded-md px-1.5 transition-opacity hover:opacity-90"
        >
          <BrandPostskinsLogo />
        </NuxtLink>
      </div>
    </div>

    <nav
      ref="navRef"
      class="navbar-section relative col-start-2 hidden items-center gap-0.5 justify-self-center rounded-lg p-1 md:flex"
      :style="sectionSurfaceStyle"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute top-1 bottom-1 left-0 rounded-md bg-foreground/20 transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        :style="indicatorStyle"
      />

      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :ref="(el) => setLinkRef(link.to, el)"
        :to="link.to"
        class="relative z-10 flex h-8 items-center rounded-md px-2.5 text-xs transition-colors duration-200"
        :class="isNavActive(link.to)
          ? 'font-medium text-foreground'
          : 'text-foreground/55 hover:text-foreground/90'"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div
      v-if="isAuthenticated"
      class="navbar-section col-start-3 flex items-center justify-self-end rounded-lg p-1"
      :style="sectionSurfaceStyle"
    >
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Cart"
        >
          <RiShoppingCart2Line class="size-4" />
        </button>

        <span class="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <RiNotification3Line class="size-4" />
        </button>

        <span class="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />

        <DropdownMenu :modal="false">
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="flex h-8 items-center gap-2 rounded-md pl-1 pr-2.5 transition-colors hover:bg-accent"
            >
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.name"
                class="size-6 rounded-md object-cover"
              >
              <span
                v-else
                class="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <RiUser3Line class="size-3.5" />
              </span>
              <span class="font-mono text-xs font-semibold tabular-nums text-foreground">
                {{ balanceDisplay }}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="min-w-44">
            <DropdownMenuItem as-child>
              <NuxtLink to="/inventory" class="w-full cursor-pointer">
                Inventory
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/market" class="w-full cursor-pointer">
                Market
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/sell" class="w-full cursor-pointer">
                Sell
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="logout()">
              <RiLogoutBoxRLine />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </div>

    <button
      v-else
      type="button"
      class="sign-in-btn group col-start-3 flex h-10 items-center justify-self-end gap-1.5 rounded-lg px-3.5 text-xs font-medium text-foreground"
      :style="sectionSurfaceStyle"
      @click="loginWithSteam()"
    >
      <RiSteamFill class="relative z-10 size-4 transition-colors duration-300 group-hover:text-foreground" />
      <span class="relative z-10 hidden sm:inline">Sign in</span>
    </button>
  </header>
</template>

<style scoped>
.navbar-header {
  padding-right: var(--scrollbar-width, 0px);
  border-bottom: 1px solid color-mix(
    in oklch,
    var(--border) calc(var(--header-border-alpha) * 100%),
    transparent
  );
  background-color: color-mix(
    in oklch,
    var(--background) calc(var(--header-bg-alpha) * 100%),
    transparent
  );
  -webkit-backdrop-filter: blur(var(--header-blur));
  backdrop-filter: blur(var(--header-blur));
}

.navbar-section {
  border: 1px solid color-mix(
    in oklch,
    var(--border) calc(var(--section-border-alpha) * 100%),
    transparent
  );
  background-color: color-mix(
    in oklch,
    var(--sidebar) calc(var(--section-bg-alpha) * 100%),
    transparent
  );
  -webkit-backdrop-filter: blur(var(--section-blur));
  backdrop-filter: blur(var(--section-blur));
  box-shadow: 0 var(--section-shadow-y) var(--section-shadow-blur) oklch(0 0 0 / var(--section-shadow-alpha));
}

.sign-in-btn {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(
    145deg,
    color-mix(in oklch, var(--sidebar) 88%, white 12%) 0%,
    var(--sidebar) 45%,
    color-mix(in oklch, var(--sidebar) 92%, black 8%) 100%
  );
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.07),
    inset 0 -1px 0 oklch(0 0 0 / 0.18),
    0 var(--section-shadow-y, 0px) var(--section-shadow-blur, 0px) oklch(0 0 0 / var(--section-shadow-alpha, 0));
  -webkit-backdrop-filter: blur(var(--section-blur, 4px));
  backdrop-filter: blur(var(--section-blur, 4px));
  border: 1px solid color-mix(
    in oklch,
    var(--border) calc(var(--section-border-alpha, 0) * 100%),
    transparent
  );
  transition:
    box-shadow 0.35s ease,
    transform 0.15s ease;
}

.sign-in-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 28%,
    oklch(1 0 0 / 0.03) 40%,
    oklch(1 0 0 / 0.09) 50%,
    oklch(1 0 0 / 0.03) 60%,
    transparent 72%
  );
  pointer-events: none;
}

.sign-in-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 38%,
    oklch(1 0 0 / 0.05) 44%,
    oklch(1 0 0 / 0.22) 50%,
    oklch(1 0 0 / 0.05) 56%,
    transparent 62%
  );
  transform: translateX(-120%);
  transition: transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1);
  pointer-events: none;
}

.sign-in-btn:hover {
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.12),
    inset 0 -1px 0 oklch(0 0 0 / 0.12),
    0 0 24px oklch(0.58 0.15 256.6 / 0.1);
}

.sign-in-btn:hover::after {
  transform: translateX(120%);
}

.sign-in-btn:active {
  transform: scale(0.98);
}
</style>
