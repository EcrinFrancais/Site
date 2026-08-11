import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { estimateShippingCost } from '../logic/shippingService';

const STORAGE_KEY = 'ecrinFrancais.cart.v1';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CartContext = createContext({
  items: [],
  count: 0,
  addItem: () => {},
  removeItem: () => {},
  clear: () => {},
  subtotalTTC: 0,
  totalWeightKg: 0,
  shippingCostTTC: 0,
  grandTotalTTC: 0,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // stockage indisponible (navigation privée, quota) : le panier reste en mémoire
    }
  }, [items]);

  const addItem = (cartItem) => {
    setItems((current) => [...current, cartItem]);
  };

  const removeItem = (cartItemId) => {
    setItems((current) => current.filter((item) => item.id !== cartItemId));
  };

  const clear = () => setItems([]);

  const subtotalTTC = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quote?.totalTTC || 0), 0),
    [items]
  );

  const totalWeightKg = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.estimatedWeightKg || 0), 0),
    [items]
  );

  const shippingCostTTC = useMemo(() => estimateShippingCost(items), [items]);

  const grandTotalTTC = subtotalTTC + shippingCostTTC;

  const value = {
    items,
    count: items.length,
    addItem,
    removeItem,
    clear,
    subtotalTTC,
    totalWeightKg,
    shippingCostTTC,
    grandTotalTTC,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider/context
export function useCart() {
  return useContext(CartContext);
}
