import { z } from 'zod';

export const mistakeReasonValues = [
  'concept-gap',
  'calculation-error',
  'misread-question',
  'attention',
  'time',
] as const;

export const mistakeReasonSchema = z.enum(mistakeReasonValues);
export type MistakeReason = z.infer<typeof mistakeReasonSchema>;

export const mistakeReasonLabels: Record<MistakeReason, string> = {
  'concept-gap': 'Kavram eksiği',
  'calculation-error': 'İşlem hatası',
  'misread-question': 'Soruyu yanlış yorumlama',
  attention: 'Dikkat',
  time: 'Süre',
};

const customTagSchema = z.string().trim().min(1).max(32);

export const mistakeUpdateSchema = z.object({
  reason: mistakeReasonSchema,
  customTags: z.array(customTagSchema).max(8).transform((tags) => [...new Set(tags)]),
  note: z.string().trim().max(1000),
  resolved: z.boolean(),
});

export const mistakeCaptureSchema = z.object({
  topicId: z.string().min(1).max(120),
  questionId: z.string().min(1).max(160),
  source: z.enum(['question-bank', 'past-exam']),
  selectedAnswer: z.number().int().min(0).nullable(),
});

export type MistakeNotebookItem = {
  id: string;
  topicId: string;
  questionId: string;
  attemptId: string | null;
  source: 'attempt' | 'question-bank' | 'past-exam';
  question: {
    text: string;
    options: string[];
    correctAnswer: number;
    selectedAnswer: number | null;
    conceptId: string;
    difficulty: string;
  };
  suggestedReason: MistakeReason;
  reason: MistakeReason;
  customTags: string[];
  note: string;
  wrongCount: number;
  resolved: boolean;
  createdAt: string;
  lastWrongAt: string;
  updatedAt: string;
};

export type MistakeNotebookResponse = {
  items: MistakeNotebookItem[];
  summary: {
    totalOpen: number;
    totalEvents: number;
    byReason: Array<{ reason: MistakeReason; count: number }>;
    byTopic: Array<{ topicId: string; count: number }>;
  };
};
