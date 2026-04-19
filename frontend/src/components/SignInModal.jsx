import { useState, useEffect } from 'react';
import './SignInModal.css';

/* ── Icons ── */
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

const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
    <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Reusable checkbox ── */
const Checkbox = ({ id, checked, onChange, label }) => (
  <label className="sim-checkbox-label" htmlFor={id}>
    <input id={id} type="checkbox" className="sim-checkbox" checked={checked} onChange={onChange} />
    <span className="sim-checkbox-custom" />
    {label}
  </label>
);

/* ── Sign-In form ── */
const SignInContent = ({ onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  return (
    <>
      <h2 className="sim-title">SIGN IN</h2>
      <form className="sim-form" onSubmit={e => e.preventDefault()}>
        <label className="sim-label" htmlFor="si-email">Email Address</label>
        <input id="si-email" type="email" className="sim-input" value={email}
          onChange={e => setEmail(e.target.value)} autoComplete="email" required />

        <label className="sim-label" htmlFor="si-password">Password</label>
        <div className="sim-pw-wrap">
          <input id="si-password" type={showPassword ? 'text' : 'password'}
            className="sim-input sim-input--pw" value={password}
            onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          <button type="button" className="sim-pw-toggle" onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <div className="sim-row">
          <Checkbox id="si-keep" checked={keepSignedIn}
            onChange={e => setKeepSignedIn(e.target.checked)} label="Keep me signed in" />
          {/* Forgot password — switches mode instead of navigating */}
          <button type="button" className="sim-forgot" onClick={onForgot}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className="sim-submit">SIGN IN</button>
      </form>

      <div className="sim-divider"><span>Or sign in with</span></div>
      <div className="sim-socials">
        <button className="sim-social-btn"><FacebookIcon /> Sign in with Facebook</button>
        <button className="sim-social-btn"><GoogleIcon /> Sign in with Google</button>
      </div>
    </>
  );
};

/* ── Register form ── */
const RegisterContent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [emailPref, setEmailPref] = useState('');

  return (
    <>
      <h2 className="sim-title">CREATE ACCOUNT</h2>

      <form className="sim-form" onSubmit={e => e.preventDefault()}>
        <label className="sim-label" htmlFor="reg-email">Email Address</label>
        <input id="reg-email" type="email" className="sim-input" value={email}
          onChange={e => setEmail(e.target.value)} autoComplete="email" required />

        <label className="sim-label" htmlFor="reg-password">Password</label>
        <div className="sim-pw-wrap">
          <input id="reg-password" type={showPassword ? 'text' : 'password'}
            className="sim-input sim-input--pw" value={password}
            onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
          <button type="button" className="sim-pw-toggle" onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <div className="sim-row sim-row--solo">
          <Checkbox id="reg-keep" checked={keepSignedIn}
            onChange={e => setKeepSignedIn(e.target.checked)} label="Keep me signed in" />
        </div>

        <button type="submit" className="sim-submit">REGISTER</button>
      </form>

      <div className="sim-divider"><span>Or register with</span></div>
      <div className="sim-socials sim-socials--reg">
        <button className="sim-social-btn"><FacebookIcon /> Register with Facebook</button>
        <button className="sim-social-btn"><GoogleIcon /> Sign in with Google</button>
      </div>

      <p className="sim-terms">
        By creating an account you agree to our{' '}
        <a href="/terms">Terms of service</a> and <a href="/privacy">Privacy policy</a>.
      </p>
    </>
  );
};

/* ── Reset Password form ── */
const ResetContent = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call reset password API
    setSubmitted(true);
  };

  return (
    <>
      <button type="button" className="sim-back-btn" onClick={onBack}>
        <BackArrowIcon /> Back to Sign In
      </button>

      <h2 className="sim-title">RESET PASSWORD</h2>

      {submitted ? (
        <div className="sim-reset-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" width="40" height="40">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="sim-reset-success__title">Check your inbox</p>
          <p className="sim-reset-success__desc">
            We've sent a password reset link to <strong>{email}</strong>.
            If you don't see it, check your spam folder.
          </p>
          <button type="button" className="sim-submit" onClick={onBack}>
            BACK TO SIGN IN
          </button>
        </div>
      ) : (
        <form className="sim-form" onSubmit={handleSubmit}>
          <label className="sim-label" htmlFor="rp-email">Email Address</label>
          <input id="rp-email" type="email" className="sim-input" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="email" required />

          <button type="submit" className="sim-submit sim-submit--reset">
            RESET PASSWORD
          </button>
        </form>
      )}
    </>
  );
};

/* ── Right-panel config per mode ── */
const RIGHT_PANEL = {
  signin: {
    cls: 'sim-right--signin',
    title: <>ARE YOU NEW<br />TO BUNDLE FORGE?</>,
    desc: "If you don't have a Bundle Forge account, use this option to access the registration form.",
    cta: 'CREATE ACCOUNT',
    next: 'register',
  },
  register: {
    cls: 'sim-right--register',
    title: <>ALREADY HAVE<br />AN ACCOUNT?</>,
    desc: 'If you already have a Bundle Forge account, use this option to access the sign in form.',
    cta: 'SIGN IN',
    next: 'signin',
  },
  reset: {
    cls: 'sim-right--reset',
    title: <>REMEMBER YOUR<br />PASSWORD?</>,
    desc: 'Head back to the sign in form and access your Bundle Forge account.',
    cta: 'SIGN IN',
    next: 'signin',
  },
};

/* ── Modal shell ── */
export const SignInModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'register' | 'reset'

  useEffect(() => { if (isOpen) setMode('signin'); }, [isOpen]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const panel = RIGHT_PANEL[mode];

  return (
    <div className="sim-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sim-modal" onClick={e => e.stopPropagation()}>

        {/* Left panel */}
        <div className="sim-left">
          <button className="sim-close" onClick={onClose} aria-label="Close">✕</button>
          <div className="sim-left-inner">
            {mode === 'signin'    && <SignInContent  onForgot={() => setMode('reset')} />}
            {mode === 'register'  && <RegisterContent />}
            {mode === 'reset'     && <ResetContent   onBack={() => setMode('signin')} />}
          </div>
        </div>

        {/* Right panel */}
        <div className={`sim-right ${panel.cls}`}>
          <div className="sim-right-content">
            <h3 className="sim-right-title">{panel.title}</h3>
            <p className="sim-right-desc">{panel.desc}</p>
            <button className="sim-create-btn" onClick={() => setMode(panel.next)}>
              {panel.cta}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};