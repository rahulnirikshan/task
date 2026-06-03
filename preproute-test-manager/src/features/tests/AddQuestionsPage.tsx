import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MESSAGES } from '@/constants/messages';
import {
  questionSchema,
  type QuestionFormValues,
} from '@/validations/questionSchema';
import {
  useBulkCreateQuestionsMutation,
  useFetchBulkQuestionsMutation,
} from '../questions/questionsApi';
import {
  useGetSubjectsQuery,
  useGetTestByIdQuery,
  useGetTopicsBySubjectQuery,
  useUpdateTestMutation,
} from './testsApi';
import {
  addQuestion,
  removeQuestion,
  setQuestions,
  setStep,
  updateQuestion,
} from './testsSlice';
import type { RootState } from '@/app/store';
import type { Question } from '@/types';
import {
  getLabelById,
  resolveSubjectId,
  resolveTopicIds,
} from '@/utils/helpers';
import { computeExpectedTotalMarks } from '@/utils/marksUtils';

const emptyQuestionForm: QuestionFormValues = {
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
  explanation: '',
  difficulty: undefined,
  topic: '',
  sub_topic: '',
  media_url: '',
};

export default function AddQuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const localQuestions = useSelector(
    (state: RootState) => state.testsWizard.questions
  );

  const { data: test, isLoading } = useGetTestByIdQuery(id ?? '', {
    skip: !id,
  });
  const { data: subjects = [] } = useGetSubjectsQuery();
  const subjectId = test
    ? resolveSubjectId(test.subject, subjects)
    : '';
  const { data: topics = [] } = useGetTopicsBySubjectQuery(subjectId, {
    skip: !subjectId,
  });

  const [fetchBulk] = useFetchBulkQuestionsMutation();
  const [bulkCreate, { isLoading: saving }] = useBulkCreateQuestionsMutation();
  const [updateTest] = useUpdateTestMutation();
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: emptyQuestionForm,
  });

  useEffect(() => {
    dispatch(setStep(2));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setQuestions([]));
    const loadExisting = async () => {
      if (!test?.questions?.length) return;
      try {
        const fetched = await fetchBulk(test.questions).unwrap();
        dispatch(setQuestions(fetched));
      } catch {
        toast.error(MESSAGES.common.error);
      }
    };
    if (test) loadExisting();
  }, [id, test?.id, test?.questions, fetchBulk, dispatch]);

  const topicOptions = test
    ? resolveTopicIds(test.topics, topics).map((topicId) => ({
        value: topicId,
        label: getLabelById(topicId, topics),
      }))
    : [];

  const subTopicOptions =
    test?.sub_topics?.map((st) => ({ value: st, label: st })) ?? [];

  const questionsList =
    localQuestions.length > 0 ? localQuestions : [];

  const resetForm = () => {
    form.reset(emptyQuestionForm);
    setEditIndex(null);
  };

  const handleAddOrUpdate = (values: QuestionFormValues) => {
    if (!id) return;
    const question: Question = {
      type: 'mcq',
      question: values.question,
      option1: values.option1,
      option2: values.option2,
      option3: values.option3,
      option4: values.option4,
      correct_option: values.correct_option,
      explanation: values.explanation || undefined,
      difficulty: values.difficulty,
      topic: values.topic || undefined,
      sub_topic: values.sub_topic || undefined,
      media_url: values.media_url || undefined,
      test_id: id,
      subject: subjectId,
    };

    if (editIndex !== null) {
      dispatch(updateQuestion({ index: editIndex, question }));
    } else {
      dispatch(addQuestion(question));
    }
    resetForm();
  };

  const handleEdit = (index: number) => {
    const q = questionsList[index];
    form.reset({
      question: q.question,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correct_option: q.correct_option,
      explanation: q.explanation ?? '',
      difficulty: q.difficulty,
      topic: q.topic ?? '',
      sub_topic: q.sub_topic ?? '',
      media_url: q.media_url ?? '',
    });
    setEditIndex(index);
  };

  const handleSaveContinue = async () => {
    if (!id || !test) return;
    if (questionsList.length < 1) {
      toast.error(MESSAGES.question.minRequired);
      return;
    }

    if (questionsList.length !== test.total_questions) {
      toast.error(
        MESSAGES.validation.questionsCountMismatch(
          test.total_questions,
          questionsList.length
        )
      );
      return;
    }

    try {
      const payload = {
        questions: questionsList.map(({ id: _id, ...q }) => ({
          ...q,
          test_id: id,
          subject: subjectId,
          type: 'mcq' as const,
        })),
      };
      const created = await bulkCreate(payload).unwrap();
      const questionIds = created.map((q) => q.id!).filter(Boolean);
      const totalMarks = computeExpectedTotalMarks(
        test.correct_marks,
        questionIds.length
      );

      await updateTest({
        id,
        body: {
          questions: questionIds,
          total_questions: questionIds.length,
          total_marks: totalMarks,
        },
      }).unwrap();

      toast.success(MESSAGES.question.addSuccess);
      dispatch(setStep(3));
      navigate(`/tests/${id}/preview`);
    } catch {
      toast.error(MESSAGES.common.error);
    }
  };

  if (isLoading || !test) {
    return <LoadingSpinner className="py-20" />;
  }

  const subjectName = getLabelById(subjectId, subjects) || test.subject;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: test.name, href: `/tests/${id}/edit` },
          { label: MESSAGES.test.wizardStepQuestions },
        ]}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{MESSAGES.test.testInfo}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <p>
            <span className="font-medium">{MESSAGES.test.testName}:</span>{' '}
            {test.name}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.subject}:</span>{' '}
            {subjectName}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.difficulty}:</span>{' '}
            {test.difficulty}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.test.totalQuestions}:</span>{' '}
            {test.total_questions}
          </p>
          <p>
            <span className="font-medium">{MESSAGES.question.questionsList}:</span>{' '}
            {MESSAGES.question.progress(questionsList.length, test.total_questions)}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {editIndex !== null
              ? MESSAGES.question.updateQuestion
              : MESSAGES.question.addQuestion}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddOrUpdate)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{MESSAGES.question.questionText}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(['option1', 'option2', 'option3', 'option4'] as const).map(
                (opt, i) => (
                  <FormField
                    key={opt}
                    control={form.control}
                    name={opt}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {MESSAGES.question.optionLabel(i + 1)}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}
              <FormField
                control={form.control}
                name="correct_option"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.question.correctOption}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={MESSAGES.question.selectCorrect} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['option1', 'option2', 'option3', 'option4'] as const).map(
                          (opt, i) => (
                            <SelectItem key={opt} value={opt}>
                              {MESSAGES.question.optionLabel(i + 1)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{MESSAGES.question.explanation}</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.difficulty}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={MESSAGES.test.selectDifficulty} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">{MESSAGES.test.difficultyEasy}</SelectItem>
                        <SelectItem value="medium">{MESSAGES.test.difficultyMedium}</SelectItem>
                        <SelectItem value="hard">{MESSAGES.test.difficultyHard}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.question.topic}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={MESSAGES.question.selectTopic} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topicOptions.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sub_topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.question.subTopic}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={MESSAGES.question.selectSubTopic} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subTopicOptions.map((st) => (
                          <SelectItem key={st.value} value={st.value}>
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{MESSAGES.question.mediaUrl}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">
                  {editIndex !== null
                    ? MESSAGES.question.updateQuestion
                    : MESSAGES.question.addQuestion}
                </Button>
                {editIndex !== null && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {MESSAGES.question.cancelEdit}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{MESSAGES.question.questionsList}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questionsList.length === 0 ? (
            <p className="text-sm text-muted-foreground">{MESSAGES.common.noData}</p>
          ) : (
            questionsList.map((q, index) => (
              <div
                key={`${q.id ?? index}-${q.question}`}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">
                    {index + 1}. {q.question}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {MESSAGES.question.correctOption}: {q.correct_option}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(index)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => dispatch(removeQuestion(index))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSaveContinue} disabled={saving} className="w-full sm:w-auto">
        {saving ? <LoadingSpinner className="py-0" /> : MESSAGES.question.saveContinue}
      </Button>
    </div>
  );
}
