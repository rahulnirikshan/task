import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import testsReducer from '../features/tests/testsSlice';
import { testsApi } from '../features/tests/testsApi';
import { questionsApi } from '../features/questions/questionsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    testsWizard: testsReducer,
    [testsApi.reducerPath]: testsApi.reducer,
    [questionsApi.reducerPath]: questionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      testsApi.middleware,
      questionsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
