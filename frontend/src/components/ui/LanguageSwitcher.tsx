import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/i18n/locale';
import { cn } from '@/utils/cn';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () => [
      { value: 'ua' as const, short: 'UA', label: t('languageUkrainian') },
      { value: 'ru' as const, short: 'RU', label: t('languageRussian') },
    ],
    [t],
  );

  const selected = options.find((option) => option.value === locale) ?? options[0];

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'h-10 inline-flex items-center justify-between gap-1.5 px-2.5 sm:px-3',
          'border border-brand-gray-300 rounded-lg bg-white text-sm font-heading font-semibold text-brand-gray-700',
          'hover:bg-brand-gray-50 transition-colors cursor-pointer select-none',
        )}
      >
        <span className="leading-none">{selected.short}</span>
        <ChevronDown
          size={14}
          className={cn(
            'text-brand-gray-500 flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute right-0 top-full mt-2 z-30 w-[160px] p-1.5',
            'rounded-xl border border-brand-gray-200 bg-white shadow-lg',
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === locale;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setLocale(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full h-9 px-3 rounded-lg inline-flex items-center justify-between',
                  'text-sm font-body transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-brand-black text-white'
                    : 'text-brand-gray-700 hover:bg-brand-gray-100',
                )}
              >
                <span className="leading-none">{option.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
