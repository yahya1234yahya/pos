'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/middleware/authMiddleware';

function Waiter() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/waiter/orders');
  }, [router]);

  return null;
}

export default withAuth(Waiter, 'waiter');
