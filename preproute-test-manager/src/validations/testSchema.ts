import { z } from 'zod';
import { MESSAGES } from '../constants/messages';
import { computeExpectedTotalMarks } from '../utils/marksUtils';

export const testSchema = z
  .object({
    name: z.string().min(1, MESSAGES.validation.required('Test Name')),
    type: z.enum(['practice', 'exam', 'mock']),
    subject: z.string().min(1, MESSAGES.validation.required('Subject')),
    topics: z.array(z.string()).min(1, MESSAGES.validation.selectAtLeastOneTopic),
    sub_topics: z.array(z.string()).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    correct_marks: z
      .number({ error: MESSAGES.validation.required('Correct marks') })
      .positive(MESSAGES.validation.positiveNumber('Correct marks')),
    wrong_marks: z.number({ error: MESSAGES.validation.required('Wrong marks') }),
    unattempt_marks: z
      .number({ error: MESSAGES.validation.required('Unattempt marks') })
      .max(0, MESSAGES.validation.unattemptMarksMaxZero),
    total_time: z
      .number({ error: MESSAGES.validation.required('Total time') })
      .positive(MESSAGES.validation.positiveNumber('Total time')),
    total_marks: z
      .number({ error: MESSAGES.validation.required('Total marks') })
      .positive(MESSAGES.validation.positiveNumber('Total marks')),
    total_questions: z
      .number({ error: MESSAGES.validation.required('Total questions') })
      .int(MESSAGES.validation.wholeNumber('Total questions'))
      .positive(MESSAGES.validation.positiveNumber('Total questions')),
  })
  .superRefine((data, ctx) => {
    const expected = computeExpectedTotalMarks(
      data.correct_marks,
      data.total_questions
    );
    if (data.total_marks !== expected) {
      ctx.addIssue({
        code: 'custom',
        message: MESSAGES.validation.totalMarksMismatch(
          data.correct_marks,
          data.total_questions,
          expected
        ),
        path: ['total_marks'],
      });
    }
    if (data.wrong_marks > 0) {
      ctx.addIssue({
        code: 'custom',
        message: MESSAGES.validation.wrongMarksNegative,
        path: ['wrong_marks'],
      });
    }
  });

export type TestFormValues = z.infer<typeof testSchema>;
