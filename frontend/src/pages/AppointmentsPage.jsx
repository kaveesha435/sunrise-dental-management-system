import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Input from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import appointmentService from '../services/appointmentService';
import dentistService from '../services/dentistService';
import treatmentService from '../services/treatmentService';
import { formatDate } from '../utils/formatters';
import './AppointmentsPage.css';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const SORT_OPTIONS = [
  { value: 'appointmentDate,desc', label: 'Date (Newest)' },
  { value: 'appointmentDate,asc', label: 'Date (Oldest)' },
  { value: 'appointmentTime,asc', label: 'Time (Earliest)' },
  { value: 'appointmentTime,desc', label: 'Time (Latest)' }
];

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [timelineAppts, setTimelineAppts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [dentistFilter, setDentistFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortVal, setSortVal] = useState('appointmentDate,desc');

  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  // Dynamic Options
  const [dentistOptions, setDentistOptions] = useState([{ value: '', label: 'All Dentists' }]);
  const [treatmentOptions, setTreatmentOptions] = useState([{ value: '', label: 'All Treatments' }]);

  // Cancellation Modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const searchTimeout = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  const loadSummary = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await appointmentService.getSummary();
      setSummary(res.data?.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const [sortBy, sortDir] = sortVal.split(',');
      const res = await appointmentService.getAll({
        search: debouncedSearch,
        date: dateFilter,
        dentistId: dentistFilter,
        treatmentId: treatmentFilter,
        status: statusFilter,
        page: currentPage - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir
      });
      const data = res.data?.data;
      setAppointments(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
      setTotalPages(data?.totalPages ?? 0);
    } catch {
      setListError('Failed to load appointments. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [debouncedSearch, dateFilter, dentistFilter, treatmentFilter, statusFilter, currentPage, sortVal]);

  // Load dropdown options
  useEffect(() => {
    dentistService.getActiveDentists()
      .then(res => {
        const list = res.data?.data ?? [];
        setDentistOptions([
          { value: '', label: 'All Dentists' },
          ...list.map(d => ({ value: d.id.toString(), label: d.name }))
        ]);
      })
      .catch(() => {});

    treatmentService.getActiveTreatments()
      .then(res => {
        const list = res.data?.data ?? [];
        setTreatmentOptions([
          { value: '', label: 'All Treatments' },
          ...list.map(t => ({ value: t.id.toString(), label: t.name }))
        ]);
      })
      .catch(() => {});
  }, []);

  const loadTimeline = useCallback(async () => {
    try {
      // Use dateFilter if selected, otherwise today's date
      const targetDate = dateFilter || new Date().toISOString().split('T')[0];
      const res = await appointmentService.getAll({
        date: targetDate,
        page: 0,
        size: 50,
        sortBy: 'appointmentTime',
        sortDir: 'asc'
      });
      setTimelineAppts(res.data?.data?.content ?? []);
    } catch (err) {
      console.error('Failed to load timeline schedule preview', err);
    }
  }, [dateFilter]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadAppointments(); }, [loadAppointments]);
  useEffect(() => { loadTimeline(); }, [loadTimeline]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleCancelClick = (appt) => {
    setCancelTarget(appt);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await appointmentService.cancel(cancelTarget.id);
      showToast({ message: `Appointment ${cancelTarget.appointmentNumber} has been cancelled.`, type: 'success' });
      setCancelTarget(null);
      loadAppointments();
      loadTimeline();
      loadSummary();
    } catch {
      showToast({ message: 'Failed to cancel appointment. Please try again.', type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const formatTimeString = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  return (
    <div className="appointments-page">
      <PageHeader
        title="Appointments"
        subtitle="Manage clinic scheduling, dentist allocations, and bookings."
        actions={
          <Button
            variant="primary"
            leftIcon={<CalendarPlusIcon />}
            onClick={() => navigate('/appointments/new')}
            id="btn-book-appointment"
          >
            Book Appointment
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="appointments-page__stats">
        <StatCard
          title="Scheduled"
          value={statsLoading ? '…' : (summary?.totalScheduled ?? '0')}
          subtitle="Awaiting treatment"
          variant="info"
          icon={<ScheduledIcon />}
        />
        <StatCard
          title="Confirmed"
          value={statsLoading ? '…' : (summary?.totalConfirmed ?? '0')}
          subtitle="Patient confirmed"
          variant="success"
          icon={<ConfirmedIcon />}
        />
        <StatCard
          title="Pending"
          value={statsLoading ? '…' : (summary?.totalPending ?? '0')}
          subtitle="Verification required"
          variant="warning"
          icon={<PendingIcon />}
        />
        <StatCard
          title="Cancelled"
          value={statsLoading ? '…' : (summary?.totalCancelled ?? '0')}
          subtitle="Total cancelled visits"
          variant="default"
          icon={<CancelledIcon />}
        />
      </div>

      <div className="appointments-page__grid">
        {/* Left Column: Filters and Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="appointments-table-card" style={{ padding: 'var(--space-5)' }}>
            <div className="appointments-page__toolbar">
              <SearchBar
                id="appointments-search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by patient, dentist, or appointment number…"
              />
              <div className="appointments-page__filters">
                <div className="appointments-page__filter-item appointments-page__filter-item--date">
                  <Input
                    id="filter-date"
                    type="date"
                    value={dateFilter}
                    onChange={handleFilterChange(setDateFilter)}
                  />
                </div>
                <div className="appointments-page__filter-item">
                  <Select
                    id="filter-dentist"
                    options={dentistOptions}
                    value={dentistFilter}
                    onChange={handleFilterChange(setDentistFilter)}
                  />
                </div>
                <div className="appointments-page__filter-item">
                  <Select
                    id="filter-treatment"
                    options={treatmentOptions}
                    value={treatmentFilter}
                    onChange={handleFilterChange(setTreatmentFilter)}
                  />
                </div>
                <div className="appointments-page__filter-item">
                  <Select
                    id="filter-status"
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onChange={handleFilterChange(setStatusFilter)}
                  />
                </div>
                <div className="appointments-page__filter-item">
                  <Select
                    id="filter-sort"
                    options={SORT_OPTIONS}
                    value={sortVal}
                    onChange={handleFilterChange(setSortVal)}
                  />
                </div>
              </div>
            </div>

            {listLoading ? (
              <LoadingState message="Loading appointments…" />
            ) : listError ? (
              <ErrorState
                title="Failed to Load Appointments"
                message={listError}
                onRetry={loadAppointments}
              />
            ) : appointments.length === 0 ? (
              <EmptyState
                title="No Appointments Found"
                message={
                  debouncedSearch || dateFilter || dentistFilter || treatmentFilter || statusFilter
                    ? 'No appointments match your filter criteria. Try clearing some filters.'
                    : 'No appointments have been booked yet.'
                }
                action={
                  <Button
                    variant="primary"
                    leftIcon={<CalendarPlusIcon />}
                    onClick={() => navigate('/appointments/new')}
                    id="btn-empty-book"
                  >
                    Book First Appointment
                  </Button>
                }
              />
            ) : (
              <>
                <div className="appointments-table-wrapper">
                  <table className="appointments-table" aria-label="Appointment list">
                    <thead>
                      <tr>
                        <th scope="col">ID / Number</th>
                        <th scope="col">Patient</th>
                        <th scope="col">Dentist</th>
                        <th scope="col">Date / Time</th>
                        <th scope="col">Treatment</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt.id}>
                          <td>
                            <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                              {appt.appointmentNumber}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              {appt.patientName}
                            </div>
                            <div className="appointments-table__meta">{appt.patientPhone}</div>
                          </td>
                          <td>{appt.dentist}</td>
                          <td>
                            <div className="appointments-table__time">
                              {formatTimeString(appt.appointmentTime)}
                            </div>
                            <div className="appointments-table__meta">
                              {formatDate(appt.appointmentDate + 'T00:00:00')} ({appt.duration} min)
                            </div>
                          </td>
                          <td>{appt.treatment}</td>
                          <td>
                            <StatusBadge status={appt.status} />
                          </td>
                          <td>
                            <div className="appointments-table__actions">
                              <button
                                type="button"
                                className="table-action-btn"
                                title="View Details"
                                onClick={() => navigate(`/appointments/${appt.id}`)}
                                aria-label={`View details of appointment ${appt.appointmentNumber}`}
                              >
                                <EyeIcon />
                              </button>
                              <button
                                type="button"
                                className="table-action-btn"
                                title="Reschedule"
                                onClick={() => navigate(`/appointments/${appt.id}/edit`)}
                                aria-label={`Reschedule appointment ${appt.appointmentNumber}`}
                                disabled={appt.status === 'CANCELLED' || appt.status === 'COMPLETED'}
                              >
                                <EditIcon />
                              </button>
                              <button
                                type="button"
                                className="table-action-btn table-action-btn--danger"
                                title="Cancel Appointment"
                                onClick={() => handleCancelClick(appt)}
                                aria-label={`Cancel appointment ${appt.appointmentNumber}`}
                                disabled={appt.status === 'CANCELLED' || appt.status === 'COMPLETED'}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 'var(--space-4)' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Schedule/Calendar Preview */}
        <div className="schedule-preview">
          <div className="schedule-preview__header">
            <h3 className="schedule-preview__title">Schedule Preview</h3>
            <span className="schedule-preview__date">
              {formatDate((dateFilter || new Date().toISOString().split('T')[0]) + 'T00:00:00')}
            </span>
          </div>

          <div className="schedule-preview__timeline">
            {timelineAppts.length === 0 ? (
              <div className="dashboard-panel__empty" style={{ padding: 'var(--space-6) 0' }}>
                No appointments scheduled for this date.
              </div>
            ) : (
              timelineAppts.map((appt) => (
                <div className="timeline-item" key={appt.id}>
                  <div className="timeline-item__time">
                    {formatTimeString(appt.appointmentTime)}
                  </div>
                  <div className={`timeline-item__node timeline-item__node--${appt.status.toLowerCase()}`} />
                  <div className={`timeline-item__content timeline-item__content--${appt.status.toLowerCase()}`}>
                    <span className="timeline-item__patient">{appt.patientName}</span>
                    <span className="timeline-item__details">
                      {appt.dentist} · {appt.treatment} ({appt.duration}m)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={cancelling}>
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
              loading={cancelling}
              id="btn-confirm-cancel-appt"
            >
              Cancel Booking
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
          }}>
            <WarningIcon />
          </div>
          <div>
            <h4 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
              Cancel Appointment {cancelTarget?.appointmentNumber}?
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)', marginTop: 'var(--space-2)' }}>
              Are you sure you want to cancel the appointment for <strong>{cancelTarget?.patientName}</strong> with <strong>{cancelTarget?.dentist}</strong>? This slot will become available for booking.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Icons
function CalendarPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="14" x2="12" y2="20" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function ScheduledIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ConfirmedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CancelledIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
