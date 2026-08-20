import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './LoginPage.css';

/**
 * LoginPage — application entry point for authentication.
 * Authentication logic will be implemented in a future commit.
 * Currently navigates directly to dashboard on submit.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Authentication will be implemented in a future commit.
    // For now, navigate to dashboard directly.
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 500);
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
            <p className="login-card__subtitle">Clinic Appointment & Patient Management</p>
          </div>
        </div>

        {/* Form */}
        <form className="login-card__form" onSubmit={handleSubmit} noValidate>
          <div className="login-card__form-title">
            <h2 className="login-card__heading">Sign in to your account</h2>
            <p className="login-card__desc">Enter your credentials to access the system.</p>
          </div>

          <Input
            id="login-email"
            type="email"
            label="Email address"
            placeholder="admin@sunrisedental.lk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            leftIcon={<EmailIcon />}
          />

          <Input
            id="login-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            leftIcon={<LockIcon />}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            id="login-submit"
          >
            Sign In
          </Button>

          <p className="login-card__note">
            Authentication is being set up. Contact your system administrator for access.
          </p>
        </form>
      </div>
    </div>
  );
}

function ToothIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 5 4.5 5 3.5 5.5C2 6.5 2 9 3 11C4 13 4.5 14 4.5 16C4.5 18.5 5.5 22 7 22C8.5 22 9 20 9.5 18.5C10 17 10.5 16 12 16C13.5 16 14 17 14.5 18.5C15 20 15.5 22 17 22C18.5 22 19.5 18.5 19.5 16C19.5 14 20 13 21 11C22 9 22 6.5 20.5 5.5C19.5 5 18.5 5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
