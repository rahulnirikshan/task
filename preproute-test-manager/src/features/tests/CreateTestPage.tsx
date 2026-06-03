import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DraftInfoBanner } from '@/components/DraftInfoBanner';
import { MarksHint } from '@/components/MarksHint';
import { MultiSelect } from '@/components/MultiSelect';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { computeExpectedTotalMarks } from '@/utils/marksUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent } from '@/components/ui/card';
import { MESSAGES } from '@/constants/messages';
import { testSchema, type TestFormValues } from '@/validations/testSchema';
import {
  useCreateTestMutation,
  useGetSubjectsQuery,
  useGetTestByIdQuery,
  useGetTopicsBySubjectQuery,
  useGetSubTopicsByTopicsMutation,
  useUpdateTestMutation,
} from './testsApi';
import { setCurrentTest, setStep } from './testsSlice';
import {
  resolveSubjectId,
  resolveSubTopicIds,
  resolveTopicIds,
} from '@/utils/helpers';
import type { TestType } from '@/types';

const defaultValues: TestFormValues = {
  name: '',
  type: 'practice',
  subject: '',
  topics: [],
  sub_topics: [],
  difficulty: 'easy',
  correct_marks: 4,
  wrong_marks: -1,
  unattempt_marks: 0,
  total_time: 60,
  total_marks: 100,
  total_questions: 25,
};

