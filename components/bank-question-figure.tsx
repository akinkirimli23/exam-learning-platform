'use client';

import { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import type { BankFigure } from '@/shared/question-bank';

export function BankQuestionFigure({ figure }: { figure?: BankFigure }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);
  if (!figure) return null;
  return <figure className="bank-figure">
    <button type="button" className="bank-figure-preview" aria-label="Şemayı büyüt" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
      <img src={figure.src} alt={figure.alt} width={800} height={410} loading="lazy" />
      <span><ZoomIn size={16} />Şemayı büyüt</span>
    </button>
    <figcaption>Şema ölçekli değildir; soru metnindeki veriler esastır.</figcaption>
    <dialog ref={dialog} className="bank-figure-dialog" aria-label="Büyütülmüş soru şeması" onClose={() => setZoom(1)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="row-between"><h2>Soru şeması</h2><button type="button" className="button secondary" autoFocus onClick={() => dialog.current?.close()}><X size={18} />Kapat</button></div>
      <div className="bank-zoom-controls">
        <button type="button" className="button secondary" aria-label="Şemayı uzaklaştır" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.5))}><ZoomOut size={18} /></button>
        <span aria-live="polite">%{Math.round(zoom * 100)}</span>
        <button type="button" className="button secondary" aria-label="Şemayı yakınlaştır" disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + 0.5))}><ZoomIn size={18} /></button>
      </div>
      <div className="bank-zoom-image"><img src={figure.src} alt={figure.alt} style={{ width: `${zoom * 100}%` }} /></div>
      <p className="muted small">{figure.alt}</p>
    </dialog>
  </figure>;
}
