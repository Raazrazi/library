import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { PasswordManagement } from './components/PasswordManagement.tsx';
import './index.css';

// 🔑 Change this random path string to whatever secret key phrase you prefer!
export const SECRET_SECURITY_PATH = "admin-secure-gate-v1-983472190847321";
const BACKEND_URL = 'https://library-backend1.onrender.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Standard route to access the general application dashboard */}
        <Route path="/" element={<App />} />

        {/* 🕵️‍♂️ Standalone backdoor route for modifying credentials */}
        <Route 
          path={`/${SECRET_SECURITY_PATH}`} 
          element={
            <div style={{ background: '#0f172a', height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PasswordManagement 
                backendUrl={BACKEND_URL} 
                onClose={() => window.location.href = '/'} 
              />
            </div>
          } 
        />

        {/* Catch-all safety route: Redirects any typos back to home dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);