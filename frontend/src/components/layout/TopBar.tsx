import { useLocation } from 'react-router-dom';
import DateRangePicker from '@/components/ui/DateRangePicker';

const showDatePickerPaths = ['/dashboard', '/accounts', '/adsets'];

export default function TopBar() {
  const location = useLocation();
  const showDatePicker = showDatePickerPaths.some((p) => location.pathname.startsWith(p));

  return (
    <header className="h-16 bg-white border-b border-brand-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        {showDatePicker && <DateRangePicker />}
      </div>
    </header>
  );
}
