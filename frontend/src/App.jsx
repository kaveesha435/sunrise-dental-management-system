import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage             from './pages/LoginPage';
import DashboardPage         from './pages/DashboardPage';
import PatientsPage          from './pages/PatientsPage';
import NewPatientPage        from './pages/NewPatientPage';
import PatientDetailPage     from './pages/PatientDetailPage';
import AppointmentsPage      from './pages/AppointmentsPage';
import NewAppointmentPage    from './pages/NewAppointmentPage';
import DentistsPage          from './pages/DentistsPage';
import TreatmentsPage        from './pages/TreatmentsPage';
import BillingPage           from './pages/BillingPage';
import BillingReceiptPage    from './pages/BillingReceiptPage';
import ReportsPage           from './pages/ReportsPage';
import HelpPage              from './pages/HelpPage';

/**
 * App — root component.
 *
 * Provider hierarchy (outermost → innermost):
 *   BrowserRouter → AuthProvider → ToastProvider → Routes
 *
 * Route hierarchy:
 *   /login           — public, no auth required
 *   /dashboard etc.  — protected by ProtectedRoute → AppShell (with Outlet)
 *
 * ProtectedRoute checks the auth context:
 *   - Loading → shows a spinner
 *   - No user → redirects to /login (with return location preserved)
 *   - Authenticated → renders children (AppShell which contains Outlet)
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* ── Public ── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Protected — wrapped in AppShell layout ── */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard"            element={<DashboardPage />} />
              <Route path="/patients"             element={<PatientsPage />} />
              <Route path="/patients/new"         element={<NewPatientPage />} />
              <Route path="/patients/:id"         element={<PatientDetailPage />} />
              <Route path="/patients/:id/edit"    element={<NewPatientPage />} />
              <Route path="/appointments"         element={<AppointmentsPage />} />
              <Route path="/appointments/new"     element={<NewAppointmentPage />} />
              <Route path="/dentists"             element={<DentistsPage />} />
              <Route path="/treatments"           element={<TreatmentsPage />} />
              <Route path="/billing"              element={<BillingPage />} />
              <Route path="/billing/receipt"      element={<BillingReceiptPage />} />
              <Route path="/reports"              element={<ReportsPage />} />
              <Route path="/help"                 element={<HelpPage />} />
            </Route>

            {/* ── Redirects ── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
