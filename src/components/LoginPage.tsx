import { useState } from 'react';
import { BASE_URL } from '../hooks/useLibrary';
import {
  hasPasskey,
  isWebAuthnSupported,
  registerPasskey,
  authenticateWithPasskey,
} from '../hooks/useWebAuthn';
import './LoginPage.css';

interface LoginPageProps {
  onAuthenticated: () => void;
}

type LoginStep = 'idle' | 'loading' | 'registering' | 'error';

const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [step, setStep]         = useState<LoginStep>('idle');
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const webAuthnOk   = isWebAuthnSupported();
  const passkeyReady = webAuthnOk && hasPasskey();

  // ── Fingerprint login ──────────────────────────────────────────────────
  const handleFingerprintLogin = async () => {
    setError('');
    setStep('loading');
    try {
      const verified = await authenticateWithPasskey();
      if (verified) {
        // Re-use the token saved from the previous password login
        const savedToken = localStorage.getItem('webauthn_saved_token');
        if (!savedToken) {
          setError('Saved credentials not found. Please log in with password once.');
          setStep('error');
          return;
        }
        sessionStorage.setItem('web_access_granted', 'true');
        sessionStorage.setItem('web_access_token', savedToken);
        onAuthenticated();
      } else {
        setError('Fingerprint verification failed. Try again or use password.');
        setStep('error');
      }
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') {
        setError('Fingerprint cancelled or timed out.');
      } else {
        setError(e?.message || 'Biometric authentication failed.');
      }
      setStep('error');
    }
  };

  // ── Password login ─────────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('loading');
    try {
      const token = btoa(`${username}:${password}`);
      const res = await fetch(`${BASE_URL}/api/books`, {
        method: 'GET',
        headers: { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        sessionStorage.setItem('web_access_granted', 'true');
        sessionStorage.setItem('web_access_token', token);
        // Persist token so fingerprint login can reuse it
        localStorage.setItem('webauthn_saved_token', token);

        // Offer passkey registration if supported and not yet registered
        if (webAuthnOk && !hasPasskey()) {
          setStep('registering');
          setShowRegisterPrompt(true);
        } else {
          onAuthenticated();
        }
      } else {
        setError('Invalid username or password. Access Denied.');
        setStep('error');
        setPassword('');
      }
    } catch {
      setError('Network error. Could not reach the server.');
      setStep('error');
    }
  };

  // ── Register passkey after password login ──────────────────────────────
  const handleRegisterPasskey = async () => {
    try {
      await registerPasskey();
      onAuthenticated();
    } catch (e: any) {
      // User declined or browser blocked – just continue without passkey
      onAuthenticated();
    }
  };

  // ── Register prompt UI ─────────────────────────────────────────────────
  if (showRegisterPrompt) {
    return (
      <div className="login-bg">
        <div className="login-card glass">
          <div className="login-logo">
            <img src="/assets/logo_libon_m.png" alt="LibOn-M" className="logo-img" />
          </div>
          <h2 className="login-title">Enable Fingerprint?</h2>
          <p className="login-subtitle">
            Register your fingerprint / device PIN so you can skip the password next time.
          </p>
          <div className="fingerprint-icon-wrap animate-pulse">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="fp-svg">
              <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8Z" stroke="url(#g1)" strokeWidth="2"/>
              <path d="M32 18c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14-6.3-14-14-14Z" stroke="url(#g1)" strokeWidth="1.5"/>
              <path d="M32 28c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z" fill="url(#g1)"/>
              <path d="M24 32c0-4.4 3.6-8 8-8M40 32c0 4.4-3.6 8-8 8M20 32c0-6.6 5.4-12 12-12M44 32c0 6.6-5.4 12-12 12" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="g1" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8"/>
                  <stop offset="1" stopColor="#38bdf8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="register-actions">
            <button className="btn-fingerprint-register" onClick={handleRegisterPasskey}>
              ✦ Enable Fingerprint Login
            </button>
            <button className="btn-skip" onClick={onAuthenticated}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main login UI ──────────────────────────────────────────────────────
  return (
    <div className="login-bg">
      <div className="login-card glass">
        {/* Logo */}
        <div className="login-logo">
          <img src="/assets/logo_libon_m.png" alt="LibOn-M" className="logo-img" />
        </div>

        <h2 className="login-title">LibOn-M Entrance</h2>
        <p className="login-subtitle">Library Inventory Management System</p>

        {/* Error */}
        {error && <div className="login-error">{error}</div>}

        {/* ── Fingerprint button (if registered) ── */}
        {passkeyReady && (
          <div className="fingerprint-section">
            <button
              className={`btn-fingerprint ${step === 'loading' ? 'loading' : ''}`}
              onClick={handleFingerprintLogin}
              disabled={step === 'loading'}
              type="button"
            >
              <span className="fp-icon-wrap">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="fp-svg">
                  <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M32 18c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14-6.3-14-14-14Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M32 28c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z" fill="currentColor"/>
                  <path d="M24 32c0-4.4 3.6-8 8-8M40 32c0 4.4-3.6 8-8 8M20 32c0-6.6 5.4-12 12-12M44 32c0 6.6-5.4 12-12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <span>{step === 'loading' ? 'Verifying…' : 'Sign in with Fingerprint'}</span>
            </button>

            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">or use password</span>
              <span className="divider-line" />
            </div>
          </div>
        )}

        {/* ── Password form ── */}
        <form onSubmit={handlePasswordLogin} className="login-form">
          <div className="field-group">
            <label className="field-label">Admin Username</label>
            <input
              type="text"
              className="field-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={step === 'loading'}
          >
            {step === 'loading' ? (
              <span className="spinner" />
            ) : (
              '🔓 Unlock Web System'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
