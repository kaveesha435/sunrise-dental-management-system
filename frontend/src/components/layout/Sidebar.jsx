import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard',    icon: DashboardIcon },
  { label: 'Patients',      path: '/patients',     icon: PatientsIcon },
  { label: 'Appointments',  path: '/appointments', icon: AppointmentsIcon },
  { label: 'Dentists',      path: '/dentists',     icon: DentistsIcon },
  { label: 'Treatments',    path: '/treatments',   icon: TreatmentsIcon },
  { label: 'Billing',       path: '/billing',      icon: BillingIcon },
  { label: 'Reports',       path: '/reports',      icon: ReportsIcon },
];

const BOTTOM_ITEMS = [
  { label: 'Help',          path: '/help',         icon: HelpIcon },
];

/**
 * Sidebar — fixed dark navigation panel.
 * Uses NavLink for automatic active state management.
 */
export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logout handler — will be implemented in auth commit
    navigate('/login');
  };

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-logo" aria-hidden="true">
          <ToothIcon />
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">Sunrise Dental</span>
          <span className="sidebar__brand-subtitle">Management System</span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list" role="list">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
                }
              >
                <Icon className="sidebar__nav-icon" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom items */}
      <div className="sidebar__bottom">
        {BOTTOM_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
            }
          >
            <Icon className="sidebar__nav-icon" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          className="sidebar__nav-item sidebar__nav-item--logout"
          onClick={handleLogout}
          aria-label="Log out of Sunrise Dental"
        >
          <LogoutIcon className="sidebar__nav-icon" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* ============================================================
   Inline SVG Icons — no external icon library dependency
   ============================================================ */
function ToothIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 5 4.5 5 3.5 5.5C2 6.5 2 9 3 11C4 13 4.5 14 4.5 16C4.5 18.5 5.5 22 7 22C8.5 22 9 20 9.5 18.5C10 17 10.5 16 12 16C13.5 16 14 17 14.5 18.5C15 20 15.5 22 17 22C18.5 22 19.5 18.5 19.5 16C19.5 14 20 13 21 11C22 9 22 6.5 20.5 5.5C19.5 5 18.5 5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
    </svg>
  );
}

function DashboardIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function PatientsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function AppointmentsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function DentistsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function TreatmentsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

function BillingIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

function ReportsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function HelpIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
