'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import type { BankAttempt, BankCatalog, BankCatalogItem, BankTestDefinition } from '@/shared/question-bank';
import { getConceptTitle, type TopicDefinition } from '@/shared/topic-engine';
import { api } from './client';
import { BankQuestionFigure } from './bank-question-figure';

const levels = ['kolay', 'orta', 'zor'] as const;
const levelTitle = { kolay: 'Kolay', orta: 'Orta', zor: 'Zor' };

export function BankedQuestionBank({ definition, onArchive }: { definition: TopicDefinition; onArchive: () => void }) {
  const [catalog, setCatalog] = useState<BankCatalog | null>(null);
  const [attempt, setAttempt] = useState<BankAttempt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pendingStart = useRef<{ testId: string; key: string } | null>(null);
  const load = () => api<BankCatalog>(`question-bank/${definition.id}`).then(value => { setCatalog(value); setError(''); }).catch(error => setError(error.message));
  useEffect(() => { void load(); }, [definition.id]);
  const open = async (test: BankTestDefinition, resumeId?: string | null) => {
    setBusy(true); setError('');
    try {
      if (resumeId) setAttempt(await api<BankAttempt>(`question-bank/attempts/${resumeId}`));
      else {
        if (pendingStart.current?.testId !== test.id) pendingStart.current = { testId: test.id, key: crypto.randomUUID() };
        setAttempt(await api<BankAttempt>(`question-bank/${definition.id}/${test.id}/start`, 'POST', { idempotencyKey: pendingStart.current.key }));
        pendingStart.current = null;
      }
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  };
  if (attempt) return <BankTestSession key={attempt.id} initial={attempt} definition={definition} onBack={() => { setAttempt(null); void load(); }} onRestart={() => { const test = definition.questionBank!.find(test => test.id === attempt.testId)!; void open(test); }} />;
  const tests = catalog?.tests ?? definition.questionBank ?? [];
  return <div className="media-list">
    <section className="card">
      <span className="eyebrow">SORU BANKASI</span><h2>{definition.title} · {tests.length} test, {tests.reduce((sum, test) => sum + test.questionCount, 0)} soru</h2>
      <p className="muted">Her test 15 sorudan ve beş seçenekten oluşur. Yanıtların hesabında saklanır; açıklamalı çözümler test bitince açılır.</p>
      <p className="muted small">Aksi belirtilmedikçe g=10 N/kg ve suyun özkütlesi 1 kg/L; sıvılar durgun ve sıkışmazdır. Hava kaldırması, sıvı direnci ve yüzey gerilmesi ihmal edilir. Soruların sırası sabittir; önerilen süre dolunca test otomatik bitmez.</p>
      <button type="button" className="back-link" onClick={onArchive}>Önceki {definition.quiz.length} soruluk bankayı aç</button>
    </section>
    {error && <section className="card" role="alert"><p>{error}</p><button className="button secondary" onClick={() => void load()}>Yeniden dene</button></section>}
    {levels.map(level => <section key={level} aria-label={`${levelTitle[level]} testler`}>
      <h2>{levelTitle[level]} testler</h2>
      <div className="test-choice-grid">
        {tests.filter(test => test.difficulty === level).map((test, index) => {
          const progress = test as BankCatalogItem;
          return <article className="card test-choice" key={test.id}>
            <span className={`pill difficulty-${level}`}>{levelTitle[level]}</span>
            <h3>{levelTitle[level]} Test {index + 1}</h3><p>{test.title.split(' · ').slice(1).join(' · ')}</p>
            <p className="muted small">15 soru · {test.visualCount} şema · önerilen {test.durationMinutes} dakika</p>
            <p className="muted small">Soru sırası: 1–15</p>
            {progress.completedCount > 0 && <p>{progress.completedCount} kez tamamlandı · en iyi %{progress.bestPercentage}</p>}
            {progress.activeAttemptId && <p>{progress.answeredCount}/15 yanıt kaydedildi</p>}
            <button className="button secondary" disabled={busy || !catalog || !progress.available} onClick={() => void open(test, progress.activeAttemptId)}>
              {!catalog ? 'İlerleme yükleniyor…' : !progress.available ? 'Henüz kullanıma açılmadı' : progress.activeAttemptId ? 'Kaldığın yerden devam et' : progress.completedCount > 0 ? 'Testi tekrar çöz' : 'Teste başla'}<ArrowRight size={17} />
            </button>
            {!progress.activeAttemptId && progress.completedCount > 0 && <button className="back-link" disabled={busy} onClick={() => void open(test, progress.latestAttemptId)}>Son sonucu ve çözümleri aç</button>}
          </article>;
        })}
      </div>
    </section>)}
  </div>;
}

function BankTestSession({ initial, definition, onBack, onRestart }: {
  initial: BankAttempt; definition: TopicDefinition; onBack: () => void; onRestart: () => void;
}) {
  const [attempt, setAttempt] = useState(initial);
  const [index, setIndex] = useState(() => Math.max(0, initial.questions.findIndex(question => !Object.hasOwn(initial.answers, question.id))));
  const [pending, setPending] = useState<number | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmFinish, setConfirmFinish] = useState(false);
  const question = attempt.questions[index];
  const feedback = attempt.feedback.find(item => item.questionId === question.id);
  const selected = pending !== undefined ? pending : attempt.answers[question.id] ?? null;
  const completed = attempt.status === 'completed';
  const saved = Object.keys(attempt.answers).length;
  const unanswered = attempt.questions.filter(question => attempt.answers[question.id] == null).length;
  const locked = busy || pending !== undefined;
  const save = async (value: number | null) => {
    setPending(value); setBusy(true); setError('');
    try { setAttempt(await api<BankAttempt>(`question-bank/attempts/${attempt.id}/answer`, 'PUT', { questionId: question.id, value })); setPending(undefined); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  };
  const finish = async () => {
    setBusy(true); setError('');
    try { setAttempt(await api<BankAttempt>(`question-bank/attempts/${attempt.id}/complete`, 'POST')); setConfirmFinish(false); setIndex(0); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  };
  return <div className="static-quiz bank-test-session">
    <button className="back-link" disabled={locked} onClick={onBack}><ArrowLeft size={16} />Soru bankasına dön</button>
    <div className="test-top static-quiz-top"><div><span className="eyebrow">{attempt.title}</span><h1>{completed ? 'Test tamamlandı' : `Soru ${index + 1} / 15`}</h1></div><span className={`pill difficulty-${attempt.difficulty}`}>{levelTitle[attempt.difficulty]}</span></div>
    <p className="muted small">Önerilen süre: {attempt.durationMinutes} dakika · Sıra: 1–15 · {completed ? 'Sonuçların hesabında saklanıyor.' : `${saved}/15 soru kaydedildi.`}</p>
    {completed && attempt.result && <>
      <section className="card static-result-summary" aria-label="Test sonucu">
        <div><strong>{attempt.result.correct}</strong><span>Doğru</span></div><div><strong>{attempt.result.wrong}</strong><span>Yanlış</span></div><div><strong>{attempt.result.blank}</strong><span>Boş</span></div><div><strong>%{attempt.result.percentage}</strong><span>Başarı</span></div>
      </section>
      <p className="muted small"><CheckCircle2 size={16} /> Sonuç ve çözümler kaydedildi. Yanlış ve boş sorular Yanlış Defteri’nde; bu banka günlük seri veya puan oluşturmaz.</p>
      <button className="button secondary" onClick={onRestart}><RotateCcw size={17} />Testi tekrar çöz</button>
    </>}
    <nav className="bank-question-nav" aria-label="Test soruları">
      {attempt.questions.map((item, position) => <button type="button" key={item.id} aria-label={`Soru ${position + 1}`} aria-current={position === index ? 'step' : undefined} className={Object.hasOwn(attempt.answers, item.id) ? 'answered' : ''} disabled={locked} onClick={() => { setIndex(position); setError(''); setConfirmFinish(false); }}>{position + 1}</button>)}
    </nav>
    {error && <section className="card" role="alert"><p>{error}</p>{pending !== undefined && <button className="button secondary" disabled={busy} onClick={() => void save(pending)}>Yanıtı tekrar kaydet</button>}</section>}
    <section className="card static-question-card">
      <div className="row-between"><span className="eyebrow">{getConceptTitle(definition, question.conceptId)}</span><span className="muted small">{index + 1} / 15</span></div>
      <h2>{question.text}</h2><BankQuestionFigure figure={question.figure} />
      <div role="radiogroup" aria-label="Cevap seçenekleri">
        {question.options.map((option, optionIndex) => <button type="button" key={optionIndex} className={['static-answer-option', selected === optionIndex && 'selected', feedback && optionIndex === feedback.correctAnswer && 'correct', feedback && selected === optionIndex && !feedback.isCorrect && 'incorrect'].filter(Boolean).join(' ')} role="radio" aria-checked={selected === optionIndex} disabled={busy || completed} onClick={() => void save(optionIndex)}>
          <span className="option-letter">{'ABCDE'[optionIndex]}</span><span>{option}</span>
        </button>)}
      </div>
      {feedback && <div className={`feedback ${feedback.isCorrect ? 'success' : 'needs-work'}`} role="status"><h3>Açıklamalı çözüm</h3><p>Doğru cevap: <strong>{'ABCDE'[feedback.correctAnswer]} · {question.options[feedback.correctAnswer]}</strong></p><p>{feedback.explanation}</p></div>}
      <div className="question-actions bank-test-actions">
        <button className="button secondary" disabled={locked || index === 0} onClick={() => setIndex(value => value - 1)}><ArrowLeft size={17} />Önceki soru</button>
        {!completed && <button className="button secondary" disabled={busy} onClick={() => void save(null)}>Boş bırak</button>}
        {index < 14 && <button className="button" disabled={locked} onClick={() => setIndex(value => value + 1)}>Sonraki soru<ArrowRight size={17} /></button>}
        {!completed && index === 14 && <button className="button" disabled={locked} onClick={() => setConfirmFinish(true)}>Testi bitir</button>}
      </div>
      {confirmFinish && <section className="bank-finish-confirm" role="alertdialog" aria-label="Testi tamamla"><h3>Testi tamamlamak istiyor musun?</h3><p>{unanswered > 0 ? `${unanswered} soru boş. Tamamladıktan sonra yanıtlar değişmez; çözümler açılır.` : '15 sorunun yanıtı kaydedildi. Tamamladığında açıklamalı çözümler açılır.'}</p><div className="actions"><button className="button" disabled={busy} onClick={() => void finish()}>Tamamla ve çözümleri aç</button><button className="button secondary" disabled={busy} onClick={() => setConfirmFinish(false)}>Devam et</button></div></section>}
    </section>
  </div>;
}
