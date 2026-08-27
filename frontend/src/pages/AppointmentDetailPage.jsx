import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import appointmentService from '../services/appointmentService';
import { formatDate } from '../utils/formatters';
import './AppointmentDetailPage.css';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadAppointment = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getById(id);
      setAppointment(res.data?.data ?? null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Appointment not found.');
      } else {
        setError('Failed to load appointment details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const handleCancelClick = () => {
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await appointmentService.cancel(id);
      showToast({ message: 'Appointment was successfully cancelled.', type: 'success' });
      setCancelModalOpen(false);
      loadAppointment();
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

  const renderTimeline = (status) => {
    const steps = [
      { key: 'PENDING', label: 'Pending' },
      { key: 'SCHEDULED', label: 'Scheduled' },
      { key: 'CONFIRMED', label: 'Confirmed' },
      { key: 'COMPLETED', label: 'Completed' }
    ];

    if (status === 'CANCELLED') {
      steps[3] = { key: 'CANCELLED', label: 'Cancelled' };
    }

    const getStepClass = (stepKey, index) => {
      if (status === 'CANCELLED' && stepKey === 'CANCELLED') {
        return 'timeline-step--cancelled';
      }
      
      const statusOrder = ['PENDING', 'SCHEDULED', 'CONFIRMED', 'COMPLETED'];
      const currentIndex = statusOrder.indexOf(status);
      const stepIndex = statusOrder.indexOf(stepKey);

      if (status === 'CANCELLED') {
        if (index < 3) {
          return 'timeline-step--completed';
        }
        return 'timeline-step--cancelled';
      }

      if (stepKey === status) {
        return 'timeline-step--active';
      }
      if (stepIndex < currentIndex) {
        return 'timeline-step--completed';
      }
      return '';
    };

    return (
      <div className="status-timeline">
        {steps.map((step, idx) => (
          <div key={step.key} className={`timeline-step ${getStepClass(step.key, idx)}`}>
            <div className="timeline-step__dot">
              {step.key === 'COMPLETED' && status === 'COMPLETED' ? '✓' : idx + 1}
            </div>
            <span className="timeline-step__label">{step.label}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="appointment-detail-page">
        <PageHeader title="Appointment Details" />
        <LoadingState message="Loading appointment details…" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="appointment-detail-page">
        <PageHeader title="Appointment Details" />
        <ErrorState
          title="Appointment Not Found"
          message={error || 'The appointment could not be loaded.'}
          onRetry={loadAppointment}
        />
      </div>
    );
  }

  const isTerminalState = appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED';

  return (
    <div className="appointment-detail-page">
      <PageHeader
        title={appointment.appointmentNumber}
        subtitle={
          <button
            type="button"
            className="patient-detail-back"
            onClick={() => navigate('/appointments')}
            aria-label="Back to appointments list"
          >
            <BackIcon /> Back to Appointments
          </button>
        }
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="secondary"
              leftIcon={<EditIcon />}
              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
              disabled={isTerminalState}
              id="btn-edit-appt"
            >
              Reschedule
            </Button>
            <Button
              variant="danger"
              leftIcon={<TrashIcon />}
              onClick={handleCancelClick}
              disabled={isTerminalState}
              id="btn-cancel-appt"
            >
              Cancel Appointment
            </Button>
          </div>
        }
      />

      <div className="appointment-detail-grid">
        {/* Left column: Patient Info, Appt Details, Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Status Timeline */}
          <div className="appointment-detail-card">
            <div className="appointment-detail-card__header">
              <h2 className="appointment-detail-card__title">Appointment Progress</h2>
              <StatusBadge status={appointment.status} />
            </div>
            <div className="appointment-detail-card__body">
              {renderTimeline(appointment.status)}
            </div>
          </div>

          {/* Patient Details Card */}
          <div className="appointment-detail-card">
            <div className="appointment-detail-card__header">
              <h2 className="appointment-detail-card__title">
                <PatientIcon /> Patient Information
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/patients/${appointment.patientId}`)}
              >
                View Patient File
              </Button>
            </div>
            <div className="appointment-detail-card__body">
              <div className="detail-info-grid">
                <InfoItem label="Full Name" value={appointment.patientName} />
                <InfoItem label="Phone Number" value={appointment.patientPhone} />
                <InfoItem label="Email Address" value={appointment.patientEmail || 'Not provided'} />
                <InfoItem label="Patient ID" value={`#${appointment.patientId}`} />
              </div>
            </div>
          </div>

          {/* Appointment Details Card */}
          <div className="appointment-detail-card">
            <div className="appointment-detail-card__header">
              <h2 className="appointment-detail-card__title">
                <SlotIcon /> Appointment Details
              </h2>
            </div>
            <div className="appointment-detail-card__body">
              <div className="detail-info-grid">
                <InfoItem label="Assign Dentist" value={appointment.dentist} />
                <InfoItem label="Treatment" value={appointment.treatment} />
                <InfoItem label="Scheduled Date" value={formatDate(appointment.appointmentDate + 'T00:00:00')} />
                <InfoItem label="Start Time" value={formatTimeString(appointment.appointmentTime)} />
                <InfoItem label="Duration" value={`${appointment.duration} Minutes`} />
                <InfoItem label="Created On" value={new Date(appointment.createdAt).toLocaleString()} />
              </div>
            </div>
          </div>

          {/* Notes Panel */}
          {appointment.notes && (
            <div className="appointment-detail-card">
              <div className="appointment-detail-card__header">
                <h2 className="appointment-detail-card__title">Notes / Special Instructions</h2>
              </div>
              <div className="appointment-detail-card__body">
                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {appointment.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Billing Summary Placeholder */}
        <div className="appointment-detail-card">
          <div className="appointment-detail-card__header">
            <h2 className="appointment-detail-card__title">
              <BillingIcon /> Billing Summary
            </h2>
          </div>
          <div className="appointment-detail-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-bg)',
              color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
            }}>
              <BillingIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)' }}>Invoicing & Payments</h3>
              <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)', lineHeight: 1.4 }}>
                Billing details and payment links will appear here once the billing module is completed.
              </p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <Button
                variant="secondary"
                fullWidth
                disabled
                title="Billing module is not implemented yet"
              >
                Generate Bill
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
              loading={cancelling}
              id="btn-confirm-cancel-page"
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
              Cancel Appointment {appointment.appointmentNumber}?
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)', marginTop: 'var(--space-2)' }}>
              This will mark the slot as <strong>CANCELLED</strong>. This action is permanent and frees the dentist's calendar slot.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="detail-info-item">
      <span className="detail-info-item__label">{label}</span>
      <span className="detail-info-item__value">{value}</span>
    </div>
  );
}

// Icons
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function PatientIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SlotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BillingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
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
