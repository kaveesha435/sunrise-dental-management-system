import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader   from '../components/common/PageHeader';
import Button       from '../components/common/Button';
import Input        from '../components/common/Input';
import Select       from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import patientService from '../services/patientService';
import './NewPatientPage.css';

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const GENDER_OPTIONS = [
  { value: 'MALE',   label: 'Male'   },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER',  label: 'Other'  },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Active'   },
  { value: 'INACTIVE', label: 'Inactive' },
];

const INITIAL_FORM = {
  fullName:         '',
  dateOfBirth:      '',
  gender:           '',
  contactNumber:    '',
  email:            '',
  address:          '',
  city:             '',
  postalCode:       '',
  emergencyContact: '',
  notes:            '',
  status:           'ACTIVE',
};

/* ─────────────────────────────────────────────────────────────
   Validation helpers
───────────────────────────────────────────────────────────── */
const SL_PHONE_REGEX = /^(\+94|0)[0-9]{9}$/;
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (form.fullName.trim().length > 100) {
    errors.fullName = 'Full name must not exceed 100 characters.';
  }

  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else if (new Date(form.dateOfBirth) >= new Date()) {
    errors.dateOfBirth = 'Date of birth must be in the past.';
  }

  if (!form.gender) {
    errors.gender = 'Please select a gender.';
  }

  if (!form.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required.';
  } else if (!SL_PHONE_REGEX.test(form.contactNumber.trim())) {
    errors.contactNumber = 'Enter a valid Sri Lankan number (e.g. 0771234567 or +94771234567).';
  }

  if (form.email && !EMAIL_REGEX.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (form.email && form.email.length > 100) {
    errors.email = 'Email must not exceed 100 characters.';
  }

  if (!form.address.trim()) {
    errors.address = 'Address is required.';
  } else if (form.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters.';
  }

  if (!form.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!form.postalCode.trim()) {
    errors.postalCode = 'Postal code is required.';
  } else if (form.postalCode.trim().length < 4) {
    errors.postalCode = 'Postal code must be at least 4 characters.';
  }

  if (form.emergencyContact && form.emergencyContact.length > 150) {
    errors.emergencyContact = 'Emergency contact must not exceed 150 characters.';
  }

  if (form.notes && form.notes.length > 1000) {
    errors.notes = 'Notes must not exceed 1000 characters.';
  }

  return errors;
}

/* ─────────────────────────────────────────────────────────────
   NewPatientPage component
───────────────────────────────────────────────────────────── */
/**
 * NewPatientPage — patient registration form.
 *
 * Also handles EDIT mode when navigated to /patients/:id?edit=true.
 * In edit mode it pre-fills from the existing patient record.
 *
 * Features:
 *  - Two-column layout with three sections (Personal / Address / Additional)
 *  - Per-field frontend validation with clear error messages
 *  - Duplicate-contact warning (checked after contact field blurs)
 *  - POST (create) or PUT (update) on submit
 *  - Backend validation errors shown inline
 */
