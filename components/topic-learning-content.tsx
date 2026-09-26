'use client';

import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Layers,
  RotateCcw,
  Target,
  FileText,
  LibraryBig,
  TriangleAlert,
  Video,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { ContentDTO, QuizAnswerRecord } from '@/shared/contracts';
import {
  getConceptTitle,
  gradeLearningQuestion,
  summarizeIncorrectConcepts,
  type TopicDefinition,
} from '@/shared/topic-engine';
import { ConceptExplorer } from './concept-explorer';
import { LearningMaterials, LearningVideo } from './learning-media';
import { PastExamAnalysis } from './past-exam-analysis';
import { QuestionBank } from './question-bank';
import { api } from './client';

export function TopicLearningPage({
  tab,
  topic,
  definition,
  backHref = '/konular',
}: {
  tab: 'izle' | 'kartlar' | 'testler' | 'soru-bankasi' | 'cikmis-analizi';
  topic: ContentDTO;
  definition: TopicDefinition;
  backHref?: string;
}) {
  const videos = definition.media.filter((item) => item.type === 'video');
  const tabs = [
    ['ogren', 'Öğren', BookOpen],
    ['dinle', 'Dinle', Headphones],
    ['izle', 'İzle', Video],
    ['kartlar', 'Kartlar', Layers],
    ['testler', 'Kendini dene', Target],
    ['soru-bankasi', 'Soru bankası', LibraryBig],
    ['cikmis-analizi', 'Çıkmış analizi', FileText],
  ] as const;

  return (
    <>
      <Link className="back-link" href={backHref}><ChevronLeft size={16} />Ders konularına dön</Link>
      <div className="page-title">
        <div>
          <span className="eyebrow">{definition.headerEyebrow}</span>
          <h1>{topic.title}</h1>
          <p>{topic.payload.description}</p>
        </div>
        {topic.demo && <span className="pill orange">Demo içerik</span>}
      </div>
      <nav className="tabs" aria-label="Konu içerikleri">
        {tabs.map(([slug, title, Icon]) => (
          <Link key={slug} href={`/konu/${definition.id}/${slug}`} className={tab === slug ? 'active' : ''}>
            <Icon size={18} />{title}
          </Link>
        ))}
      </nav>
      {tab === 'izle' && (
        <div className="media-list">
          {videos.map((item) => (
            <LearningVideo key={item.id} item={item} />
          ))}
          {!videos.length && (
            <section className="card">
              <h2>İçerik henüz yüklenmedi</h2>
              <p className="muted">Bu konu için video materyali tanımlandığında burada görünecek.</p>
            </section>
          )}
        </div>
      )}
      {tab === 'kartlar' && <TopicFlashcards definition={definition} />}
      {tab === 'testler' && <TopicQuiz definition={definition} />}
      {tab === 'soru-bankasi' && <QuestionBank definition={definition} />}
      {tab === 'cikmis-analizi' && <PastExamAnalysis definition={definition} />}
    </>
  );
}
export function TopicLearnResources({
  definition,
  interactiveContent,
}: {
  definition: TopicDefinition;
  interactiveContent?: ReactNode;
}) {
  return (
    <>
      <section className="card explorer">
        {interactiveContent}
        <ConceptExplorer conceptMap={definition.conceptMap} />
      </section>
      <LearningMaterials items={definition.media} />
    </>
  );
}

