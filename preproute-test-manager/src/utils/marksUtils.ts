/** Maximum marks if every question is answered correctly. */
export const computeExpectedTotalMarks = (
  correctMarks: number,
  totalQuestions: number
): number => correctMarks * totalQuestions;

export const isValidTotalMarks = (
  totalMarks: number,
  correctMarks: number,
  totalQuestions: number
): boolean =>
  totalMarks === computeExpectedTotalMarks(correctMarks, totalQuestions);
