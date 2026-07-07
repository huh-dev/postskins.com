<script setup lang="ts">
import { RiErrorWarningLine, RiInboxLine, RiLoopRightLine, RiEyeOffLine, RiSteamFill } from '@remixicon/vue'

const { isAuthenticated, loginWithSteam } = useAuth()
const { items, status, stale, isLoading, errorMessage, load } = useInventory()

onMounted(() => {
  if (isAuthenticated.value) {
    load()
  }
})

watch(isAuthenticated, (authenticated, wasAuthenticated) => {
  if (authenticated && !wasAuthenticated) {
    load()
  }
})
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-6xl p-4 sm:p-6">
    <!-- Signed-out gate -->
    <div v-if="!isAuthenticated" class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <RiSteamFill class="size-10 text-muted-foreground" />
      <div>
        <h1 class="text-lg font-semibold">Your inventory</h1>
        <p class="mt-1 text-sm text-muted-foreground">Sign in with Steam to view your CS2 items.</p>
      </div>
      <Button variant="outline" @click="loginWithSteam()">
        <RiSteamFill />
        Sign in with Steam
      </Button>
    </div>

    <template v-else>
      <!-- Header -->
      <header class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold">Inventory</h1>
          <p class="text-xs text-muted-foreground">
            <template v-if="status === 'success'">
              {{ items.length }} {{ items.length === 1 ? 'item' : 'items' }}
              <span v-if="stale" class="text-amber-600 dark:text-amber-400"> · showing last known (Steam unavailable)</span>
            </template>
            <template v-else-if="isLoading">Loading…</template>
            <template v-else>Counter-Strike 2</template>
          </p>
        </div>

        <Button variant="outline" size="sm" :disabled="isLoading" @click="load({ fresh: true })">
          <RiLoopRightLine :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </header>

      <!-- Private inventory -->
      <div v-if="status === 'private'" class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">
        <RiEyeOffLine class="size-10 text-muted-foreground" />
        <div class="max-w-md">
          <h2 class="text-sm font-semibold">Your inventory is private</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Steam hides private inventories from everyone. Set your inventory privacy to
            <strong>Public</strong>, then reload.
          </p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" as="a" href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener">
            Open Steam privacy settings
          </Button>
          <Button size="sm" @click="load({ fresh: true })">I've made it public</Button>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="status === 'error'" class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">
        <RiErrorWarningLine class="size-10 text-destructive" />
        <p class="max-w-md text-sm text-muted-foreground">{{ errorMessage }}</p>
        <Button variant="outline" size="sm" @click="load({ fresh: true })">Try again</Button>
      </div>

      <!-- Loading skeletons (first load) -->
      <div v-else-if="isLoading && items.length === 0" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <div v-for="n in 18" :key="n" class="animate-pulse overflow-hidden rounded-lg border border-border bg-card">
          <div class="aspect-[4/3] bg-muted" />
          <div class="space-y-1.5 border-t border-border px-2.5 py-2">
            <div class="h-3 w-4/5 rounded bg-muted" />
            <div class="h-2.5 w-2/5 rounded bg-muted" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="status === 'success' && items.length === 0" class="flex min-h-[50svh] flex-col items-center justify-center gap-3 text-center">
        <RiInboxLine class="size-10 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">No CS2 items found in this inventory.</p>
      </div>

      <!-- Item grid -->
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <InventoryItemCard v-for="item in items" :key="item.asset_id" :item="item" />
      </div>
    </template>
  </div>
</template>
