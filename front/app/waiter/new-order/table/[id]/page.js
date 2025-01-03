'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { withAuth } from '@/middleware/authMiddleware';
import Categories from '@/components/kitchen/categories';
import Menu from '@/components/kitchen/menu';
import Order from '@/components/kitchen/order';

function TableOrder({ params }) {
  const router = useRouter();
  const tableId = use(params).id;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderItems, setOrderItems] = useState([]);
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        console.log('Fetching table with ID:', tableId);
        const response = await fetch(`http://localhost/pos/POS/api/tables.php?id=${tableId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Table API response:', data);
        
        if (data.success && data.table) {
          console.log('Setting table:', data.table);
          setTable(data.table);
        } else {
          const errorMsg = data.message || 'Failed to fetch table details';
          console.error('Failed to fetch table:', errorMsg);
          setError(errorMsg);
        }
      } catch (err) {
        console.error('Error fetching table:', err);
        setError('Error fetching table: ' + (err.message || 'Unknown error'));
      }
    };

    if (tableId) {
      console.log('Table ID changed, fetching table:', tableId);
      fetchTable();
    } else {
      console.error('No table ID provided');
      setError('No table ID provided');
    }
  }, [tableId]);

  const handleCreateOrder = async () => {
    console.log('handleCreateOrder called');
    console.log('Current table:', table);
    console.log('Current order items:', orderItems);
    
    if (!table) {
      console.error('No table object:', table);
      console.log('Table ID:', tableId);
      setError('No table selected');
      return;
    }
    
    if (orderItems.length === 0) {
      setError('No items in order');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user info
      console.log('Fetching user info...');
      const userResponse = await fetch('http://localhost/pos/POS/api/auth.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      console.log('User data:', userData);

      if (!userData.success || !userData.user?.id) {
        throw new Error('Please log in to create an order');
      }

      // Format order data according to backend expectations
      const orderData = {
        table_id: parseInt(table.id),
        waiter_id: parseInt(userData.user.id),
        type: 'dine-in',
        items: orderItems.map(item => ({
          menu_item_id: parseInt(item.id),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price),
          notes: item.selectedOptions ? 
            JSON.stringify(
              Object.values(item.selectedOptions).map(opt => ({
                option_id: parseInt(opt.option_id),
                value: opt.value,
                extra_cost: parseFloat(opt.extra_cost || 0)
              }))
            ) : null
        }))
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('http://localhost/pos/POS/api/orders.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Order response:', data);

      if (data.success && data.order && data.order.id) {
        // Open receipt in new window with orderId parameter
        const receiptWindow = window.open(`/receipt?orderId=${data.order.id}`, '_blank');
        if (receiptWindow) {
          receiptWindow.focus();
        }
        
        // Redirect to orders page after a short delay
        setTimeout(() => {
          router.push('/waiter/orders');
        }, 500);
      } else {
        throw new Error(data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (item) => {
    console.log('Adding item to order:', item);
    setOrderItems(prevItems => {
      const existingItem = prevItems.find((orderItem) => 
        orderItem.id === item.id && 
        JSON.stringify(orderItem.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      if (existingItem) {
        return prevItems.map((orderItem) =>
          orderItem.id === item.id && 
          JSON.stringify(orderItem.selectedOptions) === JSON.stringify(item.selectedOptions)
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        const newItems = [...prevItems, { ...item, quantity: 1 }];
        console.log('Updated order items:', newItems);
        return newItems;
      }
    });
  };

  const removeFromOrder = (itemId) => {
    console.log('Removing item from order:', itemId);
    setOrderItems(prevItems => {
      const newItems = prevItems.filter((item) => item.id !== itemId);
      console.log('Updated order items after removal:', newItems);
      return newItems;
    });
  };

  // Add table info to the UI for debugging
  const debugInfo = process.env.NODE_ENV === 'development' && (
    <div className="fixed bottom-0 right-0 bg-black text-white p-2 text-xs">
      <div>Table ID: {tableId}</div>
      <div>Table Object: {JSON.stringify(table)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b">
        <div className="px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link href="/waiter" className="text-xl font-bold text-gray-800">
                Cool Down
              </Link>
              <Link
                href="/waiter/new-order"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                New Order
              </Link>
              <Link
                href="/waiter/orders"
                className="text-gray-600 hover:text-gray-900"
              >
                All Orders
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                Admin
              </Link>
              <Link
                href="/login"
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        <Categories selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <Menu selectedCategory={selectedCategory} onAddToOrder={addToOrder} />
        <Order 
          orderItems={orderItems} 
          onRemoveFromOrder={removeFromOrder} 
          onCreateOrder={handleCreateOrder}
          loading={loading}
          error={error}
        />
      </div>

      {debugInfo}
    </div>
  );
}

export default withAuth(TableOrder, 'waiter');
