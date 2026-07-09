import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { EleksUIThemeProvider } from '@eleks-ui/theme';
import App from './App.tsx';
import { AuthProvider } from './features/auth/AuthProvider';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EleksUIThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </EleksUIThemeProvider>
  </StrictMode>
);
