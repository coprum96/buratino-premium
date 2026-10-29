import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Да, начать заново',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-base leading-relaxed mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button type="button" className="btn min-h-11" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="btn btn-danger min-h-11" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
