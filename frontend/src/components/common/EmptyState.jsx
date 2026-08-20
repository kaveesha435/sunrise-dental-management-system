import Button from './Button';
import './EmptyState.css';

/**
 * EmptyState — shown when a list/table has no data.
 *
 * @param {string}          title
 * @param {string}          description
 * @param {React.ReactNode} icon
 * @param {string}          actionLabel
 * @param {Function}        onAction
 */
export default function EmptyState({
  title = 'No data found',
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`} role="status" aria-label={title}>
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="empty-state__action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
