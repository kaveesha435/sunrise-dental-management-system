import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import './DashboardPage.css';

/**
 * Dashboard — application landing page.
 * Shows summary statistics and quick-access widgets.
 * Data will be fetched from the API in a future commit.
 */
export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back. Here's an overview of the clinic today."
      />

      {/* Stat Cards */}
      <div className="dashboard-page__stats">
        <StatCard
          title="Total Patients"
          value="—"
          subtitle="Registered patients"
          variant="default"
          icon={<PatientsIcon />}
        />
        <StatCard
          title="Today's Appointments"
          value="—"
          subtitle="Scheduled for today"
          variant="info"
          icon={<CalendarIcon />}
        />
        <StatCard
          title="Pending Billing"
          value="—"
          subtitle="Invoices awaiting payment"
          variant="warning"
          icon={<BillingIcon />}
        />
        <StatCard
          title="Active Dentists"
          value="—"
          subtitle="Currently on staff"
          variant="success"
          icon={<DentistIcon />}
        />
      </div>

      {/* Placeholder panels */}
      <div className="dashboard-page__panels">
        <section className="dashboard-panel" aria-labelledby="upcoming-label">
          <div className="dashboard-panel__header">
            <h3 id="upcoming-label" className="dashboard-panel__title">Upcoming Appointments</h3>
          </div>
          <div className="dashboard-panel__body dashboard-panel__body--empty">
            <CalendarIcon className="dashboard-panel__empty-icon" />
            <p>Appointment data will appear here once connected to the API.</p>
          </div>
        </section>

        <section className="dashboard-panel" aria-labelledby="recent-label">
          <div className="dashboard-panel__header">
            <h3 id="recent-label" className="dashboard-panel__title">Recent Patients</h3>
          </div>
          <div className="dashboard-panel__body dashboard-panel__body--empty">
            <PatientsIcon className="dashboard-panel__empty-icon" />
            <p>Recent patient registrations will appear here.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* Inline icons */
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

function CalendarIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
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

function DentistIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
