import Button from './Button';
import './PageHeader.css';

/**
 * PageHeader — top section of each page with title, subtitle, and action slot.
 *
 * @param {string}          title
 * @param {string}          subtitle
 * @param {React.ReactNode} actions - buttons or other controls rendered on the right
 */
export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header__text">
        <h2 className="page-header__title">{title}</h2>
        {subtitle && (
          <p className="page-header__subtitle">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="page-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
}
