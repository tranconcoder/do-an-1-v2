'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCart } from '@/lib/store/slices/cartSlice';

import { useEffect } from 'react';

export const Init = () => {
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [isAuthenticated]);

    return null;
};
