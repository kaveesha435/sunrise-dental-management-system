import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import './LoginPage.css';

/**
 * LoginPage — authenticates users against the Spring Boot API.
 * On success, stores the JWT and redirects to the originally requested page.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authService.login(usernameOrEmail.trim(), password);
      const authData = response.data?.data; // ApiResponse wrapper → data field
      if (!authData?.token) {
        throw new Error('Invalid response from server');
      }
      login(authData, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message
        ?? 'Invalid username/email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-card__brand">
          <div className="login-card__logo" aria-hidden="true">
            <ToothIcon />
          </div>
          <div>
            <h1 className="login-card__name">Sunrise Dental</h1>
            <p className="login-card__subtitle">Clinic Appointment &amp; Patient Management</p>
          </div>
        </div>

        {/* Form */}
        <form className="login-card__form" onSubmit={handleSubmit} noValidate>
          <div className="login-card__form-title">
            <h2 className="login-card__heading">Sign in to your account</h2>
            <p className="login-card__desc">Enter your credentials to access the system.</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="login-card__error" role="alert" id="login-error">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <Input
            id="login-username"
            type="text"
            label="Username or Email"
            placeholder="admin or admin@sunrisedental.lk"
            value={usernameOrEmail}
            onChange={(e) => { setUsernameOrEmail(e.target.value); setError(''); }}
            required
            autoComplete="username"
            leftIcon={<UserIcon />}
            error={error && !usernameOrEmail ? 'This field is required' : ''}
          />

          <div className="login-card__password-row">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              autoComplete="current-password"
              leftIcon={<LockIcon />}
              rightIcon={
                <button
                  type="button"
                  className="login-card__toggle-pw"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
              error={error && !password ? 'This field is required' : ''}
            />
          </div>

          {/* Remember me */}
          <label className="login-card__remember" htmlFor="login-remember">
            <input
              id="login-remember"
              type="checkbox"
              className="login-card__checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me for 24 hours</span>
          </label>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            id="login-submit"
          >
            Sign In
          </Button>

          <p className="login-card__hint">
            Default dev credentials: <code>admin</code> / <code>Admin@123</code>
          </p>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Icons
------------------------------------------------------- */
function ToothIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 5 4.5 5 3.5 5.5C2 6.5 2 9 3 11C4 13 4.5 14 4.5 16C4.5 18.5 5.5 22 7 22C8.5 22 9 20 9.5 18.5C10 17 10.5 16 12 16C13.5 16 14 17 14.5 18.5C15 20 15.5 22 17 22C18.5 22 19.5 18.5 19.5 16C19.5 14 20 13 21 11C22 9 22 6.5 20.5 5.5C19.5 5 18.5 5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
