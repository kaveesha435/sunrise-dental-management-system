import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { getInitials, titleCase } from '../../utils/formatters';
import './Topbar.css';

/**
 * Map of route paths to human-readable page titles.
 * Used to render the active page title in the top bar.
 */
const PAGE_TITLES = {
  '/dashboard':         'Dashboard',
  '/patients':          'Patients',
  '/patients/new':      'New Patient',
  '/appointments':      'Appointments',
  '/appointments/new':  'New Appointment',
  '/dentists':          'Dentists',
  '/treatments':        'Treatments',
  '/billing':           'Billing',
  '/billing/receipt':   'Billing Receipt',
  '/reports':           'Reports',
  '/help':              'Help & Support',
};

/**
 * Topbar — horizontal header bar displayed above all authenticated page content.
 * Shows the current page title on the left and a user menu with logout on the right.
 */
export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Sunrise Dental';

  const displayName = user
    ? `${user.username}`
    : 'User';
  const displayRole = user
    ? titleCase(user.role?.replace('_', ' ') ?? 'User')
    : '';
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    setMenuOpen(false);
    await authService.logout();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar" role="banner">
      <div className="topbar__left">
        <h1 className="topbar__page-title">{pageTitle}</h1>
      </div>

      <div className="topbar__right">
        {/* User menu */}
        <div className="topbar__user-wrapper" ref={menuRef}>
          <button
            type="button"
            className="topbar__user"
            aria-label="Open user menu"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            id="user-menu-button"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className="topbar__user-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="topbar__user-info">
              <span className="topbar__user-name">{displayName}</span>
              <span className="topbar__user-role">{displayRole}</span>
            </div>
            <ChevronIcon />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              {/* Overlay to close menu */}
              <div
                className="topbar__menu-overlay"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                className="topbar__dropdown"
                role="menu"
                aria-labelledby="user-menu-button"
              >
                <div className="topbar__dropdown-header">
                  <span className="topbar__dropdown-name">{displayName}</span>
                  <span className="topbar__dropdown-email">{user?.email}</span>
                </div>
                <div className="topbar__dropdown-divider" />
                <button
                  type="button"
                  className="topbar__dropdown-item topbar__dropdown-item--danger"
                  role="menuitem"
                  id="logout-button"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------
   Icons
------------------------------------------------------- */
function ChevronIcon() {
  return (
    <svg className="topbar__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
