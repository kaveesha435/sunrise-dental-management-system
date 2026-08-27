import './StatusBadge.css';

/**
 * Appointment / entity status → badge variant + display label mapping.
 */
const STATUS_MAP = {
  // Appointments
  SCHEDULED:   { variant: 'info',    label: 'Scheduled' },
  CONFIRMED:   { variant: 'info',    label: 'Confirmed' },
  IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
  COMPLETED:   { variant: 'success', label: 'Completed' },
  CANCELLED:   { variant: 'danger',  label: 'Cancelled' },
  NO_SHOW:     { variant: 'neutral', label: 'No Show' },
  // Billing
  PENDING:     { variant: 'warning', label: 'Pending' },
  PAID:        { variant: 'success', label: 'Paid' },
  OVERDUE:     { variant: 'danger',  label: 'Overdue' },
  // Generic
  ACTIVE:      { variant: 'success', label: 'Active' },
  INACTIVE:    { variant: 'neutral', label: 'Inactive' },
};

/**
 * StatusBadge — pill-shaped status indicator.
 *
 * Two usage modes:
 *   1. status prop: <StatusBadge status="COMPLETED" />
 *      → auto-maps to variant + label via STATUS_MAP
 *   2. explicit: <StatusBadge variant="success" label="Done" />
 *
 * @param {string} [status]  - entity status string (auto-mapped)
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} [variant]
 * @param {string}  [label]
 * @param {'sm'|'md'} [size]
 */
export default function StatusBadge({
  status,
  variant,
  label,
  size = 'md',
  className = '',
}) {
  let resolvedVariant = variant ?? 'neutral';
  let resolvedLabel   = label ?? status ?? '';

  if (status && STATUS_MAP[status]) {
    resolvedVariant = STATUS_MAP[status].variant;
    resolvedLabel   = STATUS_MAP[status].label;
  }

  return (
    <span
      className={`status-badge status-badge--${resolvedVariant} status-badge--${size} ${className}`.trim()}
      aria-label={`Status: ${resolvedLabel}`}
    >
      <span className="status-badge__dot" aria-hidden="true" />
      {resolvedLabel}
    </span>
  );
}
