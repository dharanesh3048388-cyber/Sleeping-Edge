import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent browsers from restoring a previous scroll position on a normal reload.
// App.tsx still honours explicit hash/query deep links.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
createRoot(document.getElementById('root')!).render(<App />);
