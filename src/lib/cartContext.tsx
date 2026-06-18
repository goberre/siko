"use client";

import {
  createContext, useContext, useEffect, useReducer, useCallback,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type CartTier = "스타터" | "스탠다드" | "프로";

export type CartItem = {
  cartKey:     string;   // serviceId + tier 조합 (고유키)
  serviceId:   string;
  serviceName: string;
  category:    string;
  tier:        CartTier;
  unitPrice:   number;   // 해당 티어 단가
  qty:         number;
};

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD";     payload: Omit<CartItem, "qty"> & { qty?: number } }
  | { type: "REMOVE";  payload: { cartKey: string } }
  | { type: "SET_QTY"; payload: { cartKey: string; qty: number } }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: CartItem[] };

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.payload };

    case "ADD": {
      const { qty: addQty = 1, ...item } = action.payload;
      const idx = state.items.findIndex((i) => i.cartKey === item.cartKey);
      if (idx >= 0) {
        const next = [...state.items];
        next[idx] = { ...next[idx], qty: next[idx].qty + addQty };
        return { items: next };
      }
      return { items: [...state.items, { ...item, qty: addQty }] };
    }

    case "REMOVE":
      return { items: state.items.filter((i) => i.cartKey !== action.payload.cartKey) };

    case "SET_QTY": {
      const { cartKey, qty } = action.payload;
      if (qty < 1) return { items: state.items.filter((i) => i.cartKey !== cartKey) };
      return {
        items: state.items.map((i) =>
          i.cartKey === cartKey ? { ...i, qty } : i
        ),
      };
    }

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
type CartContextValue = {
  items:       CartItem[];
  totalCount:  number;
  subtotal:    number;
  addItem:     (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem:  (cartKey: string) => void;
  setQty:      (cartKey: string, qty: number) => void;
  clearCart:   () => void;
  isInCart:    (cartKey: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "siko_cart_v1";

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // localStorage 초기 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {}
  }, []);

  // localStorage 동기화
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addItem    = useCallback((item: Omit<CartItem, "qty"> & { qty?: number }) => dispatch({ type: "ADD",     payload: item }),                    []);
  const removeItem = useCallback((cartKey: string)                                 => dispatch({ type: "REMOVE",  payload: { cartKey } }),             []);
  const setQty     = useCallback((cartKey: string, qty: number)                   => dispatch({ type: "SET_QTY", payload: { cartKey, qty } }),        []);
  const clearCart  = useCallback(()                                                => dispatch({ type: "CLEAR" }),                                     []);
  const isInCart   = useCallback((cartKey: string)                                 => state.items.some((i) => i.cartKey === cartKey), [state.items]);

  const totalCount = state.items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = state.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  return (
    <CartContext.Provider value={{ items: state.items, totalCount, subtotal, addItem, removeItem, setQty, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
