import { cn } from '@/utils/cn';
import { useI18n } from '@/i18n/locale';

interface StatusBadgeProps {
  status: string | null;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useI18n();
  const s = (status || 'unknown').toUpperCase();

  const styles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PAUSED: 'bg-amber-50 text-amber-700 border-amber-200',
    DELETED: 'bg-red-50 text-red-700 border-red-200',
    ARCHIVED: 'bg-brand-gray-100 text-brand-gray-600 border-brand-gray-200',
  };

  const style = styles[s as keyof typeof styles] || 'bg-brand-gray-100 text-brand-gray-600 border-brand-gray-200';
  const labels = {
    ACTIVE: t('statusActive'),
    PAUSED: t('statusPaused'),
    DELETED: t('statusDeleted'),
    ARCHIVED: t('statusArchived'),
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-medium border', style)}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        s === 'ACTIVE' && 'bg-emerald-500',
        s === 'PAUSED' && 'bg-amber-500',
        s === 'DELETED' && 'bg-red-500',
        s !== 'ACTIVE' && s !== 'PAUSED' && s !== 'DELETED' && 'bg-brand-gray-400',
      )} />
      {labels[s as keyof typeof labels] || s}
    </span>
  );
}
