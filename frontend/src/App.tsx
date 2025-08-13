import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import Header from './components/Layout/Header';
import HomePage from './components/HomePage/HomePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<div>Browse Page - Coming Soon</div>} />
                <Route path="/categories" element={<div>Categories Page - Coming Soon</div>} />
                <Route path="/cities" element={<div>Cities Page - Coming Soon</div>} />
                <Route path="/login" element={<div>Login Page - Coming Soon</div>} />
                <Route path="/register" element={<div>Register Page - Coming Soon</div>} />
                <Route path="/dashboard" element={<div>Dashboard Page - Coming Soon</div>} />
                <Route path="/post-ad" element={<div>Post Ad Page - Coming Soon</div>} />
                <Route path="/listing/:id" element={<div>Listing Detail Page - Coming Soon</div>} />
                <Route path="/category/:slug" element={<div>Category Page - Coming Soon</div>} />
                <Route path="/city/:name" element={<div>City Page - Coming Soon</div>} />
                <Route path="*" element={<div>404 - Page Not Found</div>} />
              </Routes>
            </main>
          </div>
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: theme.fonts.primary,
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
