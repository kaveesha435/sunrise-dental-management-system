import Button from './Button';
import './EmptyState.css';

/**
 * ErrorState — shown when a data fetch or action fails.
 *
 * @param {string}   title
 * @param {string}   description
 * @param {Function} onRetry - if provided, shows a "Try Again" button
 */
export default function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`error-state ${className}`} role="alert">
      <div className="error-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__description">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="error-state__action">
          Try Again
        </Button>
      )}
    </div>
  );
}
