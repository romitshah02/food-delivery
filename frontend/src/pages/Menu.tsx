import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchItems } from '../services/items';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ItemCard from '../components/Item/ItemCard';
import type { Item } from '../types';
import toast from 'react-hot-toast';

export default function Menu() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch all items
  const { data: allItems = [], isLoading, error } = useQuery<Item[], Error>({
    queryKey: ['items'],
    queryFn: () => fetchItems({}),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    (allItems || []).forEach((i) => set.add(i.category || 'Uncategorized'));
    return Array.from(set);
  }, [allItems]);

  // Filter items based on selected categories and search
  const filtered = useMemo(() => {
    let items = allItems || [];
    
    // Filter by categories (if any selected)
    if (selectedCategories.length > 0) {
      items = items.filter(item => selectedCategories.includes(item.category || 'Uncategorized'));
    }
    
    // Filter by search
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return items;
  }, [allItems, selectedCategories, debouncedSearch]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

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

  const handleIncreaseQuantity = async (item: Item) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const cartItem = cart.find(ci => ci.itemId === item.id);
    if (cartItem) {
      try {
        await updateQuantity(cartItem.id, cartItem.quantity + 1);
      } catch (error) {
        // Error is already handled in CartContext
      }
    }
  };

  const handleDecreaseQuantity = async (item: Item) => {
    if (!user) return;

    const cartItem = cart.find(ci => ci.itemId === item.id);
    if (cartItem) {
      try {
        if (cartItem.quantity === 1) {
          await removeItem(cartItem.id);
        } else {
          await updateQuantity(cartItem.id, cartItem.quantity - 1);
        }
      } catch (error) {
        // Error is already handled in CartContext
      }
    }
  };

  const handleSetQuantity = async (item: Item, newQuantity: number) => {
    if (!user) return;

    const cartItem = cart.find(ci => ci.itemId === item.id);
    if (cartItem) {
      try {
        if (newQuantity <= 0) {
          await removeItem(cartItem.id);
        } else {
          await updateQuantity(cartItem.id, newQuantity);
        }
      } catch (error) {
        // Error is already handled in CartContext
      }
    }
  };

  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = cart.find(ci => ci.itemId === itemId);
    return cartItem?.quantity || 0;
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold">Menu</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCategories.length > 0 
                ? `${selectedCategories.length} category${selectedCategories.length > 1 ? 'ies' : 'y'} selected` 
                : 'Browse items by category'}
            </span>
          </div>

          <input
            aria-label="Search items"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full sm:w-64 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</span>
          <button
            onClick={handleClearCategories}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              selectedCategories.length === 0
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => handleCategoryToggle(c)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedCategories.includes(c)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading items...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">Failed to load items</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600 dark:text-gray-400">No items found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {filtered.map((item: Item) => (
            <ItemCard
              key={item.id}
              item={item}
              quantity={getItemQuantityInCart(item.id)}
              onAdd={() => handleAddToCart(item)}
              onIncrease={() => handleIncreaseQuantity(item)}
              onDecrease={() => handleDecreaseQuantity(item)}
              onSetQuantity={(item, qty) => handleSetQuantity(item, qty)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
