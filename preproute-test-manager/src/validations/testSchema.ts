import { z } from 'zod';
import { MESSAGES } from '../constants/messages';

export const testSchema = z.object({
  name: z.string().min(1, MESSAGES.validation.required('Test Name')),
  type: z.enum(['practice', 'exam', 'mock']),
  subject: z.string().min(1, MESSAGES.validation.required('Subject')),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.number({
    invalid_type_error: MESSAGES.validation.required('Correct marks'),
  }),
  wrong_marks: z.number({
    invalid_type_error: MESSAGES.validation.required('Wrong marks'),
  }),
  unattempt_marks: z.number({
    invalid_type_error: MESSAGES.validation.required('Unattempt marks'),
  }),
  total_time: z.number({
    invalid_type_error: MESSAGES.validation.required('Total time'),
  }).positive(),
  total_marks: z.number({
    invalid_type_error: MESSAGES.validation.required('Total marks'),
  }).positive(),
  total_questions: z.number({
    invalid_type_error: MESSAGES.validation.required('Total questions'),
  }).positive(),
});

export type TestFormValues = z.infer<typeof testSchema>;