'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/pos/POS/api';

export function withAuth(WrappedComponent, requiredRole) {
    return function AuthComponent(props) {
        const router = useRouter();
        const [isAuthorized, setIsAuthorized] = useState(false);

        useEffect(() => {
            const checkAuth = async () => {
                try {
                    // First check if we have a user in localStorage
                    const userStr = localStorage.getItem('user');
                    if (!userStr) {
                        router.replace('/');
                        return;
                    }

                    const user = JSON.parse(userStr);
                    
                    // Verify the role if required
                    if (requiredRole) {
                        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                        if (!allowedRoles.includes(user.role.toLowerCase())) {
                            router.replace('/');
                            return;
                        }
                    }

                    // Verify with the server that the session is still valid
                    const response = await axios.get(`${API_BASE_URL}/auth.php`, {
                        withCredentials: true
                    });

                    if (!response.data.success) {
                        localStorage.clear();
                        sessionStorage.clear();
                        router.replace('/');
                        return;
                    }

                    // Update local storage with latest user data from server
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    setIsAuthorized(true);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.clear();
                    sessionStorage.clear();
                    router.replace('/');
                }
            };

            checkAuth();

            // Set up an interval to periodically check auth status
            const interval = setInterval(checkAuth, 60000); // Check every minute

            return () => clearInterval(interval);
        }, [router, requiredRole]);

        // Show nothing while checking authorization
        if (!isAuthorized) {
            return null;
        }

        // Render the protected component if authorized
        return <WrappedComponent {...props} />;
    };
}
