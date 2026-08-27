import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader    from '../components/common/PageHeader';
import StatCard      from '../components/common/StatCard';
import SearchBar     from '../components/common/SearchBar';
import Select        from '../components/common/Select';
import Button        from '../components/common/Button';
import StatusBadge   from '../components/common/StatusBadge';
import Pagination    from '../components/common/Pagination';
import Modal         from '../components/common/Modal';
import LoadingState  from '../components/common/LoadingState';
import EmptyState    from '../components/common/EmptyState';
import ErrorState    from '../components/common/ErrorState';
import { useToast }  from '../components/common/Toast';
import patientService from '../services/patientService';
import { getInitials, formatDate } from '../utils/formatters';
import './PatientsPage.css';

/* ── Constants ── */
const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '',         label: 'All Patients' },
  { value: 'ACTIVE',   label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const SORT_OPTIONS = [
  { value: 'createdAt,desc',  label: 'Newest First' },
  { value: 'createdAt,asc',   label: 'Oldest First' },
  { value: 'fullName,asc',    label: 'Name A → Z' },
  { value: 'fullName,desc',   label: 'Name Z → A' },
];

/**
 * PatientsPage — full patient management list view.
 *
 * Features:
 *  - 4 summary stat cards (total / active / inactive / new this month)
 *  - Debounced search (name / contact / ID)
 *  - Status filter dropdown
 *  - Sort dropdown
 *  - Patient table with avatar, age/gender, actions
 *  - Pagination
 *  - Delete confirmation modal
 */
export default function PatientsPage() {
  const navigate     = useNavigate();
  const { showToast } = useToast();

  /* ── Summary state ── */
  const [summary, setSummary] = useState(null);

  /* ── List state ── */
  const [patients,    setPatients]    = useState([]);
  const [totalItems,  setTotalItems]  = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [currentPage, setCurrentPage] = useState(1);   // 1-indexed in UI

  /* ── Filter state ── */
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [sortVal, setSortVal] = useState('createdAt,desc');

  /* ── Loading / error ── */
  const [listLoading, setListLoading]   = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listError,   setListError]     = useState('');

  /* ── Delete modal state ── */
  const [deleteTarget, setDeleteTarget] = useState(null);   // patient object
  const [deleting,     setDeleting]     = useState(false);

  /* ── Debounce search ── */
  const searchTimeout = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  /* ── Fetch summary ── */
  const loadSummary = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await patientService.getSummary();
      setSummary(res.data?.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ── Fetch list ── */
  const loadPatients = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const [sortBy, sortDir] = sortVal.split(',');
      const res = await patientService.getAll({
        search: debouncedSearch,
        status,
        page: currentPage - 1,   // API is 0-indexed
        size: PAGE_SIZE,
        sortBy,
        sortDir,
      });
      const data = res.data?.data;
      setPatients(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
      setTotalPages(data?.totalPages ?? 0);
    } catch {
      setListError('Failed to load patients. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [debouncedSearch, status, sortVal, currentPage]);

  /* ── Initial + reactive loads ── */
  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadPatients(); }, [loadPatients]);

  /* ── Filter/sort change handlers ── */
  const handleStatusChange  = (e) => { setStatus(e.target.value);  setCurrentPage(1); };
  const handleSortChange    = (e) => { setSortVal(e.target.value); setCurrentPage(1); };

  /* ── Delete handlers ── */
  const openDeleteModal  = (patient) => setDeleteTarget(patient);
  const closeDeleteModal = () => { setDeleteTarget(null); setDeleting(false); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await patientService.delete(deleteTarget.id);
      showToast({ message: `${deleteTarget.fullName} has been removed.`, type: 'success' });
      closeDeleteModal();
      loadPatients();
      loadSummary();
    } catch {
      showToast({ message: 'Failed to delete patient. Please try again.', type: 'error' });
      setDeleting(false);
    }
  };

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <div className="patients-page">

      {/* ── Page header ── */}
      <PageHeader
        title="Patients"
        subtitle="Manage registered patients and their records."
        actions={
          <Button
            variant="primary"
            leftIcon={<PlusIcon />}
            onClick={() => navigate('/patients/new')}
            id="btn-register-patient"
          >
            Register Patient
          </Button>
        }
      />

      {/* ── Summary stat cards ── */}
      <div className="patients-page__stats">
        <StatCard
          title="Total Patients"
          value={statsLoading ? '…' : (summary?.total ?? '—')}
          subtitle="Registered in system"
          variant="default"
          icon={<PatientsIcon />}
        />
        <StatCard
          title="Active"
          value={statsLoading ? '…' : (summary?.active ?? '—')}
          subtitle="Currently active"
          variant="success"
          icon={<ActiveIcon />}
        />
        <StatCard
          title="New This Month"
          value={statsLoading ? '…' : (summary?.newThisMonth ?? '—')}
          subtitle="Registered this month"
          variant="info"
          icon={<NewIcon />}
        />
        <StatCard
          title="Inactive"
          value={statsLoading ? '…' : (summary?.inactive ?? '—')}
          subtitle="Deactivated records"
          variant="warning"
          icon={<InactiveIcon />}
        />
      </div>

      {/* ── Search / Filter / Sort toolbar ── */}
      <div className="patients-page__toolbar">
        <SearchBar
          id="patients-search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name, contact or patient ID…"
        />
        <div className="patients-page__toolbar-right">
          <Select
            id="patients-status-filter"
            className="patients-page__filter"
            options={STATUS_OPTIONS}
            value={status}
            onChange={handleStatusChange}
          />
          <Select
            id="patients-sort"
            className="patients-page__sort"
            options={SORT_OPTIONS}
            value={sortVal}
            onChange={handleSortChange}
          />
        </div>
      </div>

      {/* ── Patient table card ── */}
      <div className="patients-table-card">
        {listLoading ? (
          <LoadingState message="Loading patients…" />
        ) : listError ? (
          <ErrorState
            title="Failed to Load Patients"
            message={listError}
            onRetry={loadPatients}
          />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No Patients Found"
            message={
              debouncedSearch || status
                ? 'No patients match your current filters. Try adjusting your search or filter.'
                : 'No patients registered yet. Register your first patient to get started.'
            }
            action={
              <Button
                variant="primary"
                leftIcon={<PlusIcon />}
                onClick={() => navigate('/patients/new')}
                id="btn-empty-register"
              >
                Register First Patient
              </Button>
            }
          />
        ) : (
          <>
            <div className="patients-table-wrapper">
              <table className="patients-table" aria-label="Patient records">
                <thead>
                  <tr>
                    <th scope="col">Patient</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Age / Gender</th>
                    <th scope="col">City</th>
                    <th scope="col">Status</th>
                    <th scope="col">Registered</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      {/* Patient column */}
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar" aria-hidden="true">
                            {getInitials(p.fullName)}
                          </div>
                          <div>
                            <span className="patient-cell__name">{p.fullName}</span>
                            <span className="patient-cell__id">#{p.id}</span>
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td>
                        <div>{p.contactNumber}</div>
                        {p.email && (
                          <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
                            {p.email}
                          </div>
                        )}
                      </td>
                      {/* Age / Gender */}
                      <td>
                        {p.age != null ? `${p.age} yrs` : '—'}
                        {p.gender && (
                          <span style={{ marginLeft: 6, color: 'var(--color-text-secondary)' }}>
                            · {p.gender.charAt(0) + p.gender.slice(1).toLowerCase()}
                          </span>
                        )}
                      </td>
                      {/* City */}
                      <td>{p.city}</td>
                      {/* Status */}
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      {/* Registered date */}
                      <td style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(p.createdAt)}
                      </td>
                      {/* Actions */}
                      <td>
                        <div className="patients-table__actions">
                          <button
                            type="button"
                            className="table-action-btn"
                            title="View patient"
                            aria-label={`View ${p.fullName}`}
                            onClick={() => navigate(`/patients/${p.id}`)}
                          >
                            <EyeIcon />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn"
                            title="Edit patient"
                            aria-label={`Edit ${p.fullName}`}
                            onClick={() => navigate(`/patients/${p.id}/edit`)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn table-action-btn--danger"
                            title="Delete patient"
                            aria-label={`Delete ${p.fullName}`}
                            onClick={() => openDeleteModal(p)}
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

            {/* Pagination */}
            <div className="patients-table-footer">
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

      {/* ── Delete confirmation modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Delete Patient"
        size="sm"
        footer={
          <div className="delete-confirm-footer">
            <Button variant="ghost" onClick={closeDeleteModal} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleting}
              id="btn-confirm-delete-patient"
            >
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
            <strong>Delete {deleteTarget?.fullName}?</strong>
            <p>
              This will permanently remove all records for patient #{deleteTarget?.id}.
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
}

/* ── Inline icon components ── */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function PatientsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ActiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function NewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}
function InactiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
