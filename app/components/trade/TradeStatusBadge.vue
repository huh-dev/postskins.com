<script setup lang="ts">
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const { status } = defineProps<{ status: string }>()

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        pending_delivery: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        accepted: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
        completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
        reversed: "bg-destructive/10 text-destructive",
        cancelled: "bg-muted text-muted-foreground",
        disputed: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
      },
    },
    defaultVariants: { status: "pending_delivery" },
  },
)

const labels: Record<string, string> = {
  pending_delivery: "Pending delivery",
  accepted: "Accepted · protected",
  completed: "Completed",
  reversed: "Reversed",
  cancelled: "Cancelled",
  disputed: "Disputed",
}

const label = computed(() => labels[status] ?? status)
</script>

<template>
  <span :class="cn(badge({ status: status as never }))">
    <span class="size-1.5 rounded-full bg-current opacity-70" />
    {{ label }}
  </span>
</template>
