import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers3,
  LockKeyhole,
} from 'lucide-react';
import type { ContentDTO } from '@/shared/contracts';
import {
  examRegistry,
  getExamPath,
  type ExamPath,
  type SessionPath,
  type SubjectPath,
} from '@/shared/exam-registry';
import { getTopicDefinition } from '@/shared/topic-registry';

function examHref(exam: ExamPath) {
  return `/sinav/${exam.id}`;
}

function sessionHref(exam: ExamPath, session: SessionPath) {
  return `${examHref(exam)}/${session.id}`;
}

function subjectPath(exam: ExamPath, session: SessionPath, subject: SubjectPath) {
  return `${sessionHref(exam, session)}/${subject.id}`;
}

function availableTopics(subject: SubjectPath, content?: readonly ContentDTO[]) {
  return subject.topicIds.flatMap((topicId) => {
    const definition = getTopicDefinition(topicId);
    if (!definition) return [];
    const record = content?.find((item) => item.kind === 'topic' && item.logical_id === topicId);
    if (content && record?.status !== 'published') return [];
    return [{ definition, record }];
  });
}

function NavigationTrail({
  rootHref,
  exam,
  session,
  subject,
}: {
  rootHref: string;
  exam?: ExamPath;
  session?: SessionPath;
  subject?: SubjectPath;
}) {
  return (
    <nav className="exam-trail" aria-label="Sınav yolu">
      <Link href={rootHref}>Sınavlar</Link>
      {exam && <><ChevronRight size={14}/><Link href={examHref(exam)}>{exam.title}</Link></>}
      {session && exam && <><ChevronRight size={14}/><Link href={sessionHref(exam, session)}>{session.title}</Link></>}
      {subject && <><ChevronRight size={14}/><span aria-current="page">{subject.title}</span></>}
    </nav>
  );
}

function SessionSwitcher({ exam, current }: { exam: ExamPath; current?: SessionPath }) {
  if (exam.sessions.length < 2) return null;
  return (
    <nav className="session-switcher" aria-label={`${exam.title} oturumları`}>
      {exam.sessions.map((session) => (
        <Link
          key={session.id}
          href={sessionHref(exam, session)}
          className={current?.id === session.id ? 'active' : ''}
          aria-current={current?.id === session.id ? 'page' : undefined}
        >
          <span>{session.title}</span>
          <small>{session.description}</small>
        </Link>
      ))}
    </nav>
  );
}

