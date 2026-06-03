import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MESSAGES } from '@/constants/messages';
import type { Question } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  index: number;
  question: Question;
}

const optionKeys = ['option1', 'option2', 'option3', 'option4'] as const;

export function QuestionCard({ index, question }: QuestionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {index + 1}. {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {optionKeys.map((key, i) => (
          <div
            key={key}
            className={cn(
              'rounded-md border px-3 py-2 text-sm',
              question.correct_option === key
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-border bg-background'
            )}
          >
            {MESSAGES.question.optionLabel(i + 1)}: {question[key]}
            {question.correct_option === key && (
              <span className="ml-2 font-medium">({MESSAGES.question.correctAnswer})</span>
            )}
          </div>
        ))}
        {question.explanation && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">{MESSAGES.question.explanation}:</span>{' '}
            {question.explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
