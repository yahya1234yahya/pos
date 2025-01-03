'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/pos/POS/api';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '0.00',
    description: '',
    optionGroups: []
  });

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu.php`, {
        withCredentials: true
      });
      if (response.data.success) {
        // Flatten the menu items from categories
        const items = response.data.menu.reduce((acc, category) => {
          return [...acc, ...category.items.map(item => ({
            ...item,
            category_name: category.name // Add category name to each item
          }))];
        }, []);
        setMenuItems(items);
      } else {
        setError('Failed to load menu items');
      }
    } catch (err) {
      setError('Error loading menu items');
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories.php`, {
        withCredentials: true
      });
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.name || !formData.category_id || !formData.price) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/menu.php`,
        {
          action: 'add_item',
          name: formData.name,
          category_id: formData.category_id,
          price: formData.price,
          description: formData.description || '',
          option_groups: formData.optionGroups || []
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Clear form
        setFormData({
          name: '',
          category_id: '',
          price: '0.00',
          description: '',
          optionGroups: []
        });
        fetchMenuItems(); // Refresh the list
      } else {
        setError(response.data.message || 'Failed to add menu item');
      }
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError(err.response?.data?.message || 'Error adding menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/menu.php`,
        {
          data: { id },
          withCredentials: true
        }
      );

      if (response.data.success) {
        fetchMenuItems();
      } else {
        setError(response.data.message || 'Failed to delete menu item');
      }
    } catch (err) {
      setError('Error deleting menu item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/menu.php`,
        {
          action: 'update_item',
          id: editingItem.id,
          name: formData.name,
          category_id: formData.category_id,
          price: formData.price,
          description: formData.description || '',
          option_groups: formData.optionGroups || []
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowEditModal(false);
        setEditingItem(null);
        setFormData({
          name: '',
          category_id: '',
          price: '0.00',
          description: '',
          optionGroups: []
        });
        fetchMenuItems();
      } else {
        setError(response.data.message || 'Failed to update menu item');
      }
    } catch (err) {
      console.error('Error updating menu item:', err);
      setError(err.response?.data?.message || 'Error updating menu item');
    } finally {
      setLoading(false);
    }
  };

  const addOptionGroup = () => {
    setFormData(prev => ({
      ...prev,
      optionGroups: [...prev.optionGroups, { name: '', type: 'Single Select', options: [], extraCost: '0.00' }]
    }));
  };

  const removeOptionGroup = (index) => {
    setFormData(prev => ({
      ...prev,
      optionGroups: prev.optionGroups.filter((_, i) => i !== index)
    }));
  };

  const addOption = (groupIndex) => {
    setFormData(prev => {
      const newGroups = [...prev.optionGroups];
      newGroups[groupIndex].options.push({ name: '', extraCost: '0.00' });
      return { ...prev, optionGroups: newGroups };
    });
  };

  const removeOption = (groupIndex, optionIndex) => {
    setFormData(prev => {
      const newGroups = [...prev.optionGroups];
      newGroups[groupIndex].options = newGroups[groupIndex].options.filter((_, i) => i !== optionIndex);
      return { ...prev, optionGroups: newGroups };
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      description: item.description || '',
      optionGroups: item.option_groups || []
    });
    setShowEditModal(true);
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
        <form onSubmit={handleAddItem}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Enter item description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Customization Options</h3>
              <div className="space-y-4">
                {formData.optionGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="border-l-4 border-indigo-500 pl-4 pb-4">
                    <div className="flex items-center gap-4 mb-2">
                      <input
                        type="text"
                        placeholder="Group Name (e.g., Sugar Level)"
                        value={group.name}
                        onChange={(e) => {
                          const newGroups = [...formData.optionGroups];
                          newGroups[groupIndex].name = e.target.value;
                          setFormData({ ...formData, optionGroups: newGroups });
                        }}
                        className="flex-1 border rounded-md shadow-sm py-2 px-3"
                      />
                      <select
                        value={group.type}
                        onChange={(e) => {
                          const newGroups = [...formData.optionGroups];
                          newGroups[groupIndex].type = e.target.value;
                          setFormData({ ...formData, optionGroups: newGroups });
                        }}
                        className="border rounded-md shadow-sm py-2 px-3"
                      >
                        <option>Single Select</option>
                        <option>Multi Select</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeOptionGroup(groupIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {group.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-4 mt-2">
                        <input
                          type="text"
                          placeholder="Option Name"
                          value={option.name}
                          onChange={(e) => {
                            const newGroups = [...formData.optionGroups];
                            newGroups[groupIndex].options[optionIndex].name = e.target.value;
                            setFormData({ ...formData, optionGroups: newGroups });
                          }}
                          className="flex-1 border rounded-md shadow-sm py-2 px-3"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Extra Cost"
                          value={option.extraCost}
                          onChange={(e) => {
                            const newGroups = [...formData.optionGroups];
                            newGroups[groupIndex].options[optionIndex].extraCost = e.target.value;
                            setFormData({ ...formData, optionGroups: newGroups });
                          }}
                          className="w-32 border rounded-md shadow-sm py-2 px-3"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(groupIndex, optionIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => addOption(groupIndex)}
                      className="mt-2 text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Option
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOptionGroup}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  + Add Option Group
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Menu Item</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({
                    name: '',
                    category_id: '',
                    price: '0.00',
                    description: '',
                    optionGroups: []
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleEditItem}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                    <input
                      type="text"
                      placeholder="Enter item name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    placeholder="Enter item description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Customization Options</h3>
                  <div className="space-y-4">
                    {formData.optionGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="border-l-4 border-indigo-500 pl-4 pb-4">
                        <div className="flex items-center gap-4 mb-2">
                          <input
                            type="text"
                            placeholder="Group Name (e.g., Sugar Level)"
                            value={group.name}
                            onChange={(e) => {
                              const newGroups = [...formData.optionGroups];
                              newGroups[groupIndex].name = e.target.value;
                              setFormData({ ...formData, optionGroups: newGroups });
                            }}
                            className="flex-1 border rounded-md shadow-sm py-2 px-3"
                          />
                          <select
                            value={group.type}
                            onChange={(e) => {
                              const newGroups = [...formData.optionGroups];
                              newGroups[groupIndex].type = e.target.value;
                              setFormData({ ...formData, optionGroups: newGroups });
                            }}
                            className="border rounded-md shadow-sm py-2 px-3"
                          >
                            <option>Single Select</option>
                            <option>Multi Select</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeOptionGroup(groupIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        
                        {group.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-4 mt-2">
                            <input
                              type="text"
                              placeholder="Option Name"
                              value={option.name}
                              onChange={(e) => {
                                const newGroups = [...formData.optionGroups];
                                newGroups[groupIndex].options[optionIndex].name = e.target.value;
                                setFormData({ ...formData, optionGroups: newGroups });
                              }}
                              className="flex-1 border rounded-md shadow-sm py-2 px-3"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Extra Cost"
                              value={option.extraCost}
                              onChange={(e) => {
                                const newGroups = [...formData.optionGroups];
                                newGroups[groupIndex].options[optionIndex].extraCost = e.target.value;
                                setFormData({ ...formData, optionGroups: newGroups });
                              }}
                              className="w-32 border rounded-md shadow-sm py-2 px-3"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(groupIndex, optionIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => addOption(groupIndex)}
                          className="mt-2 text-indigo-600 hover:text-indigo-800"
                        >
                          + Add Option
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOptionGroup}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Option Group
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setFormData({
                      name: '',
                      category_id: '',
                      price: '0.00',
                      description: '',
                      optionGroups: []
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">Menu Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatPrice(item.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Available
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            className="absolute top-0 right-0 px-4 py-3"
            onClick={() => setError('')}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}
    </div>
  );
}