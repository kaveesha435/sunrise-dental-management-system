import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import './Toast.css';

/* ============================================================
   Toast Context & Provider
   ============================================================ */

const ToastContext = createContext(null);

let nextId = 0;

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

/**
 * ToastProvider — wraps the application root.
 * Exposes the toast context consumed by useToast().
 */
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback(({ message, variant = 'info', duration = 4000 }) => {
    const id = ++nextId;
    dispatch({ type: 'ADD', toast: { id, message, variant } });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast — hook to trigger toasts from any component.
 *
 * @returns {{ toast: { success, error, warning, info } }}
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success('Patient saved!');
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');

  const { addToast } = ctx;

  // Memoised so the identity stays stable across renders: several pages list
  // these in useEffect/useCallback dependency arrays, and a fresh function each
  // render would re-trigger those effects in a loop.
  const toast = useMemo(() => ({
    success: (message, opts) => addToast({ message, variant: 'success', ...opts }),
    error:   (message, opts) => addToast({ message, variant: 'danger',  ...opts }),
    warning: (message, opts) => addToast({ message, variant: 'warning', ...opts }),
    info:    (message, opts) => addToast({ message, variant: 'info',    ...opts }),
  }), [addToast]);

  /**
   * showToast — used by the page components. Accepts either
   *   showToast({ message, type: 'success' | 'error', duration })
   *   showToast('danger', 'message')
   * and normalises 'error' to the 'danger' variant the UI renders.
   */
  const showToast = useCallback((arg, positionalMessage) => {
    if (typeof arg === 'string') {
      return addToast({ message: positionalMessage, variant: normaliseVariant(arg) });
    }
    const { message, type, variant, duration } = arg ?? {};
    return addToast({
      message,
      variant: normaliseVariant(variant ?? type),
      ...(duration != null ? { duration } : {}),
    });
  }, [addToast]);

  return { toast, showToast };
}

function normaliseVariant(value) {
  switch (value) {
    case 'error':
    case 'danger':
      return 'danger';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}

/* ============================================================
   Toast UI Components
   ============================================================ */

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  return (
    <div
      className={`toast toast--${toast.variant}`}
      role="alert"
      aria-label={toast.message}
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONS[toast.variant] ?? ICONS.info}
      </span>
      <span className="toast__message">{toast.message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
