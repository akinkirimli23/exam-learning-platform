'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, Columns2, FileText, RotateCcw } from 'lucide-react';
import type { BankAttempt } from '@/shared/question-bank';
import { bookletPages, bookletView, bookletWindow, type QuestionBookletDefinition } from '@/shared/question-booklet';
import { QuestionBookletPage } from './question-booklet-page';
import styles from './question-booklet.module.css';

export type QuestionBookletProps = {
  attempt: BankAttempt; definition: QuestionBookletDefinition; busy: boolean; pending: boolean;
  error: string; onAnswer: (questionId: string, value: number | null) => void;
  onRetry: () => void; onFinish: () => void; onBack: () => void; onRestart: () => void;
};

export function QuestionBooklet({ attempt, definition, busy, pending, error, onAnswer, onRetry, onFinish, onBack, onRestart }: QuestionBookletProps) {
  const firstUnanswered = attempt.questions.findIndex(question => !Object.hasOwn(attempt.answers, question.id));
  const [page, setPage] = useState(() => attempt.status === 'completed' ? 0 : Math.floor(Math.max(0, firstUnanswered) / definition.questionsPerPage));
  const [viewportWidth, setViewportWidth] = useState(0);
  const [layout, setLayout] = useState<'auto' | 'single' | 'spread'>('auto');
  const [focusQuestion, setFocusQuestion] = useState<string | null>(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const confirmation = useRef<HTMLElement>(null);
  const completed = attempt.status === 'completed';
  const locked = busy || pending;
  const pages = bookletPages(attempt.questions, definition.questionsPerPage);
  const { canSpread: wide, spread } = bookletView(viewportWidth, layout);
  const visible = bookletWindow(page, pages.length, spread);
  const answered = Object.values(attempt.answers).filter(answer => answer !== null).length;
  const blanks = attempt.questions.length - answered;
  const selectedPages = visible.pages.map(index => index + 1).join('–');
  useEffect(() => {
    const queries = [window.matchMedia('(min-width: 760px)'), window.matchMedia('(min-width: 1360px)')];
    const update = () => setViewportWidth(window.innerWidth);
    update(); queries.forEach(query => query.addEventListener('change', update));
    return () => queries.forEach(query => query.removeEventListener('change', update));
  }, []);
  useEffect(() => {
    root.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [visible.start]);
  useEffect(() => {
    if (!focusQuestion) return;
    const element = document.getElementById(`booklet-title-${focusQuestion}`);
    element?.focus({ preventScroll: true }); element?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, [focusQuestion, visible.start]);
  useEffect(() => { if (completed) { setPage(0); setFocusQuestion(null); setConfirmFinish(false); } }, [completed]);
  useEffect(() => {
    if (confirmFinish) { confirmation.current?.focus({ preventScroll: true }); confirmation.current?.scrollIntoView({ block: 'center', behavior: 'instant' }); }
  }, [confirmFinish]);
  const turn = (next: number) => { setFocusQuestion(null); setPage(next); setConfirmFinish(false); };
  return <div className={styles.shell} ref={root} data-question-booklet={attempt.testId}>
    <div className={styles.readerBar}>
      <button className={styles.backButton} disabled={locked} onClick={onBack}><ArrowLeft size={16} />Soru bankası</button>
      <span className={styles.readerEyebrow}><BookOpen size={15} />ÇALIŞMA FASİKÜLÜ <span>{String(definition.bookletNumber ?? 1).padStart(2, '0')}</span></span>
      <span className={styles.duration}><Clock3 size={15} />{attempt.durationMinutes} dk<span> önerilen süre</span></span>
    </div>
    <div className={styles.readerToolbar}>
      <div className={styles.readerHeading}><span>{definition.examLabel} · {definition.topicLabel}</span><h2>{definition.testLabel}</h2></div>
      {wide && <div className={styles.viewSwitch} aria-label="Kitapçık görünümü"><button disabled={locked} aria-label="Tek sayfa görünümü" aria-pressed={!spread} onClick={() => setLayout('single')}><FileText size={17} />Tek sayfa</button><button disabled={locked} aria-label="Çift sayfa görünümü" aria-pressed={spread} onClick={() => setLayout('spread')}><Columns2 size={17} />Çift sayfa</button></div>}
      <div className={styles.saveStatus} role="status" aria-live="polite">{busy ? <span>Kaydediliyor…</span> : error ? <span>Kaydetme tamamlanmadı</span> : <><CheckCircle2 size={16} /><span>{completed ? 'Sonuçlar kaydedildi' : `${answered} / ${attempt.questions.length} soru yanıtlandı`}</span></>}</div>
    </div>
    {completed && attempt.result && <section className={styles.result} aria-label="Test sonucu"><div><CheckCircle2 size={22} /><h3>Test tamamlandı</h3></div><p><strong>{attempt.result.correct}</strong> doğru <strong>{attempt.result.wrong}</strong> yanlış <strong>{attempt.result.blank}</strong> boş <strong>%{attempt.result.percentage}</strong> başarı</p><button onClick={onRestart} disabled={locked}><RotateCcw size={16} />Tekrar çöz</button><span>Çözümler soru altında açık. Yanlış ve boş sorular Yanlış Defteri’nde.</span></section>}
    {error && <div className={styles.error} role="alert"><p>{error}</p>{pending && <button type="button" disabled={busy} onClick={onRetry}>Yanıtı tekrar kaydet</button>}</div>}
    <div className={`${styles.book} ${spread ? styles.spread : styles.single}`} aria-label={spread ? 'İki sayfalık test kitapçığı' : 'Test kitapçığı'}>
      {visible.pages.map(index => <QuestionBookletPage key={index} definition={definition} pageNumber={index + 1} questions={pages[index]} answers={attempt.answers}
        feedback={attempt.feedback} completed={completed} locked={locked} showInstructions={!spread || index % 2 === 0} onAnswer={onAnswer} />)}
    </div>
    <div className={styles.pageControls}>
      <button type="button" disabled={locked || visible.start === 0} onClick={() => turn(visible.start - (spread ? 2 : 1))}><ArrowLeft size={17} /><span>Önceki sayfa</span></button>
      <span className={styles.pageIndicator}>SAYFA <strong>{selectedPages}</strong><span> / {pages.length}</span></span>
      {visible.start + visible.pages.length < pages.length ? <button type="button" disabled={locked} onClick={() => turn(visible.start + (spread ? 2 : 1))}><span>Sonraki sayfa</span><ArrowRight size={17} /></button>
        : !completed ? <button className={styles.finishButton} disabled={locked} onClick={() => setConfirmFinish(true)}>Testi tamamla<Check size={17} /></button> : <span className={styles.endMark}>TEST SONU</span>}
    </div>
    <div className={styles.answerDock}><span className={styles.answerDockTitle}>YANITLARIN</span><nav aria-label="Kitapçık soruları">{attempt.questions.map((question, index) => {
      const saved = Object.hasOwn(attempt.answers, question.id), answer = attempt.answers[question.id];
      return <button key={question.id} disabled={locked} type="button" aria-label={`Soru ${question.number}: ${saved ? answer === null ? 'boş' : `${'ABCDE'[answer]} işaretli` : 'yanıtlanmadı'}`}
        aria-current={visible.pages.includes(Math.floor(index / definition.questionsPerPage)) ? 'page' : undefined}
        className={saved && answer !== null ? styles.dockAnswered : saved ? styles.dockBlank : ''}
        onClick={() => { setPage(Math.floor(index / definition.questionsPerPage)); setFocusQuestion(question.id); }}><span>{question.number}</span><strong>{saved && answer !== null ? 'ABCDE'[answer] : '·'}</strong></button>;
    })}</nav>{!completed && <button className={styles.dockFinish} disabled={locked} onClick={() => setConfirmFinish(true)}>Testi bitir<ArrowRight size={15} /></button>}</div>
    {!completed && <p className={styles.modelNote}>Şemalar ölçekli değildir. Aksi belirtilmedikçe g = 10 N/kg, suyun özkütlesi 1 kg/L alınır. Süre öneridir; test kendiliğinden bitmez.</p>}
    {confirmFinish && !completed && <section ref={confirmation} tabIndex={-1} className={styles.confirm} role="alertdialog" aria-label="Kitapçığı tamamla" aria-describedby="booklet-finish-description" onKeyDown={event => { if (event.key === 'Escape' && !locked) setConfirmFinish(false); }}><h3>Testi tamamlamak istiyor musun?</h3><p id="booklet-finish-description">{blanks ? `${blanks} soru boş. ` : 'Bütün sorular yanıtlandı. '}Tamamladıktan sonra yanıtların kilitlenir ve açıklamalı çözümler açılır.</p><div><button disabled={locked} onClick={() => { setConfirmFinish(false); root.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}>Çözmeye devam et</button><button className={styles.finishButton} disabled={locked} onClick={onFinish}>Tamamla ve çözümleri aç</button></div></section>}
  </div>;
}
