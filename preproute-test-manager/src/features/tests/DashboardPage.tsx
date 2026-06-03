import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Eye, FileQuestion, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { SortableTableHead } from '@/components/SortableTableHead';
import { TablePagination } from '@/components/TablePagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MESSAGES } from '@/constants/messages';
import {
  useDeleteTestMutation,
  useGetSubjectsQuery,
  useGetTestsQuery,
} from './testsApi';
import { getLabelById, resolveSubjectId } from '@/utils/helpers';
import {
  paginateTests,
  sortTests,
  type PerPageOption,
  type SortColumn,
  type SortDirection,
} from '@/utils/tableUtils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: tests = [], isLoading, isError, refetch } = useGetTestsQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<PerPageOption>(10);

  const getSubjectName = useCallback(
    (subject: string) => {
      const id = resolveSubjectId(subject, subjects);
      return getLabelById(id, subjects) || subject;
    },
    [subjects]
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const sortedTests = useMemo(
    () => sortTests(tests, sortColumn, sortDirection, getSubjectName),
    [tests, sortColumn, sortDirection, getSubjectName]
  );

  const { items: paginatedTests, totalPages, from, to } = useMemo(
    () => paginateTests(sortedTests, page, perPage),
    [sortedTests, page, perPage]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTest(deleteId).unwrap();
      toast.success(MESSAGES.test.deleteSuccess);
      setDeleteId(null);
      refetch();
    } catch {
      toast.error(MESSAGES.test.deleteFailed);
    }
  };

  useEffect(() => {
    if (isError) toast.error(MESSAGES.test.fetchError);
  }, [isError]);

  return (
    <div>
      <PageHeader
        title={MESSAGES.test.myTests}
        action={
          <Button onClick={() => navigate('/tests/create')}>
            {MESSAGES.test.createNew}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white py-16">
          <FileQuestion className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">{MESSAGES.test.noTests}</p>
          <Button onClick={() => navigate('/tests/create')}>
            {MESSAGES.test.createNew}
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  label={MESSAGES.test.columnName}
                  column="name"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHead
                  label={MESSAGES.test.columnSubject}
                  column="subject"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <TableHead>{MESSAGES.test.columnTopics}</TableHead>
                <SortableTableHead
                  label={MESSAGES.test.columnStatus}
                  column="status"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHead
                  label={MESSAGES.test.columnCreated}
                  column="created_at"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <TableHead className="text-right">{MESSAGES.test.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {MESSAGES.test.noResultsOnPage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{getSubjectName(test.subject)}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={test.topics.join(', ')}>
                      {test.topics.join(', ')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={test.status ?? 'draft'} />
                    </TableCell>
                    <TableCell>
                      {test.created_at
                        ? dayjs(test.created_at).format('DD MMM YYYY, HH:mm')
                        : MESSAGES.common.noData}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tests/${test.id}/preview`)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          {MESSAGES.test.view}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tests/${test.id}/edit`)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          {MESSAGES.test.edit}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(test.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          {MESSAGES.test.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            page={page}
            totalPages={totalPages}
            perPage={perPage}
            from={from}
            to={to}
            total={sortedTests.length}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={MESSAGES.test.deleteTestTitle}
        description={MESSAGES.test.deleteConfirm}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
