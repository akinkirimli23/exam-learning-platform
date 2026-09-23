import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ExamNavigationPage, ExamQuickStart } from '../components/exam-navigation';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';
import { createExamRegistry, examRegistry, type ExamPath } from '../shared/exam-registry';
import { createTopicRegistry } from '../shared/topic-engine';
import type { ContentDTO } from '../shared/contracts';

const publishedBuoyancy: ContentDTO = {
  id: 'buoyancy-v1',
  logical_id: 'buoyancy',
  kind: 'topic',
  parent_id: 'physics',
  title: 'Kaldırma Kuvveti',
  demo: true,
  status: 'published',
  revision: 1,
  payload: { description: 'Kaldırma kuvvetini keşfet.' },
  source: { url: '', license: 'Test içeriği', attribution: '' },
};

describe('sınav ve konu navigasyonu', () => {
  it('ana sayfadan YKS, TYT ve AYT oturumlarına açılır', () => {
    const home = renderToStaticMarkup(<ExamQuickStart/>);
    const sessions = renderToStaticMarkup(<ExamNavigationPage segments={['yks']} content={[publishedBuoyancy]}/>);

    expect(home).toContain('href="/sinav/yks"');
    expect(home).toContain('TYT · AYT');
    expect(sessions).toContain('href="/sinav/yks/tyt"');
    expect(sessions).toContain('href="/sinav/yks/ayt"');
  });

  it('TYT Fizik altında yayımlanmış Kaldırma Kuvveti konusunu mevcut URL ile gösterir', () => {
    const subjects = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'tyt']} content={[publishedBuoyancy]}/>);
    const topics = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'tyt', 'fizik']} content={[publishedBuoyancy]}/>);

    expect(subjects).toContain('href="/sinav/yks/tyt/fizik"');
    expect(subjects).toContain('1 konu');
    expect(topics).toContain('Kaldırma Kuvveti');
    expect(topics).toContain('href="/konu/buoyancy"');
    expect(buoyancyTopicDefinition.quiz).toHaveLength(20);
    expect(examRegistry.get('yks')?.sessions[1].subjects.find((subject) => subject.id === 'fizik')?.topicIds).toEqual([]);
  });

  it('yayımlanmamış konuyu açmaz ve boş ders için açık durum gösterir', () => {
    const unpublished = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'tyt', 'fizik']} content={[]}/>);
    const empty = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'ayt', 'fizik']} content={[publishedBuoyancy]}/>);

    expect(unpublished).not.toContain('href="/konu/buoyancy"');
    expect(empty).toContain('henüz yayımlanmış konu yok');
  });

  it('aynı canonical konuyu TYT ve AYT yollarında veri kopyalamadan referanslayabilir', () => {
    const topics = createTopicRegistry([buoyancyTopicDefinition]);
    const exam: ExamPath = {
      id: 'yks', title: 'YKS', description: '',
      sessions: [
        { id: 'tyt', title: 'TYT', description: '', subjects: [{ id: 'fizik', title: 'Fizik', description: '', topicIds: ['buoyancy'] }] },
        { id: 'ayt', title: 'AYT', description: '', subjects: [{ id: 'fizik', title: 'Fizik', description: '', topicIds: ['buoyancy'] }] },
      ],
    };
    const registry = createExamRegistry([exam], topics);

    expect(registry.get('yks')?.sessions[0].subjects[0].topicIds[0]).toBe('buoyancy');
    expect(registry.get('yks')?.sessions[1].subjects[0].topicIds[0]).toBe('buoyancy');
    expect(topics.size).toBe(1);
    expect(topics.get('buoyancy')?.quiz).toHaveLength(20);
  });

  it('registry bilinmeyen konuyu ve yanlış ders yerleşimini reddeder', () => {
    const topics = createTopicRegistry([buoyancyTopicDefinition]);
    const base: ExamPath = {
      id: 'yks', title: 'YKS', description: '',
      sessions: [{ id: 'tyt', title: 'TYT', description: '', subjects: [{ id: 'fizik', title: 'Fizik', description: '', topicIds: ['unknown'] }] }],
    };

    expect(() => createExamRegistry([base], topics)).toThrow(/unknown topic/);
    expect(() => createExamRegistry([{ ...base, sessions: [{ ...base.sessions[0], subjects: [{ ...base.sessions[0].subjects[0], id: 'kimya', topicIds: ['buoyancy'] }] }] }], topics)).toThrow(/belongs to/);
  });
});
