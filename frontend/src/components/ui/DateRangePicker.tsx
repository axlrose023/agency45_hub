import { useDateRange } from '@/hooks/useDateRange';
import { Calendar } from 'lucide-react';
import { useState } from 'react';

const presets = [
  {
    label: 'This Month',
    range: () => {
      const now = new Date();
      return {
        since: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        until: now.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Last 7 Days',
    range: () => {
      const now = new Date();
      const since = new Date(now);
      since.setDate(since.getDate() - 7);
      return {
        since: since.toISOString().split('T')[0],
        until: now.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Last 30 Days',
    range: () => {
      const now = new Date();
      const since = new Date(now);
      since.setDate(since.getDate() - 30);
      return {
        since: since.toISOString().split('T')[0],
        until: now.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Last Month',
    range: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        since: firstDay.toISOString().split('T')[0],
        until: lastDay.toISOString().split('T')[0],
      };
    },
  },
];

export default function DateRangePicker() {
  const { dateRange, setDateRange } = useDateRange();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-gray-300 rounded-lg text-sm font-body hover:bg-brand-gray-50 transition-colors"
      >
        <Calendar size={16} className="text-brand-gray-500" />
        <span className="text-brand-gray-700">
          {dateRange.since} — {dateRange.until}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-lg border border-brand-gray-200 shadow-lg p-4 min-w-[320px]">
            <div className="flex gap-2 mb-4 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setDateRange(p.range());
                    setOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-heading font-medium bg-brand-gray-100 rounded-md hover:bg-brand-gray-200 transition-colors text-brand-gray-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-brand-gray-500 mb-1 font-heading">From</label>
                <input
                  type="date"
                  value={dateRange.since}
                  onChange={(e) => setDateRange({ ...dateRange, since: e.target.value })}
                  className="w-full border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-brand-gray-500 mb-1 font-heading">To</label>
                <input
                  type="date"
                  value={dateRange.until}
                  onChange={(e) => setDateRange({ ...dateRange, until: e.target.value })}
                  className="w-full border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-3 py-2 bg-brand-black text-white rounded-lg text-sm font-heading font-medium hover:bg-brand-gray-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
}
