import { b as useNuxtApp } from './server.mjs';

const useSanctumClient = () => {
  const { $sanctumClient } = useNuxtApp();
  return $sanctumClient;
};

export { useSanctumClient as u };
//# sourceMappingURL=useSanctumClient-CyejobjL.mjs.map