export default function CreateTestPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: existingTest,
    isLoading: loadingTest,
    isError: loadError,
  } = useGetTestByIdQuery(id ?? '', { skip: !id });
  const formInitialized = useRef(false);
  const topicsHydrated = useRef(false);
  const subTopicsHydrated = useRef(false);
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [createTest, { isLoading: creating }] = useCreateTestMutation();
  const [updateTest, { isLoading: updating }] = useUpdateTestMutation();
  const [fetchSubTopics, { data: subTopics = [] }] =
    useGetSubTopicsByTopicsMutation();

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues,
  });

  const subjectId = form.watch('subject');
  const selectedTopics = form.watch('topics');
  const correctMarks = form.watch('correct_marks');
  const totalQuestions = form.watch('total_questions');

  const { data: topics = [], isFetching: loadingTopics } =
    useGetTopicsBySubjectQuery(subjectId, { skip: !subjectId });

  useEffect(() => {
    if (selectedTopics.length > 0) {
      fetchSubTopics(selectedTopics);
    }
  }, [selectedTopics, fetchSubTopics]);

  useEffect(() => {
    if (correctMarks > 0 && totalQuestions > 0) {
      const expected = computeExpectedTotalMarks(correctMarks, totalQuestions);
      const current = form.getValues('total_marks');
      if (current !== expected) {
        form.setValue('total_marks', expected, { shouldValidate: true });
      }
    }
  }, [correctMarks, totalQuestions, form]);

  useEffect(() => {
    if (loadError && isEdit) {
      toast.error(MESSAGES.test.editLoadError);
      navigate('/dashboard');
    }
  }, [loadError, isEdit, navigate]);

  useEffect(() => {
    if (!isEdit) {
      formInitialized.current = false;
      topicsHydrated.current = false;
      subTopicsHydrated.current = false;
      return;
    }
    if (!existingTest || subjects.length === 0 || formInitialized.current) return;

    const resolvedSubject = resolveSubjectId(existingTest.subject, subjects);
    form.reset({
      name: existingTest.name,
      type: existingTest.type,
      subject: resolvedSubject,
      topics: [],
      sub_topics: [],
      difficulty: existingTest.difficulty,
      correct_marks: existingTest.correct_marks,
      wrong_marks: existingTest.wrong_marks,
      unattempt_marks: existingTest.unattempt_marks,
      total_time: existingTest.total_time,
      total_marks: existingTest.total_marks,
      total_questions: existingTest.total_questions,
    });
    formInitialized.current = true;
    dispatch(setCurrentTest({ id: existingTest.id, data: existingTest }));
    dispatch(setStep(1));
  }, [existingTest, isEdit, subjects, form, dispatch]);

  useEffect(() => {
    if (!isEdit || !existingTest || topics.length === 0 || topicsHydrated.current)
      return;
    const topicIds = resolveTopicIds(existingTest.topics, topics);
    if (topicIds.length > 0) {
      form.setValue('topics', topicIds);
      fetchSubTopics(topicIds);
      topicsHydrated.current = true;
    }
  }, [existingTest, isEdit, topics, form, fetchSubTopics]);

  useEffect(() => {
    if (
      !isEdit ||
      !existingTest?.sub_topics?.length ||
      subTopics.length === 0 ||
      subTopicsHydrated.current
    )
      return;
    const subTopicIds = resolveSubTopicIds(existingTest.sub_topics, subTopics);
    form.setValue('sub_topics', subTopicIds);
    subTopicsHydrated.current = true;
  }, [existingTest, isEdit, subTopics, form]);

  const topicOptions = useMemo(
    () => topics.map((t) => ({ value: t.id, label: t.name })),
    [topics]
  );

  const subTopicOptions = useMemo(
    () => subTopics.map((st) => ({ value: st.id, label: st.name })),
    [subTopics]
  );

  const isSaving = creating || updating;

  const saveTest = async (
    values: TestFormValues,
    goNext: boolean
  ) => {
    try {
      const payload = {
        ...values,
        status: 'draft' as const,
        sub_topics: values.sub_topics ?? [],
      };

      let testId = id;
      if (isEdit && id) {
        await updateTest({ id, body: payload }).unwrap();
        toast.success(
          goNext ? MESSAGES.test.updateSuccess : MESSAGES.test.saveDraftSuccess
        );
        testId = id;
      } else {
        const created = await createTest(payload).unwrap();
        testId = created.id;
        toast.success(
          goNext ? MESSAGES.test.createSuccess : MESSAGES.test.saveDraftSuccess
        );
      }

      if (testId) {
        dispatch(setCurrentTest({ id: testId, data: payload }));
        if (goNext) {
          dispatch(setStep(2));
          navigate(`/tests/${testId}/questions`);
        }
      }
    } catch {
      toast.error(MESSAGES.common.error);
    }
  };

  const handleSubjectChange = (value: string) => {
    form.setValue('subject', value);
    form.setValue('topics', []);
    form.setValue('sub_topics', []);
  };

  const handleTopicsChange = (value: string[]) => {
    form.setValue('topics', value);
    form.setValue('sub_topics', []);
    if (value.length > 0) fetchSubTopics(value);
  };

  if (isEdit && (loadingTest || !existingTest || subjects.length === 0)) {
    return <LoadingSpinner className="py-20" />;
  }

  const testName = form.watch('name') || existingTest?.name || MESSAGES.test.wizardStepDetails;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: testName },
          { label: MESSAGES.test.wizardStepDetails },
        ]}
      />
      <DraftInfoBanner />
      <Card className="overflow-visible">
        <CardContent className="overflow-visible pt-6">
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{MESSAGES.test.testName}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.testType}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={MESSAGES.test.selectType} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          [
                            ['practice', MESSAGES.test.typePractice],
                            ['exam', MESSAGES.test.typeExam],
                            ['mock', MESSAGES.test.typeMock],
                          ] as [TestType, string][]
                        ).map(([val, label]) => (
                          <SelectItem key={val} value={val}>
                            {label}
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
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.subject}</FormLabel>
                    <Select
                      onValueChange={handleSubjectChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={MESSAGES.test.selectSubject} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
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
                name="topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.topics}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={topicOptions}
                        value={field.value}
                        onChange={handleTopicsChange}
                        placeholder={MESSAGES.test.selectTopics}
                        disabled={!subjectId || loadingTopics}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sub_topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.subTopics}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={subTopicOptions}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder={MESSAGES.test.selectSubTopics}
                        disabled={selectedTopics.length === 0}
                      />
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="correct_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.correctMarks}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wrong_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.wrongMarks}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unattempt_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.unattemptMarks}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.totalTime}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_questions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.totalQuestions}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MESSAGES.test.totalMarks}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        readOnly
                        className="bg-muted/50"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <MarksHint
                      correctMarks={correctMarks}
                      totalQuestions={totalQuestions}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 pt-4 md:col-span-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSaving}
                  onClick={form.handleSubmit((v) => saveTest(v, false))}
                >
                  {isSaving ? <LoadingSpinner className="py-0" /> : MESSAGES.test.saveDraft}
                </Button>
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={form.handleSubmit((v) => saveTest(v, true))}
                >
                  {MESSAGES.test.nextQuestions}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
