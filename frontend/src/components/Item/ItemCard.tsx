import type { Item } from '../../types';

export default function ItemCard({ item, onAdd }:{ item: Item; onAdd?: (item: Item)=>void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
      <div className="h-40 w-full bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
        ) : (
          <div className="text-gray-400">No image</div>
        )}
      </div>

      <div className="mt-3 flex-1">
        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{item.name}</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Price</div>
          <div className="font-semibold text-primary-600">₹{item.price.toFixed(2)}</div>
        </div>

        <div className="text-right">
          <div className={`text-sm ${item.stock>0 ? 'text-green-600' : 'text-red-500'}`}>
            {item.stock > 0 ? `${item.stock} in stock` : 'Not available'}
          </div>
          <button
            onClick={() => onAdd && onAdd(item)}
            disabled={item.stock <= 0}
            className="mt-2 inline-flex items-center px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
