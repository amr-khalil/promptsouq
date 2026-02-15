import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  promptId: string;
  title: string;
  price: number;
  thumbnail: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (promptId: string) => void;
  clearCart: () => void;
  isInCart: (promptId: string) => boolean;
  totalPrice: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (item.price === 0) return state;
          if (state.items.some((i) => i.promptId === item.promptId)) {
            return state;
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (promptId) =>
        set((state) => ({
          items: state.items.filter((i) => i.promptId !== promptId),
        })),
      clearCart: () => set({ items: [] }),
      isInCart: (promptId) => get().items.some((i) => i.promptId === promptId),
      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price, 0),
      itemCount: () => get().items.length,
    }),
    {
      name: "promptsouq-cart",
    },
  ),
);
