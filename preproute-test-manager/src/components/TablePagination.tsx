import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MESSAGES } from '@/constants/messages';
import { PER_PAGE_OPTIONS, type PerPageOption } from '@/utils/tableUtils';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  perPage: PerPageOption;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: PerPageOption) => void;
}

export function TablePagination({
  page,
  totalPages,
  perPage,
  from,
  to,
  total,
  onPageChange,
  onPerPageChange,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-4 border-t bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {MESSAGES.test.showingResults(from, to, total)}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {MESSAGES.test.rowsPerPage}
          </span>
          <Select
            value={String(perPage)}
            onValueChange={(v) =>
              onPerPageChange(Number(v) as PerPageOption)
            }
          >
            <SelectTrigger className="h-9 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          {MESSAGES.test.page} {page} {MESSAGES.test.of} {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {MESSAGES.test.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {MESSAGES.test.next}
          </Button>
        </div>
      </div>
    </div>
  );
}
