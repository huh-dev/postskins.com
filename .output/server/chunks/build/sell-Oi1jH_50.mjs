import { _ as _sfc_main$1 } from './index-ZcX2QkUC.mjs';
import { defineComponent, reactive, computed, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { RiSteamFill, RiCheckLine, RiLoopRightLine, RiLock2Line } from '@remixicon/vue';
import { f as formatMoney } from './format-BBBd5tQz.mjs';
import { u as useAuth } from './auth-Dmkix5Lz.mjs';
import { u as useInventory } from './useInventory-BRB_6jb1.mjs';
import { u as useMarket } from './useMarket-DE15xBfs.mjs';
import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';
import { s as setInterval } from './interval-B0wcd8HX.mjs';
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

function useSeller() {
  const client = useSanctumClient();
  const connected = ref(false);
  const qrChallengeUrl = ref(null);
  const connecting = ref(false);
  const errorMessage = ref(null);
  async function loadStatus() {
    try {
      connected.value = (await client("/api/seller/status")).connected;
    } catch {
      connected.value = false;
    }
  }
  async function disconnect() {
    try {
      await client("/api/seller/connect", { method: "DELETE" });
    } finally {
      connected.value = false;
      qrChallengeUrl.value = null;
    }
  }
  async function startConnect() {
    errorMessage.value = null;
    connecting.value = true;
    try {
      const { id, qr_url } = await client("/api/seller/connect", { method: "POST" });
      qrChallengeUrl.value = qr_url;
      return id;
    } catch (error) {
      errorMessage.value = readError(error);
      connecting.value = false;
      return null;
    }
  }
  async function checkConnect(id) {
    try {
      const { status } = await client(`/api/seller/connect/${id}`);
      if (status === "connected") {
        connected.value = true;
        connecting.value = false;
        qrChallengeUrl.value = null;
      } else if (status === "error" || status === "timeout" || status === "wrong_account" || status === "not_found") {
        connecting.value = false;
        errorMessage.value = status === "wrong_account" ? "That Steam account does not match your signed-in account." : "Authorization failed or expired. Please try again.";
      }
      return status;
    } catch (error) {
      errorMessage.value = readError(error);
      connecting.value = false;
      return "error";
    }
  }
  const qrImageSrc = computed(
    () => qrChallengeUrl.value ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrChallengeUrl.value)}` : null
  );
  function readError(error) {
    return error.data?.message ?? "The trade service is unavailable right now.";
  }
  return { connected, connecting, qrChallengeUrl, qrImageSrc, errorMessage, loadStatus, disconnect, startConnect, checkConnect };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "sell",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated, loginWithSteam } = useAuth();
    const { items, status, isLoading, load } = useInventory();
    const { mine, errorMessage, busy, loadMine, createListing, cancelListing } = useMarket();
    const seller = useSeller();
    const priceDrafts = reactive({});
    async function connectSteam() {
      const id = await seller.startConnect();
      if (!id) {
        return;
      }
      setInterval();
    }
    async function reconnectSteam() {
      await seller.disconnect();
      await connectSteam();
    }
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
        seller.loadStatus();
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
        if (!unref(seller).connected.value) {
          _push(`<section class="mb-6 rounded-lg border border-amber-300 bg-card p-4 dark:border-amber-500/30"><h2 class="text-sm font-semibold">Connect your Steam account to sell</h2><p class="mt-0.5 text-xs text-muted-foreground"> This authorizes Postskins to send the trade offer for you when an item sells — you&#39;ll just confirm it on your Steam mobile app. We never see your password. </p>`);
          if (unref(seller).qrImageSrc.value) {
            _push(`<div class="mt-3 flex flex-col items-center gap-2"><img${ssrRenderAttr("src", unref(seller).qrImageSrc.value)} alt="Steam login QR code" width="200" height="200" class="rounded-md bg-white p-2"><p class="text-xs text-muted-foreground">Scan with the Steam mobile app, then tap <strong>Approve</strong>. Waiting…</p></div>`);
          } else {
            _push(ssrRenderComponent(_component_Button, {
              size: "sm",
              class: "mt-3",
              disabled: unref(seller).connecting.value,
              onClick: ($event) => connectSteam()
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(unref(RiSteamFill), null, null, _parent2, _scopeId));
                  _push2(` Connect Steam `);
                } else {
                  return [
                    createVNode(unref(RiSteamFill)),
                    createTextVNode(" Connect Steam ")
                  ];
                }
              }),
              _: 1
            }, _parent));
          }
          if (unref(seller).errorMessage.value) {
            _push(`<p class="mt-2 text-xs text-destructive">${ssrInterpolate(unref(seller).errorMessage.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</section>`);
        } else {
          _push(`<div class="mb-4 flex items-center gap-2"><span class="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">`);
          _push(ssrRenderComponent(unref(RiCheckLine), { class: "size-3.5" }, null, _parent));
          _push(` Steam connected for selling </span>`);
          _push(ssrRenderComponent(_component_Button, {
            variant: "ghost",
            size: "xs",
            disabled: unref(seller).connecting.value,
            onClick: ($event) => reconnectSteam()
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Reconnect`);
              } else {
                return [
                  createTextVNode("Reconnect")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        }
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
        if (unref(seller).connected.value) {
          _push(`<!--[--><h2 class="mb-2 text-sm font-semibold">List an item</h2>`);
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
        } else {
          _push(`<!---->`);
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
//# sourceMappingURL=sell-Oi1jH_50.mjs.map
