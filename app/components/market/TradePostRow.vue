<script setup lang="ts">
import { RiArrowLeftRightLine, RiCopperCoinLine, RiUser3Line } from "@remixicon/vue"
import type { PostDto } from "@/composables/usePosts"
import { formatMoney } from "@/lib/format"

const { post, own = false } = defineProps<{ post: PostDto, own?: boolean }>()
const emit = defineEmits<{ offer: [post: PostDto], open: [post: PostDto] }>()

const postedAt = computed(() =>
  post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "",
)
</script>

<template>
  <article class="surface-panel group flex flex-col gap-3 rounded-lg p-3 sm:p-4">
    <!-- Who -->
    <header class="flex items-center gap-2">
      <img
        v-if="post.owner?.avatar"
        :src="post.owner.avatar"
        :alt="post.owner.name"
        class="size-6 rounded-md object-cover ring-1 ring-border"
      >
      <span v-else class="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <RiUser3Line class="size-3.5" />
      </span>
      <span class="text-sm font-medium">{{ post.owner?.name ?? "Unknown" }}</span>
      <span v-if="post.owner?.suspended" class="rounded bg-destructive/10 px-1.5 py-px text-[0.625rem] font-medium text-destructive">suspended</span>
      <span class="ml-auto text-xs text-muted-foreground">{{ postedAt }}</span>
    </header>

    <!-- The two sides -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
      <!-- Offering -->
      <div class="min-w-0">
        <p class="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">Offering</p>
        <div class="flex flex-wrap items-center gap-1.5">
          <MarketItemThumb v-for="item in post.offering" :key="item.id" :item="item.item" size="sm" />
          <span
            v-if="post.offer_cash > 0"
            class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
          >
            <RiCopperCoinLine class="size-3.5" />{{ formatMoney(post.offer_cash, post.currency) }}
          </span>
          <span v-if="!post.offering.length && !post.offer_cash" class="text-xs text-muted-foreground">—</span>
        </div>
      </div>

      <RiArrowLeftRightLine class="size-5 shrink-0 text-muted-foreground/60" />

      <!-- Wanting -->
      <div class="min-w-0">
        <p class="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">Wanting</p>
        <div class="flex flex-wrap items-center gap-1.5">
          <MarketItemThumb v-for="item in post.wanting" :key="item.id" :item="item.item" size="sm" />
          <span
            v-if="post.want_cash > 0"
            class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
          >
            <RiCopperCoinLine class="size-3.5" />{{ formatMoney(post.want_cash, post.currency) }}
          </span>
          <span
            v-if="post.wants_anything"
            class="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground"
          >Open to offers</span>
          <span v-if="!post.wanting.length && !post.want_cash && !post.wants_anything" class="text-xs text-muted-foreground">—</span>
        </div>
      </div>
    </div>

    <p v-if="post.note" class="line-clamp-2 text-xs text-muted-foreground">"{{ post.note }}"</p>

    <!-- Actions -->
    <footer class="flex items-center gap-2 border-t border-border/60 pt-2.5">
      <span v-if="own" class="text-xs text-muted-foreground">
        {{ post.offers_count ?? 0 }} offer{{ (post.offers_count ?? 0) === 1 ? "" : "s" }}
      </span>
      <Button
        v-if="own"
        variant="outline"
        size="sm"
        class="ml-auto"
        @click="emit('open', post)"
      >
        Manage
      </Button>
      <template v-else>
        <Button variant="ghost" size="sm" @click="emit('open', post)">Details</Button>
        <Button size="sm" class="ml-auto" @click="emit('offer', post)">Make offer</Button>
      </template>
    </footer>
  </article>
</template>
