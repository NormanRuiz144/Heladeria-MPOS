import { create } from "zustand";
import { Product } from "../app/movimientos/crear";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaymentMethod {
  type: "efectivo" | "tarjeta" | "transferencia";
  amount: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  payments: PaymentMethod[];
  setPayments: (payments: PaymentMethod[]) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  calcularTotal: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  payments: [],
  addItem: (product, quantity = 1) => {
    const { items, calcularTotal } = get();
    const exists = items.some((item) => item.product.id === product.id);
    const updatedItems = exists
      ? items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [...items, { product, quantity }];
    set({ items: updatedItems });
    calcularTotal();
  },
  removeItem: (productId) => {
    const { items, calcularTotal } = get();
    const updatedItems = items.filter((item) => item.product.id !== productId);
    set({ items: updatedItems });
    calcularTotal();
  },
  updateQuantity: (productId, quantity) => {
    const { items, calcularTotal } = get();
    if (quantity <= 0) {
      const updatedItems = items.filter((item) => item.product.id !== productId);
      set({ items: updatedItems });
    } else {
      const updatedItems = items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      set({ items: updatedItems });
    }
    calcularTotal();
  },
  setPayments: (payments) => set({ payments: payments }),
  calcularTotal: () => {
    const { items } = get();
    const totalCalculado = items.reduce(
      (sum, item) => (sum += item.product.precio * item.quantity),
      0
    );
    set({ total: totalCalculado });
  },
  clearCart: () => {
    set({ items: [], total: 0, payments: [] });
  },
}));
