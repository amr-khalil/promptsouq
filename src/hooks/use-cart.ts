import { useSyncExternalStore } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useCartItemCount() {
  return useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().items.length,
    () => 0,
  );
}
