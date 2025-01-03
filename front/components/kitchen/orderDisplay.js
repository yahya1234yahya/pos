'use client';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function OrderDisplay({ orders, onUpdateStatus }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleUpdateStatus = async (orderId, newStatus, itemId = null) => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update_status',
          order_id: orderId,
          item_id: itemId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      onUpdateStatus();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  if (!orders || orders.length === 0) {
    return <div className="p-4 text-gray-600">No pending orders at the moment.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Order Header */}
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Order #{order.id}
                  {order.table_number && (
                    <span className="ml-2 text-sm text-gray-600">
                      (Table {order.table_number})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'preparing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
            {order.waiter_name && (
              <p className="text-sm text-gray-600 mt-1">
                Waiter: {order.waiter_name}
              </p>
            )}
          </div>

          {/* Order Items */}
          <div className="p-4">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.name}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : item.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity}
                      {item.notes && (
                        <div className="text-red-600 mt-1">Note: {item.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing', item.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Start
                      </button>
                    )}
                    {item.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready', item.id)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
