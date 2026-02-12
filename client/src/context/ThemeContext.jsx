import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Custom hook to use theme context
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

/**
 * Theme Provider Component
 */
export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage or system preference
        const saved = localStorage.getItem('theme');
        if (saved) {
            return saved === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Apply theme class to html element
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    /**
     * Toggle theme
     */
    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    /**
     * Set specific theme
     */
    const setTheme = (theme) => {
        setIsDark(theme === 'dark');
    };

    const value = {
        isDark,
        toggleTheme,
        setTheme,
        theme: isDark ? 'dark' : 'light',
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
