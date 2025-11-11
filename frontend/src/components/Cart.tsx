import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { items, total, itemCount, updateQuantity, removeItem, checkout, loading } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      await checkout();
      alert('Order placed successfully!');
      navigate('/products');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-4xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div
            className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-8 text-center transition-colors duration-300`}
          >
            <p className="text-xl mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.orderDetailId}
                  className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-6 transition-colors duration-300`}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Product Image */}
                    <img
                      src={`/products/${item.product.imgName}`}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/products/placeholder.png';
                      }}
                    />

                    {/* Product Details */}
                    <div className="flex-grow">
                      <h3
                        className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}
                      >
                        {item.product.name}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.product.description}
                      </p>
                      <p
                        className={`text-lg font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}
                      >
                        ${item.unitPrice.toFixed(2)} / {item.product.unit}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.orderDetailId, item.quantity - 1)
                          }
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg transition-colors duration-300"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.orderDetailId, item.quantity + 1)
                          }
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg transition-colors duration-300"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.orderDetailId)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
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
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}
                      >
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-6 sticky top-24 transition-colors duration-300`}
              >
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Items ({itemCount})</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingOut ? 'Processing...' : 'Checkout'}
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-4 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
