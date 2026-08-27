import { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader    from '../components/common/PageHeader';
import StatCard      from '../components/common/StatCard';
import SearchBar     from '../components/common/SearchBar';
import Select        from '../components/common/Select';
import Button        from '../components/common/Button';
import Input         from '../components/common/Input';
import StatusBadge   from '../components/common/StatusBadge';
import Pagination    from '../components/common/Pagination';
import Modal         from '../components/common/Modal';
import LoadingState  from '../components/common/LoadingState';
import EmptyState    from '../components/common/EmptyState';
import ErrorState    from '../components/common/ErrorState';
import { useToast }  from '../components/common/Toast';
import dentistService from '../services/dentistService';
import appointmentService from '../services/appointmentService';
import { getInitials } from '../utils/formatters';
import './DentistsPage.css';

/* ── Constants ── */
const PAGE_SIZE = 10;

const AVAILABILITY_OPTIONS = [
  { value: '',            label: 'All Availability' },
  { value: 'AVAILABLE',   label: 'Available' },
  { value: 'BUSY',        label: 'Busy' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
  { value: 'ON_LEAVE',    label: 'On Leave' }
];

const ACTIVE_OPTIONS = [
  { value: '',      label: 'All Status' },
  { value: 'true',  label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'createdAt,asc',  label: 'Oldest First' },
  { value: 'name,asc',       label: 'Name A → Z' },
  { value: 'name,desc',      label: 'Name Z → A' }
];

const INITIAL_FORM = {
  name: '',
  specialization: '',
  contact: '',
  email: '',
  availabilityStatus: 'AVAILABLE',
  active: true
};

export default function DentistsPage() {
  const { showToast } = useToast();

  /* ── Summary & Filter State ── */
  const [summary, setSummary] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  
  const [dentists, setDentists] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sortVal, setSortVal] = useState('createdAt,desc');

  const [listLoading, setListLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listError, setListError] = useState('');

  /* ── Modals & Actions State ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editingDentist, setEditingDentist] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduleAppts, setScheduleAppts] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const searchTimeout = useRef(null);

  /* ── Debounced search handler ── */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  /* ── Fetch metrics & filters ── */
  const loadSummary = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [sumRes, specRes] = await Promise.all([
        dentistService.getSummary(),
        dentistService.getSpecializations()
      ]);
      setSummary(sumRes.data?.data ?? null);
      setSpecializations(specRes.data?.data ?? []);
    } catch {
      setSummary(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ── Fetch List ── */
  const loadDentists = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const [sortBy, sortDir] = sortVal.split(',');
      const res = await dentistService.getAll({
        search: debouncedSearch,
        specialization: specFilter,
        status: availFilter,
        active: activeFilter,
        page: currentPage - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir
      });
      const data = res.data?.data;
      setDentists(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
      setTotalPages(data?.totalPages ?? 0);
    } catch {
      setListError('Failed to load dentists. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [debouncedSearch, specFilter, availFilter, activeFilter, currentPage, sortVal]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadDentists(); }, [loadDentists]);

  /* ── Filter changes ── */
  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setCurrentPage(1); };

  /* ── Form Modal Handlers ── */
  const openAddModal = () => {
    setEditingDentist(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (dentist) => {
    setEditingDentist(dentist);
    setForm({
      name: dentist.name,
      specialization: dentist.specialization,
      contact: dentist.contact,
      email: dentist.email ?? '',
      availabilityStatus: dentist.availabilityStatus,
      active: dentist.active
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.specialization.trim()) errors.specialization = 'Specialization is required.';
    if (!form.contact.trim()) {
      errors.contact = 'Contact number is required.';
    } else if (!/^(?:\+94|0)?7[0-9]{8}$/.test(form.contact.trim())) {
      errors.contact = 'Enter a valid Sri Lankan mobile number.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (editingDentist) {
        await dentistService.update(editingDentist.id, form);
        showToast({ message: `${form.name}'s profile updated successfully.`, type: 'success' });
      } else {
        await dentistService.create(form);
        showToast({ message: `${form.name} registered successfully.`, type: 'success' });
      }
      setFormOpen(false);
      loadDentists();
      loadSummary();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to save dentist profile.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete Confirmation ── */
  const openDeleteModal = (dentist) => setDeleteTarget(dentist);
  const closeDeleteModal = () => { setDeleteTarget(null); setDeleting(false); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dentistService.delete(deleteTarget.id);
      showToast({ message: `Dentist ${deleteTarget.name} has been removed.`, type: 'success' });
      closeDeleteModal();
      loadDentists();
      loadSummary();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to delete dentist profile.';
      showToast({ message: msg, type: 'error' });
      setDeleting(false);
    }
  };

  /* ── View Schedule (Today's appointments modal) ── */
  const openScheduleModal = async (dentist) => {
    setScheduleTarget(dentist);
    setScheduleLoading(true);
    setScheduleAppts([]);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await appointmentService.getAll({
        dentistId: dentist.id,
        date: today,
        page: 0,
        size: 50,
        sortBy: 'appointmentTime',
        sortDir: 'asc'
      });
      setScheduleAppts(res.data?.data?.content ?? []);
    } catch {
      showToast({ message: 'Failed to load dentist schedule.', type: 'error' });
    } finally {
      setScheduleLoading(false);
    }
  };

  const closeScheduleModal = () => setScheduleTarget(null);

  const formatTimeString = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${minute} ${ampm}`;
  };

  return (
    <div className="dentists-page">
      <PageHeader
        title="Dentists"
        subtitle="Manage dentist staff directory profiles, specialties, and schedules."
        actions={
          <Button variant="primary" leftIcon={<PlusIcon />} onClick={openAddModal} id="btn-add-dentist">
            Add Dentist
          </Button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="dentists-page__stats">
        <StatCard
          title="Total Dentists"
          value={statsLoading ? '…' : (summary?.total ?? '—')}
          subtitle="Staff registered"
          variant="default"
          icon={<DentistCardIcon />}
        />
        <StatCard
          title="Available"
          value={statsLoading ? '…' : (summary?.available ?? '—')}
          subtitle="Active & free today"
          variant="success"
          icon={<AvailableCardIcon />}
        />
        <StatCard
          title="Busy"
          value={statsLoading ? '…' : (summary?.busy ?? '—')}
          subtitle="Treating patients"
          variant="info"
          icon={<BusyCardIcon />}
        />
        <StatCard
          title="On Leave"
          value={statsLoading ? '…' : (summary?.onLeave ?? '—')}
          subtitle="Temporary leaves"
          variant="warning"
          icon={<LeaveCardIcon />}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="dentists-page__toolbar">
        <SearchBar
          id="dentist-search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by dentist name, specialization or contact details…"
        />
        <div className="dentists-page__toolbar-right">
          <Select
            id="filter-specialization"
            options={[{ value: '', label: 'All Specializations' }, ...specializations.map(s => ({ value: s, label: s }))]}
            value={specFilter}
            onChange={handleFilterChange(setSpecFilter)}
          />
          <Select
            id="filter-availability"
            options={AVAILABILITY_OPTIONS}
            value={availFilter}
            onChange={handleFilterChange(setAvailFilter)}
          />
          <Select
            id="filter-active"
            options={ACTIVE_OPTIONS}
            value={activeFilter}
            onChange={handleFilterChange(setActiveFilter)}
          />
          <Select
            id="sort-dentists"
            options={SORT_OPTIONS}
            value={sortVal}
            onChange={handleFilterChange(setSortVal)}
          />
        </div>
      </div>

      {/* ── Dentists List Grid ── */}
      <div className="dentists-table-card">
        {listLoading ? (
          <LoadingState message="Loading dentist profiles…" />
        ) : listError ? (
          <ErrorState title="Failed to Load Dentists" message={listError} onRetry={loadDentists} />
        ) : dentists.length === 0 ? (
          <EmptyState
            title="No Dentists Found"
            message="No dentist records match your current filters. Adjust parameters or add a new dentist profile."
            action={
              <Button variant="primary" leftIcon={<PlusIcon />} onClick={openAddModal}>
                Register First Dentist
              </Button>
            }
          />
        ) : (
          <>
            <div className="dentists-table-wrapper">
              <table className="dentists-table" aria-label="Dentist records">
                <thead>
                  <tr>
                    <th scope="col">Dentist</th>
                    <th scope="col">Specialty</th>
                    <th scope="col">Contact Info</th>
                    <th scope="col">Today's Appts</th>
                    <th scope="col">Availability</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dentists.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="dentist-cell">
                          <div className="dentist-avatar" aria-hidden="true">
                            {getInitials(d.name)}
                          </div>
                          <div>
                            <span className="dentist-cell__name">{d.name}</span>
                            <span className="dentist-cell__id">ID: #{d.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="dentist-cell__spec">{d.specialization}</td>
                      <td>
                        <div>{d.contact}</div>
                        {d.email && <div className="dentist-cell__email">{d.email}</div>}
                      </td>
                      <td style={{ fontWeight: '500' }}>
                        {d.todayAppointmentCount > 0 ? (
                          <span className="appointment-count-badge">{d.todayAppointmentCount} Today</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-secondary)' }}>None</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={d.availabilityStatus} />
                      </td>
                      <td>
                        <span className={`active-badge ${d.active ? 'active-badge--true' : 'active-badge--false'}`}>
                          {d.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="dentists-table__actions">
                          <button
                            type="button"
                            className="table-action-btn"
                            title="View today's schedule"
                            aria-label={`View schedule for ${d.name}`}
                            onClick={() => openScheduleModal(d)}
                          >
                            <CalendarIcon />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn"
                            title="Edit dentist profile"
                            aria-label={`Edit ${d.name}`}
                            onClick={() => openEditModal(d)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn table-action-btn--danger"
                            title="Delete dentist profile"
                            aria-label={`Delete ${d.name}`}
                            onClick={() => openDeleteModal(d)}
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

            <div className="dentists-table-footer">
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

      {/* ── Form Modal (Add / Edit) ── */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingDentist ? 'Edit Dentist Profile' : 'Register New Dentist'}
        size="md"
        footer={
          <div className="dentist-form-footer">
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} loading={saving} id="btn-save-dentist">
              {editingDentist ? 'Save Changes' : 'Register'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="dentist-form-body">
          <div className="form-grid">
            <Input
              id="name"
              name="name"
              label="Full Name"
              required
              placeholder="e.g. Dr. K. Perera"
              value={form.name}
              onChange={handleFormChange}
              error={formErrors.name}
            />
            <Input
              id="specialization"
              name="specialization"
              label="Specialization / Department"
              required
              placeholder="e.g. Orthodontics, General Dentistry"
              value={form.specialization}
              onChange={handleFormChange}
              error={formErrors.specialization}
            />
            <Input
              id="contact"
              name="contact"
              label="Primary Contact Number"
              required
              placeholder="e.g. 0771234567"
              value={form.contact}
              onChange={handleFormChange}
              error={formErrors.contact}
            />
            <Input
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="e.g. perera@sunrisedental.lk"
              value={form.email}
              onChange={handleFormChange}
              error={formErrors.email}
            />
            <Select
              id="availabilityStatus"
              name="availabilityStatus"
              label="Availability Status"
              options={AVAILABILITY_OPTIONS.filter(o => o.value !== '')}
              value={form.availabilityStatus}
              onChange={handleFormChange}
            />
            
            <div className="active-checkbox-field">
              <label htmlFor="active">Active Status</label>
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={form.active}
                  onChange={handleFormChange}
                />
                <span>Dentist is currently active in the clinic roster</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Remove Dentist Profile"
        size="sm"
        footer={
          <div className="delete-confirm-footer">
            <Button variant="ghost" onClick={closeDeleteModal} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting} id="btn-confirm-delete-dentist">
              Delete
            </Button>
          </div>
        }
      >
        <div className="delete-confirm-body">
          <div className="delete-confirm-icon" aria-hidden="true">
            <TrashIcon />
          </div>
          <div className="delete-confirm-text">
            <strong>Delete {deleteTarget?.name}?</strong>
            <p>
              This will permanently delete dentist record #{deleteTarget?.id}.
              You cannot undo this action.
            </p>
          </div>
        </div>
      </Modal>

      {/* ── Schedule Modal (Today's Schedule) ── */}
      <Modal
        isOpen={!!scheduleTarget}
        onClose={closeScheduleModal}
        title={`${scheduleTarget?.name} — Today's Schedule`}
        size="md"
      >
        <div className="schedule-modal-body">
          {scheduleLoading ? (
            <LoadingState message="Loading today's schedule preview…" />
          ) : scheduleAppts.length === 0 ? (
            <EmptyState
              title="No Appointments Scheduled"
              message="This dentist has no appointments scheduled for today."
            />
          ) : (
            <div className="schedule-table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th scope="col">Time Slot</th>
                    <th scope="col">Patient</th>
                    <th scope="col">Treatment</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleAppts.map((appt) => (
                    <tr key={appt.id}>
                      <td className="schedule-time">{formatTimeString(appt.appointmentTime)}</td>
                      <td>
                        <strong>{appt.patientName}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{appt.patientPhone}</div>
                      </td>
                      <td>{appt.treatmentName}</td>
                      <td>
                        <StatusBadge status={appt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

/* ── Inline SVG Icons ── */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function DentistCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function AvailableCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function BusyCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function LeaveCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}
