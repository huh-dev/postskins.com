import { _ as _sfc_main$1 } from './index-ZcX2QkUC.mjs';
import { _ as __nuxt_component_1, t as tradeEventLabel } from './useTrade-BZQUdb7u.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { RiFlaskLine, RiRefreshLine, RiDownloadLine, RiLock2Line, RiLoopRightLine, RiArrowRightLine } from '@remixicon/vue';
import { f as formatMoney } from './format-BBBd5tQz.mjs';
import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'consola';

function useTradeLab() {
  const client = useSanctumClient();
  const state = ref(null);
  const busy = ref(false);
  const errorMessage = ref(null);
  async function call(path, method, body) {
    errorMessage.value = null;
    try {
      state.value = await client(`/api/dev/trade-lab/${path}`, { method, body });
    } catch (error) {
      const response = error;
      errorMessage.value = response.data?.message ?? "Trade lab request failed. Make sure the API is running locally (APP_ENV=local).";
    }
  }
  async function action(path, body) {
    busy.value = true;
    await call(path, "POST", body);
    busy.value = false;
  }
  return {
    state,
    busy,
    errorMessage,
    refresh: () => call("state", "GET"),
    reset: () => action("reset"),
    loadDemo: () => action("demo-seller"),
    syncSeller: (steamId) => action("sync-seller", { steam_id: steamId }),
    buy: (inventoryItemId, price) => action("buy", { inventory_item_id: inventoryItemId, price }),
    simulateReceived: () => action("simulate-received"),
    simulateReversal: () => action("simulate-reversal")
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "trade-lab",
  __ssrInlineRender: true,
  setup(__props) {
    const { state, busy, errorMessage, reset, loadDemo, syncSeller, buy, simulateReceived, simulateReversal } = useTradeLab();
    const sellerSteamId = ref("");
    const selectedItemId = ref(null);
    const priceInput = ref(25);
    const trade = computed(() => state.value?.trade ?? null);
    const listings = computed(() => state.value?.listings ?? []);
    const hasActiveTrade = computed(() => !!trade.value && ["pending_delivery", "accepted"].includes(trade.value.status));
    const canCreateOffer = computed(
      () => !hasActiveTrade.value && selectedItemId.value !== null && priceInput.value > 0
    );
    const canReceive = computed(() => trade.value?.status === "pending_delivery");
    const canReverse = computed(() => trade.value?.status === "accepted");
    async function createOffer() {
      if (selectedItemId.value !== null) {
        await buy(selectedItemId.value, Math.round(priceInput.value * 100));
      }
    }
    watch(listings, (items) => {
      if (selectedItemId.value !== null && !items.some((item) => item.inventory_item_id === selectedItemId.value)) {
        selectedItemId.value = null;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$1;
      const _component_TradeStatusBadge = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto min-h-svh w-full max-w-5xl p-4 sm:p-6" }, _attrs))}><header class="mb-6 flex items-start justify-between gap-3"><div><h1 class="flex items-center gap-2 text-lg font-semibold">`);
      _push(ssrRenderComponent(unref(RiFlaskLine), { class: "size-5 text-muted-foreground" }, null, _parent));
      _push(` Trade lab </h1><p class="mt-1 max-w-2xl text-xs text-muted-foreground"> Load a real Steam account&#39;s public inventory as the seller, create an offer from one of its items, then simulate the buyer receiving it — and watch the payout lock, release, or reverse. </p></div>`);
      _push(ssrRenderComponent(_component_Button, {
        variant: "outline",
        size: "sm",
        disabled: unref(busy),
        onClick: ($event) => unref(reset)()
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(RiRefreshLine), {
              class: { "animate-spin": unref(busy) }
            }, null, _parent2, _scopeId));
            _push2(` Reset `);
          } else {
            return [
              createVNode(unref(RiRefreshLine), {
                class: { "animate-spin": unref(busy) }
              }, null, 8, ["class"]),
              createTextVNode(" Reset ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      if (unref(errorMessage)) {
        _push(`<p class="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">${ssrInterpolate(unref(errorMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid gap-3 sm:grid-cols-2"><!--[-->`);
      ssrRenderList([{ key: "seller", data: unref(state)?.seller, title: "Seller (real account)" }, { key: "buyer", data: unref(state)?.buyer, title: "Buyer (simulated)" }], (party) => {
        _push(`<section class="rounded-lg border border-border bg-card p-4"><div class="flex items-center justify-between"><h2 class="text-sm font-semibold">${ssrInterpolate(party.title)}</h2>`);
        if (party.data?.suspended) {
          _push(`<span class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"${ssrRenderAttr("title", party.data?.suspension_reason ?? void 0)}> Suspended </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><p class="mt-0.5 truncate text-xs text-muted-foreground">${ssrInterpolate(party.data ? `${party.data.name} · ${party.data.steam_id}` : "—")}</p><dl class="mt-3 space-y-1.5"><div class="flex items-center justify-between"><dt class="text-xs text-muted-foreground">Spendable</dt><dd class="font-mono text-sm font-medium tabular-nums">${ssrInterpolate(unref(formatMoney)(party.data?.balance, party.data?.currency))}</dd></div><div class="flex items-center justify-between"><dt class="text-xs text-muted-foreground">Locked (in protection)</dt><dd class="${ssrRenderClass([party.data?.locked_balance ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground", "font-mono text-sm tabular-nums"])}">${ssrInterpolate(unref(formatMoney)(party.data?.locked_balance, party.data?.currency))}</dd></div></dl></section>`);
      });
      _push(`<!--]--></div><section class="mt-4 rounded-lg border border-border bg-card p-4"><h2 class="text-sm font-semibold">1 · Create the offer</h2><div class="mt-3 flex flex-wrap items-end gap-2"><label class="flex flex-col gap-1 text-xs"><span class="text-muted-foreground">Seller SteamID64 (public inventory)</span><input${ssrRenderAttr("value", unref(sellerSteamId))} inputmode="numeric" placeholder="7656119…" class="h-9 w-64 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"></label>`);
      _push(ssrRenderComponent(_component_Button, {
        variant: "outline",
        size: "sm",
        disabled: unref(busy) || unref(sellerSteamId).length !== 17,
        onClick: ($event) => unref(syncSeller)(unref(sellerSteamId))
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(RiDownloadLine), null, null, _parent2, _scopeId));
            _push2(` Load inventory `);
          } else {
            return [
              createVNode(unref(RiDownloadLine)),
              createTextVNode(" Load inventory ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Button, {
        variant: "secondary",
        size: "sm",
        disabled: unref(busy),
        onClick: ($event) => unref(loadDemo)()
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Load demo inventory `);
          } else {
            return [
              createTextVNode(" Load demo inventory ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(state)?.seller_inventory_status === "private") {
        _push(`<p class="mt-2 text-xs text-amber-600 dark:text-amber-400"> That inventory is private — set it to public on Steam, then load again. </p>`);
      } else if (unref(state)?.seller_inventory_status === "error") {
        _push(`<p class="mt-2 text-xs text-destructive"> Couldn&#39;t reach Steam for that account. Check the SteamID and your inventory driver. </p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(listings).length) {
        _push(`<div class="mt-4"><p class="mb-2 text-xs text-muted-foreground"> Pick an item to sell (${ssrInterpolate(unref(listings).length)} loaded`);
        if (unref(selectedItemId)) {
          _push(`<span> · 1 selected</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`): </p><div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"><!--[-->`);
        ssrRenderList(unref(listings), (item) => {
          _push(`<button type="button" class="${ssrRenderClass([unref(selectedItemId) === item.inventory_item_id ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-ring/60", "group relative flex flex-col overflow-hidden rounded-lg border bg-card p-0 text-left transition-colors"])}">`);
          if (!item.tradable) {
            _push(`<span class="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-600 backdrop-blur-sm dark:text-amber-400">`);
            _push(ssrRenderComponent(unref(RiLock2Line), { class: "size-2.5" }, null, _parent));
            _push(` Locked </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-2">`);
          if (item.icon_url) {
            _push(`<img${ssrRenderAttr("src", item.icon_url)}${ssrRenderAttr("alt", item.name ?? "Item")} loading="lazy" class="max-h-full max-w-full object-contain">`);
          } else {
            _push(`<span class="text-xs text-muted-foreground">No image</span>`);
          }
          _push(`</div><p class="truncate border-t border-border px-2 py-1.5 text-xs font-medium"${ssrRenderAttr("title", item.name ?? "")}>${ssrInterpolate(item.name ?? "Unknown item")}</p></button>`);
        });
        _push(`<!--]--></div><div class="mt-3 flex flex-wrap items-end gap-2"><label class="flex flex-col gap-1 text-xs"><span class="text-muted-foreground">Price (${ssrInterpolate(unref(state)?.buyer?.currency ?? "USD")})</span><input${ssrRenderAttr("value", unref(priceInput))} type="number" min="0.01" step="0.01" class="h-9 w-32 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"></label>`);
        _push(ssrRenderComponent(_component_Button, {
          size: "sm",
          disabled: unref(busy) || !unref(canCreateOffer),
          onClick: ($event) => createOffer()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(busy)) {
                _push2(ssrRenderComponent(unref(RiLoopRightLine), { class: "animate-spin" }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(` Create offer (hold funds) `);
            } else {
              return [
                unref(busy) ? (openBlock(), createBlock(unref(RiLoopRightLine), {
                  key: 0,
                  class: "animate-spin"
                })) : createCommentVNode("", true),
                createTextVNode(" Create offer (hold funds) ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(hasActiveTrade)) {
          _push(`<p class="mt-2 text-xs text-amber-600 dark:text-amber-400"> A trade is already in progress — Reset (top right) to create a new offer. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (unref(state)?.seller) {
        _push(`<p class="mt-3 text-xs text-muted-foreground"> No CS2 items found for that account. </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section class="mt-4 rounded-lg border border-border bg-card p-4"><div class="flex items-center justify-between gap-3"><h2 class="text-sm font-semibold">2 · Track the trade</h2>`);
      if (unref(trade)) {
        _push(ssrRenderComponent(_component_TradeStatusBadge, {
          status: unref(trade).status
        }, null, _parent));
      } else {
        _push(`<span class="text-xs text-muted-foreground">No trade yet</span>`);
      }
      _push(`</div>`);
      if (unref(trade)) {
        _push(`<!--[--><div class="mt-3 flex items-center gap-3 rounded-md border border-border bg-background/50 p-3"><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">${ssrInterpolate(unref(trade).item.name)}</p><p class="truncate text-xs text-muted-foreground">${ssrInterpolate(unref(trade).market_hash_name)}</p></div><span class="shrink-0 font-mono text-sm font-semibold tabular-nums">${ssrInterpolate(unref(formatMoney)(unref(trade).price, unref(trade).currency))}</span></div>`);
        if (unref(trade).status === "pending_delivery" && unref(trade).steam_trade_link) {
          _push(`<div class="mt-3 rounded-md border border-dashed border-border p-3 text-xs"><p class="text-muted-foreground">The seller opens this link in Steam to deliver the item, then confirms on their mobile authenticator:</p><a${ssrRenderAttr("href", unref(trade).steam_trade_link)} target="_blank" rel="noopener" class="mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"> Open Steam trade offer `);
          _push(ssrRenderComponent(unref(RiArrowRightLine), { class: "size-3.5" }, null, _parent));
          _push(`</a></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(trade).events?.length) {
          _push(`<ol class="mt-4 space-y-2 border-t border-border pt-4"><!--[-->`);
          ssrRenderList(unref(trade).events, (event) => {
            _push(`<li class="flex items-start gap-2.5 text-xs"><span class="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"></span><div class="flex-1"><p class="font-medium">${ssrInterpolate(("tradeEventLabel" in _ctx ? _ctx.tradeEventLabel : unref(tradeEventLabel))(event.type))}</p><p class="text-muted-foreground">${ssrInterpolate(event.created_at ? new Date(event.created_at).toLocaleTimeString() : "")}</p></div></li>`);
          });
          _push(`<!--]--></ol>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">`);
        _push(ssrRenderComponent(_component_Button, {
          size: "sm",
          variant: "secondary",
          disabled: unref(busy) || !unref(canReceive),
          onClick: ($event) => unref(simulateReceived)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Simulate item received `);
            } else {
              return [
                createTextVNode(" Simulate item received ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_Button, {
          size: "sm",
          variant: "destructive",
          disabled: unref(busy) || !unref(canReverse),
          onClick: ($event) => unref(simulateReversal)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Simulate reversal `);
            } else {
              return [
                createTextVNode(" Simulate reversal ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="mt-3 text-xs text-muted-foreground"><strong>Simulate item received</strong> locks the payout to the seller; wait out the protection window to complete it, or <strong>Simulate reversal</strong> to suspend the seller and refund the buyer. </p></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trade-lab.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=trade-lab-DSGO8COv.mjs.map
