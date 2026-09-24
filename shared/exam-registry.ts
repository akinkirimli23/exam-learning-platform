import type { TopicDefinition } from '@/shared/topic-engine';
import { topicRegistry } from '@/shared/topic-registry';

export type SubjectPath = {
  id: string;
  title: string;
  description: string;
  topicIds: readonly string[];
};

export type SessionPath = {
  id: string;
  title: string;
  description: string;
  subjects: readonly SubjectPath[];
};

export type ExamPath = {
  id: string;
  contentExamId?: string;
  title: string;
  description: string;
  availability: 'active' | 'coming-soon';
  sessions: readonly SessionPath[];
};

function assertUniqueIds(items: readonly { id: string }[], location: string) {
  const ids = new Set<string>();
  for (const item of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) {
      throw new Error(`${location}: invalid path id '${item.id}'`);
    }
    if (ids.has(item.id)) throw new Error(`${location}: duplicate path id '${item.id}'`);
    ids.add(item.id);
  }
}

export function createExamRegistry(
  exams: readonly ExamPath[],
  topics: ReadonlyMap<string, TopicDefinition>,
): ReadonlyMap<string, ExamPath> {
  assertUniqueIds(exams, 'exams');
  for (const exam of exams) {
    assertUniqueIds(exam.sessions, exam.id);
    for (const session of exam.sessions) {
      assertUniqueIds(session.subjects, `${exam.id}/${session.id}`);
      for (const subject of session.subjects) {
        const seen = new Set<string>();
        for (const topicId of subject.topicIds) {
          const topic = topics.get(topicId);
          if (!topic) throw new Error(`${exam.id}/${session.id}/${subject.id}: unknown topic '${topicId}'`);
          if (topic.subjectId !== subject.id) {
            throw new Error(`${exam.id}/${session.id}/${subject.id}: topic '${topicId}' belongs to '${topic.subjectId}'`);
          }
          if (seen.has(topicId)) throw new Error(`${exam.id}/${session.id}/${subject.id}: duplicate topic '${topicId}'`);
          seen.add(topicId);
        }
      }
    }
  }
  return new Map(exams.map((exam) => [exam.id, exam]));
}

// Topic IDs are references to one canonical TopicDefinition and one published content record.
// A topic may be listed in multiple sessions without copying its quiz, media or progress.
export const examRegistry = createExamRegistry([
  {
    id: 'yks',
    contentExamId: 'yks-2026',
    title: 'YKS',
    description: 'Üniversite sınavına kendi sıranla hazırlan.',
    availability: 'active',
    sessions: [
      {
        id: 'tyt',
        title: 'TYT',
        description: 'Temel Yeterlilik Testi',
        subjects: [
          { id: 'turkce', title: 'Türkçe', description: 'Anlam, dil ve yorumlama', topicIds: [] },
          { id: 'matematik', title: 'Matematik', description: 'Temel matematik', topicIds: [] },
          { id: 'tarih', title: 'Tarih', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'cografya', title: 'Coğrafya', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'felsefe', title: 'Felsefe', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'din-kulturu', title: 'Din Kültürü', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'fizik', title: 'Fizik', description: 'Fen bilimleri', topicIds: ['buoyancy'] },
          { id: 'kimya', title: 'Kimya', description: 'Fen bilimleri', topicIds: [] },
          { id: 'biyoloji', title: 'Biyoloji', description: 'Fen bilimleri', topicIds: [] },
        ],
      },
      {
        id: 'ayt',
        title: 'AYT',
        description: 'Alan Yeterlilik Testleri',
        subjects: [
          { id: 'edebiyat', title: 'Türk Dili ve Edebiyatı', description: 'Edebiyat ve yorumlama', topicIds: [] },
          { id: 'matematik', title: 'Matematik', description: 'Alan matematiği', topicIds: [] },
          { id: 'tarih', title: 'Tarih', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'cografya', title: 'Coğrafya', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'felsefe', title: 'Felsefe', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'din-kulturu', title: 'Din Kültürü', description: 'Sosyal bilimler', topicIds: [] },
          { id: 'fizik', title: 'Fizik', description: 'Fen bilimleri', topicIds: [] },
          { id: 'kimya', title: 'Kimya', description: 'Fen bilimleri', topicIds: [] },
          { id: 'biyoloji', title: 'Biyoloji', description: 'Fen bilimleri', topicIds: [] },
        ],
      },
    ],
  },
  {
    id: 'lgs',
    title: 'LGS',
    description: 'Ortaöğretime geçiş hazırlığı',
    availability: 'coming-soon',
    sessions: [],
  },
  {
    id: 'kpss',
    title: 'KPSS',
    description: 'Kamu personeli sınavı hazırlığı',
    availability: 'coming-soon',
    sessions: [],
  },
], topicRegistry);

export function getExamPath(examId: string) {
  return examRegistry.get(examId);
}

export function getExamPathByContentId(contentExamId: string | null | undefined) {
  if (!contentExamId) return undefined;
  return [...examRegistry.values()].find((exam) => exam.contentExamId === contentExamId);
}
