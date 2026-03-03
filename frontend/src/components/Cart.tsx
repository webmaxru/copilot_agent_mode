import { Link } from 'react-router-dom';
import { useCart, CartItem } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
          >
            Shopping Cart
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
              aria-label="Clear all items from cart"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            role="status"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-12 w-12 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-medium`}>
              Your cart is empty
            </p>
            <Link
              to="/products"
              className="mt-4 bg-primary hover:bg-accent text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: CartItem) => {
              const effectivePrice = item.price * (1 - (item.discount ?? 0));
              return (
                <div
                  key={item.productId}
                  className={`flex items-center gap-4 p-4 rounded-lg shadow-sm border ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } transition-colors duration-300`}
                >
                  <img
                    src={`/${item.imgName}`}
                    alt={item.name}
                    className="h-20 w-20 object-contain flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <p
                      className={`font-semibold truncate ${darkMode ? 'text-light' : 'text-gray-800'}`}
                    >
                      {item.name}
                    </p>
                    <p className="text-primary font-bold">
                      ${effectivePrice.toFixed(2)}{' '}
                      <span className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        / {item.unit}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}
                  >
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <span aria-hidden="true">-</span>
                    </button>
                    <span
                      className={`min-w-[2rem] text-center ${darkMode ? 'text-light' : 'text-gray-800'}`}
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                  <p
                    className={`w-20 text-right font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                    aria-label={`Subtotal for ${item.name}`}
                  >
                    ${(effectivePrice * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors flex-shrink-0`}
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
              );
            })}

            <div
              className={`flex justify-end p-4 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-sm`}
            >
              <div className="text-right space-y-2">
                <p
                  className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  aria-label={`Order total: $${totalPrice.toFixed(2)}`}
                >
                  Total: <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </p>
                <button
                  className="bg-primary hover:bg-accent text-white px-8 py-2 rounded-md font-medium transition-colors"
                  onClick={() => alert('Order placement is not yet implemented.')}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
