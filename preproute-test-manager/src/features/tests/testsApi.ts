import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';
import type { Subject, SubTopic, Test, Topic } from '../../types';
import type { TestFormValues } from '../../validations/testSchema';
import { mapAppTestTypeToApi, normalizeTest } from '../../utils/helpers';

type CreateTestBody = TestFormValues & { status?: Test['status'] };
type UpdateTestBody = Partial<Test> & Record<string, unknown>;

export const testsApi = createApi({
  reducerPath: 'testsApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Tests', 'Test'],
  endpoints: (builder) => ({
    getTests: builder.query<Test[], void>({
      query: () => ({ url: '/tests', method: 'GET' }),
      transformResponse: (response: unknown) =>
        (response as Record<string, unknown>[]).map((item) =>
          normalizeTest(item)
        ),
      providesTags: ['Tests'],
    }),
    getTestById: builder.query<Test, string>({
      query: (id) => ({ url: `/tests/${id}`, method: 'GET' }),
      transformResponse: (response: unknown) =>
        normalizeTest(response as Record<string, unknown>),
      providesTags: (_result, _error, id) => [{ type: 'Test', id }],
    }),
    createTest: builder.mutation<Test, CreateTestBody>({
      query: (body) => ({
        url: '/tests',
        method: 'POST',
        data: {
          ...body,
          type: mapAppTestTypeToApi(body.type),
          status: body.status === null || body.status === 'draft' ? 'draft' : body.status,
          sub_topics: body.sub_topics ?? [],
        },
      }),
      transformResponse: (response: unknown) =>
        normalizeTest(response as Record<string, unknown>),
      invalidatesTags: ['Tests'],
    }),
    updateTest: builder.mutation<
      Test,
      { id: string; body: UpdateTestBody }
    >({
      query: ({ id, body }) => {
        const data: Record<string, unknown> = { ...body };
        if (
          typeof data.type === 'string' &&
          ['practice', 'exam', 'mock'].includes(data.type)
        ) {
          data.type = mapAppTestTypeToApi(data.type as Test['type']);
        }
        if (data.status === null) {
          data.status = 'draft';
        }
        return {
          url: `/tests/${id}`,
          method: 'PUT',
          data,
        };
      },
      transformResponse: (response: unknown) =>
        normalizeTest(response as Record<string, unknown>),
      invalidatesTags: (_result, _error, { id }) => [
        'Tests',
        { type: 'Test', id },
      ],
    }),
    deleteTest: builder.mutation<void, string>({
      query: (id) => ({ url: `/tests/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tests'],
    }),
    getSubjects: builder.query<Subject[], void>({
      query: () => ({ url: '/subjects', method: 'GET' }),
    }),
    getTopicsBySubject: builder.query<Topic[], string>({
      query: (subjectId) => ({
        url: `/topics/subject/${subjectId}`,
        method: 'GET',
      }),
    }),
    getSubTopicsByTopics: builder.mutation<SubTopic[], string[]>({
      query: (topicIds) => ({
        url: '/sub-topics/multi-topics',
        method: 'POST',
        data: { topicIds },
      }),
    }),
    publishTest: builder.mutation<Test, string>({
      query: (id) => ({
        url: `/tests/${id}`,
        method: 'PUT',
        data: { status: 'live' },
      }),
      transformResponse: (response: unknown) =>
        normalizeTest(response as Record<string, unknown>),
      invalidatesTags: ['Tests'],
    }),
  }),
});

export const {
  useGetTestsQuery,
  useGetTestByIdQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useGetSubjectsQuery,
  useGetTopicsBySubjectQuery,
  useGetSubTopicsByTopicsMutation,
  usePublishTestMutation,
} = testsApi;
