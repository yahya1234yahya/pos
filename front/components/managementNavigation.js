'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const ManagementNavigation = () => {
    const pathname = usePathname();
    const router = useRouter();
    const isActive = (path) => {
        if (path === '') {
            return pathname === '/management';
        }
        return pathname.startsWith(`/management/${path}`);
    };
    
    const navItems = [
        { name: 'Overview', path: '' },
        { name: 'Staff', path: 'staff' },
        { name: 'Menu', path: 'menu' },
        { name: 'Reports', path: 'reports' },
        { name: 'Settings', path: 'settings' },
    ];

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost/pos/POS/api/logout.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Clear storage first to prevent any race conditions
            localStorage.clear();
            sessionStorage.clear();
            
            if (!response.ok) {
                throw new Error('Logout failed');
            }

            // Force reload to clear any cached state
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            // Force reload even on error
            window.location.href = '/';
        }
    };

    return (
        <nav className="bg-white shadow-lg h-20">
            <div className="w-full mx-auto px-4 h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex flex-row items-center space-x-8">
                        <span className="text-2xl font-bold text-gray-900">Cool Down</span>
                        <div className="flex space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={`/management${item.path ? `/${item.path}` : ''}`}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        isActive(item.path)
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default ManagementNavigation;
