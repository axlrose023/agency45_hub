interface InsightCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export default function InsightCard({ label, value, icon }: InsightCardProps) {
  return (
    <div className="bg-white rounded-lg border border-brand-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-brand-gray-400">{icon}</span>}
        <span className="text-xs text-brand-gray-500 uppercase tracking-wider font-heading font-medium">
          {label}
        </span>
      </div>
      <span className="text-xl font-heading font-bold text-brand-black">{value}</span>
    </div>
  );
}
