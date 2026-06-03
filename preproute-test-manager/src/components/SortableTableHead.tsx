import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SortColumn, SortDirection } from '@/utils/tableUtils';

interface SortableTableHeadProps {
  label: string;
  column: SortColumn;
  activeColumn: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  className?: string;
}

export function SortableTableHead({
  label,
  column,
  activeColumn,
  direction,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = activeColumn === column;
  const Icon = !isActive
    ? ArrowUpDown
    : direction === 'asc'
      ? ArrowUp
      : ArrowDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 font-medium transition-colors hover:text-primary',
          isActive && 'text-primary'
        )}
        onClick={() => onSort(column)}
        aria-label={`${label} ${isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'sortable'}`}
      >
        {label}
        <Icon className="h-4 w-4 shrink-0 opacity-60" />
      </button>
    </TableHead>
  );
}
