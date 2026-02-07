import { useLocation } from 'react-router-dom';
import DateRangePicker from '@/components/ui/DateRangePicker';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { Menu } from 'lucide-react';

const showDatePickerPaths = ['/dashboard', '/accounts', '/adsets'];

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const location = useLocation();
  const showDatePicker = showDatePickerPaths.some((p) => location.pathname.startsWith(p));

  return (
    <header className="h-[56px] sm:h-[72px] bg-white border-b border-brand-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-brand-gray-600 hover:text-brand-black transition-colors -ml-1"
      >
        <Menu size={24} />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 sm:gap-4">
        {showDatePicker && <DateRangePicker />}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
