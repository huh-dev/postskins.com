import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';
import { ref } from 'vue';

function useWallet() {
  const client = useSanctumClient();
  const wallet = ref(null);
  async function load() {
    try {
      wallet.value = await client("/api/wallet");
    } catch {
      wallet.value = null;
    }
  }
  async function addTestFunds(amount = 1e5) {
    await client("/api/dev/credit", { method: "POST", body: { amount } });
    await load();
  }
  return { wallet, load, addTestFunds };
}

export { useWallet as u };
//# sourceMappingURL=useWallet-B-bYuplg.mjs.map
