<script setup lang="ts">
import { usePreferredReducedMotion, useTransition } from "@vueuse/core"
import {
  RiArrowDownSLine,
  RiFlaskLine,
  RiLock2Line,
  RiRefreshLine,
  RiWallet3Line,
} from "@remixicon/vue"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatMoney } from "@/lib/format"

const {
  loading,
  currency,
  balance,
  lockedBalance,
  totalBalance,
  hasLockedBalance,
  load: loadWallet,
  addTestFunds,
} = useWallet()

const reducedMotion = usePreferredReducedMotion()

const countUpDuration = computed(() => (reducedMotion.value === "reduce" ? 0 : 620))

/** Count the balance up rather than snapping, so credits/debits read as motion. */
const animatedBalance = useTransition(balance, {
  duration: countUpDuration,
  transition: [0.22, 1, 0.36, 1],
})

const balanceDisplay = computed(() => formatMoney(Math.round(animatedBalance.value), currency.value))
const settledBalanceDisplay = computed(() => formatMoney(balance.value, currency.value))
const lockedBalanceDisplay = computed(() => formatMoney(lockedBalance.value, currency.value))
const totalBalanceDisplay = computed(() => formatMoney(totalBalance.value, currency.value))

/** Share of the total that is spendable, used to size the split meter. */
const availableShare = computed(() => {
  if (totalBalance.value <= 0) {
    return 1
  }

  return balance.value / totalBalance.value
})

const triggerLabel = computed(() =>
  hasLockedBalance.value
    ? `Wallet: ${settledBalanceDisplay.value} available, ${lockedBalanceDisplay.value} in escrow`
    : `Wallet: ${settledBalanceDisplay.value}`,
)

const isDev = import.meta.dev

const addingFunds = ref(false)

async function onAddTestFunds(): Promise<void> {
  addingFunds.value = true

  try {
    await addTestFunds()
  }
  finally {
    addingFunds.value = false
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger
      class="group flex items-center gap-1.5 rounded-md border border-border/40 bg-sidebar px-2 py-1.5 font-mono tabular-nums transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/60"
      :aria-label="triggerLabel"
    >
      <RiWallet3Line class="size-3.5 shrink-0 text-sidebar-foreground/60" aria-hidden="true" />

      <span class="text-[0.8125rem] font-medium tracking-[0.01em] text-sidebar-foreground">
        {{ balanceDisplay }}
      </span>

      <span
        v-if="hasLockedBalance"
        class="inline-flex items-center gap-0.5 rounded-sm bg-chart-1/15 px-1 py-px text-[0.625rem] tracking-[0.01em] text-chart-1"
      >
        <RiLock2Line class="size-2.5 shrink-0" aria-hidden="true" />
        <span>{{ lockedBalanceDisplay }}</span>
      </span>

      <RiArrowDownSLine
        class="size-3 shrink-0 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </PopoverTrigger>

    <PopoverContent
      align="end"
      :side-offset="8"
      class="w-(--reka-popover-trigger-width) min-w-56 gap-3 rounded-md border border-border/40 bg-sidebar p-3 ring-0"
    >
      <div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
              Available
            </p>
            <p class="mt-0.5 font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {{ balanceDisplay }}
            </p>
          </div>

          <button
            type="button"
            class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            aria-label="Refresh wallet balance"
            :disabled="loading"
            @click="loadWallet()"
          >
            <RiRefreshLine
              class="size-3.5"
              :class="{ 'animate-spin motion-reduce:animate-none': loading }"
            />
          </button>
        </div>

        <div class="mt-2.5 flex h-1 overflow-hidden rounded-full bg-chart-1/55" role="presentation">
          <span
            class="rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
            :style="{ width: `${availableShare * 100}%` }"
          />
        </div>
      </div>

      <dl class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <dt class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            Spendable
          </dt>
          <dd class="font-mono text-xs font-medium tabular-nums text-foreground">
            {{ settledBalanceDisplay }}
          </dd>
        </div>

        <div class="flex items-center justify-between gap-3">
          <dt class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="size-1.5 shrink-0 rounded-full bg-chart-1/70" aria-hidden="true" />
            In escrow
          </dt>
          <dd
            class="font-mono text-xs font-medium tabular-nums"
            :class="hasLockedBalance ? 'text-foreground' : 'text-muted-foreground/55'"
          >
            {{ lockedBalanceDisplay }}
          </dd>
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-border/55 pt-2">
          <dt class="text-xs font-medium text-foreground">
            Total
          </dt>
          <dd class="font-mono text-xs font-medium tabular-nums text-foreground">
            {{ totalBalanceDisplay }}
          </dd>
        </div>
      </dl>

      <p
        v-if="hasLockedBalance"
        class="flex items-start gap-1.5 text-[0.6875rem] leading-snug text-muted-foreground"
      >
        <RiLock2Line class="mt-px size-3 shrink-0 opacity-70" aria-hidden="true" />
        <span>Escrowed funds are reserved for trades in progress and release when they settle.</span>
      </p>

      <button
        v-if="isDev"
        type="button"
        class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-accent/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        :disabled="addingFunds"
        @click="onAddTestFunds()"
      >
        <RiFlaskLine class="size-3.5" aria-hidden="true" />
        {{ addingFunds ? "Adding funds…" : "Add test funds" }}
      </button>
    </PopoverContent>
  </Popover>
</template>
