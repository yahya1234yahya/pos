"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header({ title, role }) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    router.push('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 capitalize">{role}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Navigation links based on role */}
            {role === 'waiter' && (
              <>
                <Link href="/waiter" className="text-gray-600 hover:text-gray-900">Tables</Link>
                <Link href="/waiter/orders" className="text-gray-600 hover:text-gray-900">Orders</Link>
              </>
            )}
            {role === 'kitchen' && (
              <>
                <Link href="/kitchen" className="text-gray-600 hover:text-gray-900">New Orders</Link>
                <Link href="/kitchen/progress" className="text-gray-600 hover:text-gray-900">In Progress</Link>
                <Link href="/kitchen/complete" className="text-gray-600 hover:text-gray-900">Completed</Link>
              </>
            )}
            {role === 'management' && (
              <>
                <Link href="/management" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/management/menu" className="text-gray-600 hover:text-gray-900">Menu</Link>
                <Link href="/management/staff" className="text-gray-600 hover:text-gray-900">Staff</Link>
                <Link href="/management/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                <Link href="/management/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
