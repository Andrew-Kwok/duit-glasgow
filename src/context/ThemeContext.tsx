import React, {createContext, ReactNode, useEffect, useState} from 'react';

interface ThemeContextType {
    theme: string;
    changeTheme: (theme: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    changeTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<string>('light');
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        const localTheme = localStorage.getItem('theme') || 'light';
        setTheme(localTheme);
        setIsMounted(true);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const changeTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    if (!isMounted) {
        return <h1>Loading...</h1>;
    }

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
