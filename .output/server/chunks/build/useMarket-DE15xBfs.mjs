import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';
import { ref } from 'vue';

function useMarket() {
  const client = useSanctumClient();
  const listings = ref([]);
  const mine = ref([]);
  const errorMessage = ref(null);
  const busy = ref(false);
  async function loadMarket() {
    listings.value = (await client("/api/listings")).listings;
  }
  async function loadMine() {
    mine.value = (await client("/api/listings/mine")).listings;
  }
  async function createListing(inventoryItemId, price) {
    return run(async () => {
      await client("/api/listings", { method: "POST", body: { inventory_item_id: inventoryItemId, price } });
      await loadMine();
    });
  }
  async function cancelListing(id) {
    return run(async () => {
      await client(`/api/listings/${id}`, { method: "DELETE" });
      await loadMine();
    });
  }
  async function purchase(id) {
    errorMessage.value = null;
    busy.value = true;
    try {
      const { trade } = await client(`/api/listings/${id}/purchase`, { method: "POST" });
      return trade;
    } catch (error) {
      errorMessage.value = readError(error);
      return null;
    } finally {
      busy.value = false;
    }
  }
  async function run(fn) {
    errorMessage.value = null;
    busy.value = true;
    try {
      await fn();
      return true;
    } catch (error) {
      errorMessage.value = readError(error);
      return false;
    } finally {
      busy.value = false;
    }
  }
  function readError(error) {
    return error.data?.message ?? "Something went wrong. Please try again.";
  }
  return { listings, mine, errorMessage, busy, loadMarket, loadMine, createListing, cancelListing, purchase };
}

export { useMarket as u };
//# sourceMappingURL=useMarket-DE15xBfs.mjs.map
