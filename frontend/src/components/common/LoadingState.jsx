import './EmptyState.css';

/**
 * LoadingState — full-area loading spinner with optional message.
 *
 * @param {string} message
 */
export default function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={`loading-state ${className}`} role="status" aria-label={message} aria-busy="true">
      <div className="loading-state__spinner" aria-hidden="true" />
      <span className="loading-state__message">{message}</span>
    </div>
  );
}
