import { useState, useEffect } from 'react';
import './SignInModal.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="#1877F2" width="20" height="20">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FandomIcon = () => (
  <svg viewBox="0 0 24 24" fill="#FF4500" width="20" height="20">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
  </svg>
);

const MagicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M15 3l-4 4-4-4M3 9l4 4-4 4M21 9l-4 4 4 4M9 21l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
);

export const SignInModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire up auth logic
    console.log('Sign in:', { email, keepSignedIn });
  };

  return (
    <div className="sim-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="sim-modal" onClick={(e) => e.stopPropagation()}>

        <div className="sim-left">
          <button className="sim-close" onClick={onClose} aria-label="Close">✕</button>

          <h2 className="sim-title">SIGN IN</h2>

          <form className="sim-form" onSubmit={handleSubmit}>
            <label className="sim-label" htmlFor="sim-email">Email Address</label>
            <input
              id="sim-email"
              type="email"
              className="sim-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label className="sim-label" htmlFor="sim-password">Password</label>
            <div className="sim-pw-wrap">
              <input
                id="sim-password"
                type={showPassword ? 'text' : 'password'}
                className="sim-input sim-input--pw"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="sim-pw-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div className="sim-row">
              <label className="sim-checkbox-label">
                <input
                  type="checkbox"
                  className="sim-checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                <span className="sim-checkbox-custom" />
                Keep me signed in
              </label>
              <a href="/forgot-password" className="sim-forgot">Forgot password?</a>
            </div>

            <button type="submit" className="sim-submit">SIGN IN</button>
          </form>

          <div className="sim-divider"><span>Or sign in with</span></div>

          <div className="sim-socials">
            <button className="sim-social-btn">
              <FacebookIcon /> Sign in with Facebook
            </button>
            <button className="sim-social-btn">
              <GoogleIcon /> Sign in with Google
            </button>
            <button className="sim-social-btn">
              <FandomIcon /> Sign in with Fandom
            </button>
            <button className="sim-social-btn sim-social-btn--magic">
              <MagicIcon /> Get magic sign in link
            </button>
          </div>
        </div>

        <div className="sim-right">
          <div className="sim-right-content">
            <h3 className="sim-right-title">ARE YOU NEW<br />TO BUNDLE FORGE?</h3>
            <p className="sim-right-desc">
              If you don't have a Bundle Forge account, use this option to access the registration form.
            </p>
            <button className="sim-create-btn">CREATE ACCOUNT</button>
          </div>
        </div>

      </div>
    </div>
  );
};
