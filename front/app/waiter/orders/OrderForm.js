'use client';
import { useState, useEffect } from 'react';

const OrderForm = ({ table, onSubmit, onCancel }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/menu.php', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.items);
      } else {
        setError('Failed to load menu items');
      }
    } catch (err) {
      setError('Error loading menu items');
      console.error('Error:', err);
    }
  };

  const addItem = (item) => {
    const newItem = {
      menu_item_id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: 1,
      options: [],
      available_options: item.options || []
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const updateItemQuantity = (index, quantity) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = Math.max(1, quantity);
    setSelectedItems(newItems);
  };

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const toggleOption = (itemIndex, option, value) => {
    const newItems = [...selectedItems];
    const item = newItems[itemIndex];
    
    // Check if this option type already exists
    const existingOptionIndex = item.options.findIndex(
      opt => opt.option_type === option.option_type
    );

    if (existingOptionIndex !== -1) {
      // Update existing option
      if (option.option_type === 'size') {
        // For size, replace the existing value
        item.options[existingOptionIndex] = {
          option_id: option.id,
          option_type: option.option_type,
          option_name: option.option_name,
          value: value.value,
          extra_cost: parseFloat(value.extra_cost)
        };
      } else {
        // For extras, toggle the value
        const valueIndex = item.options[existingOptionIndex].values.findIndex(
          v => v.value === value.value
        );
        if (valueIndex !== -1) {
          item.options[existingOptionIndex].values.splice(valueIndex, 1);
          if (item.options[existingOptionIndex].values.length === 0) {
            item.options.splice(existingOptionIndex, 1);
          }
        } else {
          item.options[existingOptionIndex].values.push({
            value: value.value,
            extra_cost: parseFloat(value.extra_cost)
          });
        }
      }
    } else {
      // Add new option
      if (option.option_type === 'size') {
        item.options.push({
          option_id: option.id,
          option_type: option.option_type,
          option_name: option.option_name,
          value: value.value,
          extra_cost: parseFloat(value.extra_cost)
        });
      } else {
        item.options.push({
          option_id: option.id,
          option_type: option.option_type,
          option_name: option.option_name,
          values: [{
            value: value.value,
            extra_cost: parseFloat(value.extra_cost)
          }]
        });
      }
    }
    
    setSelectedItems(newItems);
  };

  const calculateItemTotal = (item) => {
    let total = item.price * item.quantity;
    item.options.forEach(option => {
      if (option.option_type === 'size') {
        total += option.extra_cost * item.quantity;
      } else {
        option.values.forEach(value => {
          total += value.extra_cost * item.quantity;
        });
      }
    });
    return total;
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError('Please add at least one item');
      return;
    }
    onSubmit({
      table_id: table.id,
      items: selectedItems.map(item => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        options: item.options,
      }))
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Nouvelle Commande - Table {table.number}</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Menu</h3>
          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="p-4 border rounded-lg hover:bg-blue-50 text-left"
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600">{parseFloat(item.price).toFixed(2)} DH</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Commande</h3>
          {selectedItems.length === 0 ? (
            <p className="text-gray-500">Aucun article sélectionné</p>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{parseFloat(item.price).toFixed(2)} DH</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{item.quantity}x {item.name}</span>
                    <span>
                      {(item.price * item.quantity).toFixed(2)} DH
                    </span>
                  </div>
                  {item.available_options.map((option, optIndex) => (
                    <div key={optIndex} className="mt-2">
                      <div className="text-sm font-medium text-gray-700">
                        {option.option_type === 'size' ? 'Taille' : 'Extras'}:
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {option.values.map((value, valIndex) => {
                          const isSelected = item.options.some(opt => 
                            opt.option_type === option.option_type && 
                            (opt.option_type === 'size' ? 
                              opt.value === value.value :
                              opt.values.some(v => v.value === value.value))
                          );
                          
                          return (
                            <button
                              key={valIndex}
                              onClick={() => toggleOption(index, option, value)}
                              className={`px-2 py-1 text-sm rounded ${
                                isSelected
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {value.name}
                              {value.extra_cost > 0 && ` (+${value.extra_cost} DH)`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="text-right font-bold">
                  Total: {calculateTotal().toFixed(2)} DH
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={selectedItems.length === 0}
        >
          Commander
        </button>
      </div>
    </div>
  );
};

export default OrderForm;
