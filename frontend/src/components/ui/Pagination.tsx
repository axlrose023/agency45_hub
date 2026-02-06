import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          'p-2 rounded-lg border border-brand-gray-300 transition-colors',
          page <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-gray-100',
        )}
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-body text-brand-gray-600 px-3">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          'p-2 rounded-lg border border-brand-gray-300 transition-colors',
          page >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-gray-100',
        )}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
