import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCart();
  const { darkMode } = useTheme();
  const [couponCode, setCouponCode] = useState('');

  const subtotal = getSubtotal();
  const discountPercent = 0.05; // 5% discount
  const discountAmount = subtotal * discountPercent;
  const shipping = 10;
  const grandTotal = subtotal - discountAmount + shipping;

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleApplyCoupon = () => {
    // TODO: Implement coupon logic
    alert('Coupon functionality coming soon!');
  };

  if (items.length === 0) {
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
          <div
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-12 text-center border transition-colors duration-300`}
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
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2`}>
              Your cart is empty
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary hover:bg-accent text-white font-semibold px-6 py-3 rounded-lg transition-colors"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <div
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg overflow-hidden border transition-colors duration-300`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b transition-colors duration-300`}
                  >
                    <tr>
                      <th
                        className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-700'}`}
                      >
                        S. No.
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-700'}`}
                      >
                        Product Image
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-700'}`}
                      >
                        Product Name
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-700'}`}
                      >
                        Unit Price
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-700'}`}
                      >
                        Quantity
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-700'}`}
                      >
                        Total
                      </th>
                      <th
                        className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-700'}`}
                      >
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const unitPrice = item.discount
                        ? item.price * (1 - item.discount)
                        : item.price;
                      const total = unitPrice * item.quantity;
                      return (
                        <tr
                          key={item.productId}
                          className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b transition-colors duration-300`}
                        >
                          <td
                            className={`px-4 py-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}
                          >
                            {index + 1}
                          </td>
                          <td className="px-4 py-4">
                            <img
                              src={`/${item.imgName}`}
                              alt={item.name}
                              className="w-16 h-16 object-contain"
                            />
                          </td>
                          <td
                            className={`px-4 py-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}
                          >
                            {item.name}
                          </td>
                          <td
                            className={`px-4 py-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}
                          >
                            ${unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 1)
                              }
                              className={`w-20 px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-900 text-light border-gray-700' : 'bg-white text-gray-800 border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                              aria-label={`Quantity of ${item.name}`}
                            />
                          </td>
                          <td
                            className={`px-4 py-4 font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                          >
                            ${total.toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-primary hover:text-accent transition-colors"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <svg
                                className="w-5 h-5"
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Coupon Code Section */}
              <div
                className={`px-4 py-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}
              >
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`flex-1 max-w-xs px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-900 text-light border-gray-700' : 'bg-white text-gray-800 border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                    aria-label="Coupon code"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-accent text-white font-semibold rounded-lg transition-colors"
                  >
                    Apply Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border transition-colors duration-300`}
            >
              <h2
                className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6`}
              >
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subtotal
                  </span>
                  <span
                    className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  >
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Discount (5%)
                  </span>
                  <span
                    className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  >
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Shipping
                  </span>
                  <span
                    className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  >
                    ${shipping.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                    >
                      Grand Total
                    </span>
                    <span
                      className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
                    >
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 px-6 py-3 bg-primary hover:bg-accent text-white font-semibold rounded-lg transition-colors">
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
