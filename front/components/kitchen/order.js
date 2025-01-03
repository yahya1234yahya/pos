'use client';
import { useState } from 'react';

const Order = ({ orderItems, onRemoveFromOrder, onCreateOrder, loading, error }) => {
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      let itemTotal = item.price * item.quantity;
      
      // Add extra costs from options if any
      if (item.selectedOptions) {
        itemTotal += Object.values(item.selectedOptions).reduce((optionsTotal, option) => {
          return optionsTotal + (Number(option.extra_cost) || 0);
        }, 0) * item.quantity;
      }
      
      return total + itemTotal;
    }, 0);
  };

  const handleCreateOrder = () => {
    console.log('Create order button clicked');
    console.log('Order items:', orderItems);
    if (typeof onCreateOrder === 'function') {
      onCreateOrder();
    } else {
      console.error('onCreateOrder is not a function');
    }
  };

  return (
    <div className="w-1/3 bg-white border-l">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Current Order</h2>
      </div>

      {error && (
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {orderItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No items selected</p>
        ) : (
          orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="font-medium">{item.name}</div>
                  <button
                    onClick={() => onRemoveFromOrder(item.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </div>
                {item.selectedOptions && Object.values(item.selectedOptions).map((option, index) => (
                  <div key={index} className="text-sm text-gray-500">
                    {option.value} {option.extra_cost > 0 ? `(+${option.extra_cost} DH)` : ''}
                  </div>
                ))}
                <div className="text-sm font-medium mt-1">
                  {(item.price + (Object.values(item.selectedOptions || {}).reduce((total, opt) => total + (Number(opt.extra_cost) || 0), 0))) * item.quantity} DH
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-lg font-bold">{calculateTotal().toFixed(2)} DH</span>
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={loading || orderItems.length === 0}
          className={`w-full py-3 rounded ${
            loading || orderItems.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </div>
  );
};

export default Order;
