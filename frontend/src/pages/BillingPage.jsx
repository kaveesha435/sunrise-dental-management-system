import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import appointmentService from '../services/appointmentService';
import billingService from '../services/billingService';
import { formatCurrency, formatDate } from '../utils/formatters';
import './BillingPage.css';

const PAGE_SIZE = 10;

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const HISTORY_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export default function BillingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Generating bill state
  const [apptSearch, setApptSearch] = useState('');
  const [apptResults, setApptResults] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [consultationFee, setConsultationFee] = useState('1500');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Billing history state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);

  // Load Billing History
  const loadBillingHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await billingService.getAll({
        search: debouncedHistorySearch,
        status: statusFilter,
        page: currentPage - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      const data = res.data?.data;
      setHistory(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
    } catch (err) {
      console.error('Failed to load billing history:', err);
      showToast('danger', 'Failed to load billing history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [debouncedHistorySearch, statusFilter, currentPage, showToast]);

  useEffect(() => {
    loadBillingHistory();
  }, [loadBillingHistory]);

  // Handle history search input debouncing
  const handleHistorySearchChange = (e) => {
    const val = e.target.value;
    setHistorySearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedHistorySearch(val);
      setCurrentPage(1);
    }, 350);
  };

  // Handle appointment search autocomplete
  const handleApptSearchChange = async (e) => {
    const val = e.target.value;
    setApptSearch(val);
    if (!val || val.trim().length < 2) {
      setApptResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const res = await appointmentService.getAll({ search: val, size: 5 });
      const activeAppts = (res.data?.data?.content ?? []).filter(
        (a) => a.status !== 'CANCELLED'
      );
      setApptResults(activeAppts);
      setShowDropdown(activeAppts.length > 0);
    } catch (err) {
      console.error('Error searching appointments:', err);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select an appointment and fetch billing details
  const handleSelectAppointment = async (appt) => {
    setSelectedAppt(appt);
    setApptSearch(`${appt.appointmentNumber} - ${appt.patientName}`);
    setApptResults([]);
    setShowDropdown(false);
    setInfoLoading(true);

    try {
      const res = await billingService.getAppointmentBillingInfo(appt.id);
      const info = res.data?.data;
      setBillingInfo(info);
      if (info?.defaultConsultationFee) {
        setConsultationFee(info.defaultConsultationFee.toString());
      }
    } catch (err) {
      console.error('Failed to load billing info:', err);
      showToast('danger', 'Failed to retrieve appointment billing details.');
      setSelectedAppt(null);
      setApptSearch('');
    } finally {
      setInfoLoading(false);
    }
  };

  // Save the bill
  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!selectedAppt) {
      showToast('warning', 'Please select an appointment first.');
      return;
    }

    setSaving(true);
    try {
      const parsedFee = parseFloat(consultationFee);
      if (isNaN(parsedFee) || parsedFee < 0) {
        showToast('danger', 'Consultation fee must be a positive number.');
        setSaving(false);
        return;
      }

      const res = await billingService.saveBill({
        appointmentId: selectedAppt.id,
        consultationFee: parsedFee,
        paymentStatus
      });

      showToast('success', `Bill ${res.data?.data?.receiptNumber} saved successfully.`);
      
      // Reset form
      setSelectedAppt(null);
      setBillingInfo(null);
      setApptSearch('');
      setConsultationFee('1500');
      setPaymentStatus('PAID');
      
      // Reload history
      setCurrentPage(1);
      loadBillingHistory();
    } catch (err) {
      console.error('Failed to save bill:', err);
      const msg = err.response?.data?.message ?? 'Failed to save bill.';
      showToast('danger', msg);
    } finally {
      setSaving(false);
    }
  };

  // Compute subtotal and total dynamically for display
  const treatmentCost = billingInfo ? billingInfo.treatmentCost : 0;
  const parsedFee = parseFloat(consultationFee) || 0;
  const computedSubtotal = treatmentCost + parsedFee;
  const computedTotal = computedSubtotal;

  return (
    <div className="billing-page">
      <PageHeader 
        title="Billing & Invoicing" 
        description="Search appointments, calculate fees, generate receipts, and track clinic revenue." 
      />

      <div className="billing-grid">
        {/* Left Column: Generate Invoice Panel */}
        <div className="billing-card billing-card--main">
          <h2 className="billing-card__title">Generate New Invoice</h2>
          
          <form onSubmit={handleSaveBill} className="billing-form">
            <div className="billing-search-wrapper" ref={dropdownRef}>
              <Input
                id="appt-search"
                label="Search Appointment / Patient"
                placeholder="Type patient name or appointment number (e.g. APT-10001)..."
                value={apptSearch}
                onChange={handleApptSearchChange}
                required
                autoComplete="off"
              />
              {showDropdown && (
                <ul className="appt-search-dropdown">
                  {apptResults.map((appt) => (
                    <li 
                      key={appt.id} 
                      onClick={() => handleSelectAppointment(appt)}
                      className="appt-search-dropdown__item"
                    >
                      <div className="appt-search-dropdown__main">
                        <span className="appt-search-dropdown__num">{appt.appointmentNumber}</span>
                        <span className="appt-search-dropdown__patient">{appt.patientName}</span>
                      </div>
                      <div className="appt-search-dropdown__meta">
                        <span>{formatDate(appt.appointmentDate)}</span>
                        <span>·</span>
                        <span>{appt.treatmentName}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {infoLoading && <LoadingState message="Retrieving appointment data..." />}

            {billingInfo && (
              <div className="billing-details-section">
                <div className="billing-details-group">
                  <h3 className="billing-details-group__title">Appointment Details</h3>
                  <div className="billing-details-grid">
                    <div className="billing-detail">
                      <span className="billing-detail__label">Patient</span>
                      <span className="billing-detail__value">{billingInfo.patientName}</span>
                    </div>
                    <div className="billing-detail">
                      <span className="billing-detail__label">Contact</span>
                      <span className="billing-detail__value">{billingInfo.patientPhone || '—'}</span>
                    </div>
                    <div className="billing-detail">
                      <span className="billing-detail__label">Dentist</span>
                      <span className="billing-detail__value">{billingInfo.dentistName}</span>
                    </div>
                    <div className="billing-detail">
                      <span className="billing-detail__label">Treatment</span>
                      <span className="billing-detail__value">{billingInfo.treatmentName}</span>
                    </div>
                  </div>
                </div>

                <div className="billing-calculation-panel">
                  <h3 className="billing-details-group__title">Billing Calculation</h3>
                  <div className="billing-calc-row">
                    <span>Treatment Cost</span>
                    <strong>{formatCurrency(treatmentCost)}</strong>
                  </div>
                  <div className="billing-calc-input-row">
                    <Input
                      id="consultation-fee"
                      label="Consultation Fee (LKR)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="billing-calc-divider" />
                  
                  <div className="billing-calc-row billing-calc-row--subtotal">
                    <span>Subtotal</span>
                    <span>{formatCurrency(computedSubtotal)}</span>
                  </div>
                  <div className="billing-calc-row billing-calc-row--total">
                    <span>Total (LKR)</span>
                    <span className="billing-total-amount">{formatCurrency(computedTotal)}</span>
                  </div>
                </div>

                <div className="billing-payment-status-row">
                  <Select
                    id="payment-status"
                    label="Payment Status"
                    options={PAYMENT_STATUS_OPTIONS}
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    required
                  />
                </div>

                <div className="billing-form-actions">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={saving}
                    fullWidth
                  >
                    Save & Generate Receipt
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Billing History Table */}
        <div className="billing-card billing-card--history">
          <div className="billing-history-header">
            <h2 className="billing-card__title">Billing History</h2>
            <div className="billing-history-filters">
              <div className="billing-history-search">
                <Input
                  id="history-search"
                  placeholder="Search receipt, patient..."
                  value={historySearch}
                  onChange={handleHistorySearchChange}
                />
              </div>
              <div className="billing-history-status">
                <Select
                  id="history-status"
                  options={HISTORY_STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {historyLoading ? (
            <LoadingState message="Loading invoices..." />
          ) : history.length === 0 ? (
            <EmptyState 
              title="No Invoices Found" 
              description="There are no saved bills matching the filter criteria." 
            />
          ) : (
            <div className="billing-table-wrapper">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Treatment</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((bill) => (
                    <tr key={bill.id} className="billing-table__row">
                      <td className="billing-table__cell--receipt">{bill.receiptNumber}</td>
                      <td>{formatDate(bill.createdAt)}</td>
                      <td>
                        <div className="billing-table__patient-info">
                          <span className="billing-table__patient-name">{bill.patientName}</span>
                          <span className="billing-table__patient-phone">{bill.patientPhone}</span>
                        </div>
                      </td>
                      <td>{bill.treatmentName}</td>
                      <td className="billing-table__cell--total">{formatCurrency(bill.total)}</td>
                      <td>
                        <StatusBadge status={bill.paymentStatus} />
                      </td>
                      <td>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/billing/receipt/${bill.id}`)}
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="billing-pagination-wrapper">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
