import {
  examRegistry,
  getExamPath,
  getExamPathByContentId,
  type ExamPath,
  type SessionPath,
  type SubjectPath,
} from '@/shared/exam-registry';

export type LearningPathSelection = {
  exam: ExamPath;
  session?: SessionPath;
  subject?: SubjectPath;
  topicId?: string;
  path: string;
};

export function findTopicPlacement(topicId: string, preferredExamId?: string): LearningPathSelection | undefined {
  const exams = [...examRegistry.values()].sort((exam) => Number(exam.id !== preferredExamId));
  for (const exam of exams) {
    for (const session of exam.sessions) {
      for (const subject of session.subjects) {
        if (subject.topicIds.includes(topicId)) {
          return {
            exam,
            session,
            subject,
            topicId,
            path: `/konu/${topicId}`,
          };
        }
      }
    }
  }
}

export function learningPathFromPathname(pathname: string): LearningPathSelection | undefined {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'konu' && segments[1]) return findTopicPlacement(segments[1]);
  if (segments[0] !== 'sinav' || !segments[1]) return undefined;

  const exam = getExamPath(segments[1]);
  if (!exam || exam.availability !== 'active') return undefined;
  const session = exam.sessions.find((item) => item.id === segments[2]);
  const subject = session?.subjects.find((item) => item.id === segments[3]);
  return { exam, session, subject, path: pathname };
}

export function learningPathForUser(contentExamId: string | null | undefined) {
  return getExamPathByContentId(contentExamId);
}

export function subjectHref(selection: Pick<LearningPathSelection, 'exam' | 'session' | 'subject'>) {
  if (!selection.session || !selection.subject) return `/sinav/${selection.exam.id}`;
  return `/sinav/${selection.exam.id}/${selection.session.id}/${selection.subject.id}`;
}

export function journeyLabel(selection: LearningPathSelection | undefined) {
  if (!selection) return 'Sınav yolun';
  return [selection.exam.title, selection.session?.title, selection.subject?.title]
    .filter(Boolean)
    .join(' · ');
}
