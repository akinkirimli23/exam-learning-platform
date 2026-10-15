import { Waves } from 'lucide-react';
import type { QuestionBookletDefinition } from '@/shared/question-booklet';
import styles from './question-booklet.module.css';

export function QuestionHeader({ definition }: { definition: QuestionBookletDefinition }) {
  return <header className={styles.pageHeader}>
    <div className={styles.titleBand}><span className={styles.examLabel}>{definition.examLabel}</span>
      <span className={styles.testTitle}><span>{definition.topicLabel}</span><span className={styles.titleSeparator}> — </span><span>{definition.testLabel}</span></span>
    </div>
    <div className={styles.topicBadge}><span><Waves size={23} strokeWidth={1.7} /></span><span>{definition.badgeLabel}</span></div>
  </header>;
}
