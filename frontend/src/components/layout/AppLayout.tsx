import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { DateRangeContext, getDefaultDateRange } from '@/hooks/useDateRange';
import type { DateRange } from '@/types/facebook';

export default function AppLayout() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      <div className="flex min-h-screen bg-brand-gray-50">
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuToggle={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </DateRangeContext.Provider>
  );
}
