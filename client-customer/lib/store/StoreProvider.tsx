'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { store, AppDispatch, RootState } from './store' // Assuming store.ts is in the same directory
import { loadUserFromStorage } from './slices/userSlice'

interface StoreProviderProps {
  children: React.ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<typeof store | null>(null)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = store;
    // Attempt to load user from localStorage
    // This is a basic example; consider moving to a useEffect in a top-level client component
    // or using a library for persistent state if more complex logic is needed.
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const storedShop = localStorage.getItem('shop');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (storedUser && accessToken && refreshToken) {
          const user = JSON.parse(storedUser);
          const shop = storedShop ? JSON.parse(storedShop) : null;
          storeRef.current.dispatch(loadUserFromStorage({
            user,
            shop,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }));
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
        // Optionally dispatch a logout or error action
      }
    }
  }

  return <Provider store={storeRef.current}>{children}</Provider>
} 