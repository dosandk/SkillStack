import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { EleksUIThemeProvider } from '@eleks-ui/theme';
import { AuthProvider } from './context/AuthContext';
import App from './App.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EleksUIThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </EleksUIThemeProvider>
  </StrictMode>
);
