'use client';

import { useEffect, useRef } from 'react';

/**
 * Confirmation modal for transaction operations.
 */
export default function ConfirmationModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  recipient, 
  amount, 
  asset = 'NOVA',
  operation = 'transfer'
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // FM-01 / KN-01: focus trap + Escape key + restore focus on close
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        modalRef.current?.querySelectorAll(
          'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      {/* SR-02: role=dialog, aria-modal, aria-labelledby */}
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirmation-modal-title">Confirm {operation}</h3>
        <div className="confirmation-details">
          <p><strong>Recipient:</strong> {recipient}</p>
          <p><strong>Amount:</strong> {amount} {asset}</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
