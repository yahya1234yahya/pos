'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';

export default function Receipt({ params }) {
  const orderId = use(params).id;
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await fetch(`http://localhost/pos/POS/api/orders.php?id=${orderId}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setReceipt(data.order);
        } else {
          setError('Failed to fetch receipt');
        }
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setError('Error fetching receipt');
      }
    };

    fetchReceipt();
  }, [orderId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate total
  const calculateItemTotal = (item) => {
    let total = item.unit_price * item.quantity;
    if (item.notes) {
      const options = JSON.parse(item.notes);
      total += options.reduce((sum, opt) => sum + (parseFloat(opt.extra_cost) || 0), 0) * item.quantity;
    }
    return total;
  };

  const total = receipt.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Cool Down</h1>
          <p className="text-gray-600 mt-1">Order Receipt</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Order #:</span>
            <span>{receipt.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Table:</span>
            <span>{receipt.table_number}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Waiter:</span>
            <span>{receipt.waiter_name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Date:</span>
            <span>{new Date(receipt.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t border-b py-4 mb-6">
          {receipt.items.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.quantity} x {item.unit_price} DH
                  </div>
                  {item.notes && JSON.parse(item.notes).map((opt, i) => (
                    <div key={i} className="text-sm text-gray-500 ml-4">
                      + {opt.value} {opt.extra_cost > 0 ? `(+${opt.extra_cost} DH)` : ''}
                    </div>
                  ))}
                </div>
                <div className="font-medium">
                  {calculateItemTotal(item).toFixed(2)} DH
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xl font-bold mb-8">
          <span>Total:</span>
          <span>{total.toFixed(2)} DH</span>
        </div>

        <div className="text-center text-gray-600 text-sm">
          <p>Thank you for your visit!</p>
          <p>Please come again</p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
