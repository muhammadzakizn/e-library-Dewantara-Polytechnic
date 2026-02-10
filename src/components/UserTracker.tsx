'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackViewAction } from '@/app/actions';

export default function UserTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Track view on mount and path change
        trackViewAction(pathname);
    }, [pathname]);

    return null;
}
