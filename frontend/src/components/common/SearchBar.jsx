import './SearchBar.css';

/**
 * SearchBar — search input with magnifier icon and optional clear button.
 *
 * @param {string}   value
 * @param {Function} onChange
 * @param {string}   placeholder
 * @param {string}   id
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  id = 'search',
  className = '',
  ...rest
}) {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <div className={`searchbar ${className}`}>
      <span className="searchbar__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        id={id}
        type="search"
        className="searchbar__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        {...rest}
      />

      {value && (
        <button
          type="button"
          className="searchbar__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
