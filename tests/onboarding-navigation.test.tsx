import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AuthScreen, GuestShell } from '../components/learning-app';
import { ExamNavigationPage } from '../components/exam-navigation';
import {
  findTopicPlacement,
  journeyLabel,
  learningPathForUser,
  learningPathFromPathname,
  subjectHref,
} from '../shared/learning-path';

describe('sınav öncelikli başlangıç akışı', () => {
  it('ilk ziyaretçiye giriş formu yerine sınav seçimini gösterir', () => {
    const html = renderToStaticMarkup(<GuestShell segments={[]} onLogin={vi.fn()}/>);

    expect(html).toContain('Hangi sınava hazırlanıyorsun?');
    expect(html).toContain('href="/sinav/yks"');
    expect(html).toContain('LGS');
    expect(html).toContain('KPSS');
    expect(html).toContain('YAKINDA');
    expect(html).toContain('Giriş yap');
  });

  it('misafir YKS, TYT, Fizik ve canonical konu yolunu girişten önce gezebilir', () => {
    const sessions = renderToStaticMarkup(<ExamNavigationPage segments={['yks']} rootHref="/"/>);
    const subjects = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'tyt']} rootHref="/"/>);
    const topic = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'tyt', 'fizik']} rootHref="/"/>);
    const ayt = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'ayt', 'fizik']} rootHref="/"/>);

    expect(sessions).toContain('href="/sinav/yks/tyt"');
    expect(sessions).toContain('href="/sinav/yks/ayt"');
    expect(subjects).toContain('href="/sinav/yks/tyt/fizik"');
    expect(topic).toContain('href="/konu/buoyancy"');
    expect(ayt).toContain('henüz yayımlanmış konu yok');
  });

  it('konu seçimi giriş ve kayıt ekranına bağlamıyla taşınır', () => {
    const selection = learningPathFromPathname('/konu/buoyancy/testler');
    const html = renderToStaticMarkup(
      <AuthScreen
        initialError=""
        selection={selection}
        onBack={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(journeyLabel(selection)).toBe('YKS · TYT · Fizik');
    expect(html).toContain('YKS · TYT · Fizik · Kaldırma Kuvveti');
    expect(html).toContain('Seçimin hazır');
    expect(html).toContain('Hesap oluştur');
    expect(subjectHref(selection!)).toBe('/sinav/yks/tyt/fizik');
  });

  it('mevcut öğrencinin kayıtlı sınavını ve eski konu URL’sini geri bulur', () => {
    expect(learningPathForUser('yks-2026')?.id).toBe('yks');
    expect(learningPathFromPathname('/sinav/yks/ayt')?.session?.id).toBe('ayt');
    expect(findTopicPlacement('buoyancy')?.path).toBe('/konu/buoyancy');
    expect(findTopicPlacement('buoyancy')?.session?.id).toBe('tyt');
  });
});
