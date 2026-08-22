import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import appointmentService from '../services/appointmentService';
import patientService from '../services/patientService';
import { formatDate } from '../utils/formatters';
import './NewAppointmentPage.css';

import dentistService from '../services/dentistService';
import treatmentService from '../services/treatmentService';

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const DURATION_OPTIONS = [
  { value: '15', label: '15 Minutes' },
  { value: '30', label: '30 Minutes' },
  { value: '45', label: '45 Minutes' },
  { value: '60', label: '60 Minutes' },
  { value: '90', label: '90 Minutes' },
  { value: '120', label: '120 Minutes' }
];

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { showToast } = useToast();

  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form State
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    dentist: '',
    treatment: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: '30',
    status: 'SCHEDULED',
    notes: ''
  });

  const [dentistOptions, setDentistOptions] = useState([]);
  const [treatmentOptions, setTreatmentOptions] = useState([]);

  // Availability State
  const [availability, setAvailability] = useState('EMPTY'); // EMPTY | CHECKING | AVAILABLE | UNAVAILABLE

  const searchTimeout = useRef(null);

  // Load dropdown options on mount
  useEffect(() => {
    dentistService.getActiveDentists()
      .then((res) => {
        const list = res.data?.data ?? [];
        const options = list.map(d => ({ value: d.id.toString(), label: d.name }));
        setDentistOptions(options);
        // Default to first dentist if not editing
        if (!isEdit && options.length > 0) {
          setForm(prev => ({ ...prev, dentist: options[0].value }));
        }
      })
      .catch(() => {});

    treatmentService.getActiveTreatments()
      .then((res) => {
        const list = res.data?.data ?? [];
        const options = list.map(t => ({ value: t.id.toString(), label: t.name }));
        setTreatmentOptions(options);
        // Default to first treatment if not editing
        if (!isEdit && options.length > 0) {
          setForm(prev => ({ ...prev, treatment: options[0].value }));
        }
      })
      .catch(() => {});
  }, [isEdit]);

  // Load appointment details if in edit/reschedule mode
  useEffect(() => {
    if (!isEdit || !id) return;
    setLoadingEdit(true);
    appointmentService.getById(id)
      .then((res) => {
        const appt = res.data?.data;
        if (appt) {
          setForm({
            patientId: appt.patientId,
            dentist: appt.dentistId.toString(),
            treatment: appt.treatmentId.toString(),
            appointmentDate: appt.appointmentDate,
            appointmentTime: appt.appointmentTime.substring(0, 5), // Keep only HH:MM
            duration: appt.duration.toString(),
            status: appt.status,
            notes: appt.notes ?? ''
          });
          setSelectedPatient({
            id: appt.patientId,
            fullName: appt.patientName,
            contactNumber: appt.patientPhone,
            email: appt.patientEmail
          });
        }
      })
      .catch(() => {
        showToast({ message: 'Failed to load appointment details.', type: 'error' });
      })
      .finally(() => {
        setLoadingEdit(false);
      });
  }, [isEdit, id, showToast]);

  // Debounced Patient Search
  const handlePatientSearchChange = (e) => {
    const val = e.target.value;
    setPatientSearch(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingPatients(true);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await patientService.getAll({ search: val, size: 5 });
        setSearchResults(res.data?.data?.content ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchingPatients(false);
      }
    }, 300);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setForm((prev) => ({ ...prev, patientId: patient.id }));
    setPatientSearch('');
    setSearchResults([]);
    if (errors.patientId) {
      setErrors((prev) => ({ ...prev, patientId: '' }));
    }
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setForm((prev) => ({ ...prev, patientId: '' }));
  };

  // Availability verification trigger
  const checkAvailability = useCallback(async () => {
    const { dentist, appointmentDate, appointmentTime, duration } = form;
    if (!dentist || !appointmentDate || !appointmentTime || !duration) {
      setAvailability('EMPTY');
      return;
    }

    setAvailability('CHECKING');
    try {
      const res = await appointmentService.checkAvailability(
        dentist,
        appointmentDate,
        appointmentTime,
        parseInt(duration, 10),
        isEdit ? id : null
      );
      if (res.data?.data === true) {
        setAvailability('AVAILABLE');
      } else {
        setAvailability('UNAVAILABLE');
      }
    } catch {
      setAvailability('UNAVAILABLE');
    }
  }, [form, isEdit, id]);

  // Trigger check availability when slot fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 400);
    return () => clearTimeout(timer);
  }, [form.dentist, form.appointmentDate, form.appointmentTime, form.duration, checkAvailability]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.patientId) newErrors.patientId = 'Patient is required.';
    if (!form.dentist) newErrors.dentist = 'Dentist is required.';
    if (!form.treatment) newErrors.treatment = 'Treatment is required.';
    if (!form.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required.';
    } else {
      const selected = new Date(form.appointmentDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past.';
      }
    }
    if (!form.appointmentTime) newErrors.appointmentTime = 'Appointment time is required.';
    if (!form.duration) newErrors.duration = 'Duration is required.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      showToast({ message: 'Please fix the validation errors.', type: 'error' });
      return;
    }

    if (availability === 'UNAVAILABLE') {
      showToast({ message: 'Dentist is not available at the selected time slot.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientId: form.patientId,
        dentistId: parseInt(form.dentist, 10),
        treatmentId: parseInt(form.treatment, 10),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime + ':00', // Ensure HH:MM:SS format
        duration: parseInt(form.duration, 10),
        status: form.status,
        notes: form.notes || null
      };

      if (isEdit && id) {
        await appointmentService.update(id, payload);
        showToast({ message: 'Appointment rescheduled successfully.', type: 'success' });
        navigate(`/appointments/${id}`);
      } else {
        const res = await appointmentService.create(payload);
        const created = res.data?.data;
        showToast({ message: 'Appointment booked successfully.', type: 'success' });
        navigate(created?.id ? `/appointments/${created.id}` : '/appointments');
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to save appointment. Please check availability and try again.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
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

  if (loadingEdit) {
    return (
      <div className="new-appointment-page">
        <PageHeader title="Reschedule Appointment" />
        <LoadingState message="Loading appointment details…" />
      </div>
    );
  }

  return (
    <div className="new-appointment-page">
      <PageHeader
        title={isEdit ? 'Reschedule Appointment' : 'Book New Appointment'}
        subtitle={isEdit ? 'Modify details to reschedule the appointment slot.' : 'Choose patient, dentist, time, and service details.'}
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <div className="new-appointment-grid">
        {/* Left Column: Form */}
        <div className="new-appointment-card">
          <form onSubmit={handleSubmit} noValidate className="new-appointment-form">
            {/* Patient Selection Section */}
            <div>
              <h3 className="new-appointment-section-title">
                <PatientIcon /> Patient Information
              </h3>
              
              {!selectedPatient ? (
                <div className="patient-search-container">
                  <Input
                    id="patient-search"
                    label="Search Patient"
                    placeholder="Type patient name, phone number, or ID..."
                    value={patientSearch}
                    onChange={handlePatientSearchChange}
                    error={errors.patientId}
                    autoComplete="off"
                  />
                  {searchingPatients && (
                    <div className="patient-search-results" style={{ padding: 'var(--space-3)' }}>
                      Searching…
                    </div>
                  )}
                  {!searchingPatients && searchResults.length > 0 && (
                    <div className="patient-search-results">
                      {searchResults.map((p) => (
                        <div
                          className="patient-search-item"
                          key={p.id}
                          onClick={() => handleSelectPatient(p)}
                        >
                          <div>
                            <span className="patient-search-item__name">{p.fullName}</span>
                            <span className="patient-search-item__meta" style={{ marginLeft: 'var(--space-2)' }}>
                              #{p.id}
                            </span>
                          </div>
                          <span className="patient-search-item__meta">{p.contactNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="selected-patient-card">
                  <div className="selected-patient-card__info">
                    <span className="selected-patient-card__name">{selectedPatient.fullName}</span>
                    <span className="selected-patient-card__meta">
                      ID: #{selectedPatient.id} · Phone: {selectedPatient.contactNumber}
                    </span>
                  </div>
                  {!isEdit && (
                    <Button variant="ghost" size="sm" onClick={handleClearPatient}>
                      Change Patient
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Appointment Slot Details Section */}
            <div>
              <h3 className="new-appointment-section-title">
                <SlotIcon /> Appointment Schedule
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  label="Appointment Date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.appointmentDate}
                  onChange={handleChange}
                  error={errors.appointmentDate}
                />
                
                <Input
                  id="appointmentTime"
                  name="appointmentTime"
                  type="time"
                  label="Start Time"
                  required
                  value={form.appointmentTime}
                  onChange={handleChange}
                  error={errors.appointmentTime}
                />

                <Select
                  id="duration"
                  name="duration"
                  label="Duration"
                  options={DURATION_OPTIONS}
                  value={form.duration}
                  onChange={handleChange}
                  error={errors.duration}
                />

                <Select
                  id="dentist"
                  name="dentist"
                  label="Assign Dentist"
                  options={dentistOptions}
                  value={form.dentist}
                  onChange={handleChange}
                  error={errors.dentist}
                />
              </div>

              {/* Availability Status Indicator */}
              {availability === 'AVAILABLE' && (
                <div className="availability-indicator availability-indicator--available">
                  <AvailableIcon /> Dentist is available for this slot
                </div>
              )}
              {availability === 'UNAVAILABLE' && (
                <div className="availability-indicator availability-indicator--unavailable">
                  <UnavailableIcon /> Dentist double booking! Conflicting schedule.
                </div>
              )}
              {availability === 'CHECKING' && (
                <div className="availability-indicator availability-indicator--checking">
                  Checking dentist availability schedule…
                </div>
              )}
            </div>

            {/* Treatment & Notes Section */}
            <div>
              <h3 className="new-appointment-section-title">
                <TreatmentIcon /> Treatment Details
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <Select
                  id="treatment"
                  name="treatment"
                  label="Select Treatment"
                  options={treatmentOptions}
                  value={form.treatment}
                  onChange={handleChange}
                  error={errors.treatment}
                />

                {isEdit && (
                  <Select
                    id="status"
                    name="status"
                    label="Appointment Status"
                    options={STATUS_OPTIONS}
                    value={form.status}
                    onChange={handleChange}
                  />
                )}
              </div>

              <div style={{ marginTop: 'var(--space-4)' }}>
                <label className="new-patient-textarea-label" htmlFor="notes">Notes / Special Instructions</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="new-patient-textarea"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Clinical notes, patient preferences, or comments…"
                  rows={4}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={submitting}
                id="btn-save-appt"
                disabled={availability === 'UNAVAILABLE'}
              >
                {isEdit ? 'Save Reschedule' : 'Book Appointment'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Dynamic Appointment Summary Card */}
        <div className="appointment-summary-card">
          <h3 className="appointment-summary-card__title">Booking Summary</h3>
          
          <div className="appointment-summary-card__item">
            <span className="appointment-summary-card__label">Patient</span>
            <span className="appointment-summary-card__value">
              {selectedPatient ? selectedPatient.fullName : 'No patient selected'}
            </span>
          </div>

          <div className="appointment-summary-card__item">
            <span className="appointment-summary-card__label">Dentist</span>
            <span className="appointment-summary-card__value">{form.dentist}</span>
          </div>

          <div className="appointment-summary-card__item">
            <span className="appointment-summary-card__label">Treatment</span>
            <span className="appointment-summary-card__value">{form.treatment}</span>
          </div>

          <div className="appointment-summary-card__item">
            <span className="appointment-summary-card__label">Date</span>
            <span className="appointment-summary-card__value">
              {form.appointmentDate ? formatDate(form.appointmentDate + 'T00:00:00') : 'No date chosen'}
            </span>
          </div>

          <div className="appointment-summary-card__item">
            <span className="appointment-summary-card__label">Time Slot</span>
            <span className="appointment-summary-card__value">
              {form.appointmentTime ? `${formatTimeString(form.appointmentTime)} (${form.duration} mins)` : 'No time chosen'}
            </span>
          </div>

          <div className="appointment-summary-card__item">
            <span className="appointment-summary-card__label">Status</span>
            <span className="appointment-summary-card__value">{form.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
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

function TreatmentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function AvailableIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UnavailableIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
