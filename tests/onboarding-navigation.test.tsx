import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AuthScreen, ExamOnboardingShell, postAuthDestination, postExamDestination } from '../components/learning-app';
import { ExamNavigationPage } from '../components/exam-navigation';
import {
  findTopicPlacement,
  journeyLabel,
  learningPathForUser,
  learningPathFromPathname,
  subjectHref,
} from '../shared/learning-path';

describe('giriş öncelikli başlangıç akışı', () => {
  it('ilk ziyaretçiye doğrudan güvenli giriş ve kayıt ekranını gösterir', () => {
    const html = renderToStaticMarkup(<AuthScreen initialError="" onSuccess={vi.fn()}/>);

    expect(html).toContain('Kaldığın yerden devam et.');
    expect(html).toContain('Giriş yap');
    expect(html).toContain('Hesap oluştur');
    expect(html).not.toContain('Hangi sınava hazırlanıyorsun?');
  });

  it('sınavı olmayan öğrenciye girişten sonra tam sayfa sınav seçimini gösterir', () => {
    const html = renderToStaticMarkup(<ExamOnboardingShell
      user={{id:'new-student',email:'student@example.test',name:'Yeni Öğrenci',role:'student',dailyGoal:5,weeklyGoal:5,examId:null,timezone:'Europe/Istanbul',notifications:false}}
      content={[]}
      error=""
      onExamSelect={vi.fn()}
      onLogout={vi.fn()}
    />);

    expect(html).toContain('Hangi sınava hazırlanıyorsun?');
    expect(html).toContain('href="/sinav/yks"');
    expect(html).toContain('LGS');
    expect(html).toContain('KPSS');
    expect(html).toContain('YAKINDA');
    expect(html).toContain('Çıkış yap');
  });

  it('YKS, TYT, Fizik ve canonical konu yolu veri modelinde korunur', () => {
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
        onSuccess={vi.fn()}
      />,
    );

    expect(journeyLabel(selection)).toBe('YKS · TYT · Fizik');
    expect(html).toContain('YKS · TYT · Fizik · Kaldırma Kuvveti');
    expect(html).toContain('Bağlantıdaki konu hazır');
    expect(html).toContain('Hesap oluştur');
    expect(subjectHref(selection!)).toBe('/sinav/yks/tyt/fizik');
  });

  it('mevcut öğrencinin kayıtlı sınavını ve eski konu URL’sini geri bulur', () => {
    expect(learningPathForUser('yks-2026')?.id).toBe('yks');
    expect(learningPathFromPathname('/sinav/yks/ayt')?.session?.id).toBe('ayt');
    expect(findTopicPlacement('buoyancy')?.path).toBe('/konu/buoyancy');
    expect(findTopicPlacement('buoyancy')?.session?.id).toBe('tyt');
    const selection = learningPathFromPathname('/konu/buoyancy/testler');
    expect(postAuthDestination('yks-2026', '/konu/buoyancy/testler', selection)).toBe('/konu/buoyancy/testler');
    expect(postAuthDestination(null, '/konu/buoyancy/testler', selection)).toBe('/konu/buoyancy/testler');
    expect(postExamDestination('yks', '/konu/buoyancy/testler', false)).toBe('/konu/buoyancy/testler');
    expect(postExamDestination('yks', '/konular', false)).toBe('/sinav/yks');
    expect(postExamDestination('yks', '/konu/buoyancy/testler', true)).toBe('/sinav/yks');
    expect(postExamDestination('lgs', '/konu/buoyancy/testler', false)).toBe('/sinav/lgs');
    expect(postAuthDestination('yks-2026', '/giris')).toBe('/');
  });
});
