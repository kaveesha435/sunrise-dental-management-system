import './Input.css';

/**
 * Input — controlled text input with label, helper text, and error state.
 *
 * @param {string}  id        - required for accessibility
 * @param {string}  label     - visible label above input
 * @param {string}  error     - error message; marks field invalid
 * @param {string}  helper    - helper text below input
 * @param {boolean} required  - shows asterisk on label
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export default function Input({
  id,
  label,
  error,
  helper,
  required,
  leftIcon,
  rightIcon,
  className = '',
  ...rest
}) {
  const inputId = id;
  const helperId = helper || error ? `${inputId}-desc` : undefined;

  const wrapperClass = [
    'input-wrapper',
    leftIcon  ? 'input-wrapper--left-icon'  : '',
    rightIcon ? 'input-wrapper--right-icon' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`input-field ${className}`}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
          {required && <span className="input-required" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className={wrapperClass}>
        {leftIcon && (
          <span className="input-icon input-icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`input${error ? ' input--error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={helperId}
          required={required}
          {...rest}
        />
        {rightIcon && (
          <span className="input-icon input-icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {(error || helper) && (
        <p
          id={helperId}
          className={`input-desc${error ? ' input-desc--error' : ''}`}
          role={error ? 'alert' : undefined}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
}
