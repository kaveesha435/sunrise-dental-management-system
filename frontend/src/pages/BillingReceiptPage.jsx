import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import billingService from '../services/billingService';
import { formatCurrency, formatDate, formatDateTime, formatTime } from '../utils/formatters';
import './BillingReceiptPage.css';


/**
 * Dentist names are usually entered already carrying a title
 * (the Dentists form prompts for "Dr. K. Perera"), so only add the
 * prefix when it is genuinely missing — otherwise it reads "Dr. Dr.".
 */
function formatDentistName(name) {
  if (!name) return '—';
  return /^dr\.?\s/i.test(name.trim()) ? name.trim() : `Dr. ${name.trim()}`;
}

export default function BillingReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBill = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await billingService.getById(id);
        setBill(res.data?.data ?? null);
      } catch (err) {
        console.error('Failed to load bill:', err);
        setError(err.response?.data?.message || 'Failed to retrieve invoice details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBill();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="receipt-page-container">
        <LoadingState message="Loading invoice details..." />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="receipt-page-container">
        <ErrorState
          title="Invoice Not Found"
          message={error || 'The requested invoice does not exist or could not be loaded.'}
          actionLabel="Back to Billing"
          onAction={() => navigate('/billing')}
        />
      </div>
    );
  }

  return (
    <div className="receipt-page-container">
      {/* Action Header — hidden during print */}
      <div className="receipt-actions no-print">
        <Button variant="ghost" onClick={() => navigate('/billing')} leftIcon={<BackIcon />}>
          Back to Billing
        </Button>
        <Button variant="primary" onClick={handlePrint} leftIcon={<PrintIcon />}>
          Print Receipt
        </Button>
      </div>

      {/* Printable Receipt Card */}
      <div className="receipt-card">
        {/* Receipt Header */}
        <div className="receipt-header">
          <div className="receipt-clinic-info">
            <h1 className="receipt-logo">
              <LogoIcon />
              Sunrise Dental
            </h1>
            <p className="receipt-address">
              123 Clinic Road, Colombo 03, Sri Lanka<br />
              Phone: +94 11 234 5678 · Email: care@sunrisedental.lk
            </p>
          </div>
          <div className="receipt-invoice-meta">
            <div className="receipt-status-badge">
              <StatusBadge status={bill.paymentStatus} />
            </div>
            <div className="receipt-meta-item">
              <span className="receipt-meta-item__label">Receipt No:</span>
              <strong className="receipt-meta-item__value receipt-meta-item__value--number">
                {bill.receiptNumber}
              </strong>
            </div>
            <div className="receipt-meta-item">
              <span className="receipt-meta-item__label">Date:</span>
              <span className="receipt-meta-item__value">{formatDateTime(bill.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* Info Grid */}
        <div className="receipt-info-grid">
          {/* Patient Details */}
          <div className="receipt-info-section">
            <h2 className="receipt-info-section__title">Patient Information</h2>
            <div className="receipt-info-details">
              <div className="receipt-info-row">
                <span className="receipt-info-row__label">Name:</span>
                <span className="receipt-info-row__value">{bill.patientName}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-row__label">Phone:</span>
                <span className="receipt-info-row__value">{bill.patientPhone || '—'}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-row__label">Email:</span>
                <span className="receipt-info-row__value">{bill.patientEmail || '—'}</span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="receipt-info-section">
            <h2 className="receipt-info-section__title">Appointment Details</h2>
            <div className="receipt-info-details">
              <div className="receipt-info-row">
                <span className="receipt-info-row__label">Appointment No:</span>
                <span className="receipt-info-row__value receipt-info-row__value--number">
                  {bill.appointmentNumber}
                </span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-row__label">Date:</span>
                <span className="receipt-info-row__value">{formatDate(bill.createdAt)}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-row__label">Dentist:</span>
                <span className="receipt-info-row__value">
                  {formatDentistName(bill.dentistName)} ({bill.dentistSpecialization})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* Treatment Details */}
        <div className="receipt-section">
          <h2 className="receipt-section__title">Treatment Summary</h2>
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Procedure / Service</th>
                <th className="receipt-text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="receipt-treatment-name">{bill.treatmentName}</div>
                  <div className="receipt-treatment-desc">Standard clinic dental treatment procedure</div>
                </td>
                <td className="receipt-text-right">{formatCurrency(bill.treatmentCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Calculations */}
        <div className="receipt-totals-wrapper">
          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Treatment Cost:</span>
              <span>{formatCurrency(bill.treatmentCost)}</span>
            </div>
            <div className="receipt-total-row">
              <span>Consultation Fee:</span>
              <span>{formatCurrency(bill.consultationFee)}</span>
            </div>
            <div className="receipt-totals-divider" />
            <div className="receipt-total-row receipt-total-row--subtotal">
              <span>Subtotal:</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="receipt-total-row receipt-total-row--total">
              <span>Total Amount (LKR):</span>
              <strong>{formatCurrency(bill.total)}</strong>
            </div>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* Receipt Footer */}
        <footer className="receipt-footer">
          <p className="receipt-thank-you">Thank you for choosing Sunrise Dental clinic!</p>
          <p className="receipt-footer-notes">
            This is a system generated document. For inquiries or follow-up appointments, please contact support.
          </p>
          <div className="receipt-signatures">
            <div className="receipt-signature-line">
              <div className="signature-box" />
              <span>Prepared By</span>
            </div>
            <div className="receipt-signature-line">
              <div className="signature-box" />
              <span>Authorized Signature</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Icons
------------------------------------------------------- */
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon-svg">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
