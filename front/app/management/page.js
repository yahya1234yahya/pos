'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/middleware/authMiddleware';

function ManagementPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    revenue: { value: 0, change: 0 },
    customers: { value: 0, change: 0 },
    orders: { value: 0, popular: '' },
    staff: { kitchen: 0, waiters: 0 },
    waiters: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost/pos/POS/api/stats.php', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          throw new Error(data.message || 'Failed to fetch stats');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
            <div className="mt-2">
              <p className="text-2xl font-semibold">${stats.revenue.value.toFixed(2)}</p>
              <p className={`text-sm ${stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenue.change >= 0 ? '↑' : '↓'} {Math.abs(stats.revenue.change)}%
              </p>
            </div>
          </div>

          {/* Customers Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Customers Today</h3>
            <div className="mt-2">
              <p className="text-2xl font-semibold">{stats.customers.value}</p>
              <p className={`text-sm ${stats.customers.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.customers.change >= 0 ? '↑' : '↓'} {Math.abs(stats.customers.change)}%
              </p>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <div className="mt-2">
              <p className="text-2xl font-semibold">{stats.orders.value}</p>
              <p className="text-sm text-gray-500">Most Popular: {stats.orders.popular}</p>
            </div>
          </div>

          {/* Staff Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Active Staff</h3>
            <div className="mt-2">
              <p className="text-2xl font-semibold">{stats.staff.kitchen + stats.staff.waiters}</p>
              <p className="text-sm text-gray-500">
                Kitchen: {stats.staff.kitchen} | Waiters: {stats.staff.waiters}
              </p>
            </div>
          </div>
        </div>

        {/* Waiters Performance Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Waiters Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Most Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagementPage, ['admin', 'manager']);