import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import StatusBadge from '../components/common/StatusBadge';
import dashboardService from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import './DashboardPage.css';

/**
 * DashboardPage — main landing page for authenticated users.
 *
 * Data flows:
 *   dashboardService.getStats()               → headline stat cards
 *   dashboardService.getTodayAppointments()   → today's appointments table
 *   dashboardService.getUpcomingAppointments()→ upcoming appointments list
 *   dashboardService.getWeeklyChart()         → bar chart
 *
 * Each service call maps to a separate piece of state so sections
 * can load independently without blocking the whole page.
 */
export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats]               = useState(null);
  const [todayAppts, setTodayAppts]     = useState([]);
  const [upcomingAppts, setUpcoming]    = useState([]);
  const [chartData, setChartData]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, todayRes, upcomingRes, chartRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTodayAppointments(),
        dashboardService.getUpcomingAppointments(),
        dashboardService.getWeeklyChart(),
      ]);

      setStats(statsRes.data?.data ?? null);
      setTodayAppts(todayRes.data?.data ?? []);
      setUpcoming(upcomingRes.data?.data ?? []);

      // Transform weekly chart into recharts format
      const chart = chartRes.data?.data;
      if (chart?.labels && chart?.appointments) {
        setChartData(
          chart.labels.map((day, i) => ({
            day,
            appointments: chart.appointments[i] ?? 0,
          }))
        );
      }
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <PageHeader title="Dashboard" subtitle="Loading clinic summary…" />
        <LoadingState message="Fetching dashboard data…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <PageHeader title="Dashboard" />
        <ErrorState
          title="Failed to Load Dashboard"
          message={error}
          onRetry={loadDashboard}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back. Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`}
      />

      {/* ────────────────────────────────────────────────
          Stat Cards
      ──────────────────────────────────────────────── */}
      <div className="dashboard-page__stats">
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments ?? '—'}
          subtitle="Scheduled for today"
          variant="info"
          icon={<CalendarIcon />}
        />
        <StatCard
          title="Registered Patients"
          value={stats?.totalPatients ?? '—'}
          subtitle="Total in system"
          variant="default"
          icon={<PatientsIcon />}
        />
        <StatCard
          title="Today's Revenue"
          value={stats?.todayRevenue != null ? formatCurrency(stats.todayRevenue) : '—'}
          subtitle="Payments received"
          variant="success"
          icon={<RevenueIcon />}
        />
        <StatCard
          title="Available Dentists"
          value={stats?.availableDentists ?? '—'}
          subtitle="On duty today"
          variant="warning"
          icon={<DentistIcon />}
        />
      </div>

      {/* ────────────────────────────────────────────────
          Middle row: Chart + Quick Actions
      ──────────────────────────────────────────────── */}
      <div className="dashboard-page__middle">
        {/* Appointment Overview Chart */}
        <section className="dashboard-panel" aria-labelledby="chart-label">
          <div className="dashboard-panel__header">
            <h2 id="chart-label" className="dashboard-panel__title">
              Appointment Overview
            </h2>
            <span className="dashboard-panel__subtitle">This week</span>
          </div>
          <div className="dashboard-panel__body">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-input)',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: 13,
                    }}
                    cursor={{ fill: 'var(--color-bg)' }}
                    formatter={(v) => [v, 'Appointments']}
                  />
                  <Bar
                    dataKey="appointments"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-panel__empty">No chart data available.</div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-panel" aria-labelledby="actions-label">
          <div className="dashboard-panel__header">
            <h2 id="actions-label" className="dashboard-panel__title">Quick Actions</h2>
          </div>
          <div className="dashboard-panel__body dashboard-panel__body--actions">
            <QuickAction
              label="New Appointment"
              description="Book a patient slot"
              icon={<CalendarPlusIcon />}
              onClick={() => navigate('/appointments/new')}
              id="qa-new-appointment"
            />
            <QuickAction
              label="Register Patient"
              description="Add a new patient record"
              icon={<UserPlusIcon />}
              onClick={() => navigate('/patients/new')}
              id="qa-register-patient"
            />
            <QuickAction
              label="Create Bill"
              description="Generate an invoice"
              icon={<ReceiptIcon />}
              onClick={() => navigate('/billing')}
              id="qa-create-bill"
            />
            <QuickAction
              label="View Reports"
              description="Analytics and statistics"
              icon={<ChartIcon />}
              onClick={() => navigate('/reports')}
              id="qa-view-reports"
            />
          </div>
        </section>
      </div>

      {/* ────────────────────────────────────────────────
          Bottom row: Today's Appointments Table + Upcoming
      ──────────────────────────────────────────────── */}
      <div className="dashboard-page__bottom">
        {/* Today's Appointments Table */}
        <section className="dashboard-panel" aria-labelledby="today-label">
          <div className="dashboard-panel__header">
            <h2 id="today-label" className="dashboard-panel__title">Today's Appointments</h2>
            <button
              type="button"
              className="dashboard-panel__link"
              onClick={() => navigate('/appointments')}
            >
              View all
            </button>
          </div>
          <div className="dashboard-panel__body dashboard-panel__body--no-pad">
            {todayAppts.length > 0 ? (
              <div className="appt-table-wrapper">
                <table className="appt-table" aria-label="Today's appointments">
                  <thead>
                    <tr>
                      <th scope="col">Time</th>
                      <th scope="col">Patient</th>
                      <th scope="col">Dentist</th>
                      <th scope="col">Treatment</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppts.map((appt) => (
                      <tr key={appt.id}>
                        <td className="appt-table__time">{appt.time}</td>
                        <td className="appt-table__patient">{appt.patientName}</td>
                        <td className="appt-table__dentist">{appt.dentistName}</td>
                        <td>{appt.treatment}</td>
                        <td>
                          <StatusBadge status={appt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dashboard-panel__empty">No appointments scheduled for today.</div>
            )}
          </div>
        </section>

        {/* Upcoming Appointments */}
        <section className="dashboard-panel" aria-labelledby="upcoming-label">
          <div className="dashboard-panel__header">
            <h2 id="upcoming-label" className="dashboard-panel__title">Upcoming</h2>
          </div>
          <div className="dashboard-panel__body dashboard-panel__body--no-pad">
            {upcomingAppts.length > 0 ? (
              <ul className="upcoming-list" aria-label="Upcoming appointments">
                {upcomingAppts.map((appt) => (
                  <li key={appt.id} className="upcoming-item">
                    <div className="upcoming-item__dot" aria-hidden="true" />
                    <div className="upcoming-item__content">
                      <span className="upcoming-item__patient">{appt.patientName}</span>
                      <span className="upcoming-item__meta">
                        {appt.time} · {appt.dentistName}
                      </span>
                    </div>
                    <StatusBadge status={appt.status} size="sm" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-panel__empty">No upcoming appointments.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Quick Action card sub-component
------------------------------------------------------- */
function QuickAction({ label, description, icon, onClick, id }) {
  return (
    <button
      type="button"
      className="quick-action"
      onClick={onClick}
      id={id}
    >
      <div className="quick-action__icon" aria-hidden="true">{icon}</div>
      <div className="quick-action__text">
        <span className="quick-action__label">{label}</span>
        <span className="quick-action__desc">{description}</span>
      </div>
      <ArrowRightIcon />
    </button>
  );
}

/* -------------------------------------------------------
   Icons
------------------------------------------------------- */
function PatientsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function CalendarIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function RevenueIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function DentistIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function CalendarPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="12" y1="15" x2="12" y2="19"/><line x1="10" y1="17" x2="14" y2="17"/>
    </svg>
  );
}
function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg className="quick-action__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
