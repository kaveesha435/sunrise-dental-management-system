import { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader    from '../components/common/PageHeader';
import StatCard      from '../components/common/StatCard';
import SearchBar     from '../components/common/SearchBar';
import Select        from '../components/common/Select';
import Button        from '../components/common/Button';
import Input         from '../components/common/Input';
import Pagination    from '../components/common/Pagination';
import Modal         from '../components/common/Modal';
import LoadingState  from '../components/common/LoadingState';
import EmptyState    from '../components/common/EmptyState';
import ErrorState    from '../components/common/ErrorState';
import { useToast }  from '../components/common/Toast';
import treatmentService from '../services/treatmentService';
import { formatCurrency } from '../utils/formatters';
import './TreatmentsPage.css';

/* ── Constants ── */
const PAGE_SIZE = 10;

const ACTIVE_OPTIONS = [
  { value: '',      label: 'All Treatments' },
  { value: 'true',  label: 'Active Only' },
  { value: 'false', label: 'Inactive Only' }
];

const SORT_OPTIONS = [
  { value: 'name,asc',        label: 'Name A → Z' },
  { value: 'name,desc',       label: 'Name Z → A' },
  { value: 'standardCost,asc',  label: 'Cost (Low → High)' },
  { value: 'standardCost,desc', label: 'Cost (High → Low)' }
];

const INITIAL_FORM = {
  name: '',
  description: '',
  standardCost: '',
  active: true
};

export default function TreatmentsPage() {
  const { showToast } = useToast();

  /* ── State variables ── */
  const [summary, setSummary] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sortVal, setSortVal] = useState('name,asc');

  const [listLoading, setListLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listError, setListError] = useState('');

  /* ── Form Modal State ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ── Action State ── */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const searchTimeout = useRef(null);

  /* ── Search debounce ── */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  /* ── Load stats and lists ── */
  const loadSummary = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await treatmentService.getSummary();
      setSummary(res.data?.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadTreatments = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const [sortBy, sortDir] = sortVal.split(',');
      const res = await treatmentService.getAll({
        search: debouncedSearch,
        active: activeFilter,
        page: currentPage - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir
      });
      const data = res.data?.data;
      setTreatments(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
      setTotalPages(data?.totalPages ?? 0);
    } catch {
      setListError('Failed to load treatments. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [debouncedSearch, activeFilter, currentPage, sortVal]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadTreatments(); }, [loadTreatments]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  /* ── Modal Add / Edit Handlers ── */
  const openAddModal = () => {
    setEditingTreatment(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (treatment) => {
    setEditingTreatment(treatment);
    setForm({
      name: treatment.name,
      description: treatment.description,
      standardCost: treatment.standardCost.toString(),
      active: treatment.active
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
    if (!form.name.trim()) errors.name = 'Treatment name is required.';
    if (!form.description.trim()) {
      errors.description = 'Description is required.';
    } else if (form.description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters.';
    }
    
    const parsedCost = parseFloat(form.standardCost);
    if (!form.standardCost || form.standardCost.trim() === '') {
      errors.standardCost = 'Standard cost is required.';
    } else if (isNaN(parsedCost)) {
      errors.standardCost = 'Cost must be a valid number.';
    } else if (parsedCost < 0) {
      errors.standardCost = 'Standard cost cannot be negative.';
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
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        standardCost: parseFloat(form.standardCost),
        active: form.active
      };

      if (editingTreatment) {
        await treatmentService.update(editingTreatment.id, payload);
        showToast({ message: `Treatment "${form.name}" updated successfully.`, type: 'success' });
      } else {
        await treatmentService.create(payload);
        showToast({ message: `Treatment "${form.name}" added to catalog.`, type: 'success' });
      }
      setFormOpen(false);
      loadTreatments();
      loadSummary();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to save treatment details.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Status toggle (Activate / Deactivate) ── */
  const toggleStatusClick = (treatment) => {
    setStatusTarget(treatment);
  };

  const confirmToggleStatus = async () => {
    if (!statusTarget) return;
    setTogglingStatus(true);
    try {
      const updatedStatus = !statusTarget.active;
      await treatmentService.update(statusTarget.id, {
        name: statusTarget.name,
        description: statusTarget.description,
        standardCost: statusTarget.standardCost,
        active: updatedStatus
      });
      showToast({ 
        message: `Treatment "${statusTarget.name}" has been ${updatedStatus ? 'activated' : 'deactivated'}.`, 
        type: 'success' 
      });
      setStatusTarget(null);
      loadTreatments();
      loadSummary();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to update treatment status.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setTogglingStatus(false);
    }
  };

  /* ── Permanent Delete ── */
  const openDeleteModal = (treatment) => setDeleteTarget(treatment);
  const closeDeleteModal = () => { setDeleteTarget(null); setDeleting(false); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await treatmentService.delete(deleteTarget.id);
      showToast({ message: `Treatment "${deleteTarget.name}" has been deleted from catalog.`, type: 'success' });
      closeDeleteModal();
      loadTreatments();
      loadSummary();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Cannot delete treatment as it has scheduled appointments.';
      showToast({ message: msg, type: 'error' });
      setDeleting(false);
    }
  };

  return (
    <div className="treatments-page">
      <PageHeader
        title="Treatments Catalogue"
        subtitle="Manage clinic procedures list catalog and standard pricing tiers."
        actions={
          <Button variant="primary" leftIcon={<PlusIcon />} onClick={openAddModal} id="btn-add-treatment">
            Add Treatment
          </Button>
        }
      />

      {/* ── Summary Stats Cards ── */}
      <div className="treatments-page__stats">
        <StatCard
          title="Total Procedures"
          value={statsLoading ? '…' : (summary?.total ?? '—')}
          subtitle="Procedures catalogued"
          variant="default"
          icon={<TreatmentCardIcon />}
        />
        <StatCard
          title="Active Services"
          value={statsLoading ? '…' : (summary?.active ?? '—')}
          subtitle="Available for booking"
          variant="success"
          icon={<ActiveCardIcon />}
        />
        <StatCard
          title="Inactive Services"
          value={statsLoading ? '…' : (summary?.inactive ?? '—')}
          subtitle="Deactivated items"
          variant="warning"
          icon={<InactiveCardIcon />}
        />
        <StatCard
          title="Avg Procedure Cost"
          value={statsLoading ? '…' : (summary?.averagePrice != null ? formatCurrency(summary.averagePrice) : '—')}
          subtitle="Standard price mean"
          variant="info"
          icon={<CostCardIcon />}
        />
      </div>

      {/* ── Toolbar search / filter ── */}
      <div className="treatments-page__toolbar">
        <SearchBar
          id="treatment-search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by treatment name or description details…"
        />
        <div className="treatments-page__toolbar-right">
          <Select
            id="filter-active-status"
            options={ACTIVE_OPTIONS}
            value={activeFilter}
            onChange={handleFilterChange(setActiveFilter)}
          />
          <Select
            id="sort-treatments"
            options={SORT_OPTIONS}
            value={sortVal}
            onChange={handleFilterChange(setSortVal)}
          />
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="treatments-table-card">
        {listLoading ? (
          <LoadingState message="Loading treatments catalog…" />
        ) : listError ? (
          <ErrorState title="Failed to Load Treatments" message={listError} onRetry={loadTreatments} />
        ) : treatments.length === 0 ? (
          <EmptyState
            title="No Treatments Found"
            message="No treatments found matching your filters. Register a new procedure to add it to catalog."
            action={
              <Button variant="primary" leftIcon={<PlusIcon />} onClick={openAddModal}>
                Register First Treatment
              </Button>
            }
          />
        ) : (
          <>
            <div className="treatments-table-wrapper">
              <table className="treatments-table" aria-label="Treatment catalog">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '10%' }}>ID</th>
                    <th scope="col" style={{ width: '25%' }}>Treatment Name</th>
                    <th scope="col" style={{ width: '35%' }}>Description</th>
                    <th scope="col" style={{ width: '15%' }}>Standard Cost</th>
                    <th scope="col" style={{ width: '10%' }}>Status</th>
                    <th scope="col" style={{ width: '15%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>#{t.id}</td>
                      <td style={{ fontWeight: '600' }} className="treatment-name-cell">{t.name}</td>
                      <td className="treatment-desc-cell" title={t.description}>{t.description}</td>
                      <td className="treatment-cost-cell">{formatCurrency(t.standardCost)}</td>
                      <td>
                        <span className={`active-badge ${t.active ? 'active-badge--true' : 'active-badge--false'}`}>
                          {t.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="treatments-table__actions">
                          <button
                            type="button"
                            className="table-action-btn"
                            title={t.active ? 'Deactivate treatment' : 'Activate treatment'}
                            aria-label={t.active ? `Deactivate ${t.name}` : `Activate ${t.name}`}
                            onClick={() => toggleStatusClick(t)}
                          >
                            {t.active ? <PowerOffIcon /> : <PowerOnIcon />}
                          </button>
                          <button
                            type="button"
                            className="table-action-btn"
                            title="Edit details"
                            aria-label={`Edit ${t.name}`}
                            onClick={() => openEditModal(t)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn table-action-btn--danger"
                            title="Delete treatment"
                            aria-label={`Delete ${t.name}`}
                            onClick={() => openDeleteModal(t)}
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

            <div className="treatments-table-footer">
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

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingTreatment ? 'Edit Treatment Procedure' : 'Add New Treatment'}
        size="md"
        footer={
          <div className="treatment-form-footer">
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} loading={saving} id="btn-save-treatment">
              {editingTreatment ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="treatment-form-body">
          <div className="form-grid">
            <Input
              id="name"
              name="name"
              label="Treatment Procedure Name"
              required
              placeholder="e.g. Tooth Filling, Root Canal Treatment"
              value={form.name}
              onChange={handleFormChange}
              error={formErrors.name}
            />
            <Input
              id="standardCost"
              name="standardCost"
              label="Standard Cost (LKR)"
              required
              type="number"
              step="0.01"
              placeholder="e.g. 7500.00"
              value={form.standardCost}
              onChange={handleFormChange}
              error={formErrors.standardCost}
            />
            
            <div style={{ gridColumn: 'span 2' }}>
              <label className="new-patient-textarea-label" htmlFor="description">Procedure Description</label>
              <textarea
                id="description"
                name="description"
                className={`new-patient-textarea ${formErrors.description ? 'new-patient-textarea--error' : ''}`}
                value={form.description}
                onChange={handleFormChange}
                placeholder="Details of the treatment procedure, standard medical guidelines, or general instructions..."
                rows={4}
                required
              />
              {formErrors.description && (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-small)', marginTop: '4px' }}>
                  {formErrors.description}
                </div>
              )}
            </div>

            <div className="active-checkbox-field">
              <label htmlFor="active">Catalogue Availability</label>
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={form.active}
                  onChange={handleFormChange}
                />
                <span>Enable this procedure for booking schedules</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Status Toggle Modal ── */}
      <Modal
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title={statusTarget?.active ? 'Deactivate Treatment?' : 'Activate Treatment?'}
        size="sm"
        footer={
          <div className="delete-confirm-footer">
            <Button variant="ghost" onClick={() => setStatusTarget(null)} disabled={togglingStatus}>
              Cancel
            </Button>
            <Button 
              variant={statusTarget?.active ? 'warning' : 'primary'} 
              onClick={confirmToggleStatus} 
              loading={togglingStatus}
              id="btn-confirm-toggle-treatment"
            >
              {statusTarget?.active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        }
      >
        <div style={{ padding: 'var(--space-2) 0', fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to {statusTarget?.active ? 'deactivate' : 'activate'} the treatment 
          <strong> "{statusTarget?.name}"</strong>? 
          {statusTarget?.active 
            ? ' Deactivating will prevent new appointments from scheduling this service. Existing bookings will remain unaffected.' 
            : ' Activating will restore this service to the booking selection panel.'}
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Delete Procedure Catalog Record"
        size="sm"
        footer={
          <div className="delete-confirm-footer">
            <Button variant="ghost" onClick={closeDeleteModal} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting} id="btn-confirm-delete-treatment">
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
              This will permanently remove the treatment procedure catalog record #{deleteTarget?.id}.
              You cannot undo this action.
            </p>
          </div>
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
function PowerOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}
function PowerOnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon" style={{ color: 'var(--color-success)' }}>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}
function TreatmentCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function ActiveCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function InactiveCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function CostCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
