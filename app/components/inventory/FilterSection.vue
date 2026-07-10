<script setup lang="ts">
import { RiArrowUpSLine } from '@remixicon/vue'
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'

withDefaults(defineProps<{
  title: string
  defaultOpen?: boolean
}>(), {
  defaultOpen: true,
})
</script>

<template>
  <CollapsibleRoot
    :default-open="defaultOpen"
    class="border-b border-border/60 py-4 last:border-b-0"
  >
    <CollapsibleTrigger class="group flex w-full items-center justify-between text-left outline-none">
      <span class="text-sm font-semibold text-foreground">{{ title }}</span>
      <RiArrowUpSLine
        class="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:rotate-180"
      />
    </CollapsibleTrigger>

    <CollapsibleContent class="filter-collapsible overflow-hidden">
      <div class="pt-4">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.filter-collapsible[data-state='open'] {
  animation: filter-collapsible-down 200ms ease-out;
}

.filter-collapsible[data-state='closed'] {
  animation: filter-collapsible-up 200ms ease-out;
}

@keyframes filter-collapsible-down {
  from {
    height: 0;
  }
  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes filter-collapsible-up {
  from {
    height: var(--reka-collapsible-content-height);
  }
  to {
    height: 0;
  }
}
</style>
