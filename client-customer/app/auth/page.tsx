'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'signup') {
            router.replace('/auth/register');
        } else {
            router.replace('/auth/login'); // Default to login
        }
    }, [router, searchParams]);

    // Render null or a loading indicator while redirecting.
    // A loading.tsx file in this directory will be used by Next.js if present.
    return null;
}
