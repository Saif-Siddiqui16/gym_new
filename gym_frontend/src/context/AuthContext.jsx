import React, { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser } from '../api/auth/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('userData');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [role, setRole] = useState(() => localStorage.getItem('userRole'));
    const [loading, setLoading] = useState(false);

    const login = (userData) => {
        setUser(userData);
        setRole(userData.role);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userData', JSON.stringify(userData));
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout API failed:', error);
        } finally {
            // Always clear local state even if API fails
            setUser(null);
            setRole(null);
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            setLoading(false);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login, logout }}>
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
