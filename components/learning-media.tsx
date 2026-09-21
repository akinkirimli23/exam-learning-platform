'use client';

import {
  CloudOff,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Video,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LearningMedia } from '@/shared/contracts';

function MediaUnavailable({ item }: { item: LearningMedia }) {
  return (
    <div className="learning-media-empty" role="status">
      <span><CloudOff size={25} /></span>
      <div>
        <strong>İçerik henüz yüklenmedi</strong>
        <p>{item.title}, storage URL’si tanımlandığında burada kullanılabilir olacak.</p>
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

export function LearningVideo({ item }: { item: LearningMedia }) {
  return (
    <article className="card learning-video-card">
      <MediaHeading item={item} icon={<Video size={22} />} />
      {item.url ? (
        <>
          <video
            className="learning-video-player"
            controls
            playsInline
            preload="metadata"
            poster={item.thumbnailUrl || undefined}
            aria-label={item.title}
          >
            <source src={item.url} type={item.mimeType || 'video/mp4'} />
            Tarayıcın HTML5 video oynatmayı desteklemiyor.
          </video>
          <p className="small-note learning-media-note">
            Oynatıcı; oynatma, duraklatma, ileri-geri sarma, ses, süre ve tam ekran kontrollerini tarayıcından alır.
          </p>
        </>
      ) : (
        <MediaUnavailable item={item} />
      )}
    </article>
  );
}

export function LearningSlides({ item }: { item: LearningMedia }) {
  return (
    <article className="card learning-material-card">
      <MediaHeading item={item} icon={<FileText size={21} />} />
      {item.url ? (
        <a className="button secondary learning-material-action" href={item.url} target="_blank" rel="noreferrer">
          PDF slaytı yeni sekmede aç<ExternalLink size={17} />
        </a>
      ) : (
        <MediaUnavailable item={item} />
      )}
    </article>
  );
}

export function LearningInfographic({ item }: { item: LearningMedia }) {
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
          <img src={item.url} alt={item.title} />
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <article className="card learning-material-card infographic-card">
        <MediaHeading item={item} icon={<ImageIcon size={21} />} />
        {item.url ? (
          <button
            ref={triggerRef}
            className="infographic-preview"
            onClick={() => setOpen(true)}
            aria-label={`${item.title} infografiğini büyüt`}
          >
            <img src={item.url} alt={item.title} loading="lazy" />
            <span><Maximize2 size={16} />Büyüt</span>
          </button>
        ) : (
          <MediaUnavailable item={item} />
        )}
      </article>
      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}

export function LearningMaterials({ items }: { items: LearningMedia[] }) {
  const slides = items.find((item) => item.type === 'slides');
  const infographic = items.find((item) => item.type === 'infographic');
  return (
    <section className="learning-materials" aria-labelledby="learning-materials-title">
      <div className="learning-materials-title">
        <span className="eyebrow">GÖRSEL MATERYALLER</span>
        <h2 id="learning-materials-title">Konuyu farklı biçimlerde incele</h2>
      </div>
      {slides && <LearningSlides item={slides} />}
      {infographic && <LearningInfographic item={infographic} />}
    </section>
  );
}
