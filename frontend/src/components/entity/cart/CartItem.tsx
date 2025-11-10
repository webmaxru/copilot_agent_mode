import { CartItem as CartItemType } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { darkMode } = useTheme();
  const finalPrice = item.discount ? item.price * (1 - item.discount) : item.price;

  return (
    <div
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 flex gap-4 transition-colors duration-300`}
    >
      <div
        className={`w-24 h-24 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} rounded-lg flex-shrink-0`}
      >
        <img
          src={`/${item.imgName}`}
          alt={item.name}
          className="w-full h-full object-contain p-2"
        />
      </div>

      <div className="flex-grow">
        <h3
          className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-1`}
        >
          {item.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          {item.discount ? (
            <>
              <span className="text-gray-500 line-through text-sm">${item.price.toFixed(2)}</span>
              <span className="text-primary text-lg font-bold">${finalPrice.toFixed(2)}</span>
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                {Math.round(item.discount * 100)}% OFF
              </span>
            </>
          ) : (
            <span className="text-primary text-lg font-bold">${item.price.toFixed(2)}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div
            className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1`}
          >
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <span aria-hidden="true">-</span>
            </button>
            <span
              className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center`}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-semibold`}>
              ${(finalPrice * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={() => onRemove(item.productId)}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label={`Remove ${item.name} from cart`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
      </div>
    </div>
  );
}
