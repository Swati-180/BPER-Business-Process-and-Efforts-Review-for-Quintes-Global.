<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { ErrorProvider } from './errors/ErrorProvider.tsx'
=======
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient();
>>>>>>> target/main

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
<<<<<<< HEAD
      <ErrorProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorProvider>
    </BrowserRouter>
  </StrictMode>,
)
=======
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" />
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
>>>>>>> target/main
