import { useLocation } from 'react-router-dom';
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
 * Topbar — horizontal header bar displayed above all page content.
 * Displays the current page title and a placeholder for future user menu.
 */
export default function Topbar() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Sunrise Dental';

  return (
    <header className="topbar" role="banner">
      <div className="topbar__left">
        <h1 className="topbar__page-title">{pageTitle}</h1>
      </div>

      <div className="topbar__right">
        <div className="topbar__user" aria-label="User account">
          <div className="topbar__user-avatar" aria-hidden="true">A</div>
          <div className="topbar__user-info">
            <span className="topbar__user-name">Admin User</span>
            <span className="topbar__user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
