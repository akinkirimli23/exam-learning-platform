import { PencilLine } from 'lucide-react';
import type { BankFeedback, BankQuestion } from '@/shared/question-bank';
import type { QuestionBookletDefinition } from '@/shared/question-booklet';
import { QuestionHeader } from './question-header';
import { QuestionChoiceList } from './question-choice-list';
import { QuestionDiagram } from './question-diagram';
import styles from './question-booklet.module.css';

export function QuestionBookletPage({ definition, pageNumber, questions, answers, feedback, completed, locked, showInstructions, onAnswer }: {
  definition: QuestionBookletDefinition; pageNumber: number; questions: BankQuestion[];
  answers: Record<string, number | null>; feedback: BankFeedback[]; completed: boolean; locked: boolean;
  showInstructions: boolean; onAnswer: (questionId: string, value: number | null) => void;
}) {
  return <section className={styles.page} aria-label={`Kitapçık sayfası ${pageNumber}`} data-booklet-page={pageNumber}>
    <QuestionHeader definition={definition} />
    {showInstructions ? <div className={styles.instructions}><PencilLine size={18} /><span>Her soru için en uygun seçeneği işaretleyiniz.</span></div>
      : <div className={styles.continuation}><span>{definition.unitLabel}</span><span>TESTE DEVAM</span></div>}
    <div className={styles.questionGrid}>
      {questions.map(question => {
        const response = completed ? feedback.find(item => item.questionId === question.id) : undefined;
        const selected = answers[question.id] ?? null;
        const explicitlyBlank = Object.hasOwn(answers, question.id) && selected === null;
        return <article key={question.id} className={styles.question} aria-labelledby={`booklet-title-${question.id}`} data-booklet-question={question.id}>
          <div className={styles.questionHeading}><span className={styles.questionNumber}>{question.number}</span>
            <h3 id={`booklet-title-${question.id}`} tabIndex={-1}>{question.text}</h3></div>
          {question.figure && <QuestionDiagram question={question} definition={definition} />}
          <QuestionChoiceList question={question} selected={selected} disabled={locked || completed} feedback={response} onAnswer={value => onAnswer(question.id, value)} />
          {!completed && <button className={styles.blankButton} type="button" disabled={locked} onClick={() => onAnswer(question.id, null)} aria-label={`Soru ${question.number}: boş bırak`}>
            {explicitlyBlank ? 'Boş olarak kaydedildi' : 'Boş bırak'}</button>}
          {response && <div className={styles.solution}><h4>Açıklamalı çözüm <span>{response.isCorrect ? 'Doğru' : selected === null ? 'Boş' : 'Yanlış'}</span></h4>
            <p className={styles.correctAnswer}>Doğru cevap: {'ABCDE'[response.correctAnswer]} · {question.options[response.correctAnswer]}</p><p>{response.explanation}</p></div>}
        </article>;
      })}
    </div>
    <footer className={styles.pageFooter}><span className={styles.pageNumber}>{String(pageNumber).padStart(2, '0')}</span><span>{definition.examLabel}<i />SORU BANKASI</span><span className={styles.footerUnit}>{definition.unitLabel}</span></footer>
  </section>;
}
