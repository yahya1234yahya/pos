'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KitchenNavigation from '@/components/kitchenNavigation';
import OrderDisplay from '@/components/kitchen/orderDisplay';
import { format } from 'date-fns';

export default function KitchenPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.log('Kitchen orders response:', data); // Debug log

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      // Ensure orders is an array and has required fields
      const validOrders = (data.orders || [])
        .filter(order => order && order.id && Array.isArray(order.items))
        .filter(order => ['pending', 'preparing'].includes(order.status))
        .map(order => ({
          ...order,
          items: order.items
            .filter(item => ['pending', 'preparing'].includes(item.status))
            .map(item => ({
              id: item.id,
              name: item.name || 'Unknown Item',
              quantity: parseInt(item.quantity) || 1,
              notes: item.notes || '',
              category: item.category || 'uncategorized',
              status: item.status || 'pending'
            }))
        }))
        .filter(order => order.items.length > 0);

      console.log('Processed orders:', validOrders); // Debug log
      setOrders(validOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'logout' }),
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      const data = await response.json();
      if (data.success) {
        router.push('/');
      } else {
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <KitchenNavigation onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Orders</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : (
          <OrderDisplay orders={orders} onUpdateStatus={pollOrders} />
        )}
      </main>
    </div>
  );
}