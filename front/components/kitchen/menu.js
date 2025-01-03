'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ItemOptionsModal from './ItemOptionsModal';

const Menu = ({ selectedCategory, onAddToOrder, onUpdateStatus }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/menu.php', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        // Make sure each item has an options array
        const itemsWithOptions = data.items.map(item => ({
          ...item,
          options: item.options || []
        }));
        setMenuItems(itemsWithOptions);
      } else {
        setError('Failed to fetch menu items');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Error fetching menu items');
      setLoading(false);
    }
  };

  const handleAddToOrder = (item) => {
    // Check if item has options
    if (item.options && item.options.length > 0) {
      setSelectedItemForOptions(item);
    } else {
      // If no options, add directly to order
      onAddToOrder({ ...item, selectedOptions: {} });
    }
  };

  const handleOptionsConfirm = (options) => {
    if (selectedItemForOptions) {
      const selectedOptions = {};
      // Format options properly
      Object.entries(options).forEach(([optionId, value]) => {
        if (value && typeof value === 'object') {
          selectedOptions[optionId] = {
            id: value.id,
            value: value.value,
            extra_cost: Number(value.extra_cost) || 0
          };
        }
      });
      
      onAddToOrder({
        ...selectedItemForOptions,
        selectedOptions
      });
      setSelectedItemForOptions(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchItems}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  return (
    <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {item.image && (
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <span className="text-primary font-bold">{item.price} DH</span>
              </div>
              {item.description && (
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              )}
              <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium">{item.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      item.status === 'preparing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                    {item.notes && (
                      <span className="ml-2 text-red-600">Note: {item.notes}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'preparing', item.id)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Start Preparing
                    </button>
                  )}
                  {item.status === 'preparing' && (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'ready', item.id)}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
              <button
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                onClick={() => handleAddToOrder(item)}
              >
                Add to Order
                {item.options?.length > 0 && (
                  <span className="ml-1 text-xs">(+ Options)</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedItemForOptions && (
        <ItemOptionsModal
          item={selectedItemForOptions}
          onConfirm={handleOptionsConfirm}
          onClose={() => setSelectedItemForOptions(null)}
        />
      )}
    </div>
  );
};

export default Menu;
