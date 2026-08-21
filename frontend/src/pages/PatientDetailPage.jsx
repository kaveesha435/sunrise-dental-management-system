import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader   from '../components/common/PageHeader';
import Button       from '../components/common/Button';
import StatusBadge  from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState   from '../components/common/ErrorState';
import { useToast } from '../components/common/Toast';
import patientService from '../services/patientService';
import { getInitials, formatDate, formatDateTime } from '../utils/formatters';
import './PatientDetailPage.css';

/**
 * PatientDetailPage — view a single patient's complete record.
 *
 * Layout:
 *  - PageHeader: patient name + Edit / Back actions
 *  - Left column (3/4):
 *      • Profile card (avatar, name, status, info grid)
 *      • Appointments placeholder
 *      • Treatment History placeholder
 *  - Right sidebar (1/4):
 *      • Patient Summary card
 *      • Billing placeholder
 */
export default function PatientDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [patient,  setPatient]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const loadPatient = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await patientService.getById(id);
      setPatient(res.data?.data ?? null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Patient not found.');
      } else {
        setError('Failed to load patient data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadPatient(); }, [loadPatient]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="patient-detail-page">
        <PageHeader title="Patient Details" />
        <LoadingState message="Loading patient record…" />
      </div>
    );
  }

  /* ── Error ── */
  if (error || !patient) {
    return (
      <div className="patient-detail-page">
        <PageHeader title="Patient Details" />
        <ErrorState
          title="Patient Not Found"
          message={error || 'The patient record could not be loaded.'}
          onRetry={loadPatient}
        />
      </div>
    );
  }

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <div className="patient-detail-page">

      {/* ── Page header ── */}
      <PageHeader
        title={patient.fullName}
        subtitle={
          <button
            type="button"
            className="patient-detail-back"
            onClick={() => navigate('/patients')}
            aria-label="Back to patients list"
          >
            <BackIcon /> Back to Patients
          </button>
        }
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="secondary"
              leftIcon={<EditIcon />}
              onClick={() => navigate(`/patients/${patient.id}/edit`)}
              id="btn-edit-patient"
            >
              Edit Patient
            </Button>
          </div>
        }
      />

      {/* ── Content grid ── */}
      <div className="patient-detail-grid">

        {/* ── Left column: main content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Profile card */}
          <div className="detail-card">
            <div className="detail-card__header">
              <h2 className="detail-card__title">
                <ProfileIcon /> Profile Information
              </h2>
              <StatusBadge status={patient.status} />
            </div>
            <div className="detail-card__body">

              {/* Avatar + name block */}
              <div className="profile-card__top">
                <div className="profile-avatar" aria-hidden="true">
                  {getInitials(patient.fullName)}
                </div>
                <div className="profile-card__name-block">
                  <div className="profile-card__name">{patient.fullName}</div>
                  <div className="profile-card__id">Patient ID: #{patient.id}</div>
                  <div className="profile-card__badges">
                    <StatusBadge status={patient.status} size="sm" />
                    {patient.gender && (
                      <StatusBadge
                        variant="neutral"
                        label={patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="profile-info-grid">
                <InfoItem label="Date of Birth"    value={patient.dateOfBirth ? formatDate(patient.dateOfBirth + 'T00:00:00') : '—'} />
                <InfoItem label="Age"              value={patient.age != null ? `${patient.age} years` : '—'} />
                <InfoItem label="Contact Number"   value={patient.contactNumber ?? '—'} />
                <InfoItem label="Email"            value={patient.email ?? <span className="profile-info-item__value--muted">Not provided</span>} />
                <InfoItem label="Address"          value={patient.address ?? '—'} />
                <InfoItem label="City"             value={patient.city ?? '—'} />
                <InfoItem label="Postal Code"      value={patient.postalCode ?? '—'} />
                <InfoItem
                  label="Emergency Contact"
                  value={patient.emergencyContact ?? <span className="profile-info-item__value--muted">Not provided</span>}
                />
              </div>

              {/* Notes */}
              {patient.notes && (
                <div style={{ marginTop: 'var(--space-5)' }}>
                  <div className="profile-info-item__label" style={{ marginBottom: 'var(--space-2)' }}>Clinical Notes</div>
                  <div className="patient-notes-block">{patient.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Appointments placeholder */}
          <div className="detail-card">
            <div className="detail-card__header">
              <h2 className="detail-card__title">
                <CalendarIcon /> Appointments
              </h2>
            </div>
            <div className="placeholder-section">
              <div className="placeholder-section__icon"><CalendarIcon /></div>
              <div className="placeholder-section__title">Appointment History</div>
              <p className="placeholder-section__desc">
                This patient's appointment history will appear here once the Appointment
                module is implemented.
              </p>
            </div>
          </div>

          {/* Treatment History placeholder */}
          <div className="detail-card">
            <div className="detail-card__header">
              <h2 className="detail-card__title">
                <TreatmentIcon /> Treatment History
              </h2>
            </div>
            <div className="placeholder-section">
              <div className="placeholder-section__icon"><TreatmentIcon /></div>
              <div className="placeholder-section__title">Treatment Records</div>
              <p className="placeholder-section__desc">
                Completed treatments and clinical notes will be displayed here in a future
                module.
              </p>
            </div>
          </div>

        </div>

        {/* ── Right sidebar ── */}
        <div className="patient-sidebar">

          {/* Patient summary */}
          <div className="detail-card">
            <div className="detail-card__header">
              <h2 className="detail-card__title">
                <SummaryIcon /> Patient Summary
              </h2>
            </div>
            <div className="detail-card__body">
              <div className="summary-list">
                <div className="summary-list__item">
                  <span className="summary-list__label">Patient ID</span>
                  <span className="summary-list__value">#{patient.id}</span>
                </div>
                <div className="summary-list__item">
                  <span className="summary-list__label">Status</span>
                  <StatusBadge status={patient.status} size="sm" />
                </div>
                <div className="summary-list__item">
                  <span className="summary-list__label">Gender</span>
                  <span className="summary-list__value">
                    {patient.gender
                      ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()
                      : '—'}
                  </span>
                </div>
                <div className="summary-list__item">
                  <span className="summary-list__label">Age</span>
                  <span className="summary-list__value">
                    {patient.age != null ? `${patient.age} yrs` : '—'}
                  </span>
                </div>
                <div className="summary-list__item">
                  <span className="summary-list__label">Member Since</span>
                  <span className="summary-list__value">{formatDate(patient.createdAt)}</span>
                </div>
                <div className="summary-list__item">
                  <span className="summary-list__label">Last Updated</span>
                  <span className="summary-list__value">{formatDateTime(patient.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing placeholder */}
          <div className="detail-card">
            <div className="detail-card__header">
              <h2 className="detail-card__title">
                <BillingIcon /> Billing
              </h2>
            </div>
            <div className="placeholder-section" style={{ padding: 'var(--space-6)' }}>
              <div className="placeholder-section__icon"><BillingIcon /></div>
              <div className="placeholder-section__title">Billing Summary</div>
              <p className="placeholder-section__desc">
                Invoices and payment history will appear here once the Billing module
                is implemented.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Info item sub-component ── */
function InfoItem({ label, value }) {
  return (
    <div className="profile-info-item">
      <span className="profile-info-item__label">{label}</span>
      <span className="profile-info-item__value">{value}</span>
    </div>
  );
}

/* ── Icons ── */
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
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
function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function TreatmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
function SummaryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function BillingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
