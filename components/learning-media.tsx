'use client';

import {
  CloudOff,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Maximize2,
  Video,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LearningMedia, SignedLearningMedia } from '@/shared/contracts';
import { api } from './client';

export type LearningMediaLoadState =
  | { status: 'loading'; url?: undefined }
  | { status: 'ready'; url: string }
  | { status: 'error'; url?: undefined };

function useLearningMediaUrl(mediaId: string): LearningMediaLoadState {
  const [state, setState] = useState<LearningMediaLoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    api<SignedLearningMedia>(`learning-media/${encodeURIComponent(mediaId)}`)
      .then((result) => {
        if (active) setState({ status: 'ready', url: result.url });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [mediaId]);

  return state;
}

function MediaLoading({ item }: { item: LearningMedia }) {
  return (
    <div className="learning-media-empty learning-media-loading" role="status">
      <span><LoaderCircle size={25} /></span>
      <div>
        <strong>İçerik hazırlanıyor</strong>
        <p>{item.title} için güvenli bağlantı oluşturuluyor.</p>
      </div>
    </div>
  );
}

function MediaUnavailable({ item }: { item: LearningMedia }) {
  return (
    <div className="learning-media-empty" role="status">
      <span><CloudOff size={25} /></span>
      <div>
        <strong>İçerik henüz yüklenmedi</strong>
        <p>{item.title} materyaline şu anda ulaşılamıyor. Lütfen biraz sonra yeniden dene.</p>
      </div>
    </div>
  );
}

function MediaHeading({ item, icon }: { item: LearningMedia; icon: React.ReactNode }) {
  return (
    <div className="learning-media-heading">
      <span className="learning-media-icon">{icon}</span>
      <div>
        <span className="eyebrow">KONU MATERYALİ</span>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
      </div>
    </div>
  );
}

export function LearningVideoView({ item, state }: { item: LearningMedia; state: LearningMediaLoadState }) {
  const [measuredDuration, setMeasuredDuration] = useState<number | null>(null);
  const duration = measuredDuration ?? item.durationSeconds;
  const durationLabel = duration && Number.isFinite(duration)
    ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`
    : null;
  return (
    <article className="card learning-video-card">
      <MediaHeading item={item} icon={<Video size={22} />} />
      <p className="small-note learning-video-duration" aria-live="polite">
        {durationLabel ? `Süre: ${durationLabel}` : 'Süre video yüklendiğinde gösterilecek.'}
      </p>
      {state.status === 'ready' ? (
        <>
          <video
            className="learning-video-player"
            controls
            playsInline
            preload="metadata"
            aria-label={item.title}
            onLoadedMetadata={(event) => {
              const seconds = event.currentTarget.duration;
              if (Number.isFinite(seconds) && seconds > 0) setMeasuredDuration(seconds);
            }}
          >
            <source src={state.url} type={item.mimeType || 'video/mp4'} />
            Tarayıcın HTML5 video oynatmayı desteklemiyor.
          </video>
          <p className="small-note learning-media-note">
            Oynatıcı; oynatma, duraklatma, ileri-geri sarma, ses, süre ve tam ekran kontrollerini tarayıcından alır.
          </p>
        </>
      ) : state.status === 'loading' ? (
        <MediaLoading item={item} />
      ) : (
        <MediaUnavailable item={item} />
      )}
    </article>
  );
}

export function LearningVideo({ item }: { item: LearningMedia }) {
  const state = useLearningMediaUrl(item.id);
  return <LearningVideoView item={item} state={state} />;
}

export function LearningSlidesView({ item, state }: { item: LearningMedia; state: LearningMediaLoadState }) {
  return (
    <article className="card learning-material-card">
      <MediaHeading item={item} icon={<FileText size={21} />} />
      {state.status === 'ready' ? (
        <a className="button secondary learning-material-action" href={state.url} target="_blank" rel="noreferrer">
          PDF slaytı yeni sekmede aç<ExternalLink size={17} />
        </a>
      ) : state.status === 'loading' ? (
        <MediaLoading item={item} />
      ) : (
        <MediaUnavailable item={item} />
      )}
    </article>
  );
}

export function LearningSlides({ item }: { item: LearningMedia }) {
  const state = useLearningMediaUrl(item.id);
  return <LearningSlidesView item={item} state={state} />;
}

export function LearningInfographicView({ item, state }: { item: LearningMedia; state: LearningMediaLoadState }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [close, open]);

  const dialog = open ? (
    <div className="infographic-modal" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="infographic-title">
        <header>
          <div><span className="eyebrow">İNFOGRAFİK</span><h2 id="infographic-title">{item.title}</h2></div>
          <button ref={closeRef} onClick={close} aria-label="İnfografiği kapat"><X size={21} /></button>
        </header>
        <div className="infographic-modal-body">
          <img src={state.status === 'ready' ? state.url : ''} alt={item.title} />
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <article className="card learning-material-card infographic-card">
        <MediaHeading item={item} icon={<ImageIcon size={21} />} />
        {state.status === 'ready' ? (
          <button
            ref={triggerRef}
            className="infographic-preview"
            onClick={() => setOpen(true)}
            aria-label={`${item.title} infografiğini büyüt`}
          >
            <img src={state.url} alt={item.title} loading="lazy" />
            <span><Maximize2 size={16} />Büyüt</span>
          </button>
        ) : state.status === 'loading' ? (
          <MediaLoading item={item} />
        ) : (
          <MediaUnavailable item={item} />
        )}
      </article>
      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}

export function LearningInfographic({ item }: { item: LearningMedia }) {
  const state = useLearningMediaUrl(item.id);
  return <LearningInfographicView item={item} state={state} />;
}

export function LearningMaterials({ items }: { items: readonly LearningMedia[] }) {
  const materials = items.filter((item) => item.type === 'slides' || item.type === 'infographic');
  if (!materials.length) return null;
  return (
    <section className="learning-materials" aria-labelledby="learning-materials-title">
      <div className="learning-materials-title">
        <span className="eyebrow">GÖRSEL MATERYALLER</span>
        <h2 id="learning-materials-title">Konuyu farklı biçimlerde incele</h2>
      </div>
      {materials.map((item) => item.type === 'slides'
        ? <LearningSlides key={item.id} item={item} />
        : <LearningInfographic key={item.id} item={item} />)}
    </section>
  );
}
