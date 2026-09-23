import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, Layers3 } from 'lucide-react';
import type { ContentDTO } from '@/shared/contracts';
import { examRegistry, getExamPath, type ExamPath, type SessionPath, type SubjectPath } from '@/shared/exam-registry';
import { getTopicDefinition } from '@/shared/topic-registry';

function examHref(exam: ExamPath) {
  return `/sinav/${exam.id}`;
}

function sessionHref(exam: ExamPath, session: SessionPath) {
  return `${examHref(exam)}/${session.id}`;
}

function subjectHref(exam: ExamPath, session: SessionPath, subject: SubjectPath) {
  return `${sessionHref(exam, session)}/${subject.id}`;
}

function publishedTopics(subject: SubjectPath, content: readonly ContentDTO[]) {
  return subject.topicIds.flatMap((topicId) => {
    const definition = getTopicDefinition(topicId);
    const record = content.find((item) => item.kind === 'topic' && item.logical_id === topicId);
    return definition && record?.status === 'published' ? [{ definition, record }] : [];
  });
}

function NavigationTrail({ exam, session, subject }: {
  exam?: ExamPath;
  session?: SessionPath;
  subject?: SubjectPath;
}) {
  return <nav className="exam-trail" aria-label="Sınav yolu">
    <Link href="/konular">Sınavlar</Link>
    {exam && <><ChevronRight size={14}/><Link href={examHref(exam)}>{exam.title}</Link></>}
    {session && exam && <><ChevronRight size={14}/><Link href={sessionHref(exam, session)}>{session.title}</Link></>}
    {subject && <><ChevronRight size={14}/><span aria-current="page">{subject.title}</span></>}
  </nav>;
}

export function ExamQuickStart() {
  const exams = [...examRegistry.values()];
  return <section className="exam-start" aria-labelledby="exam-start-title">
    <div>
      <span className="eyebrow">ÖĞRENME YOLUN</span>
      <h2 id="exam-start-title">Hangi sınava hazırlanıyorsun?</h2>
      <p>Sınavı seç, ardından oturum ve ders üzerinden konulara ulaş.</p>
    </div>
    <div className="exam-start-options">
      {exams.map((exam) => <Link className="exam-start-link" key={exam.id} href={examHref(exam)}>
        <span className="exam-start-icon"><GraduationCap size={24}/></span>
        <span><strong>{exam.title}</strong><small>{exam.sessions.map((session) => session.title).join(' · ')}</small></span>
        <ArrowRight size={20}/>
      </Link>)}
    </div>
  </section>;
}

export function ExamNavigationPage({ segments, content }: {
  segments: readonly string[];
  content: readonly ContentDTO[];
}) {
  const [examId, sessionId, subjectId, extra] = segments;
  const exam = examId ? getExamPath(examId) : undefined;
  const session = exam?.sessions.find((item) => item.id === sessionId);
  const subject = session?.subjects.find((item) => item.id === subjectId);

  if (extra || (examId && !exam) || (sessionId && !session) || (subjectId && !subject)) {
    return <section className="card exam-empty"><BookOpen size={30}/><h1>Bu öğrenme yolu bulunamadı.</h1><p>Sınav listesinden devam edebilirsin.</p><Link className="button" href="/konular">Sınavları gör <ArrowRight size={17}/></Link></section>;
  }

  if (!exam) {
    return <div className="exam-navigation"><NavigationTrail/><header className="exam-page-heading"><span className="eyebrow">KONU KÜTÜPHANEN</span><h1>Sınavını seç.</h1><p>Oturum, ders ve konu adımlarında ilerle. Şimdilik yayımlanmış konular açılır.</p></header><div className="exam-choice-grid">
      {[...examRegistry.values()].map((item) => <Link className="card exam-choice" key={item.id} href={examHref(item)}><GraduationCap size={26}/><div><h2>{item.title}</h2><p>{item.description}</p><small>{item.sessions.map((entry) => entry.title).join(' · ')}</small></div><ArrowRight size={20}/></Link>)}
    </div></div>;
  }

  if (!session) {
    return <div className="exam-navigation"><NavigationTrail exam={exam}/><header className="exam-page-heading"><span className="eyebrow">{exam.title} / OTURUMLAR</span><h1>Oturumunu seç.</h1><p>{exam.description}</p></header><div className="exam-choice-grid">
      {exam.sessions.map((item) => <Link className="card exam-choice" key={item.id} href={sessionHref(exam, item)}><Layers3 size={26}/><div><h2>{item.title}</h2><p>{item.description}</p><small>{item.subjects.length} ders</small></div><ArrowRight size={20}/></Link>)}
    </div></div>;
  }

  if (!subject) {
    return <div className="exam-navigation"><NavigationTrail exam={exam} session={session}/><header className="exam-page-heading"><span className="eyebrow">{exam.title} / {session.title}</span><h1>Dersini seç.</h1><p>{session.description} kapsamında çalışacağın konulara buradan ulaş.</p></header><div className="exam-subject-grid">
      {session.subjects.map((item) => {
        const count = publishedTopics(item, content).length;
        return <Link className="card exam-subject" key={item.id} href={subjectHref(exam, session, item)}><span className="exam-subject-icon"><BookOpen size={22}/></span><span><strong>{item.title}</strong><small>{item.description}</small></span><span className="exam-subject-count">{count ? `${count} konu` : 'Yakında'}</span><ChevronRight size={18}/></Link>;
      })}
    </div></div>;
  }

  const topics = publishedTopics(subject, content);
  return <div className="exam-navigation"><NavigationTrail exam={exam} session={session} subject={subject}/><header className="exam-page-heading"><span className="eyebrow">{exam.title} / {session.title} / {subject.title.toLocaleUpperCase('tr')}</span><h1>{subject.title} konuları</h1><p>Bir konuya girdiğinde öğrenme kartların, testlerin, videoların ve ilerlemen aynı hesapta kalır.</p></header>
    {topics.length ? <div className="exam-topic-grid">{topics.map(({ definition, record }) => <Link className="card exam-topic" key={record.logical_id} href={`/konu/${record.logical_id}`}><span className="exam-topic-label">{session.title} · {subject.title}{record.demo ? ' · Demo' : ''}</span><h2>{record.title}</h2><p>{record.payload.description ?? definition.title}</p><span className="exam-topic-open">Konuya geç <ArrowRight size={17}/></span></Link>)}</div>
      : <section className="card exam-empty"><BookOpen size={30}/><h2>Bu derste henüz yayımlanmış konu yok.</h2><p>Yeni konular hazırlandığında burada görünecek.</p><Link className="button secondary" href={sessionHref(exam, session)}>Derslere dön <ArrowRight size={17}/></Link></section>}
  </div>;
}
