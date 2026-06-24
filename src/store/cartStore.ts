import { create } from "zustand";
import { Product } from "../app/movimientos/crear";
import { empresaRepository } from "../database/repositories/empresaRepository";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentType = "efectivo" | "tarjeta" | "transferencia";

export const PAYMENT_TYPES: PaymentType[] = [
  "efectivo",
  "tarjeta",
  "transferencia",
];

export const PAYMENT_CONFIG: Record<
  PaymentType,
  { icon: string; label: string }
> = {
  efectivo: { icon: "money-bill", label: "Efectivo" },
  tarjeta: { icon: "credit-card", label: "Tarjeta" },
  transferencia: { icon: "money-check-alt", label: "Transferencia" },
};

export interface PaymentMethod {
  type: PaymentType;
  amount: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  impuestoAmount: number;
  impuestoRate: number;
  payments: PaymentMethod[];
  clientId: number | null;
  setPayments: (payments: PaymentMethod[]) => void;
  setClientId: (id: number | null) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  calcularTotal: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  subtotal: 0,
  impuestoAmount: 0,
  impuestoRate: 0,
  payments: [],
  clientId: null,
  setClientId: (id) => set({ clientId: id }),
  addItem: async (product, quantity = 1) => {
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
    await calcularTotal();
  },
  removeItem: async (productId) => {
    const { items, calcularTotal } = get();
    const updatedItems = items.filter((item) => item.product.id !== productId);
    set({ items: updatedItems });
    await calcularTotal();
  },
  updateQuantity: async (productId, quantity) => {
    const { items, calcularTotal } = get();
    if (quantity <= 0) {
      const updatedItems = items.filter(
        (item) => item.product.id !== productId
      );
      set({ items: updatedItems });
    } else {
      const updatedItems = items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      set({ items: updatedItems });
    }
    await calcularTotal();
  },
  setPayments: (payments) => set({ payments: payments }),
  calcularTotal: async () => {
    const { items, impuestoRate } = get();
    let rate = impuestoRate;
    if (rate === 0) {
      try {
        const empresa = await empresaRepository.getFirst();
        rate = empresa?.impuesto || 0;
      } catch {}
    }
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.precio * item.quantity,
      0
    );
    const impuestoAmount = subtotal * (rate / 100);
    const total = subtotal + impuestoAmount;
    set({ subtotal, impuestoAmount, total, impuestoRate: rate });
  },
  clearCart: () => {
    set({ items: [], total: 0, subtotal: 0, impuestoAmount: 0, impuestoRate: 0, payments: [], clientId: null });
  },
}));
