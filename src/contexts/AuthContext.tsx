import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as authService from '../service/authService';
import { User } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    updateUser: (updatedUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on initial load
        try {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');
            if (token && userData) {
                setIsAuthenticated(true);
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            localStorage.clear(); // Clear corrupted data
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const { token, user: loggedInUser } = await authService.login(email, password);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(loggedInUser));
        setIsAuthenticated(true);
        setUser(loggedInUser);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
        // Navigate to login page, handled by ProtectedRoute
    };

    const updateUser = (updatedUserData: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUserData };
            setUser(newUser);
            localStorage.setItem('userData', JSON.stringify(newUser));
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};