export default function NewPatientPage() {
  const navigate      = useNavigate();
  const { id }        = useParams();                                 // present in edit mode (/patients/:id/edit)
  const isEdit        = !!id;

  const { showToast }  = useToast();
  const firstFieldRef  = useRef(null);

  const [form,       setForm]       = useState(INITIAL_FORM);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [duplicate,  setDuplicate]  = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  /* ── Pre-fill in edit mode ── */
  useEffect(() => {
    if (!isEdit || !id) return;
    patientService.getById(id)
      .then((res) => {
        const p = res.data?.data;
        if (!p) return;
        setForm({
          fullName:         p.fullName         ?? '',
          dateOfBirth:      p.dateOfBirth      ?? '',
          gender:           p.gender           ?? '',
          contactNumber:    p.contactNumber    ?? '',
          email:            p.email            ?? '',
          address:          p.address          ?? '',
          city:             p.city             ?? '',
          postalCode:       p.postalCode       ?? '',
          emergencyContact: p.emergencyContact ?? '',
          notes:            p.notes            ?? '',
          status:           p.status           ?? 'ACTIVE',
        });
      })
      .catch(() => showToast({ message: 'Failed to load patient data.', type: 'error' }))
      .finally(() => setLoadingEdit(false));
  }, [isEdit, id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Focus first field on mount ── */
  useEffect(() => { firstFieldRef.current?.focus(); }, []);

  /* ── Field change handler ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /* ── Duplicate-contact check on blur ── */
  const handleContactBlur = async () => {
    const contact = form.contactNumber.trim();
    if (!SL_PHONE_REGEX.test(contact)) return;    // don't check invalid format
    try {
      const res = await patientService.checkDuplicate(contact, isEdit ? id : null);
      setDuplicate(res.data?.data === true);
    } catch {
      setDuplicate(false);
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first error field
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName:         form.fullName.trim(),
        dateOfBirth:      form.dateOfBirth,
        gender:           form.gender,
        contactNumber:    form.contactNumber.trim(),
        email:            form.email.trim() || null,
        address:          form.address.trim(),
        city:             form.city.trim(),
        postalCode:       form.postalCode.trim(),
        emergencyContact: form.emergencyContact.trim() || null,
        notes:            form.notes.trim() || null,
        status:           form.status,
      };

      if (isEdit && id) {
        await patientService.update(id, payload);
        showToast({ message: 'Patient updated successfully.', type: 'success' });
        navigate(`/patients/${id}`);
      } else {
        const res = await patientService.create(payload);
        const created = res.data?.data;
        showToast({ message: 'Patient registered successfully.', type: 'success' });
        navigate(created?.id ? `/patients/${created.id}` : '/patients');
      }
    } catch (err) {
      const backendErrors = err.response?.data?.data;
      if (backendErrors && typeof backendErrors === 'object') {
        // Map backend field errors to form errors
        const mapped = {};
        Object.entries(backendErrors).forEach(([field, msg]) => {
          mapped[field] = msg;
        });
        setErrors(mapped);
        showToast({ message: 'Please fix the highlighted errors.', type: 'error' });
      } else {
        showToast({
          message: err.response?.data?.message ?? 'Failed to save patient. Please try again.',
          type: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────────────── Render ─────────────────────────── */
  if (loadingEdit) {
    return (
      <div className="new-patient-page">
        <PageHeader title="Edit Patient" subtitle="Loading patient data…" />
        <div className="new-patient-card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="new-patient-page">
      <PageHeader
        title={isEdit ? 'Edit Patient' : 'Register New Patient'}
        subtitle={
          isEdit
            ? 'Update the patient\'s information below.'
            : 'Fill in the patient details to register a new patient.'
        }
        actions={
          <Button variant="ghost" onClick={() => navigate(isEdit ? `/patients/${id}` : '/patients')} id="btn-cancel-patient">
            Cancel
          </Button>
        }
      />

      <div className="new-patient-card">
        <form onSubmit={handleSubmit} noValidate id="new-patient-form">
          <div className="new-patient-form">

            {/* ───── Section 1: Personal Information ───── */}
            <section aria-labelledby="section-personal">
              <h3 className="new-patient-form__section-title" id="section-personal">
                <PersonIcon /> Personal Information
              </h3>
              <div className="new-patient-form__grid">
                <div className="new-patient-form__grid--full">
                  <Input
                    id="field-fullName"
                    name="fullName"
                    label="Full Name"
                    required
                    placeholder="e.g. Amara Silva"
                    value={form.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    ref={firstFieldRef}
                    autoComplete="name"
                  />
                </div>

                <Input
                  id="field-dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  label="Date of Birth"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
                />

                <Select
                  id="field-gender"
                  name="gender"
                  label="Gender"
                  required
                  placeholder="Select gender"
                  options={GENDER_OPTIONS}
                  value={form.gender}
                  onChange={handleChange}
                  error={errors.gender}
                />

                <Input
                  id="field-contactNumber"
                  name="contactNumber"
                  type="tel"
                  label="Contact Number"
                  required
                  placeholder="0771234567 or +94771234567"
                  value={form.contactNumber}
                  onChange={handleChange}
                  onBlur={handleContactBlur}
                  error={errors.contactNumber}
                  autoComplete="tel"
                />

                <Input
                  id="field-email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="patient@example.com"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                />
              </div>

              {/* Duplicate contact warning */}
              {duplicate && (
                <div className="duplicate-warning" role="alert" aria-live="polite">
                  <svg className="duplicate-warning__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div className="duplicate-warning__text">
                    <strong>Duplicate contact number</strong>
                    A patient with this contact number already exists in the system.
                    Please verify before registering.
                  </div>
                </div>
              )}
            </section>

            {/* ───── Section 2: Address ───── */}
            <section aria-labelledby="section-address">
              <h3 className="new-patient-form__section-title" id="section-address">
                <LocationIcon /> Address
              </h3>
              <div className="new-patient-form__grid">
                <div className="new-patient-form__grid--full">
                  <Input
                    id="field-address"
                    name="address"
                    label="Street Address"
                    required
                    placeholder="No. 45, Galle Road"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    autoComplete="street-address"
                  />
                </div>

                <Input
                  id="field-city"
                  name="city"
                  label="City"
                  required
                  placeholder="Colombo"
                  value={form.city}
                  onChange={handleChange}
                  error={errors.city}
                  autoComplete="address-level2"
                />

                <Input
                  id="field-postalCode"
                  name="postalCode"
                  label="Postal Code"
                  required
                  placeholder="00300"
                  value={form.postalCode}
                  onChange={handleChange}
                  error={errors.postalCode}
                  autoComplete="postal-code"
                />
              </div>
            </section>

            {/* ───── Section 3: Additional Information ───── */}
            <section aria-labelledby="section-additional">
              <h3 className="new-patient-form__section-title" id="section-additional">
                <InfoIcon /> Additional Information
              </h3>
              <div className="new-patient-form__grid">
                <Input
                  id="field-emergencyContact"
                  name="emergencyContact"
                  label="Emergency Contact"
                  placeholder="Name and phone number"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  error={errors.emergencyContact}
                />

                <Select
                  id="field-status"
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={form.status}
                  onChange={handleChange}
                  error={errors.status}
                />

                <div className="new-patient-form__grid--full">
                  <label className="new-patient-textarea-label" htmlFor="field-notes">
                    Clinical Notes
                  </label>
                  <textarea
                    id="field-notes"
                    name="notes"
                    className={`new-patient-textarea${errors.notes ? ' textarea--error' : ''}`}
                    placeholder="Any relevant medical history, allergies, or notes…"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    maxLength={1000}
                  />
                  {errors.notes && (
                    <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-small)', marginTop: 4 }} role="alert">
                      {errors.notes}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ── Form footer ── */}
          <div className="new-patient-form__footer">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate(isEdit ? `/patients/${id}` : '/patients')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={submitting}
              id="btn-save-patient"
              leftIcon={!submitting ? <SaveIcon /> : undefined}
            >
              {isEdit ? 'Save Changes' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Inline icons ── */
function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
