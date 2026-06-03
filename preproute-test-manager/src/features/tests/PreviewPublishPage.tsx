import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { QuestionCard } from '@/components/QuestionCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MESSAGES } from '@/constants/messages';
import {
  useGetSubjectsQuery,
  useGetTestByIdQuery,
  usePublishTestMutation,
} from './testsApi';
import { useFetchBulkQuestionsMutation } from '../questions/questionsApi';
import { setStep } from './testsSlice';
import type { Question, TestType } from '@/types';
import {
  formatMarkingScheme,
  getLabelById,
  resolveSubjectId,
} from '@/utils/helpers';

const typeLabels: Record<TestType, string> = {
  practice: MESSAGES.test.typePractice,
  exam: MESSAGES.test.typeExam,
  mock: MESSAGES.test.typeMock,
};

export default function PreviewPublishPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [questions, setQuestionsList] = useState<Question[]>([]);
  const [published, setPublished] = useState(false);

  const { data: test, isLoading } = useGetTestByIdQuery(id ?? '', { skip: !id });
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [fetchBulk, { isLoading: loadingQuestions }] =
    useFetchBulkQuestionsMutation();
  const [publishTest, { isLoading: publishing }] = usePublishTestMutation();

  useEffect(() => {
    dispatch(setStep(3));
  }, [dispatch]);

  useEffect(() => {
    const load = async () => {
      if (!test?.questions?.length) return;
      try {
        const data = await fetchBulk(test.questions).unwrap();
        setQuestionsList(data);
      } catch {
        toast.error(MESSAGES.common.error);
      }
    };
    load();
  }, [test?.questions, fetchBulk]);

  const handlePublish = async () => {
    if (!id) return;
    try {
      await publishTest(id).unwrap();
      setPublished(true);
      toast.success(MESSAGES.test.publishSuccess);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      toast.error(MESSAGES.common.error);
    }
  };

  if (isLoading || !test) {
    return <LoadingSpinner className="py-20" />;
  }

  const subjectId = resolveSubjectId(test.subject, subjects);
  const subjectName = getLabelById(subjectId, subjects) || test.subject;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: test.name, href: `/tests/${id}/edit` },
          { label: MESSAGES.test.wizardStepPreview },
        ]}
      />

      {published && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          {MESSAGES.test.publishSuccess}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{test.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <p>
            <span className="font-medium">{MESSAGES.test.type}:</span>{' '}
            {typeLabels[test.type]}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.subject}:</span>{' '}
            {subjectName}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.topics}:</span>{' '}
            {test.topics.join(', ')}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.difficulty}:</span>{' '}
            {test.difficulty}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.totalTimeLabel}:</span>{' '}
            {test.total_time} {MESSAGES.test.minutes}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.totalMarks}:</span>{' '}
            {test.total_marks}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.totalQuestions}:</span>{' '}
            {test.total_questions}
          </p>
          <p className="sm:col-span-2">
            <span className="font-medium">{MESSAGES.test.markingScheme}:</span>{' '}
            {formatMarkingScheme(
              test.correct_marks,
              test.wrong_marks,
              test.unattempt_marks
            )}
          </p>
        </CardContent>
      </Card>

      {loadingQuestions ? (
        <LoadingSpinner className="py-10" />
      ) : questions.length === 0 ? (
        <p className="mb-6 text-muted-foreground">{MESSAGES.common.noData}</p>
      ) : (
        <div className="mb-6 space-y-4">
          {questions.map((q, index) => (
            <QuestionCard key={q.id ?? index} index={index} question={q} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => navigate(`/tests/${id}/edit`)}>
          {MESSAGES.test.editTest}
        </Button>
        <Button variant="outline" onClick={() => navigate(`/tests/${id}/questions`)}>
          {MESSAGES.test.editQuestions}
        </Button>
        <Button
          variant="success"
          onClick={handlePublish}
          disabled={publishing || published}
        >
          {publishing ? (
            <LoadingSpinner className="py-0" />
          ) : (
            MESSAGES.test.publish
          )}
        </Button>
      </div>
    </div>
  );
}
