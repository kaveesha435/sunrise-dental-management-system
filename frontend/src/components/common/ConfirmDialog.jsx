import Modal from './Modal';
import Button from './Button';
import './ConfirmDialog.css';

/**
 * ConfirmDialog — specialised modal for destructive or irreversible actions.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {Function} onConfirm
 * @param {string}   title
 * @param {string}   message
 * @param {string}   confirmLabel  - default "Confirm"
 * @param {'primary'|'danger'} confirmVariant
 * @param {boolean}  loading
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="confirm-dialog__message">{message}</p>
    </Modal>
  );
}
