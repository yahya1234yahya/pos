'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const KitchenNavigation = () => {
    const [userName, setUserName] = useState('');
    const pathname = usePathname();
    const router = useRouter();
    
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.name || 'Kitchen Staff');
    }, []);

    const isActive = (path) => {
        if (path === '') {
            return pathname === '/kitchen';
        }
        return pathname.startsWith(`/kitchen/${path}`);
    };
    
    const navItems = [
        { name: 'All Orders', path: '' },
        { name: 'In Progress', path: 'progress' },
        { name: 'Completed', path: 'complete' },
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
                                <Link key={item.path} href={`/kitchen/${item.path}`}>
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
                        <span className="text-xl text-gray-600">
                            {userName}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default KitchenNavigation;
