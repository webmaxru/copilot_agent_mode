import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imgName: string;
  discount?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'octocat-supply-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on init
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.productId === item.productId);
      if (existing) {
        return prevItems.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const itemPrice = item.discount ? item.price * (1 - item.discount) : item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
