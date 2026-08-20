import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';

// Layout
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage             from './pages/LoginPage';
import DashboardPage         from './pages/DashboardPage';
import PatientsPage          from './pages/PatientsPage';
import NewPatientPage        from './pages/NewPatientPage';
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
 * Wraps the application in the ToastProvider and BrowserRouter.
 * Defines all application routes using React Router v6.
 */
export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated routes — wrapped in AppShell */}
          <Route element={<AppShell />}>
            <Route path="/dashboard"            element={<DashboardPage />} />
            <Route path="/patients"             element={<PatientsPage />} />
            <Route path="/patients/new"         element={<NewPatientPage />} />
            <Route path="/appointments"         element={<AppointmentsPage />} />
            <Route path="/appointments/new"     element={<NewAppointmentPage />} />
            <Route path="/dentists"             element={<DentistsPage />} />
            <Route path="/treatments"           element={<TreatmentsPage />} />
            <Route path="/billing"              element={<BillingPage />} />
            <Route path="/billing/receipt"      element={<BillingReceiptPage />} />
            <Route path="/reports"              element={<ReportsPage />} />
            <Route path="/help"                 element={<HelpPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all — redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
