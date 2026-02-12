interface InsightCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function InsightCard({ label, value, icon, className = '' }: InsightCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-brand-gray-200 p-4 hover:shadow-sm transition-shadow select-text min-w-0 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-1.5 mb-1 min-w-0 min-h-[28px]">
        {icon && <span className="text-brand-gray-400 flex-shrink-0 mt-px">{icon}</span>}
        <span className="text-[10px] text-brand-gray-500 uppercase tracking-wider font-heading font-medium leading-tight break-words">
          {label}
        </span>
      </div>
      <span className="text-lg font-heading font-bold text-brand-black block truncate cursor-text">
        {value}
      </span>
    </div>
  );
}
