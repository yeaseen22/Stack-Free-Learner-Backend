export type TPerformanceItem = {
  course: { _id: string; title: string };
  batch: { number: number };
  assignmentSubmissionIds: string[];
  quizSubmissionIds: string[];
  assignmentTotal: number;
  quizTotal: number;
  stone: number;
  totalMark: number;
  profileLevels: any[];
  comparison?: {
    assignment: string;
    quiz: string;
    stone: string;
    totalMark: string;
  };
};
