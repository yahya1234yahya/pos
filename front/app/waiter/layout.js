'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WaiterLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/waiter') {
      router.replace('/waiter/orders');
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/logout.php', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.clear();
        sessionStorage.clear();
        router.replace('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b">
        <div className="px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link href="/waiter/orders" className={`text-xl font-bold ${pathname === '/waiter/orders' ? 'text-indigo-600' : 'text-gray-800'}`}>
                Cool Down
              </Link>
              <Link
                href="/waiter/new-order"
                className={`${
                  pathname.startsWith('/waiter/new-order')
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                } px-4 py-2 rounded`}
              >
                New Order
              </Link>
              <Link
                href="/waiter/orders"
                className={`${
                  pathname === '/waiter/orders'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                } px-4 py-2 rounded`}
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
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
