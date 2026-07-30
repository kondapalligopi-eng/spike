import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// A storefront cart is per-shop (a customer shops one storefront at a time),
// so carts are keyed by shop id and persisted across visits. Only products
// with a numeric price are cart-eligible (see PetShopView), so unit_price is a
// plain number here.
export type CartItem = {
  product_id: string;
  name: string;
  unit_price: number;
  qty: number;
  photo_url: string | null;
};

interface CartState {
  carts: Record<string, CartItem[]>;
  // Drawer open/closed — transient UI state (not persisted) so the header cart
  // icon and the floating button can both open the same drawer.
  open: boolean;
  setOpen: (open: boolean) => void;
  // False until localStorage has been read (skipHydration) so the first client
  // render matches the logged-out/empty SSG shell — same guard as authStore.
  hasHydrated: boolean;
  setHydrated: () => void;
  add: (shopId: string, item: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (shopId: string, productId: string, qty: number) => void;
  remove: (shopId: string, productId: string) => void;
  clear: (shopId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      carts: {},
      open: false,
      setOpen: (open) => set({ open }),
      hasHydrated: false,
      setHydrated: () => set({ hasHydrated: true }),

      add: (shopId, item, qty = 1) =>
        set((s) => {
          const list = s.carts[shopId] ? [...s.carts[shopId]] : [];
          const idx = list.findIndex((i) => i.product_id === item.product_id);
          if (idx >= 0) list[idx] = { ...list[idx], qty: list[idx].qty + qty };
          else list.push({ ...item, qty });
          return { carts: { ...s.carts, [shopId]: list } };
        }),

      setQty: (shopId, productId, qty) =>
        set((s) => {
          const list = (s.carts[shopId] ?? [])
            .map((i) => (i.product_id === productId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0);
          return { carts: { ...s.carts, [shopId]: list } };
        }),

      remove: (shopId, productId) =>
        set((s) => ({ carts: { ...s.carts, [shopId]: (s.carts[shopId] ?? []).filter((i) => i.product_id !== productId) } })),

      clear: (shopId) => set((s) => ({ carts: { ...s.carts, [shopId]: [] } })),
    }),
    {
      name: 'hispike_cart',
      skipHydration: true,
      partialize: (s) => ({ carts: s.carts }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
