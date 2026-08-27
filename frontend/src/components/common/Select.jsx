import './Select.css';

/**
 * Select — controlled dropdown with label, helper text, and error state.
 *
 * @param {Array<{value: string, label: string}>} options
 * @param {string} placeholder - empty option shown first
 */
export default function Select({
  id,
  label,
  options = [],
  placeholder,
  error,
  helper,
  required,
  className = '',
  ...rest
}) {
  const helperId = helper || error ? `${id}-desc` : undefined;

  return (
    <div className={`select-field ${className}`}>
      {label && (
        <label className="select-label" htmlFor={id}>
          {label}
          {required && <span className="select-required" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="select-wrapper">
        <select
          id={id}
          className={`select${error ? ' select--error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={helperId}
          required={required}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(({ value, label: optLabel }) => (
            <option key={value} value={value}>
              {optLabel}
            </option>
          ))}
        </select>
        <span className="select-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {(error || helper) && (
        <p
          id={helperId}
          className={`select-desc${error ? ' select-desc--error' : ''}`}
          role={error ? 'alert' : undefined}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
}
