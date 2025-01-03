'use client';
import Link from 'next/link';
import { withAuth } from '@/middleware/authMiddleware';
import Floor from '@/components/kitchen/floor';

function NewOrder() {
  const handleTableSelect = (table) => {
    window.location.href = `/waiter/new-order/table/${table.id}`;
  };

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

      <div className="max-w-5xl mx-auto py-8">
        <Floor onTableSelect={handleTableSelect} />
      </div>
    </div>
  );
}

export default withAuth(NewOrder, 'waiter');
