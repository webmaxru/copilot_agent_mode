import { useTheme } from '../../../context/ThemeContext';

interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
}

export default function CartSummary({ totalItems, totalPrice }: CartSummaryProps) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 sticky top-24 transition-colors duration-300`}
    >
      <h2 className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}>
        Order Summary
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Items ({totalItems})
          </span>
          <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <div
          className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-3 mt-3`}
        >
          <div className="flex justify-between text-lg font-bold">
            <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>Total</span>
            <span className="text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        className={`w-full mt-6 px-6 py-3 rounded-lg transition-colors ${
          totalItems > 0
            ? 'bg-primary hover:bg-accent text-white'
            : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
        }`}
        disabled={totalItems === 0}
      >
        Proceed to Checkout
      </button>

      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-4 text-center`}>
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}
