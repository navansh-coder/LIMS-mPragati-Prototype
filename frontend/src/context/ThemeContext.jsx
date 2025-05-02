import { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = {
    darkMode,
    toggleTheme,
    colors: {
      background: darkMode ? '#121212' : '#f5f5f5',
      text: darkMode ? '#ffffff' : '#333333',
      primary: darkMode ? '#bb86fc' : '#6200ee',
      secondary: darkMode ? '#03dac6' : '#03dac6',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);