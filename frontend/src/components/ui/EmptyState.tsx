import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-brand-gray-400 mb-4">
        {icon || <Inbox size={48} strokeWidth={1.5} />}
      </div>
      <h3 className="font-heading font-semibold text-lg text-brand-gray-700 mb-1">{title}</h3>
      {description && <p className="text-brand-gray-500 text-sm max-w-md">{description}</p>}
    </div>
  );
}
