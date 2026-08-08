import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('crm-theme');
        if (saved === 'light' || saved === 'dark') return saved;
        // Respect system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem('crm-theme', t);
    };

    useEffect(() => {
        // We no longer apply 'dark' to document.documentElement here.
        // Instead, AdminLayout applies it to its own root div to prevent it from affecting the public website.
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
