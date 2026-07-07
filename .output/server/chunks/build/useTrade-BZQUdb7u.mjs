import { ref, computed, toValue, defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { cva } from 'class-variance-authority';
import { c as cn } from './index-ZcX2QkUC.mjs';
import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "TradeStatusBadge",
  __ssrInlineRender: true,
  props: {
    status: {}
  },
  setup(__props) {
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
            disputed: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300"
          }
        },
        defaultVariants: { status: "pending_delivery" }
      }
    );
    const labels = {
      pending_delivery: "Pending delivery",
      accepted: "Accepted · protected",
      completed: "Completed",
      reversed: "Reversed",
      cancelled: "Cancelled",
      disputed: "Disputed"
    };
    const label = computed(() => labels[__props.status] ?? __props.status);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: unref(cn)(unref(badge)({ status: __props.status }))
      }, _attrs))}><span class="size-1.5 rounded-full bg-current opacity-70"></span> ${ssrInterpolate(unref(label))}</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/trade/TradeStatusBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "TradeStatusBadge" });
function useTrade(id) {
  const client = useSanctumClient();
  const trade = ref(null);
  const status = ref("idle");
  const errorMessage = ref(null);
  const isLoading = computed(() => status.value === "loading");
  const isActive = computed(
    () => trade.value?.status === "pending_delivery" || trade.value?.status === "accepted"
  );
  async function load() {
    if (trade.value === null) {
      status.value = "loading";
    }
    try {
      const data = await client(`/api/trades/${toValue(id)}`);
      trade.value = data.trade;
      status.value = "success";
    } catch (error) {
      const response = error;
      status.value = "error";
      errorMessage.value = response.data?.message ?? "We could not load this trade.";
    }
  }
  return { trade, status, isLoading, isActive, errorMessage, load };
}
function tradeEventLabel(type) {
  const labels = {
    created: "Trade created · funds held",
    accepted: "Item received · payout locked",
    completed: "Protection window passed · seller paid",
    reversal: "Reversal detected · seller suspended",
    cancelled: "Not delivered · buyer refunded",
    disputed: "Wrong item · under review"
  };
  return labels[type] ?? type;
}

export { __nuxt_component_1 as _, tradeEventLabel as t, useTrade as u };
//# sourceMappingURL=useTrade-BZQUdb7u.mjs.map
