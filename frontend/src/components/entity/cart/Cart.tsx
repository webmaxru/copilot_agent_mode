import { useCart } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { api } from '../../../api/config';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleQuantityChange = (productId: number, change: number) => {
    const item = cart.items.find((i) => i.productId === productId);
    if (item) {
      updateQuantity(productId, item.quantity + change);
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Create order with first branch (demo purposes)
      const orderResponse = await axios.post(`${api.baseURL}${api.endpoints.orders}`, {
        branchId: 1,
        orderDate: new Date().toISOString(),
        name: `Order ${new Date().toLocaleDateString()}`,
        description: 'Shopping cart order',
        status: 'pending',
      });

      const orderId = orderResponse.data.orderId;

      // Create order details for each cart item
      for (const item of cart.items) {
        const itemPrice = item.discount ? item.price * (1 - item.discount) : item.price;
        await axios.post(`${api.baseURL}${api.endpoints.orderDetails}`, {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: itemPrice,
          notes: '',
        });
      }

      // Clear cart and navigate
      clearCart();
      alert('Order placed successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
          >
            Shopping Cart
          </h1>
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-12 text-center shadow-md transition-colors duration-300`}
          >
            <svg
              className={`mx-auto h-24 w-24 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p
              className={`text-xl ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
            >
              Your cart is empty
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Add some products to get started!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        {checkoutError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {checkoutError}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {cart.items.map((item) => {
            const itemPrice = item.discount ? item.price * (1 - item.discount) : item.price;
            const itemTotal = itemPrice * item.quantity;

            return (
              <div
                key={item.productId}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md flex items-center space-x-4 transition-colors duration-300`}
              >
                <img
                  src={`/${item.imgName}`}
                  alt={item.name}
                  className={`w-24 h-24 object-contain rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                />
                <div className="flex-grow">
                  <h3
                    className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {item.discount ? (
                      <>
                        <span className="text-gray-500 line-through text-sm">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-primary font-semibold">
                          ${itemPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-primary font-semibold">${itemPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1`}
                  >
                    <button
                      onClick={() => handleQuantityChange(item.productId, -1)}
                      className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span
                      className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, 1)}
                      className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <div
                    className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'} min-w-[6rem] text-right`}
                  >
                    ${itemTotal.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md transition-colors duration-300`}
        >
          <div className="flex justify-between items-center mb-4">
            <span
              className={`text-lg ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              Total Items:
            </span>
            <span
              className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              {cart.totalItems}
            </span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span
              className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              Total:
            </span>
            <span className="text-2xl font-bold text-primary">
              ${cart.totalPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/products')}
              className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-gray-800 px-6 py-3 rounded-lg transition-colors`}
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`flex-1 ${isCheckingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-accent'} text-white px-6 py-3 rounded-lg transition-colors`}
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
