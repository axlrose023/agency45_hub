import { useI18n } from '@/i18n/locale';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  danger = false,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="font-heading font-semibold text-lg mb-2">{title}</h3>
        <p className="text-brand-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-heading font-medium border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-heading font-medium rounded-lg text-white transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-black hover:bg-brand-gray-800'
            }`}
          >
            {confirmLabel ?? t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
