import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const FREE_SHIPPING_THRESHOLD = 100;

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getSubtotal, getShipping, getTotal } = useCart();
  const { darkMode } = useTheme();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-24 w-24 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
            <h2 className={`${darkMode ? 'text-light' : 'text-gray-800'} text-2xl font-bold mb-2`}>
              Your cart is empty
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Add some products to get started
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border transition-colors duration-300`}
            >
              {/* Table Header */}
              <div
                className={`hidden md:grid grid-cols-12 gap-4 p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}
              >
                <div className="col-span-1 text-center">S. No.</div>
                <div className="col-span-2 text-center">Product Image</div>
                <div className="col-span-3">Product Name</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1 text-center">Remove</div>
              </div>

              {/* Cart Items */}
              {items.map((item, index) => {
                const price = item.discount ? item.price * (1 - item.discount) : item.price;
                const itemTotal = price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0 items-center`}
                  >
                    {/* S. No. */}
                    <div className="col-span-1 text-center">
                      <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="col-span-1 md:col-span-2 flex justify-center">
                      <div
                        className={`${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} rounded-lg p-2 w-24 h-24 flex items-center justify-center`}
                      >
                        <img
                          src={`/${item.imgName}`}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="col-span-1 md:col-span-3">
                      <h3
                        className={`${darkMode ? 'text-light' : 'text-gray-800'} font-semibold text-lg`}
                      >
                        {item.name}
                      </h3>
                      {item.discount && (
                        <span className="text-primary text-sm">
                          {Math.round(item.discount * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-1 md:col-span-2 text-center">
                      {item.discount ? (
                        <div className="flex flex-col items-center">
                          <span className="text-gray-500 line-through text-sm">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                            ${price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-1 md:col-span-2 flex justify-center">
                      <div
                        className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1`}
                      >
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light hover:text-primary' : 'text-gray-700 hover:text-primary'} transition-colors`}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span
                          className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center font-medium`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light hover:text-primary' : 'text-gray-700 hover:text-primary'} transition-colors`}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-1 text-center">
                      <span
                        className={`${darkMode ? 'text-light' : 'text-gray-800'} font-bold text-lg`}
                      >
                        ${itemTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-primary hover:text-accent transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 sticky top-24 transition-colors duration-300`}
            >
              <h2
                className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6`}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subtotal
                  </span>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Shipping
                  </span>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                    {shipping === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div
                  className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                    >
                      Grand Total
                    </span>
                    <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-accent text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Proceed To Checkout
              </button>

              <Link
                to="/products"
                className={`block text-center mt-4 ${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
