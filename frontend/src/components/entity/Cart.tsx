import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart, effectivePrice } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/config';

const DEFAULT_BRANCH_ID = 1;

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const orderRes = await axios.post(`${api.baseURL}${api.endpoints.orders}`, {
        branchId: DEFAULT_BRANCH_ID,
        status: 'pending',
        orderDate: new Date().toISOString(),
        name: 'Cart Order',
        description: 'Order placed via shopping cart',
      });
      const orderId: number = orderRes.data.orderId;

      await Promise.all(
        items.map((item) =>
          axios.post(`${api.baseURL}${api.endpoints.orderDetails}`, {
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: effectivePrice(item),
          }),
        ),
      );

      clearCart();
      alert(`Order #${orderId} placed successfully!`);
      navigate('/products');
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-3xl mx-auto">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
          >
            Your Cart
          </h1>
          <div
            className={`flex flex-col items-center justify-center py-20 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-16 w-16 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className={`text-lg font-medium ${darkMode ? 'text-light' : 'text-gray-800'}`}>
              Your cart is empty
            </p>
            <Link
              to="/products"
              className="mt-4 px-6 py-2 bg-primary hover:bg-accent text-white rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-3xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
        >
          Your Cart
        </h1>

        <div
          className={`rounded-lg shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border mb-6`}
        >
          {items.map((item) => {
            const itemPrice = effectivePrice(item);
            return (
              <div
                key={item.productId}
                className={`flex items-center justify-between p-4 border-b last:border-b-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className={`font-medium ${darkMode ? 'text-light' : 'text-gray-800'} truncate`}>
                    {item.name}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ${itemPrice.toFixed(2)} each
                    {item.discount && (
                      <span className="ml-1 text-primary text-xs">
                        ({Math.round(item.discount * 100)}% off)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div
                    className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}
                  >
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className={`w-7 h-7 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <span aria-hidden="true">-</span>
                    </button>
                    <span
                      className={`min-w-[1.5rem] text-center text-sm ${darkMode ? 'text-light' : 'text-gray-800'}`}
                      aria-label={`Quantity of ${item.name}: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className={`w-7 h-7 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>

                  <span
                    className={`w-20 text-right font-medium ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  >
                    ${(itemPrice * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}
        >
          <div className="flex justify-between items-center mb-6">
            <span className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
              Total
            </span>
            <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="flex-1 py-3 bg-primary hover:bg-accent text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Placing Order…' : 'Place Order'}
            </button>
            <Link
              to="/products"
              className={`flex-1 py-3 text-center rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
