import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { api } from '../api/config';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  sku: string;
  unit: string;
  supplierId: number;
  discount?: number;
}

interface CartItem {
  orderDetailId: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  notes: string;
  product: Product;
}

interface CartContextType {
  cartId: number | null;
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: number, quantity: number, unitPrice: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  checkout: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

const BRANCH_ID = 1; // Static branch ID for simplicity

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<number | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load or create cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      // Get or create cart
      const { data: cart } = await axios.get(`${api.baseURL}${api.endpoints.cart}/${BRANCH_ID}`);
      setCartId(cart.orderId);

      // Load cart items
      const { data: cartData } = await axios.get(
        `${api.baseURL}${api.endpoints.cart}/${cart.orderId}/items`,
      );
      setItems(cartData.items || []);
      setTotal(cartData.total || 0);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    if (!cartId) return;

    try {
      const { data: cartData } = await axios.get(
        `${api.baseURL}${api.endpoints.cart}/${cartId}/items`,
      );
      setItems(cartData.items || []);
      setTotal(cartData.total || 0);
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  };

  const addToCart = async (productId: number, quantity: number, unitPrice: number) => {
    if (!cartId) {
      console.error('Cart not initialized');
      return;
    }

    try {
      await axios.post(`${api.baseURL}${api.endpoints.cart}/${cartId}/items`, {
        productId,
        quantity,
        unitPrice,
      });
      await refreshCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!cartId) return;

    try {
      await axios.put(`${api.baseURL}${api.endpoints.cart}/${cartId}/items/${itemId}`, {
        quantity,
      });
      await refreshCart();
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: number) => {
    if (!cartId) return;

    try {
      await axios.delete(`${api.baseURL}${api.endpoints.cart}/${cartId}/items/${itemId}`);
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const checkout = async () => {
    if (!cartId) return;

    try {
      await axios.post(`${api.baseURL}${api.endpoints.cart}/${cartId}/checkout`);
      // Clear cart and reload to create a new one
      setCartId(null);
      setItems([]);
      setTotal(0);
      await loadCart();
    } catch (error) {
      console.error('Failed to checkout:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartId,
        items,
        total,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        checkout,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
