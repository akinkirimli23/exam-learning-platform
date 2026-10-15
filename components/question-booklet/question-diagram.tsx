import type { BankQuestion } from '@/shared/question-bank';
import { bookletFigure, type QuestionBookletDefinition } from '@/shared/question-booklet';
import { BankQuestionFigure } from '../bank-question-figure';
import styles from './question-booklet.module.css';

export function QuestionDiagram({ question, definition }: { question: BankQuestion; definition: QuestionBookletDefinition }) {
  const figure = bookletFigure(question, definition);
  return figure ? <div className={styles.diagram}><BankQuestionFigure figure={figure} /></div> : null;
}
