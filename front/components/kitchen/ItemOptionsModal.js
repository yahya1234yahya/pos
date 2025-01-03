'use client';
import { useState, useEffect } from 'react';

const ItemOptionsModal = ({ item, onClose, onConfirm }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    console.log('ItemOptionsModal mounted with item:', item);
  }, [item]);

  const handleOptionSelect = (optionId, value) => {
    console.log('Selected option:', optionId, value);
    // Ensure value is properly structured with id, value, and extra_cost
    const formattedValue = typeof value === 'object' ? {
      id: value.id,
      value: value.value || value.name,
      extra_cost: Number(value.extra_cost) || 0
    } : {
      id: value,
      value: value,
      extra_cost: 0
    };
    
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: formattedValue
    }));
  };

  const handleConfirm = () => {
    // Check if all required options are selected
    const missingRequired = item.options?.some(
      option => option.required && !selectedOptions[option.id]
    );

    if (missingRequired) {
      alert('Veuillez sélectionner toutes les options requises');
      return;
    }

    // Add special instructions if any
    const finalOptions = {
      ...selectedOptions,
      instructions: specialInstructions || undefined
    };

    console.log('Confirming options:', finalOptions);
    onConfirm(finalOptions);
    onClose();
  };

  // If no options, don't show modal
  if (!item || !item.options || item.options.length === 0) {
    console.log('No options available for item:', item);
    return null;
  }

  console.log('Rendering options modal for item:', item);
  console.log('Current selected options:', selectedOptions);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {item.options.map((option) => (
            <div key={option.id} className="mb-4">
              <h3 className="font-medium mb-2">
                {option.name}
                {option.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <div className="space-y-2">
                {option.values.map((value) => (
                  <button
                    key={value.id}
                    onClick={() => handleOptionSelect(option.id, value)}
                    className={`w-full text-left px-4 py-2 rounded border ${
                      selectedOptions[option.id]?.id === value.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{value.value}</span>
                      {value.extra_cost > 0 && (
                        <span className={selectedOptions[option.id]?.id === value.id ? 'text-white' : 'text-gray-500'}>
                          +{value.extra_cost} DH
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div>
            <h3 className="font-medium mb-2">Instructions spéciales</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ex: Sans oignon, bien cuit, etc."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemOptionsModal;
