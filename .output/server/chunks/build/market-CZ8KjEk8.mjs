import { _ as _sfc_main$1 } from './index-ZcX2QkUC.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-ZNc8GHku.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { RiSteamFill, RiWallet3Line, RiCheckLine } from '@remixicon/vue';
import { f as formatMoney } from './format-BBBd5tQz.mjs';
import { u as useAuth } from './auth-Dmkix5Lz.mjs';
import { u as useWallet } from './useWallet-B-bYuplg.mjs';
import { u as useMarket } from './useMarket-DE15xBfs.mjs';
import { n as navigateTo } from './server.mjs';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './useSanctumAuth-CV-U5xaj.mjs';
import './useSanctumClient-CyejobjL.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'consola';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "market",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated, user, loginWithSteam, saveTradeUrl } = useAuth();
    const { wallet, load: loadWallet, addTestFunds } = useWallet();
    const { listings, errorMessage, busy, loadMarket, purchase } = useMarket();
    const tradeUrlInput = ref("");
    const savingTradeUrl = ref(false);
    const hasTradeUrl = computed(() => !!user.value?.trade_url);
    async function refresh() {
      await Promise.all([loadMarket(), loadWallet()]);
    }
    async function onSaveTradeUrl() {
      savingTradeUrl.value = true;
      try {
        await saveTradeUrl(tradeUrlInput.value);
      } finally {
        savingTradeUrl.value = false;
      }
    }
    async function buy(id) {
      const trade = await purchase(id);
      if (trade) {
        await navigateTo(`/trade/${trade.id}`);
      } else {
        await refresh();
      }
    }
    watch(isAuthenticated, (authed) => {
      if (authed) {
        refresh();
        tradeUrlInput.value = user.value?.trade_url ?? "";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto min-h-svh w-full max-w-6xl p-4 sm:p-6" }, _attrs))}>`);
      if (!unref(isAuthenticated)) {
        _push(`<div class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">`);
        _push(ssrRenderComponent(unref(RiSteamFill), { class: "size-10 text-muted-foreground" }, null, _parent));
        _push(`<h1 class="text-lg font-semibold">Sign in to browse the market</h1>`);
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
        _push(`<!--[--><header class="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 class="text-lg font-semibold">Market</h1><div class="flex items-center gap-3"><span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-sm">`);
        _push(ssrRenderComponent(unref(RiWallet3Line), { class: "size-4 text-muted-foreground" }, null, _parent));
        _push(`<span class="font-mono font-medium tabular-nums">${ssrInterpolate(unref(formatMoney)(unref(wallet)?.balance, unref(wallet)?.currency))}</span></span>`);
        _push(ssrRenderComponent(_component_Button, {
          variant: "secondary",
          size: "sm",
          onClick: ($event) => unref(addTestFunds)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Add test funds`);
            } else {
              return [
                createTextVNode("Add test funds")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></header><section class="${ssrRenderClass([{ "border-amber-300 dark:border-amber-500/30": !unref(hasTradeUrl) }, "mb-5 rounded-lg border border-border bg-card p-4"])}"><h2 class="flex items-center gap-1.5 text-sm font-semibold"> Your Steam trade URL `);
        if (unref(hasTradeUrl)) {
          _push(ssrRenderComponent(unref(RiCheckLine), { class: "size-4 text-emerald-600 dark:text-emerald-400" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</h2><p class="mt-0.5 text-xs text-muted-foreground"> Required so a seller can send you the item. Steam → Inventory → Trade Offers → “Who can send me Trade Offers” → copy your Trade URL. </p><div class="mt-2 flex flex-wrap gap-2"><input${ssrRenderAttr("value", unref(tradeUrlInput))} placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…&amp;token=…" class="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring">`);
        _push(ssrRenderComponent(_component_Button, {
          size: "sm",
          disabled: unref(savingTradeUrl) || !unref(tradeUrlInput),
          onClick: ($event) => onSaveTradeUrl()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Save`);
            } else {
              return [
                createTextVNode("Save")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></section>`);
        if (unref(errorMessage)) {
          _push(`<p class="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">${ssrInterpolate(unref(errorMessage))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(listings).length) {
          _push(`<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"><!--[-->`);
          ssrRenderList(unref(listings), (listing) => {
            _push(`<div class="flex flex-col overflow-hidden rounded-lg border border-border bg-card"><div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-3">`);
            if (listing.item.icon_url) {
              _push(`<img${ssrRenderAttr("src", listing.item.icon_url)}${ssrRenderAttr("alt", listing.item.name ?? "Item")} loading="lazy" class="max-h-full max-w-full object-contain">`);
            } else {
              _push(`<span class="text-xs text-muted-foreground">No image</span>`);
            }
            _push(`</div><div class="flex flex-1 flex-col gap-2 border-t border-border p-2.5"><div class="min-w-0"><p class="truncate text-xs font-medium"${ssrRenderAttr("title", listing.item.name ?? "")}>${ssrInterpolate(listing.item.name ?? "Unknown item")}</p><p class="truncate text-[0.625rem] text-muted-foreground">by ${ssrInterpolate(listing.seller?.name ?? "—")}</p></div><div class="mt-auto flex items-center justify-between gap-1"><span class="font-mono text-sm font-semibold tabular-nums">${ssrInterpolate(unref(formatMoney)(listing.price, listing.currency))}</span>`);
            _push(ssrRenderComponent(_component_Button, {
              size: "xs",
              disabled: unref(busy) || !unref(hasTradeUrl),
              onClick: ($event) => buy(listing.id)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Buy`);
                } else {
                  return [
                    createTextVNode("Buy")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="flex min-h-[40svh] items-center justify-center text-sm text-muted-foreground"> No items for sale yet — `);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/sell",
            class: "ml-1 text-primary hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`list one`);
              } else {
                return [
                  createTextVNode("list one")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`. </div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/market.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=market-CZ8KjEk8.mjs.map
