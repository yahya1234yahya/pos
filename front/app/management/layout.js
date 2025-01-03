'use client';
import { useState, useEffect } from 'react';
import { withAuth } from '@/middleware/authMiddleware';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/pos/POS/api';

const ManagementLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || user.username || '');
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/logout.php`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        localStorage.clear();
        sessionStorage.clear();
        router.replace('/');
      } else {
        console.error('Logout failed:', response.data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/management" className="text-xl font-bold">
                  Cool Down
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/management"
                  className={`${
                    pathname === '/management'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Overview
                </Link>
                <Link
                  href="/management/staff"
                  className={`${
                    pathname === '/management/staff'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Staff
                </Link>
                <Link
                  href="/management/menu"
                  className={`${
                    pathname === '/management/menu'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Menu
                </Link>
                <Link
                  href="/management/reports"
                  className={`${
                    pathname === '/management/reports'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Reports
                </Link>
                <Link
                  href="/management/settings"
                  className={`${
                    pathname === '/management/settings'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="ml-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default withAuth(ManagementLayout);
