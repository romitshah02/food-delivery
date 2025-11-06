import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchItems } from '../services/items';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ItemCard from '../components/Item/ItemCard';
import type { Item } from '../types';
import toast from 'react-hot-toast';

export default function Menu() {
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: items = [], isLoading, error } = useQuery<Item[], Error>({
    queryKey: ['items', category, search],
    queryFn: () => fetchItems({ category: category === 'All' ? undefined : category, search: search || undefined }),
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    (items || []).forEach((i) => set.add(i.category || 'Uncategorized'));
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = items || [];

  const handleAddToCart = async (item: Item) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(item.id, 1);
    } catch (error) {
      // Error is already handled in CartContext
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold">Menu</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Browse items by category</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-md text-sm ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <input
            aria-label="Search items"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items"
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">Loading items...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">Failed to load items</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">No items found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item: Item) => (
            <ItemCard item={item} key={item.id} onAdd={() => handleAddToCart(item)} />
          ))}
        </div>
      )}
    </div>
  );
}
