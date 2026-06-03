import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';
import type { BulkQuestionsRequest, Question } from '../../types';

export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    bulkCreateQuestions: builder.mutation<Question[], BulkQuestionsRequest>({
      query: (body) => ({
        url: '/questions/bulk',
        method: 'POST',
        data: body,
      }),
    }),
    fetchBulkQuestions: builder.mutation<Question[], string[]>({
      query: (questionIds) => ({
        url: '/questions/fetchBulk',
        method: 'POST',
        data: { question_ids: questionIds },
      }),
    }),
  }),
});

export const {
  useBulkCreateQuestionsMutation,
  useFetchBulkQuestionsMutation,
} = questionsApi;
