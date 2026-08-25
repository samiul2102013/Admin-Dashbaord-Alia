'use client';

import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="!bg-danger !shadow-danger/25 hover:!bg-danger/90"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#FDECEC] flex items-center justify-center">
          <AlertTriangle size={22} className="text-danger" />
        </div>
        <p className="text-sm text-text-secondary font-[family-name:var(--font-poppins)]">
          {message}
        </p>
      </div>
    </Modal>
  );
}