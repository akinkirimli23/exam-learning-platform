import type { BankFeedback, BankQuestion } from '@/shared/question-bank';
import styles from './question-booklet.module.css';

export function QuestionChoiceList({ question, selected, disabled, feedback, onAnswer }: {
  question: BankQuestion; selected: number | null; disabled: boolean; feedback?: BankFeedback;
  onAnswer: (value: number) => void;
}) {
  const longest = Math.max(...question.options.map(option => option.length));
  const layout = longest <= 12 ? styles.compactChoices : longest <= 26 ? styles.pairedChoices : styles.longChoices;
  return <div className={`${styles.choices} ${layout}`} role="radiogroup" aria-label={`Soru ${question.number} cevap seçenekleri`}>
    {question.options.map((option, index) => <label key={index} className={[
      styles.choice, selected === index && styles.selectedChoice,
      feedback && feedback.correctAnswer === index && styles.correctChoice,
      feedback && selected === index && !feedback.isCorrect && styles.wrongChoice,
    ].filter(Boolean).join(' ')}>
      <input type="radio" name={`booklet-${question.id}`} aria-label={`${'ABCDE'[index]}. ${option}`} value={index} checked={selected === index} disabled={disabled}
        onChange={() => onAnswer(index)} />
      <span className={styles.choiceLetter}>{'ABCDE'[index]}<span className={styles.choiceBracket}>)</span></span><span>{option}</span>
    </label>)}
  </div>;
}
