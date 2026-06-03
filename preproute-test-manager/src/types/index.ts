export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: { token: string; user: User };
}

export interface User {
  id: string;
  name?: string;
  userId: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export type TestStatus = 'draft' | 'live' | null;
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type TestType = 'practice' | 'exam' | 'mock';

export type ApiTestType = 'chapterwise' | 'pyq' | 'mock';

export interface Test {
  id: string;
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics?: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: DifficultyLevel;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: TestStatus;
  created_at?: string;
  questions?: string[];
}

export interface Question {
  id?: string;
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: 'option1' | 'option2' | 'option3' | 'option4';
  explanation?: string;
  difficulty?: DifficultyLevel;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
  test_id: string;
  subject?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BulkQuestionsRequest {
  questions: Omit<Question, 'id'>[];
}

export interface ApiEnvelope<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
}
