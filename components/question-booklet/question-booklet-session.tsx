'use client';

import { useRef, useState } from 'react';
import type { BankAttempt } from '@/shared/question-bank';
import type { QuestionBookletDefinition } from '@/shared/question-booklet';
import { api } from '../client';
import { QuestionBooklet } from './question-booklet';

export function QuestionBookletSession({ initial, definition, onBack, onRestart }: {
  initial: BankAttempt; definition: QuestionBookletDefinition; onBack: () => void; onRestart: () => void;
}) {
  const [attempt, setAttempt] = useState(initial);
  const [pending, setPending] = useState<{ questionId: string; value: number | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const answer = async (questionId: string, value: number | null) => {
    if (inFlight.current) return;
    inFlight.current = true; setPending({ questionId, value }); setBusy(true); setError('');
    try {
      setAttempt(await api<BankAttempt>(`question-bank/attempts/${attempt.id}/answer`, 'PUT', { questionId, value }));
      setPending(null);
    } catch (error) { setError((error as Error).message); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const finish = async () => {
    if (inFlight.current || pending) return;
    inFlight.current = true; setBusy(true); setError('');
    try { setAttempt(await api<BankAttempt>(`question-bank/attempts/${attempt.id}/complete`, 'POST')); }
    catch (error) { setError((error as Error).message); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return <QuestionBooklet attempt={pending ? { ...attempt, answers: { ...attempt.answers, [pending.questionId]: pending.value } } : attempt} definition={definition}
    busy={busy} pending={!!pending} error={error} onAnswer={(id, value) => void answer(id, value)}
    onRetry={() => { if (pending) void answer(pending.questionId, pending.value); }} onFinish={() => void finish()} onBack={onBack} onRestart={onRestart} />;
}
