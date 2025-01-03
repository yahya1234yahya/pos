'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/middleware/authMiddleware';

function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/pos/POS/api/orders.php', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const formattedOrders = data.orders.map(order => ({
          id: order.id,
          table: order.table_number,
          status: order.status,
          items: order.items.map(item => ({
            quantity: item.quantity,
            name: item.item_name,
            options: item.options?.map(opt => `${opt.option_name}: ${opt.value}`).join(', ') || '',
            price: item.unit_price,
            total: (item.quantity * item.unit_price) + 
              (item.options?.reduce((acc, opt) => acc + (parseFloat(opt.extra_cost) || 0), 0) || 0) * item.quantity
          })),
          total: order.items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unit_price;
            const optionsTotal = item.options?.reduce((acc, opt) => acc + (parseFloat(opt.extra_cost) || 0), 0) || 0;
            return sum + (itemTotal + (optionsTotal * item.quantity));
          }, 0),
          created_at: new Date(order.created_at).toLocaleString(),
          completed_at: order.completed_at ? new Date(order.completed_at).toLocaleString() : null
        }));
        
        setOrders(formattedOrders);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handlePayment = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/pos/POS/api/orders.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          order_id: orderId,
          status: 'completed'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchOrders();
        window.open(`/receipt?orderId=${orderId}`, '_blank');
      } else {
        throw new Error(data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/logout.php', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'unpaid') {
      return order.status !== 'completed' && order.status !== 'cancelled';
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-md py-2 px-3"
          >
            <option value="all">All Orders</option>
            <option value="unpaid">Unpaid Orders</option>
          </select>
          <button
            onClick={fetchOrders}
            className="bg-gray-100 p-2 rounded hover:bg-gray-200"
            title="Refresh Orders"
          >
            🔄
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Table {order.table}</h3>
                <p className="text-sm text-gray-500">{order.created_at}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <button
                    onClick={() => handlePayment(order.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    disabled={loading}
                  >
                    Pay
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.quantity}x {item.name}</span>
                    {item.options && (
                      <span className="text-gray-500"> ({item.options})</span>
                    )}
                  </div>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(Orders, 'waiter');
