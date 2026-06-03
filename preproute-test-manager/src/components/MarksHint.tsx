import { MESSAGES } from '@/constants/messages';
import { computeExpectedTotalMarks } from '@/utils/marksUtils';

interface MarksHintProps {
  correctMarks: number;
  totalQuestions: number;
}

export function MarksHint({ correctMarks, totalQuestions }: MarksHintProps) {
  if (correctMarks <= 0 || totalQuestions <= 0) return null;

  const expected = computeExpectedTotalMarks(correctMarks, totalQuestions);

  return (
    <p className="text-xs text-muted-foreground">
      {MESSAGES.test.marksFormulaHint(correctMarks, totalQuestions, expected)}
    </p>
  );
}
