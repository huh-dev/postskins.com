<script setup lang="ts">
import { RiErrorWarningLine, RiInboxLine, RiEyeOffLine, RiSteamFill } from '@remixicon/vue'

const { isAuthenticated, loginWithSteam } = useAuth()
const { items, groupedItems, status, isLoading, errorMessage, load } = useInventory()

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
  <div class="flex h-[calc(100svh-3.5rem)] w-full flex-col gap-3 overflow-hidden px-2 py-3 sm:px-3">
    <div v-if="!isAuthenticated" class="flex flex-1 items-center justify-center text-center">
      <div class="surface-panel flex max-w-sm flex-col items-center gap-4 rounded-lg px-6 py-8">
        <RiSteamFill class="size-10 text-muted-foreground" />
        <div>
          <h1 class="text-sm font-semibold text-foreground">Your inventory</h1>
          <p class="mt-1 text-xs text-muted-foreground">Sign in with Steam to view your CS2 items.</p>
        </div>
        <Button variant="outline" size="sm" @click="loginWithSteam()">
          <RiSteamFill />
          Sign in with Steam
        </Button>
      </div>
    </div>

    <template v-else>
      <InventoryFilterBar class="shrink-0" />

      <div class="inventory-scroll min-h-0 flex-1 overflow-y-auto pb-4">
        <div v-if="status === 'private'" class="surface-panel flex min-h-[50svh] flex-col items-center justify-center gap-4 rounded-lg px-4 py-10 text-center">
          <RiEyeOffLine class="size-10 text-muted-foreground" />
          <div class="max-w-md">
            <h2 class="text-sm font-semibold text-foreground">Your inventory is private</h2>
            <p class="mt-1 text-xs text-muted-foreground">
              Steam hides private inventories from everyone. Set your inventory privacy to
              <strong class="font-medium text-foreground">Public</strong>, then reload.
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" as="a" href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener">
              Open Steam privacy settings
            </Button>
            <Button size="sm" @click="load({ fresh: true })">I've made it public</Button>
          </div>
        </div>

        <div v-else-if="status === 'error'" class="surface-panel flex min-h-[50svh] flex-col items-center justify-center gap-4 rounded-lg px-4 py-10 text-center">
          <RiErrorWarningLine class="size-10 text-destructive" />
          <p class="max-w-md text-xs text-muted-foreground">{{ errorMessage }}</p>
          <Button variant="outline" size="sm" @click="load({ fresh: true })">Try again</Button>
        </div>

        <div v-else-if="isLoading && items.length === 0" class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="n in 18" :key="n" class="surface-panel animate-pulse overflow-hidden rounded-lg border-0">
            <div class="space-y-2 px-3 pt-2.5">
              <div class="h-3 w-4/5 rounded bg-sidebar-accent" />
              <div class="h-2.5 w-2/5 rounded bg-sidebar-accent/70" />
            </div>
            <div class="mx-3 mt-1 aspect-[4/3] rounded-md bg-sidebar-accent/50" />
            <div class="space-y-1.5 px-3 py-2.5">
              <div class="h-1 w-full rounded bg-sidebar-accent/70" />
              <div class="h-2.5 w-3/5 rounded bg-sidebar-accent/70" />
            </div>
          </div>
        </div>

        <div v-else-if="status === 'success' && items.length === 0" class="surface-panel flex min-h-[50svh] flex-col items-center justify-center gap-3 rounded-lg px-4 py-10 text-center">
          <RiInboxLine class="size-10 text-muted-foreground" />
          <p class="text-xs text-muted-foreground">No CS2 items found in this inventory.</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <InventoryItemCard v-for="stack in groupedItems" :key="stack.key" :stack="stack" />
        </div>
      </div>
    </template>
  </div>
</template>
