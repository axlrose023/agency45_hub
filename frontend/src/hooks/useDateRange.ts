import { createContext, useContext } from 'react';
import type { DateRange } from '@/types/facebook';

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateRangeContext = createContext<DateRangeContextType | null>(null);

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used within DateRangeProvider');
  return ctx;
}

export function getDefaultDateRange(): DateRange {
  const now = new Date();
  const since = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const until = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return { since, until };
}
