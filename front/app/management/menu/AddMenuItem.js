'use client';
import { useState, useEffect } from 'react';

const AddMenuItem = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('http://localhost/pos/POS/api/menu.php?action=get_categories', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error('Error:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Add a new option group (size or extras)
  const addOptionGroup = (type) => {
    setOptions([...options, {
      option_type: type,
      option_name: type === 'size' ? 'Taille' : 'Extras',
      values: [{ value: '', extra_cost: '0.00' }]
    }]);
  };

  // Add a new value to an option group
  const addOptionValue = (optionIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].values.push({ value: '', extra_cost: '0.00' });
    setOptions(newOptions);
  };

  // Remove an option value
  const removeOptionValue = (optionIndex, valueIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter((_, index) => index !== valueIndex);
    if (newOptions[optionIndex].values.length === 0) {
      newOptions.splice(optionIndex, 1);
    }
    setOptions(newOptions);
  };

  // Update option value
  const updateOptionValue = (optionIndex, valueIndex, field, value) => {
    const newOptions = [...options];
    newOptions[optionIndex].values[valueIndex][field] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost/pos/POS/api/menu.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'add_item',
          name,
          category_id: parseInt(categoryId),
          price: parseFloat(price),
          description,
          options: options.map(opt => ({
            option_name: opt.option_name,
            option_type: opt.option_type,
            values: opt.values.map(v => ({
              value: v.value,
              extra_cost: parseFloat(v.extra_cost)
            }))
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to add menu item');
      }
    } catch (err) {
      setError('Error adding menu item');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border w-[800px] shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Add New Menu Item</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name*
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="e.g., Cappuccino"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category*
                </label>
                {categoriesLoading ? (
                  <div className="flex items-center space-x-2 h-[42px] px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-500">Loading categories...</span>
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (€)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Enter item description..."
                />
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-gray-700">Options</h4>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => addOptionGroup('size')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
                >
                  + Add Size Options
                </button>
                <button
                  type="button"
                  onClick={() => addOptionGroup('extra')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
                >
                  + Add Extras
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {options.map((option, optionIndex) => (
                <div key={optionIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        option.option_type === 'size' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {option.option_type === 'size' ? 'Size' : 'Extras'}
                      </span>
                      <input
                        type="text"
                        value={option.option_name}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[optionIndex].option_name = e.target.value;
                          setOptions(newOptions);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Option name"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...options];
                        newOptions.splice(optionIndex, 1);
                        setOptions(newOptions);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    {option.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={value.value}
                          onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`${option.option_type === 'size' ? 'Size name' : 'Extra name'}`}
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">+</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={value.extra_cost}
                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'extra_cost', e.target.value)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                          <span className="text-gray-500">€</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOptionValue(optionIndex, valueIndex)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addOptionValue(optionIndex)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Add Value
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuItem;
