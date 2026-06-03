import { Badge } from '@/components/ui/badge';
import { MESSAGES } from '@/constants/messages';
import type { TestStatus } from '@/types';

interface StatusBadgeProps {
  status: TestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'live') {
    return <Badge variant="live">{MESSAGES.test.statusLive}</Badge>;
  }
  return <Badge variant="draft">{MESSAGES.test.statusDraft}</Badge>;
}
