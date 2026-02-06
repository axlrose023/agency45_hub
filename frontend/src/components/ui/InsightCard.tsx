interface InsightCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export default function InsightCard({ label, value, icon }: InsightCardProps) {
  return (
    <div
      className="bg-white rounded-lg border border-brand-gray-200 p-4 hover:shadow-sm transition-shadow select-text min-w-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 mb-1 min-w-0">
        {icon && <span className="text-brand-gray-400 flex-shrink-0">{icon}</span>}
        <span className="text-[10px] text-brand-gray-500 uppercase tracking-wider font-heading font-medium truncate">
          {label}
        </span>
      </div>
      <span className="text-lg font-heading font-bold text-brand-black block truncate cursor-text">
        {value}
      </span>
    </div>
  );
}
