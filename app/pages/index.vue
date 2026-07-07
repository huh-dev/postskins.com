<script setup lang="ts">
const { user, isAuthenticated, loginWithSteam, logout } = useAuth()
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
    <!-- Always-visible auth status so you can see the state change -->
    <div
      class="rounded-md border px-3 py-1.5 text-xs font-medium"
      :class="isAuthenticated
        ? 'border-green-500/40 bg-green-500/10 text-green-600'
        : 'border-border text-muted-foreground'"
    >
      {{ isAuthenticated ? 'Authenticated' : 'Not signed in' }}
    </div>

    <template v-if="isAuthenticated && user">
      <img
        v-if="user.avatar"
        :src="user.avatar"
        :alt="user.name"
        class="size-20 rounded-full"
      >
      <p class="text-sm">Signed in as <strong>{{ user.name }}</strong></p>
      <p class="text-xs text-muted-foreground">Steam ID: {{ user.steam_id }}</p>
      <div class="flex gap-2">
        <Button as-child>
          <NuxtLink to="/inventory">View inventory</NuxtLink>
        </Button>
        <Button variant="destructive" @click="logout()">Sign out</Button>
      </div>
    </template>

    <template v-else>
      <h1 class="font-sans text-lg">Welcome to Postskins</h1>
      <Button variant="outline" @click="loginWithSteam()">Sign in with Steam</Button>
    </template>
  </div>
</template>
