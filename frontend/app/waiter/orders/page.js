// app/page.js
'use client';
import { useEffect, useState } from 'react';
import WaiterNavigation from '@/components/waiterNavigation';

export default function Waiter() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'unpaid'

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = [
        {
          id: "1234",
          table: "5",
          status: "Unpaid",
          items: "2x Espresso, 1x Cappuccino",
          timestamp: "Ordered at 10:30 AM",
          total: "12.50"
        },
        {
          id: "1233",
          table: "3",
          status: "Paid",
          items: "3x Latte, 2x Croissant",
          timestamp: "Completed at 10:15 AM",
          total: "22.50"
        }
      ];
      setOrders(orders);
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'unpaid') return order.status === 'Unpaid';
    return true;
  });

  return (
    <div className="h-full bg-gray-100">
      <WaiterNavigation />

      <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-2xl font-bold">Liste des Commandes</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                Toutes les Commandes
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'unpaid' ? 'bg-primary text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                Non Payées Uniquement
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold">#{order.id}</span>
                      <span className="text-gray-600">Table {order.table}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'Unpaid' ? 'bg-warning text-white' : 'bg-secondary text-white'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-gray-600">{order.items}</div>
                    <div className="text-gray-500 text-sm">{order.timestamp}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold">${order.total}</span>
                    {order.status === 'Unpaid' ? (
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                        Pay Now
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">View Receipt</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
