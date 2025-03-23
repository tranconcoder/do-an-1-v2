import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on page load
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Set the auth header for all future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('Failed to parse stored user info', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // In a real application, you'd call your API here
        // const response = await axios.post('/api/auth/login', { email, password });
        // const { token, user } = response.data;

        // For demo purposes, using mock data:
        if (email === 'admin@example.com' && password === 'password') {
            const mockUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin'
            };
            const mockToken = 'mock-jwt-token';

            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('token', mockToken);

            // Set the auth header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

            setUser(mockUser);
            return mockUser;
        } else {
            throw new Error('Invalid credentials');
        }
    };

    const logout = () => {
        // Remove user from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // Clear the auth header
        delete axios.defaults.headers.common['Authorization'];

        setUser(null);
    };

    const forgotPassword = async (email) => {
        // In a real application, you'd call your API here
        // await axios.post('/api/auth/forgot-password', { email });

        // For demo purposes
        console.log(`Password reset email sent to ${email}`);
        // Simulate API delay
        return new Promise((resolve) => setTimeout(resolve, 1000));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                forgotPassword,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
