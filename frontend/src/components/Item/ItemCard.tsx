import { useState } from 'react';
import type { Item } from '../../types';

interface ItemCardProps {
  item: Item;
  onAdd?: (item: Item) => void;
  onIncrease?: (item: Item) => void;
  onDecrease?: (item: Item) => void;
  onSetQuantity?: (item: Item, quantity: number) => void;
  quantity?: number;
}

export default function ItemCard({ item, onAdd, onIncrease, onDecrease, onSetQuantity, quantity = 0 }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    const newQuantity = parseInt(inputValue) || 0;
    if (newQuantity > 0 && newQuantity <= item.stock && onSetQuantity) {
      onSetQuantity(item, newQuantity);
    } else {
      setInputValue(quantity.toString());
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setInputValue(quantity.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow transition-transform duration-200 ease-out p-4 flex flex-col h-full transform-gpu hover:scale-[1.02] hover:-translate-y-0.5">
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
        {item.imageUrl || item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl || item.image}
            alt={item.name}
            className="object-cover h-full w-full"
            onError={(e) => {
              // Fallback to placeholder emoji if the image fails to load
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              const parent = (e.currentTarget.parentElement);
              if (parent && !parent.querySelector('.fallback-emoji')) {
                const span = document.createElement('span');
                span.textContent = '🍽️';
                span.className = 'fallback-emoji text-gray-400 text-4xl';
                parent.appendChild(span);
              }
            }}
          />
        ) : (
          <div className="text-gray-400 text-4xl">🍽️</div>
        )}
      </div>

      <div className="mt-3 flex-1 flex flex-col min-h-[80px]">
        <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 line-clamp-1">{item.name}</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-1">{item.description}</p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 flex-shrink-0">
        <div className="flex-shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
          <div className="font-bold text-lg text-primary-600">₹{item.price.toFixed(2)}</div>
          <div className={`text-xs mt-1 ${item.stock>0 ? 'text-green-600' : 'text-red-500'}`}>
            {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
          </div>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onDecrease && onDecrease(item)}
              className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              −
            </button>
            {isEditing ? (
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                autoFocus
                className="w-12 h-8 text-center text-lg font-semibold border-2 border-primary-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
            ) : (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setInputValue(quantity.toString());
                }}
                className="min-w-[2rem] h-8 text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
              >
                {quantity}
              </button>
            )}
            <button
              onClick={() => onIncrease && onIncrease(item)}
              disabled={item.stock <= 0 || quantity >= item.stock}
              className="w-8 h-8 rounded-md bg-primary-600 text-white font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd && onAdd(item)}
            disabled={item.stock <= 0}
            className="flex-shrink-0 px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
