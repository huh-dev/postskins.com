import { _ as _sfc_main$1 } from './index-ZcX2QkUC.mjs';
import { defineComponent, reactive, computed, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { RiSteamFill, RiLoopRightLine, RiLock2Line } from '@remixicon/vue';
import { f as formatMoney } from './format-BBBd5tQz.mjs';
import { u as useAuth } from './auth-Dmkix5Lz.mjs';
import { u as useInventory } from './useInventory-BRB_6jb1.mjs';
import { u as useMarket } from './useMarket-DE15xBfs.mjs';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
import './useSanctumAuth-CV-U5xaj.mjs';
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
import './useSanctumClient-CyejobjL.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "sell",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated, loginWithSteam } = useAuth();
    const { items, status, isLoading, load } = useInventory();
    const { mine, errorMessage, busy, loadMine, createListing, cancelListing } = useMarket();
    const priceDrafts = reactive({});
    const tradableItems = computed(() => items.value.filter((item) => item.tradable));
    const listedAssetIds = computed(() => new Set(mine.value.filter((l) => l.status === "active").map((l) => l.market_hash_name)));
    async function refresh() {
      await Promise.all([load(), loadMine()]);
    }
    async function list(itemId) {
      const price = priceDrafts[itemId];
      if (price && price > 0) {
        const ok = await createListing(itemId, Math.round(price * 100));
        if (ok) {
          delete priceDrafts[itemId];
        }
      }
    }
    watch(isAuthenticated, (authed) => {
      if (authed) {
        refresh();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto min-h-svh w-full max-w-5xl p-4 sm:p-6" }, _attrs))}>`);
      if (!unref(isAuthenticated)) {
        _push(`<div class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">`);
        _push(ssrRenderComponent(unref(RiSteamFill), { class: "size-10 text-muted-foreground" }, null, _parent));
        _push(`<h1 class="text-lg font-semibold">Sign in to sell</h1>`);
        _push(ssrRenderComponent(_component_Button, {
          variant: "outline",
          onClick: ($event) => unref(loginWithSteam)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(RiSteamFill), null, null, _parent2, _scopeId));
              _push2(` Sign in with Steam `);
            } else {
              return [
                createVNode(unref(RiSteamFill)),
                createTextVNode(" Sign in with Steam ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!--[--><header class="mb-5"><h1 class="text-lg font-semibold">Sell</h1></header>`);
        if (unref(errorMessage)) {
          _push(`<p class="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">${ssrInterpolate(unref(errorMessage))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(mine).length) {
          _push(`<section class="mb-6"><h2 class="mb-2 text-sm font-semibold">Your listings</h2><ul class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"><!--[-->`);
          ssrRenderList(unref(mine), (listing) => {
            _push(`<li class="flex items-center justify-between gap-3 px-3 py-2 text-sm"><span class="min-w-0 flex-1 truncate">${ssrInterpolate(listing.item.name)}</span><span class="font-mono text-xs tabular-nums">${ssrInterpolate(unref(formatMoney)(listing.price, listing.currency))}</span><span class="${ssrRenderClass([listing.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground", "w-16 text-right text-xs capitalize"])}">${ssrInterpolate(listing.status)}</span>`);
            if (listing.status === "active") {
              _push(ssrRenderComponent(_component_Button, {
                variant: "ghost",
                size: "xs",
                disabled: unref(busy),
                onClick: ($event) => unref(cancelListing)(listing.id)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`Cancel`);
                  } else {
                    return [
                      createTextVNode("Cancel")
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<span class="w-[52px]"></span>`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h2 class="mb-2 text-sm font-semibold">List an item</h2>`);
        if (unref(isLoading) && unref(items).length === 0) {
          _push(`<div class="flex min-h-[30svh] items-center justify-center">`);
          _push(ssrRenderComponent(unref(RiLoopRightLine), { class: "size-6 animate-spin text-muted-foreground" }, null, _parent));
          _push(`</div>`);
        } else if (unref(status) === "private") {
          _push(`<div class="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground"> Your Steam inventory is private — make it public to list items. </div>`);
        } else if (unref(tradableItems).length === 0) {
          _push(`<div class="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground"> No tradable CS2 items to list. </div>`);
        } else {
          _push(`<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"><!--[-->`);
          ssrRenderList(unref(tradableItems), (item) => {
            _push(`<div class="flex flex-col overflow-hidden rounded-lg border border-border bg-card"><div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-3">`);
            if (item.icon_url) {
              _push(`<img${ssrRenderAttr("src", item.icon_url)}${ssrRenderAttr("alt", item.market_name ?? item.name ?? "Item")} loading="lazy" class="max-h-full max-w-full object-contain">`);
            } else {
              _push(`<span class="text-xs text-muted-foreground">No image</span>`);
            }
            _push(`</div><div class="flex flex-1 flex-col gap-2 border-t border-border p-2.5"><p class="truncate text-xs font-medium"${ssrRenderAttr("title", item.market_name ?? item.name ?? "")}>${ssrInterpolate(item.market_name ?? item.name ?? "Unknown item")}</p>`);
            if (unref(listedAssetIds).has(item.market_hash_name ?? "")) {
              _push(`<div class="mt-auto flex items-center gap-1 text-[0.625rem] text-muted-foreground">`);
              _push(ssrRenderComponent(unref(RiLock2Line), { class: "size-3" }, null, _parent));
              _push(` Already listed </div>`);
            } else {
              _push(`<div class="mt-auto flex items-center gap-1.5"><input${ssrRenderAttr("value", unref(priceDrafts)[item.id])} type="number" min="0.01" step="0.01" placeholder="Price" class="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-ring">`);
              _push(ssrRenderComponent(_component_Button, {
                size: "xs",
                disabled: unref(busy) || !unref(priceDrafts)[item.id],
                onClick: ($event) => list(item.id)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`List`);
                  } else {
                    return [
                      createTextVNode("List")
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div>`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/sell.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=sell-ChtcOQe4.mjs.map
