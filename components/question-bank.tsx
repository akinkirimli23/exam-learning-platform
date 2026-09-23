'use client';

import { ArrowLeft, ArrowRight, Check, CheckCircle2, Gauge, RotateCcw, Target, X } from 'lucide-react';
import { useState } from 'react';
import type { LearningQuizDifficulty, QuizAnswerRecord } from '@/shared/contracts';
import {
  getConceptTitle,
  gradeLearningQuestion,
  summarizeIncorrectConcepts,
  type TopicDefinition,
} from '@/shared/topic-engine';
import { QuestionVisual } from './question-visual';

const labels: Record<LearningQuizDifficulty, { title: string; text: string }> = {
  kolay: { title: 'Kolay Test', text: 'Temel kavramları ve doğrudan ilişkileri kontrol et.' },
  orta: { title: 'Orta Test', text: 'Birden fazla bilgiyi birlikte yorumla ve değişkenleri ayır.' },
  zor: { title: 'Zor Test', text: 'Çok adımlı çıkarım, kuvvet dengesi ve birleşik durumları çöz.' },
};

export function QuestionBank({ definition }: { definition: TopicDefinition }) {
  const [level, setLevel] = useState<LearningQuizDifficulty | null>(null);

  if (!level) {
    const levels: LearningQuizDifficulty[] = ['kolay', 'orta', 'zor'];
    return (
      <div className="media-list">
        <section className="card">
          <span className="eyebrow">SORU BANKASI</span>
          <h2>Bugün hangi seviyeyi çözmek istiyorsun?</h2>
          <p className="muted">Seçtiğin test yalnızca o zorluk seviyesindeki sorulardan oluşur. Bazı sorularda şema ve görsel yorumlama bulunur.</p>
        </section>
        <div className="test-choice-grid">
          {levels.map((difficulty) => {
            const questions = definition.quiz.filter((question) => question.difficulty === difficulty);
            const visualCount = questions.filter((question) => question.visualId).length;
            return (
              <article className="card test-choice" key={difficulty}>
                <div className="row-between">
                  <span className="step-icon blue"><Gauge size={22} /></span>
                  <span className={`pill difficulty-${difficulty}`}>{difficulty.toLocaleUpperCase('tr-TR')}</span>
                </div>
                <h2>{labels[difficulty].title}</h2>
                <p>{labels[difficulty].text}</p>
                <span className="muted">{questions.length} soru · {visualCount} görselli</span>
                <button className="button secondary" onClick={() => setLevel(difficulty)}>
                  Teste başla <ArrowRight size={18} />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return <DifficultyQuiz definition={definition} level={level} onBack={() => setLevel(null)} />;
}

function DifficultyQuiz({
  definition,
  level,
  onBack,
}: {
  definition: TopicDefinition;
  level: LearningQuizDifficulty;
  onBack: () => void;
}) {
  const questions = definition.quiz.filter((question) => question.difficulty === level);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const question = questions[questionIndex];
  const answer = answers.find((record) => record.questionId === question.id);

  const submitAnswer = () => {
    if (selectedAnswer === null || answer) return;
    setAnswers((current) => [...current, gradeLearningQuestion(question, selectedAnswer)]);
  };

  const continueQuiz = () => {
    if (!answer) return;
    if (questionIndex === questions.length - 1) {
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
    const percentage = Math.round((correct / questions.length) * 100);
    const weakConcepts = summarizeIncorrectConcepts(definition, answers);
    return (
      <div className="static-quiz-result">
        <button className="back-link" onClick={onBack}><ArrowLeft size={16} />Soru bankasına dön</button>
        <div className="page-title static-result-title">
          <div>
            <span className="eyebrow">{level.toLocaleUpperCase('tr-TR')} TEST TAMAMLANDI</span>
            <h1>Sonuçların hazır.</h1>
            <p>Bu soru bankası testi yalnızca bu oturumda tutulur; günlük seri veya puan oluşturmaz.</p>
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
            <div><span className="eyebrow">KAVRAM ÖZETİ</span><h2>Tekrar edebileceğin noktalar</h2></div>
          </div>
          {weakConcepts.length ? (
            <ul>
              {weakConcepts.map((concept) => (
                <li key={concept.conceptId}><span>{concept.title}</span><small>{concept.count} yanlış</small></li>
              ))}
            </ul>
          ) : (
            <div className="all-correct"><CheckCircle2 size={22} /><p>Bütün soruları doğru yanıtladın.</p></div>
          )}
          <div className="actions">
            <button className="button" onClick={restart}><RotateCcw size={17} />Aynı seviyeyi tekrar çöz</button>
            <button className="button secondary" onClick={onBack}>Başka seviye seç</button>
          </div>
        </section>
      </div>
    );
  }

  const progress = ((questionIndex + 1) / questions.length) * 100;
  return (
    <div className="static-quiz">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} />Soru bankasına dön</button>
      <div className="test-top static-quiz-top">
        <div>
          <span className="eyebrow">SORU BANKASI · {level.toLocaleUpperCase('tr-TR')}</span>
          <h1>Soru {questionIndex + 1} / {questions.length}</h1>
        </div>
        <span className={`pill difficulty-${level}`}>{level.toLocaleUpperCase('tr-TR')}</span>
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
        <QuestionVisual visualId={question.visualId} />
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
            {!answer.isCorrect && (
              <p className="misconception-note"><strong>Yanılgı ipucu:</strong> {question.misconception}</p>
            )}
          </div>
        )}

        <div className="question-actions static-question-actions">
          {!answer ? (
            <button className="button" disabled={selectedAnswer === null} onClick={submitAnswer}>
              Cevabı kontrol et <Check size={17} />
            </button>
          ) : (
            <button className="button" onClick={continueQuiz}>
              {questionIndex === questions.length - 1 ? 'Sonucu gör' : 'Sonraki soru'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
