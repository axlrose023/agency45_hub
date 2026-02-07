import { useDateRange } from '@/hooks/useDateRange';
import { useI18n } from '@/i18n/locale';
import { cn } from '@/utils/cn';
import { Calendar } from 'lucide-react';
import { useState } from 'react';

function toISODate(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DateRangePicker() {
  const { dateRange, setDateRange } = useDateRange();
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const handleSinceChange = (since: string) => {
    if (since > dateRange.until) {
      setDateRange({ since, until: since });
      return;
    }
    setDateRange({ ...dateRange, since });
  };

  const handleUntilChange = (until: string) => {
    if (until < dateRange.since) {
      setDateRange({ since: until, until });
      return;
    }
    setDateRange({ ...dateRange, until });
  };

  const presets = [
    {
      label: t('datePresetToday'),
      range: () => {
        const today = toISODate(new Date());
        return { since: today, until: today };
      },
    },
    {
      label: t('datePresetThisMonth'),
      range: () => {
        const now = new Date();
        return {
          since: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
          until: toISODate(now),
        };
      },
    },
    {
      label: t('datePresetLast7Days'),
      range: () => {
        const now = new Date();
        const since = new Date(now);
        since.setDate(since.getDate() - 7);
        return {
          since: toISODate(since),
          until: toISODate(now),
        };
      },
    },
    {
      label: t('datePresetLast30Days'),
      range: () => {
        const now = new Date();
        const since = new Date(now);
        since.setDate(since.getDate() - 30);
        return {
          since: toISODate(since),
          until: toISODate(now),
        };
      },
    },
    {
      label: t('datePresetLastMonth'),
      range: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          since: toISODate(firstDay),
          until: toISODate(lastDay),
        };
      },
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-10 inline-flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 bg-white border border-brand-gray-300 rounded-xl text-xs sm:text-sm font-body hover:bg-brand-gray-50 hover:border-brand-gray-400 transition-colors shadow-sm"
      >
        <span className="w-6 h-6 rounded-md bg-brand-gray-100 text-brand-gray-600 inline-flex items-center justify-center flex-shrink-0">
          <Calendar size={14} />
        </span>
        <span className="text-brand-gray-700 whitespace-nowrap">
          {dateRange.since} — {dateRange.until}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-3 top-[64px] sm:inset-x-auto sm:top-auto sm:absolute sm:right-0 sm:top-full sm:mt-3 z-20 bg-white rounded-2xl border border-brand-gray-200 shadow-xl p-4 sm:w-[460px]">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
              {presets.map((p) => {
                const presetRange = p.range();
                const isActive =
                  dateRange.since === presetRange.since &&
                  dateRange.until === presetRange.until;

                return (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => {
                      setDateRange(presetRange);
                      setOpen(false);
                    }}
                    className={cn(
                      'px-3 py-2.5 sm:py-1.5 text-xs font-heading font-medium rounded-lg border transition-all',
                      isActive
                        ? 'bg-brand-black text-white border-brand-black shadow-sm'
                        : 'bg-brand-gray-100 text-brand-gray-700 border-transparent hover:bg-brand-gray-200 hover:border-brand-gray-300',
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-brand-gray-500 mb-1.5 font-heading">
                  {t('dateFrom')}
                </label>
                <input
                  type="date"
                  value={dateRange.since}
                  max={dateRange.until}
                  onChange={(e) => handleSinceChange(e.target.value)}
                  className="w-full h-10 border border-brand-gray-300 rounded-lg px-3 text-sm bg-brand-gray-50/70 hover:bg-white hover:border-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-gray-500 mb-1.5 font-heading">
                  {t('dateTo')}
                </label>
                <input
                  type="date"
                  value={dateRange.until}
                  min={dateRange.since}
                  onChange={(e) => handleUntilChange(e.target.value)}
                  className="w-full h-10 border border-brand-gray-300 rounded-lg px-3 text-sm bg-brand-gray-50/70 hover:bg-white hover:border-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full mt-4 h-10 bg-brand-black text-white rounded-xl text-sm font-heading font-medium hover:bg-brand-gray-800 transition-colors"
            >
              {t('dateApply')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
