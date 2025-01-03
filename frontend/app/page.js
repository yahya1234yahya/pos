'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KitchenNavigation from '@/components/kitchenNavigation';
import { format, formatDistanceToNow } from 'date-fns';

export default function KitchenPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in and has kitchen role
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost/pos/POS/api/auth.php', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        if (!data.success || !data.user || data.user.role !== 'kitchen') {
          router.push('/');
          return false;
        }

        return true;
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/');
        return false;
      }
    };

    const pollOrders = async () => {
      try {
        const response = await fetch('http://localhost/pos/POS/api/orders.php?kitchen=true', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch orders');
        }

        // Ensure orders is an array and has required fields
        const validOrders = (data.orders || [])
          .filter(order => order && order.id && Array.isArray(order.items))
          .filter(order => order.status === 'pending') // Only show pending orders
          .map(order => ({
            ...order,
            items: order.items
              .filter(item => item.status === 'pending') // Only show pending items
              .map(item => ({
                id: item.id,
                name: item.name || 'Unknown Item',
                quantity: parseInt(item.quantity) || 1,
                notes: item.notes || '',
                category: item.category || 'uncategorized'
              }))
          }))
          .filter(order => order.items.length > 0); // Only show orders with pending items

        setOrders(validOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Start polling only if authenticated
    const startPolling = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) return;

      pollOrders();
      const interval = setInterval(pollOrders, 10000);
      return () => clearInterval(interval);
    };

    startPolling();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/auth.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'logout'
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Logout failed');
      }

      // Clear any local state if needed
      setOrders([]);
      setError(null);
      
      // Redirect to login page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!orders.length) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Kitchen Orders</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="text-gray-500">No pending orders at the moment.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-bold">Kitchen Orders</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white shadow-lg rounded-lg p-4 border-2 border-gray-300">
            <div className="border-b-2 border-gray-300 pb-2 mb-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500 border border-gray-300 rounded px-2 py-1">
                    Table {order.table_number || 'N/A'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Floor {order.table_floor || '?'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ordered: {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </p>
              {order.waiter_name && (
                <p className="text-sm text-gray-500">
                  Waiter: {order.waiter_name}
                </p>
              )}
            </div>
            <ul className="space-y-2 divide-y divide-gray-200">
              {order.items.map(item => (
                <li key={item.id} className="flex justify-between items-start pt-2 first:pt-0">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2 border border-gray-300 rounded-full px-2">×{item.quantity}</span>
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-1 border-l-2 border-gray-300 pl-2">Note: {item.notes}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 border border-gray-300 rounded px-2">{item.category}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}