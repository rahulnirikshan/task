import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axiosClient from './axiosClient';
import type { ApiEnvelope } from '../types';

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: AxiosRequestConfig['params'];
};

type AxiosBaseQueryError = {
  status?: number;
  data?: string;
};

export const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  AxiosBaseQueryError
> = async ({ url, method = 'GET', data, params }) => {
  try {
    const result = await axiosClient({ url, method, data, params });
    const body = result.data as ApiEnvelope<unknown>;
    if (body.status === 'success') {
      return { data: body.data };
    }
    return {
      error: {
        status: result.status,
        data: body.message ?? 'Request failed',
      },
    };
  } catch (axiosError) {
    const err = axiosError as AxiosError<{ message?: string; status?: string }>;
    const message =
      err.response?.data?.message ??
      (err.response?.status === 404
        ? `API route not found (${method} ${url}). Restart dev server if using proxy.`
        : err.message);
    return {
      error: {
        status: err.response?.status,
        data: message,
      },
    };
  }
};
