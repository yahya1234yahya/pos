'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/pos/POS/api';

// Pages that don't require authentication
const PUBLIC_PAGES = ['/'];

export default function ClientAuthCheck({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public pages
      if (PUBLIC_PAGES.includes(pathname)) {
        setIsChecking(false);
        return;
      }

      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.replace('/');
          return;
        }

        const user = JSON.parse(userStr);
        
        // If user is a waiter and they're at the root waiter path, redirect to new order
        if (user.role === 'waiter' && pathname === '/waiter/orders') {
          router.replace('/waiter');
          return;
        }

        // Verify with server that session is still valid
        const response = await axios.get(`${API_BASE_URL}/auth.php`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.data.success) {
          localStorage.clear();
          sessionStorage.clear();
          router.replace('/');
          return;
        }

        // Update local storage with latest user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        sessionStorage.clear();
        router.replace('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show nothing while checking auth status
  if (isChecking && !PUBLIC_PAGES.includes(pathname)) {
    return null;
  }

  return children;
}
