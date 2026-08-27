import './StatCard.css';

/**
 * StatCard — metric card used on the Dashboard.
 *
 * @param {string}        title       - metric name
 * @param {string|number} value       - primary metric value
 * @param {string}        subtitle    - secondary description or change
 * @param {React.ReactNode} icon      - icon element
 * @param {'default'|'success'|'warning'|'info'} variant
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className = '',
}) {
  return (
    <div className={`stat-card stat-card--${variant} ${className}`} aria-label={`${title}: ${value}`}>
      <div className="stat-card__body">
        <div className="stat-card__text">
          <span className="stat-card__title">{title}</span>
          <span className="stat-card__value">{value}</span>
          {subtitle && (
            <span className="stat-card__subtitle">{subtitle}</span>
          )}
        </div>
        {icon && (
          <div className="stat-card__icon" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
