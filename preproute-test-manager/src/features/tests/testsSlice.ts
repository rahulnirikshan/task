import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Question, Test } from '../../types';

interface TestsState {
  currentTestId: string | null;
  currentTestData: Partial<Test> | null;
  questions: Question[];
  step: 1 | 2 | 3;
}

const initialState: TestsState = {
  currentTestId: null,
  currentTestData: null,
  questions: [],
  step: 1,
};

const testsSlice = createSlice({
  name: 'testsWizard',
  initialState,
  reducers: {
    setCurrentTest: (
      state,
      action: PayloadAction<{ id: string; data: Partial<Test> }>
    ) => {
      state.currentTestId = action.payload.id;
      state.currentTestData = action.payload.data;
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    addQuestion: (state, action: PayloadAction<Question>) => {
      state.questions.push(action.payload);
    },
    removeQuestion: (state, action: PayloadAction<number>) => {
      state.questions.splice(action.payload, 1);
    },
    updateQuestion: (
      state,
      action: PayloadAction<{ index: number; question: Question }>
    ) => {
      state.questions[action.payload.index] = action.payload.question;
    },
    resetWizard: () => initialState,
    setStep: (state, action: PayloadAction<1 | 2 | 3>) => {
      state.step = action.payload;
    },
  },
});

export const {
  setCurrentTest,
  setQuestions,
  addQuestion,
  removeQuestion,
  updateQuestion,
  resetWizard,
  setStep,
} = testsSlice.actions;
export default testsSlice.reducer;
