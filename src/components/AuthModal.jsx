import { useState, useRef, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { IconClose, IconCheck, IconPlay } from './Icons.jsx';
import { useBodyLock, useFocusTrap } from '../hooks/index.js';
import './Modal.css';
import './AuthModal.css';

const EASE = [0.22, 1, 0.36, 1];
const FEATURES = ['Stream in 4K HDR', 'Download & watch offline', 'Cancel anytime, no fees'];

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 4.24A9.9 9.9 0 0 1 12 4c7 0 11 7 11 7a17.9 17.9 0 0 1-2.24 3.14M6.5 6.6C3.5 8.4 1 12 1 12s4 7 11 7c1.5 0 2.9-.32 4.15-.86M1 1l22 22" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.87-3.04.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="14" height="16" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true">
      <path d="M13.1 9.5c0-2.14 1.75-3.16 1.83-3.21-1-1.46-2.56-1.66-3.11-1.68-1.32-.13-2.58.78-3.25.78-.67 0-1.7-.76-2.8-.74A4.15 4.15 0 0 0 2.24 6.8C.63 9.59 1.83 13.7 3.38 15.97c.76 1.11 1.66 2.36 2.85 2.32 1.14-.05 1.57-.74 2.95-.74 1.37 0 1.76.74 2.96.71 1.22-.02 2-1.12 2.75-2.24a9.9 9.9 0 0 0 1.25-2.57c-.03-.01-2.39-.92-2.41-3.65-.02-2.28 1.87-3.37 1.95-3.42-.06 0 0 0 0 0z" />
      <path d="M11.5 3c.6-.72 1-1.72.9-2.72-.87.04-1.93.58-2.55 1.3-.55.63-1.04 1.66-.91 2.63.94.07 1.9-.48 2.56-1.21z" />
    </svg>
  );
}

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
const STRENGTH_LABEL = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

