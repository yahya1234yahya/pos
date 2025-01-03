'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const WaiterNavigation = () => {
    const pathname = usePathname();
    const isActive = (path) => {
        if (path === '') {
            return pathname === '/waiter';
        }
        return pathname.startsWith(`/waiter/${path}`);
    };
    
    const navItems = [
        { name: 'New Order', path: '' },
        { name: 'All Orders', path: 'orders' },
    ];
    

    return (
        <nav className="bg-white shadow-lg h-20">
            <div className="w-full mx-auto px-4 h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex flex-row items-center space-x-8">
                        <span className="text-2xl font-bold text-gray-900">Cool Down</span>
                        <div className="flex space-x-4">
                            {navItems.map((item) => (
                                <Link key={item.path} href={`/waiter/${item.path}`}>
                                    <div
                                        className={`px-6 py-3 text-lg rounded-lg transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-primary text-white hover:bg-primary/90'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {item.name}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span id="admin-name" className="text-xl text-gray-600">
                            Admin
                        </span>
                        <Link href="/logout" className="bg-red-500 text-white px-6 py-4 rounded-md hover:bg-red-600 text-lg">
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default WaiterNavigation;