export function TopicFlashcards({ definition }: { definition: TopicDefinition }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const item = definition.flashcards[index];

  const goTo = (nextIndex: number) => {
    setIndex(nextIndex);
    setFlipped(false);
  };

  return (
    <div className="flashcards learning-flashcards">
      <div className="row-between">
        <div>
          <span className="eyebrow">AKTİF HATIRLAMA</span>
          <strong className="learning-content-title">{definition.flashcardsTitle}</strong>
        </div>
        <span aria-live="polite">{index + 1} / {definition.flashcards.length}</span>
      </div>

      <button
        className={`flashcard learning-flashcard${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((current) => !current)}
        aria-label={flipped ? 'Kartın ön yüzünü göster' : 'Kartın arka yüzünü göster'}
      >
        <div className="learning-card-heading">
          <span className="learning-card-icon"><Layers size={24} /></span>
          <div>
            <span className="eyebrow">{flipped ? 'AÇIKLAMA' : 'ÖNCE KENDİN DÜŞÜN'}</span>
            <span className="pill gray">{getConceptTitle(definition, item.conceptId)}</span>
          </div>
        </div>

        {!flipped ? (
          <h2>{item.front}</h2>
        ) : (
          <div className="learning-card-back">
            <p>{item.back}</p>
            <div className="learning-card-extra formula-extra">
              <span>Formül</span>
              <strong>{item.formula}</strong>
            </div>
            <div className="learning-card-extra mistake-extra">
              <TriangleAlert size={18} />
              <div><span>Sık yapılan hata</span><p>{item.commonMistake}</p></div>
            </div>
          </div>
        )}

        <span className="subtle-link"><RotateCcw size={16} />Kartı çevirmek için dokun</span>
      </button>

      <div className="learning-card-actions">
        <button className="button secondary" disabled={index === 0} onClick={() => goTo(index - 1)}>
          <ChevronLeft size={17} />Önceki kart
        </button>
        <button className="button secondary flip-button" onClick={() => setFlipped((current) => !current)}>
          <RotateCcw size={17} />Kartı çevir
        </button>
        <button
          className="button secondary"
          disabled={index === definition.flashcards.length - 1}
          onClick={() => goTo(index + 1)}
        >
          Sonraki kart<ChevronRight size={17} />
        </button>
      </div>
      <p className="muted center">Kartlar cihazında puan veya günlük seri kaydı oluşturmaz.</p>
    </div>
  );
}

export function TopicQuiz({ definition }: { definition: TopicDefinition }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const question = definition.quiz[questionIndex];
  const answer = answers.find((record) => record.questionId === question.id);

  const submitAnswer = () => {
    if (selectedAnswer === null || answer) return;
    const graded = gradeLearningQuestion(question, selectedAnswer);
    setAnswers((current) => [...current, graded]);
    if (!graded.isCorrect) void api('mistakes/capture', 'POST', {
      topicId: definition.id, questionId: question.id, source: 'question-bank', selectedAnswer,
    }).catch(() => {});
  };

  const continueQuiz = () => {
    if (!answer) return;
    if (questionIndex === definition.quiz.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
  };

  const restart = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const correct = answers.filter((record) => record.isCorrect).length;
    const wrong = answers.length - correct;
    const percentage = Math.round((correct / definition.quiz.length) * 100);
    const weakConcepts = summarizeIncorrectConcepts(definition, answers);
    return (
      <div className="static-quiz-result">
        <div className="page-title static-result-title">
          <div>
            <span className="eyebrow">TEST TAMAMLANDI</span>
            <h1>Sonuçların hazır.</h1>
            <p>Bu sonuç yalnızca bu oturumda tutulur; hesabına veya günlük serine kaydedilmez.</p>
          </div>
        </div>
        <section className="card static-result-summary" aria-label="Test sonucu">
          <div><strong>{correct}</strong><span>Doğru</span></div>
          <div><strong>{wrong}</strong><span>Yanlış</span></div>
          <div><strong>%{percentage}</strong><span>Başarı</span></div>
        </section>
        <section className="card weak-concepts">
          <div className="weak-concepts-heading">
            <span className="step-icon orange"><Target size={21} /></span>
            <div><span className="eyebrow">DETERMİNİSTİK KONU ÖZETİ</span><h2>Tekrar etmen önerilen konular</h2></div>
          </div>
          {weakConcepts.length ? (
            <ul>
              {weakConcepts.map((concept) => (
                <li key={concept.conceptId}>
                  <span>{concept.title}</span>
                  <small>{concept.count} yanlış · {concept.conceptId}</small>
                </li>
              ))}
            </ul>
          ) : (
            <div className="all-correct"><CheckCircle2 size={22} /><p>Bütün soruları doğru yanıtladın. Tekrar önerisi oluşmadı.</p></div>
          )}
          <button className="button" onClick={restart}><RotateCcw size={17} />Testi yeniden çöz</button>
        </section>
      </div>
    );
  }

  const progress = ((questionIndex + 1) / definition.quiz.length) * 100;
  return (
    <div className="static-quiz">
      <div className="test-top static-quiz-top">
        <div>
          <span className="eyebrow">{definition.quizEyebrow}</span>
          <h1>Soru {questionIndex + 1} / {definition.quiz.length}</h1>
        </div>
        <span className={`pill difficulty-${question.difficulty}`}>{question.difficulty.toLocaleUpperCase('tr-TR')}</span>
      </div>
      <div className="progress-track" aria-label={`Test ilerlemesi: yüzde ${Math.round(progress)}`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <section className="card static-question-card">
        <div className="row-between">
          <span className="eyebrow">{getConceptTitle(definition, question.conceptId)}</span>
          <span className="muted small">{question.id}</span>
        </div>
        <h2>{question.question}</h2>
        <div role="radiogroup" aria-label="Cevap seçenekleri">
          {question.options.map((option, optionIndex) => {
            const selected = selectedAnswer === optionIndex;
            const isCorrectOption = answer && optionIndex === answer.correctAnswer;
            const isWrongSelection = answer && selected && !answer.isCorrect;
            const className = [
              'static-answer-option',
              selected && !answer ? 'selected' : '',
              isCorrectOption ? 'correct' : '',
              isWrongSelection ? 'incorrect' : '',
            ].filter(Boolean).join(' ');
            return (
              <button
                key={option}
                className={className}
                role="radio"
                aria-checked={selected}
                disabled={Boolean(answer)}
                onClick={() => setSelectedAnswer(optionIndex)}
              >
                <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                <span>{option}</span>
                {isCorrectOption && <Check size={19} />}
                {isWrongSelection && <X size={19} />}
              </button>
            );
          })}
        </div>

        {answer && (
          <div className={`feedback ${answer.isCorrect ? 'success' : 'needs-work'}`} role="status">
            <h3>{answer.isCorrect ? 'Doğru cevap' : 'Bu cevap doğru değil'}</h3>
            {!answer.isCorrect && (
              <p>Doğru cevap: <strong>{String.fromCharCode(65 + answer.correctAnswer)} · {question.options[answer.correctAnswer]}</strong></p>
            )}
            <p>{question.explanation}</p>
            {!answer.isCorrect && <p className="misconception-note"><strong>Yanılgı ipucu:</strong> {question.misconception}</p>}
          </div>
        )}

        <div className="question-actions static-question-actions">
          {!answer ? (
            <button className="button" disabled={selectedAnswer === null} onClick={submitAnswer}>
              Cevabı kontrol et<Check size={17} />
            </button>
          ) : (
            <button className="button" onClick={continueQuiz}>
              {questionIndex === definition.quiz.length - 1 ? 'Sonucu gör' : 'Sonraki soru'}<ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>
      <div className="info-inline static-quiz-note">
        <TriangleAlert size={18} />
        <p>Yanıt kontrol edildikten sonra değiştirilemez. Sonuçlar bu aşamada sunucuya kaydedilmez.</p>
      </div>
    </div>
  );
}
