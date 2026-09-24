'use client';

import { ArrowRight, Check, CheckCircle2, ExternalLink, RotateCcw, Target, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';
import { api } from './client';
import type { QuizAnswerRecord } from '@/shared/contracts';
import {
  getConceptTitle,
  gradeLearningQuestion,
  summarizeIncorrectConcepts,
  type TopicDefinition,
} from '@/shared/topic-engine';

export function PastExamAnalysis({ definition }: { definition: TopicDefinition }) {
  const set = definition.pastExam;
  if (!set) {
    return (
      <section className="card">
        <h2>Geçmiş sınav analizi henüz hazırlanmadı</h2>
        <p className="muted">Bu konu için doğrulanmış kaynak metadatası eklendiğinde burada görünecek.</p>
      </section>
    );
  }

  return (
    <div className="media-list">
      <section className="card">
        <span className="eyebrow">GEÇMİŞ YKS BECERİ ANALİZİ</span>
        <h2>ÖSYM sorusunu kopyalamadan, ölçülen beceriyi çalış.</h2>
        <p>
          Aşağıdaki kayıtlar resmî ÖSYM soru kitapçıklarından çıkarılan metadata ve beceri
          analizidir. Orijinal soru metinleri uygulamada saklanmaz. Alttaki sorular İvme için
          özgün hazırlanmıştır.
        </p>
      </section>

      <div className="test-choice-grid">
        {set.sources.map((source) => (
          <article className="card test-choice" key={source.id}>
            <div className="row-between">
              <span className="step-number">{source.year}</span>
              <span className="pill gray">{source.exam} · Soru {source.questionNumber}</span>
            </div>
            <h2>{source.questionType}</h2>
            <p>{source.skill}</p>
            <div className="muted small">
              {source.conceptIds.map((conceptId) => getConceptTitle(definition, conceptId)).join(' · ')}
            </div>
            <a className="subtle-link" href={`${source.sourceUrl}#page=${source.sourcePdfPage}`} target="_blank" rel="noreferrer">
              Resmî ÖSYM PDF'de soruyu aç <ExternalLink size={16} />
            </a>
          </article>
        ))}
      </div>

      <PastExamPractice definition={definition} />
    </div>
  );
}

function PastExamPractice({ definition }: { definition: TopicDefinition }) {
  const questions = definition.pastExam?.questions ?? [];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  if (!questions.length) return null;
  const question = questions[questionIndex];
  const answer = answers.find((record) => record.questionId === question.id);
  const source = definition.pastExam?.sources.find((item) => item.id === question.sourceRef);

  const submitAnswer = () => {
    if (selectedAnswer === null || answer) return;
    const graded=gradeLearningQuestion(question, selectedAnswer);
    setAnswers((current) => [...current, graded]);
    if(!graded.isCorrect) void api('mistakes/capture','POST',{
      topicId:definition.id,questionId:question.id,source:'past-exam',selectedAnswer,
    }).catch(()=>{});
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
        <div className="page-title static-result-title">
          <div>
            <span className="eyebrow">YKS BECERİ TESTİ TAMAMLANDI</span>
            <h1>Geçmiş sınav becerilerini taradın.</h1>
            <p>Bu test özgün İvme sorularından oluşur ve hesabındaki çalışma puanını değiştirmez.</p>
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
            <div><span className="eyebrow">BECERİ ÖZETİ</span><h2>Tekrar edilebilecek kavramlar</h2></div>
          </div>
          {weakConcepts.length ? (
            <ul>
              {weakConcepts.map((concept) => (
                <li key={concept.conceptId}>
                  <span>{concept.title}</span>
                  <small>{concept.count} yanlış</small>
                </li>
              ))}
            </ul>
          ) : (
            <div className="all-correct"><CheckCircle2 size={22} /><p>Bütün soruları doğru yanıtladın.</p></div>
          )}
          <button className="button" onClick={restart}><RotateCcw size={17} />Testi yeniden çöz</button>
        </section>
      </div>
    );
  }

  const progress = ((questionIndex + 1) / questions.length) * 100;
  return (
    <div className="static-quiz">
      <div className="test-top static-quiz-top">
        <div>
          <span className="eyebrow">ÇIKMIŞ SORULARIN ÖLÇTÜĞÜ BECERİLERDEN ÜRETİLDİ</span>
          <h1>Soru {questionIndex + 1} / {questions.length}</h1>
        </div>
        <span className={`pill difficulty-${question.difficulty}`}>
          {question.difficulty.toLocaleUpperCase('tr-TR')}
        </span>
      </div>
      <div className="progress-track" aria-label={`Test ilerlemesi: yüzde ${Math.round(progress)}`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <section className="card static-question-card">
        <div className="row-between">
          <span className="eyebrow">{getConceptTitle(definition, question.conceptId)}</span>
          <span className="muted small">{source ? `${source.year} ${source.exam} becerisi` : 'YKS becerisi'}</span>
        </div>
        <h2>{question.question}</h2>
        <p className="muted small"><strong>Ölçülen beceri:</strong> {question.skill}</p>
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
              Cevabı kontrol et<Check size={17} />
            </button>
          ) : (
            <button className="button" onClick={continueQuiz}>
              {questionIndex === questions.length - 1 ? 'Sonucu gör' : 'Sonraki soru'}<ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      <div className="info-inline static-quiz-note">
        <TriangleAlert size={18} />
        <p>Bu sorular ÖSYM sorularının kopyası değildir; doğrulanmış geçmiş soru becerilerinden özgün olarak üretilmiştir.</p>
      </div>
    </div>
  );
}
