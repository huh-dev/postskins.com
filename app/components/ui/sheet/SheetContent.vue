<script setup lang="ts">
import { RiCloseLine } from '@remixicon/vue'

import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import SheetOverlay from "./SheetOverlay.vue"

interface SheetContentProps extends DialogContentProps {
  class?: HTMLAttributes["class"]
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SheetContentProps>(), {
  side: "right",
  showCloseButton: true,
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "side", "showCloseButton")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <SheetOverlay />
    <DialogContent
      data-slot="sheet-content"
      :data-side="side"
      :class="cn(
        'bg-background text-foreground fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-closed:duration-200 data-open:duration-300 data-open:animate-in data-closed:animate-out',
        side === 'right'
          && 'inset-y-0 right-0 h-full w-3/4 border-l data-open:slide-in-from-right data-closed:slide-out-to-right sm:max-w-sm',
        side === 'left'
          && 'inset-y-0 left-0 h-full w-3/4 border-r data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-sm',
        side === 'top'
          && 'inset-x-0 top-0 h-auto border-b data-open:slide-in-from-top data-closed:slide-out-to-top',
        side === 'bottom'
          && 'inset-x-0 bottom-0 h-auto border-t data-open:slide-in-from-bottom data-closed:slide-out-to-bottom',
        props.class,
      )"
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="sheet-close"
        as-child
      >
        <Button variant="ghost" class="absolute top-4 right-4" size="icon-sm">
          <RiCloseLine />
          <span class="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
