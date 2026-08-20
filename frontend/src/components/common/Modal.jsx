import { useEffect, useRef } from 'react';
import Button from './Button';
import './Modal.css';

/**
 * Modal — accessible overlay dialog.
 *
 * @param {boolean}         isOpen
 * @param {Function}        onClose
 * @param {string}          title
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {React.ReactNode} children  - modal body
 * @param {React.ReactNode} footer    - modal footer actions
 * @param {boolean}         closeOnOverlayClick
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
  className = '',
}) {
  const dialogRef = useRef(null);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className={`modal modal--${size} ${className}`}
        role="dialog"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="modal__header">
          <h3 id="modal-title" className="modal__title">{title}</h3>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="modal__footer">{footer}</div>
        )}
      </div>
    </div>
  );
}
