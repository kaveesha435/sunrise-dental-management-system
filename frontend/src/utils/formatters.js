/**
 * Utility formatting functions used across the application.
 */

// -------------------------------------------------------
// Date / Time
// -------------------------------------------------------

/**
 * Formats an ISO date string or Date object to a readable date.
 * e.g. "20 Aug 2026"
 */
export function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats to date + time.
 * e.g. "20 Aug 2026, 14:30"
 */
export function formatDateTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats time only.
 * e.g. "14:30"
 */
export function formatTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(`1970-01-01T${value}`);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// -------------------------------------------------------
// Currency
// -------------------------------------------------------

/**
 * Formats a number as currency.
 * e.g. formatCurrency(1500) → "LKR 1,500.00"
 *
 * @param {number} amount
 * @param {string} currency - ISO 4217 code (default: 'LKR' for Sri Lanka)
 */
export function formatCurrency(amount, currency = 'LKR') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// -------------------------------------------------------
// String
// -------------------------------------------------------

/**
 * Returns initials from a full name string.
 * e.g. "John Doe" → "JD"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

/**
 * Truncates a string to a given character limit.
 */
export function truncate(str, limit = 50) {
  if (!str || str.length <= limit) return str ?? '';
  return str.slice(0, limit).trimEnd() + '…';
}

/**
 * Capitalises the first letter of each word.
 */
export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}
