'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageRange(currentPage: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '…', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages];
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-[30px]">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-11 h-11 flex items-center justify-center rounded-[29px] border border-[#2A2A2A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      {getPageRange(currentPage, totalPages).map((page, idx) =>
        page === '…' ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-[35px] h-[42px] flex items-center justify-center text-sm text-text-secondary"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-[35px] h-[42px] flex items-center justify-center rounded-[4px] text-sm font-medium font-[family-name:var(--font-poppins)] transition-colors cursor-pointer',
              page === currentPage
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-black/5',
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-11 h-11 flex items-center justify-center rounded-[29px] border border-[#2A2A2A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}