import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MESSAGES } from '@/constants/messages';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  className,
  label = MESSAGES.common.loading,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
