import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSecurityGuardian } from './utils/securityGuardian';

// Initialize client-side anti-inspect and anti-tamper security guardian
initSecurityGuardian();

createRoot(document.getElementById('root')!).render(<App />);
