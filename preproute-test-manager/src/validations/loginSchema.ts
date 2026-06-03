import { z } from 'zod';
import { MESSAGES } from '../constants/messages';

export const loginSchema = z.object({
  userId: z.string().min(1, MESSAGES.validation.required('User ID')),
  password: z.string().min(1, MESSAGES.validation.required('Password')),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
