import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingState from './LoadingState';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * Behaviour:
 *   1. While loading (checking storage)  → shows a loading state
 *   2. If no user in context             → redirects to /login, preserving the attempted location
 *   3. If authenticated                  → renders children or <Outlet />
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 * Or wrapping a layout:
 *   <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <LoadingState message="Verifying session…" />
      </div>
    );
  }

  if (!user) {
    // Preserve the location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render passed children (e.g. <AppShell />) or Outlet for nested routes
  return children ?? <Outlet />;
}
