import type { ApiTestType, Subject, SubTopic, Test, TestType, Topic } from '../types';

const API_TO_APP_TYPE: Record<ApiTestType, TestType> = {
  chapterwise: 'practice',
  pyq: 'exam',
  mock: 'mock',
};

const APP_TO_API_TYPE: Record<TestType, ApiTestType> = {
  practice: 'chapterwise',
  exam: 'pyq',
  mock: 'mock',
};

export const mapApiTestTypeToApp = (type: string): TestType => {
  if (type in API_TO_APP_TYPE) {
    return API_TO_APP_TYPE[type as ApiTestType];
  }
  return 'practice';
};

export const mapAppTestTypeToApi = (type: TestType): ApiTestType =>
  APP_TO_API_TYPE[type];

export const normalizeTest = (raw: Record<string, unknown>): Test => ({
  id: String(raw.id),
  name: String(raw.name),
  type: mapApiTestTypeToApp(String(raw.type)),
  subject: String(raw.subject),
  topics: Array.isArray(raw.topics) ? raw.topics.map(String) : [],
  sub_topics: Array.isArray(raw.sub_topics)
    ? raw.sub_topics.map(String)
    : undefined,
  correct_marks: Number(raw.correct_marks),
  wrong_marks: Number(raw.wrong_marks),
  unattempt_marks: Number(raw.unattempt_marks),
  difficulty: raw.difficulty as Test['difficulty'],
  total_time: Number(raw.total_time),
  total_marks: Number(raw.total_marks),
  total_questions: Number(raw.total_questions),
  status: (raw.status as Test['status']) ?? null,
  created_at: raw.created_at ? String(raw.created_at) : undefined,
  questions: Array.isArray(raw.questions)
    ? raw.questions.map(String)
    : undefined,
});

export const resolveSubjectId = (
  subjectValue: string,
  subjects: Subject[]
): string => {
  const byId = subjects.find((s) => s.id === subjectValue);
  if (byId) return byId.id;
  const byName = subjects.find((s) => s.name === subjectValue);
  return byName?.id ?? subjectValue;
};

export const resolveTopicIds = (
  topicValues: string[],
  topics: Topic[]
): string[] =>
  topicValues.map((value) => {
    const byId = topics.find((t) => t.id === value);
    if (byId) return byId.id;
    const byName = topics.find((t) => t.name === value);
    return byName?.id ?? value;
  });

export const resolveSubTopicIds = (
  subTopicValues: string[],
  subTopics: SubTopic[]
): string[] =>
  subTopicValues.map((value) => {
    const byId = subTopics.find((st) => st.id === value);
    if (byId) return byId.id;
    const byName = subTopics.find((st) => st.name === value);
    return byName?.id ?? value;
  });

export const getLabelById = (
  id: string,
  items: { id: string; name: string }[]
): string => items.find((i) => i.id === id)?.name ?? id;

export const formatTopicLabels = (
  topicValues: string[],
  topics: Topic[]
): string =>
  topicValues
    .map((v) => {
      const byId = topics.find((t) => t.id === v);
      if (byId) return byId.name;
      const byName = topics.find((t) => t.name === v);
      return byName?.name ?? v;
    })
    .join(', ');

export const formatMarkingScheme = (
  correct: number,
  wrong: number,
  unattempt: number
): string => `+${correct} / ${wrong} / ${unattempt}`;
