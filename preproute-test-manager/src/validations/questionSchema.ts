import { z } from 'zod';
import { MESSAGES } from '../constants/messages';

export const questionSchema = z.object({
  question: z.string().min(1, MESSAGES.validation.required('Question')),
  option1: z.string().min(1, MESSAGES.validation.required('Option 1')),
  option2: z.string().min(1, MESSAGES.validation.required('Option 2')),
  option3: z.string().min(1, MESSAGES.validation.required('Option 3')),
  option4: z.string().min(1, MESSAGES.validation.required('Option 4')),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4']),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  topic: z.string().optional(),
  sub_topic: z.string().optional(),
  media_url: z.string().url().optional().or(z.literal('')),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
