'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { UnitDef, UnitId } from '@/lib/units';
import { lineTotal } from '@/lib/units';

/**
 * Корзина. Живёт в localStorage: снабженец набирает заявку с телефона
 * между звонками, и потеря набранного при случайном обновлении страницы —
 * прямая потеря заказа.
 */

export interface CartItem {
  productId: string;
  sku: string;
  title: string;
  spec: string;
  basePrice: number;
  qty: number;
  unit: UnitDef;
}

type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'setQty'; productId: string; unitId: UnitId; qty: number }
  | { type: 'remove'; productId: string; unitId: UnitId }
  | { type: 'clear' }
  | { type: 'hydrate'; items: CartItem[] };

const STORAGE_KEY = 'stroysam.cart.v1';

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'hydrate':
      return action.items;
    case 'add': {
      // Один товар в разных единицах — разные строки: так его и отгружают
      const idx = state.findIndex(
        (i) => i.productId === action.item.productId && i.unit.id === action.item.unit.id,
      );
      if (idx === -1) return [...state, action.item];
      const next = [...state];
      next[idx] = { ...next[idx], qty: next[idx].qty + action.item.qty };
      return next;
    }
    case 'setQty':
      return state.map((i) =>
        i.productId === action.productId && i.unit.id === action.unitId
          ? { ...i, qty: Math.max(i.unit.min, action.qty) }
          : i,
      );
    case 'remove':
      return state.filter((i) => !(i.productId === action.productId && i.unit.id === action.unitId));
    case 'clear':
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: CartItem) => void;
  setQty: (productId: string, unitId: UnitId, qty: number) => void;
  remove: (productId: string, unitId: UnitId) => void;
  clear: () => void;
  /** Подсветка иконки корзины после добавления — тихий отклик без тоста */
  pulse: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'hydrate', items: JSON.parse(raw) as CartItem[] });
    } catch {
      // Испорченный снимок — не повод ронять витрину
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Приватный режим или переполнение — корзина просто не переживёт перезагрузку
    }
  }, [items, ready]);

  const add = useCallback((item: CartItem) => {
    dispatch({ type: 'add', item });
    setPulse((p) => p + 1);
  }, []);

  const setQty = useCallback((productId: string, unitId: UnitId, qty: number) => {
    dispatch({ type: 'setQty', productId, unitId, qty });
  }, []);

  const remove = useCallback((productId: string, unitId: UnitId) => {
    dispatch({ type: 'remove', productId, unitId });
  }, []);

  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((sum, i) => sum + lineTotal(i.basePrice, i.qty, i.unit), 0);
    return {
      items,
      count: items.length,
      total,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      pulse,
    };
  }, [items, open, add, setQty, remove, clear, pulse]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart вызван вне CartProvider');
  return ctx;
}
