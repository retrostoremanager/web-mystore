import { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

const STORAGE_KEY = 'mystore_inventory';

// Initial placeholder data
const initialData = [
  { 
    id: 1, 
    name: 'Pokémon Booster Box', 
    category: 'TCG', 
    quantity: 12, 
    price: '$149.99',
    game: null,
    condition: 'New',
    completeness: { box: true, instructions: true, game: true, inserts: true, other: false },
    buyPrice: '',
    sellPrice: '149.99',
    notes: '',
    addedDate: new Date().toISOString(),
  },
  { 
    id: 2, 
    name: 'Magic: The Gathering Set', 
    category: 'TCG', 
    quantity: 8, 
    price: '$99.99',
    game: null,
    condition: 'Very Good',
    completeness: { box: true, instructions: true, game: true, inserts: false, other: false },
    buyPrice: '',
    sellPrice: '99.99',
    notes: '',
    addedDate: new Date().toISOString(),
  },
  { 
    id: 3, 
    name: 'Nintendo Switch Console', 
    category: 'Video Games', 
    quantity: 5, 
    price: '$299.99',
    game: null,
    condition: 'New',
    completeness: { box: true, instructions: true, game: true, inserts: true, other: true },
    buyPrice: '',
    sellPrice: '299.99',
    notes: '',
    addedDate: new Date().toISOString(),
  },
  { 
    id: 4, 
    name: 'PlayStation 5', 
    category: 'Video Games', 
    quantity: 3, 
    price: '$499.99',
    game: null,
    condition: 'New',
    completeness: { box: true, instructions: true, game: true, inserts: true, other: false },
    buyPrice: '',
    sellPrice: '499.99',
    notes: '',
    addedDate: new Date().toISOString(),
  },
  { 
    id: 5, 
    name: 'Yu-Gi-Oh! Structure Deck', 
    category: 'TCG', 
    quantity: 20, 
    price: '$24.99',
    game: null,
    condition: 'Good',
    completeness: { box: true, instructions: true, game: true, inserts: false, other: false },
    buyPrice: '',
    sellPrice: '24.99',
    notes: '',
    addedDate: new Date().toISOString(),
  },
  { 
    id: 6, 
    name: 'Xbox Series X', 
    category: 'Video Games', 
    quantity: 2, 
    price: '$499.99',
    game: null,
    condition: 'Like New',
    completeness: { box: true, instructions: true, game: true, inserts: true, other: false },
    buyPrice: '',
    sellPrice: '499.99',
    notes: '',
    addedDate: new Date().toISOString(),
  },
];

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);

  // Load inventory from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInventory(parsed);
      } else {
        // Use initial data if nothing is stored
        setInventory(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error('Error loading inventory from localStorage:', error);
      setInventory(initialData);
    }
  }, []);

  // Save to localStorage whenever inventory changes
  useEffect(() => {
    if (inventory.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
      } catch (error) {
        console.error('Error saving inventory to localStorage:', error);
      }
    }
  }, [inventory]);

  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now(), // Simple ID generation
      addedDate: new Date().toISOString(),
      // Format price for display
      price: `$${parseFloat(item.sellPrice || 0).toFixed(2)}`,
      // Determine category from game console if available
      category: item.game?.console || 'Video Games',
      // Use game title as name if available
      name: item.game ? `${item.game.title} (${item.game.console})` : item.name || 'Unknown Item',
    };

    setInventory((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateInventoryItem = (id, updates) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteInventoryItem = (id) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

