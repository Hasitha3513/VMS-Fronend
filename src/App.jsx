import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/AppRoutes';
import { AuthProvider } from './app/AuthContext';
import { ThemeContextProvider, useThemeMode } from './app/ThemeContext';
import { buildTheme } from './theme/theme';
import { useMemo } from 'react';

function ThemedApp() {
  const { themePrefs } = useThemeMode();
  const theme = useMemo(() => buildTheme(themePrefs), [themePrefs]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeContextProvider>
      <ThemedApp />
    </ThemeContextProvider>
  );
}
