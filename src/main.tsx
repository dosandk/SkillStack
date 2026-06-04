import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { EleksUIThemeProvider } from '@eleks-ui/theme';
import App from './App.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EleksUIThemeProvider>
      <App />
    </EleksUIThemeProvider>
  </StrictMode>
);
