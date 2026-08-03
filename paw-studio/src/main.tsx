import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import '@fontsource-variable/golos-text';
import '@fontsource-variable/literata/opsz.css';
import './styles/global.css';
import { App } from './App';

/**
 * Обычная сборка живёт на сервере и использует обычные адреса. Однофайловая
 * сборка для превью раздаётся без серверной маршрутизации, поэтому там
 * адреса статей работают через hash.
 */
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
