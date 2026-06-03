import dayjs from 'dayjs';
import type { Test } from '../types';

export type SortColumn = 'name' | 'subject' | 'status' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export const PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;
export type PerPageOption = (typeof PER_PAGE_OPTIONS)[number];

export function sortTests(
  tests: Test[],
  column: SortColumn,
  direction: SortDirection,
  getSubjectName: (subject: string) => string
): Test[] {
  const sorted = [...tests].sort((a, b) => {
    let cmp = 0;
    switch (column) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'subject':
        cmp = getSubjectName(a.subject).localeCompare(getSubjectName(b.subject));
        break;
      case 'status':
        cmp = (a.status ?? 'draft').localeCompare(b.status ?? 'draft');
        break;
      case 'created_at': {
        const da = a.created_at ? dayjs(a.created_at).valueOf() : 0;
        const db = b.created_at ? dayjs(b.created_at).valueOf() : 0;
        cmp = da - db;
        break;
      }
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export function paginateTests<T>(
  items: T[],
  page: number,
  perPage: number
): { items: T[]; totalPages: number; from: number; to: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  const paginated = items.slice(start, start + perPage);
  return {
    items: paginated,
    totalPages,
    from: items.length === 0 ? 0 : start + 1,
    to: start + paginated.length,
  };
}
