import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppShell.css';

/**
 * AppShell — root layout component.
 * Renders the fixed sidebar on the left and the scrollable main area on the right.
 * All authenticated pages are rendered as children via <Outlet />.
 */
export default function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <Topbar />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
