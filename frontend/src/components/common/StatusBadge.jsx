import './StatusBadge.css';

/**
 * StatusBadge — pill-shaped status indicator.
 *
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} variant
 * @param {string} label - text to display
 */
export default function StatusBadge({ variant = 'neutral', label, className = '' }) {
  return (
    <span className={`status-badge status-badge--${variant} ${className}`} aria-label={`Status: ${label}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