function ExamLanding({ onExamSelect }: { onExamSelect?: (exam: ExamPath) => void }) {
  return (
    <div className="journey-landing">
      <header className="journey-hero">
        <span className="eyebrow">KENDİ ROTANI OLUŞTUR</span>
        <h1>Hangi sınava hazırlanıyorsun?</h1>
        <p>Önce sınavını seç. Oturum, ders ve konu adımlarında ilerlerken seçimin kaybolmaz.</p>
      </header>
      <div className="exam-choice-grid exam-entry-grid">
        {[...examRegistry.values()].map((exam) => exam.availability === 'active' ? (
          <Link
            className="card exam-choice exam-choice-active"
            key={exam.id}
            href={examHref(exam)}
            onClick={onExamSelect ? (event) => {
              event.preventDefault();
              onExamSelect(exam);
            } : undefined}
          >
            <span className="exam-choice-icon"><GraduationCap size={27}/></span>
            <div>
              <span className="exam-availability">KULLANIMA AÇIK</span>
              <h2>{exam.title}</h2>
              <p>{exam.description}</p>
              <small>{exam.sessions.map((entry) => entry.title).join(' · ')}</small>
            </div>
            <ArrowRight size={21}/>
          </Link>
        ) : (
          <article className="card exam-choice exam-choice-disabled" key={exam.id} aria-disabled="true">
            <span className="exam-choice-icon"><LockKeyhole size={25}/></span>
            <div>
              <span className="exam-availability">YAKINDA</span>
              <h2>{exam.title}</h2>
              <p>{exam.description}</p>
              <small>İçerik hazırlığı sürüyor</small>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ExamQuickStart() {
  return <ExamNavigationPage segments={[]}/>;
}

export function ExamNavigationPage({
  segments,
  content,
  rootHref = '/konular',
  onExamSelect,
}: {
  segments: readonly string[];
  content?: readonly ContentDTO[];
  rootHref?: string;
  onExamSelect?: (exam: ExamPath) => void;
}) {
  const [examId, sessionId, subjectId, extra] = segments;
  const exam = examId ? getExamPath(examId) : undefined;
  const session = exam?.sessions.find((item) => item.id === sessionId);
  const subject = session?.subjects.find((item) => item.id === subjectId);

  if (!examId) return <ExamLanding onExamSelect={onExamSelect}/>;

  if (
    extra ||
    !exam ||
    exam.availability !== 'active' ||
    (sessionId && !session) ||
    (subjectId && !subject)
  ) {
    return (
      <section className="card exam-empty">
        <BookOpen size={30}/>
        <h1>Bu öğrenme yolu henüz açık değil.</h1>
        <p>Aktif sınavlardan birini seçerek devam edebilirsin.</p>
        <Link className="button" href={rootHref}>Sınavları gör <ArrowRight size={17}/></Link>
      </section>
    );
  }

  if (!session) {
    return (
      <div className="exam-navigation">
        <NavigationTrail rootHref={rootHref} exam={exam}/>
        <header className="exam-page-heading">
          <span className="eyebrow">{exam.title} / OTURUMLAR</span>
          <h1>Hangi oturumla devam edeceksin?</h1>
          <p>{exam.description} TYT ve AYT arasında istediğin zaman geçiş yapabilirsin.</p>
        </header>
        <div className="exam-choice-grid">
          {exam.sessions.map((item) => (
            <Link className="card exam-choice" key={item.id} href={sessionHref(exam, item)}>
              <span className="exam-choice-icon"><Layers3 size={26}/></span>
              <div><h2>{item.title}</h2><p>{item.description}</p><small>{item.subjects.length} ders</small></div>
              <ArrowRight size={20}/>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="exam-navigation">
        <NavigationTrail rootHref={rootHref} exam={exam} session={session}/>
        <SessionSwitcher exam={exam} current={session}/>
        <header className="exam-page-heading">
          <span className="eyebrow">{exam.title} / {session.title}</span>
          <h1>Dersini seç.</h1>
          <p>{session.description} kapsamındaki derslerden birini aç.</p>
        </header>
        <div className="exam-subject-grid">
          {session.subjects.map((item) => {
            const count = availableTopics(item, content).length;
            return (
              <Link className="card exam-subject" key={item.id} href={subjectPath(exam, session, item)}>
                <span className="exam-subject-icon"><BookOpen size={22}/></span>
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
                <span className="exam-subject-count">{count ? `${count} konu` : 'Yakında'}</span>
                <ChevronRight size={18}/>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const topics = availableTopics(subject, content);
  return (
    <div className="exam-navigation">
      <NavigationTrail rootHref={rootHref} exam={exam} session={session} subject={subject}/>
      <SessionSwitcher exam={exam} current={session}/>
      <header className="exam-page-heading">
        <span className="eyebrow">{exam.title} / {session.title} / {subject.title.toLocaleUpperCase('tr')}</span>
        <h1>{subject.title} konuları</h1>
        <p>Bir konuya başladığında kartların, testlerin ve ilerlemen hesabında kalır.</p>
      </header>
      {topics.length ? (
        <div className="exam-topic-grid">
          {topics.map(({ definition, record }) => (
            <Link className="card exam-topic" key={definition.id} href={`/konu/${definition.id}`}>
              <span className="exam-topic-label">{session.title} · {subject.title}{record?.demo ? ' · Demo' : ''}</span>
              <h2>{record?.title ?? definition.title}</h2>
              <p>{record?.payload.description ?? `${definition.title} öğrenme modülünü aç.`}</p>
              <span className="exam-topic-open">Konuya başla <ArrowRight size={17}/></span>
            </Link>
          ))}
        </div>
      ) : (
        <section className="card exam-empty">
          <BookOpen size={30}/>
          <h2>Bu derste henüz yayımlanmış konu yok.</h2>
          <p>Yeni konular hazırlandığında burada görünecek. Diğer oturuma veya derse geçebilirsin.</p>
          <Link className="button secondary" href={sessionHref(exam, session)}>Derslere dön <ArrowRight size={17}/></Link>
        </section>
      )}
    </div>
  );
}