function FieldInput({ id, label, type, value, onChange, error, autoComplete, delay = 0, onEnter, endAdornment }) {
  return (
    <motion.div
      className={`af-field ${error ? 'has-error' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: EASE, delay }}
    >
      <input
        id={id}
        name={id}
        className="af-input"
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
      />
      <label htmlFor={id} className="af-label">{label}</label>
      {endAdornment}
      <AnimatePresence initial={false}>
        {error && (
          <motion.span
            id={`${id}-err`}
            className="af-error"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AuthModal({ onClose, onDone }) {
  const [mode, setMode] = useState('in'); // 'in' | 'up'
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | busy | success
  const [shake, setShake] = useState(false);
  const panelRef = useRef(null);
  const uid = useId();
  const reduceMotion = useReducedMotion();

  const busy = status !== 'idle';

  useBodyLock(true);
  useFocusTrap(true, panelRef, busy ? () => {} : onClose);

  const set = (k) => (e) => {
    const val = e.target.value;
    setValues((v) => ({ ...v, [k]: val }));
    setErrors((errs) => (errs[k] ? { ...errs, [k]: undefined } : errs));
  };

  const switchMode = (next) => {
    if (next === mode || busy) return;
    setErrors({});
    setMode(next);
  };

  const submit = () => {
    if (busy) return;
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Enter a valid email address.';
    if (values.password.length < 6) next.password = 'Use at least 6 characters.';
    if (mode === 'up' && values.name.trim().length < 2) next.name = 'Tell us what to call you.';
    setErrors(next);

    if (Object.keys(next).length) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setStatus('busy');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onDone(mode === 'up' ? 'Account created — welcome to CineFind' : 'Signed in');
      }, 650);
    }, 900);
  };

  const strength = getStrength(values.password);
  const spring = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 28 };

  return (
    <div className="modal-root" role="presentation">
      <div className="modal-backdrop" onClick={busy ? undefined : onClose} aria-hidden="true" />

      <motion.div
        className="af-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-heading"
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26 }}
      >
        <div className="af-grid">
          {/* ---------- Visual side ---------- */}
          <div className="af-visual">
            <span className="af-blob af-blob-a" aria-hidden="true" />
            <span className="af-blob af-blob-b" aria-hidden="true" />
            <span className="af-grain" aria-hidden="true" />

            <div className="af-visual-content">
              <p className="af-brand">
                <span className="af-brand-mark">
                  <IconPlay size={13} />
                </span>
                Cine<span>Find</span>
              </p>

              <div>
                <h3 className="af-tagline">
                  Every story,
                  <br />
                  one sign-in away.
                </h3>
                <ul className="af-features">
                  {FEATURES.map((f, i) => (
                    <li key={f} className="af-feature" style={{ '--i': i }}>
                      <span className="af-feature-icon">
                        <IconCheck size={12} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ---------- Form side ---------- */}
          <div className="af-form-side">
            <div className="af-switcher" role="tablist" aria-label="Choose sign in or sign up">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'in'}
                className={mode === 'in' ? 'is-active' : ''}
                onClick={() => switchMode('in')}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'up'}
                className={mode === 'up' ? 'is-active' : ''}
                onClick={() => switchMode('up')}
              >
                Sign up
              </button>
              <motion.span
                className="af-switcher-pill"
                aria-hidden="true"
                animate={{ x: mode === 'up' ? '100%' : '0%' }}
                transition={spring}
              />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.26, ease: EASE }}
              >
                <h2 className="af-heading" id="auth-heading">
                  {mode === 'in' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="af-sub">
                  {mode === 'in'
                    ? 'Pick up where you left off across every device.'
                    : 'Build your list, track what you watch, get better picks.'}
                </p>

                <div className={`af-form ${shake ? 'af-shake' : ''}`}>
                  <AnimatePresence initial={false}>
                    {mode === 'up' && (
                      <FieldInput
                        key="name"
                        id={`${uid}-name`}
                        label="Name"
                        type="text"
                        value={values.name}
                        onChange={set('name')}
                        error={errors.name}
                        autoComplete="name"
                        onEnter={submit}
                      />
                    )}
                  </AnimatePresence>

                  <FieldInput
                    id={`${uid}-email`}
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={set('email')}
                    error={errors.email}
                    autoComplete="email"
                    delay={mode === 'up' ? 0.05 : 0}
                    onEnter={submit}
                  />

                  <FieldInput
                    id={`${uid}-password`}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={set('password')}
                    error={errors.password}
                    autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                    delay={mode === 'up' ? 0.1 : 0.05}
                    onEnter={submit}
                    endAdornment={
                      <button
                        type="button"
                        className="af-eye"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    }
                  />

                  {mode === 'up' && values.password && (
                    <div className="af-strength">
                      <div className="af-strength-track">
                        <motion.div
                          className="af-strength-fill"
                          data-level={strength}
                          initial={false}
                          animate={{ width: `${(strength / 4) * 100}%` }}
                          transition={{ duration: 0.32, ease: EASE }}
                        />
                      </div>
                      <span className="af-strength-label">{STRENGTH_LABEL[strength]}</span>
                    </div>
                  )}

                  {mode === 'in' && (
                    <div className="af-row-between">
                      <label className="af-checkbox">
                        <input type="checkbox" /> Remember me
                      </label>
                      <button type="button" className="af-link-small">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`af-submit ${status === 'success' ? 'is-success' : ''}`}
                    onClick={submit}
                    disabled={busy}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {status === 'success' ? (
                        <motion.span
                          key="ok"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={spring}
                          style={{ display: 'inline-flex' }}
                        >
                          <IconCheck size={20} />
                        </motion.span>
                      ) : status === 'busy' ? (
                        <motion.span
                          key="spin"
                          className="af-spinner"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      ) : (
                        <motion.span
                          key="txt"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {mode === 'in' ? 'Sign in' : 'Create account'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

                <div className="af-divider">
                  <span>or continue with</span>
                </div>
                <div className="af-social">
                  <button type="button">
                    <GoogleGlyph /> Google
                  </button>
                  <button type="button">
                    <AppleGlyph /> Apple
                  </button>
                </div>

                <p className="af-switch-line">
                  {mode === 'in' ? 'New to CineFind?' : 'Already have an account?'}{' '}
                  <button type="button" className="link" onClick={() => switchMode(mode === 'in' ? 'up' : 'in')}>
                    {mode === 'in' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>

            <p className="af-note">Demo interface — no credentials are sent anywhere.</p>
          </div>
        </div>

        <button type="button" className="modal-close" onClick={onClose} aria-label="Close" disabled={busy}>
          <IconClose />
        </button>
      </motion.div>
    </div>
  );
}