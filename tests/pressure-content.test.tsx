import { PGlite } from '@electric-sql/pglite';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ConceptExplorer } from '../components/concept-explorer';
import { QuestionBank } from '../components/question-bank';
import { QuestionVisual } from '../components/question-visual';
import { TopicFlashcards, TopicQuiz } from '../components/topic-learning-content';
import { ExamNavigationPage } from '../components/exam-navigation';
import { initialSchema } from '../server/db';
import { seedPressureContent } from '../server/seed-pressure';
import { captureStaticMistake, listMistakes } from '../server/mistakes';
import { buoyancyTopicDefinition } from '../shared/content/physics/buoyancy/topic';
import { pressureTopicDefinition } from '../shared/content/physics/pressure/topic';
import { pressureMainQuiz, pressureQuestionBank } from '../shared/content/physics/pressure/data';
import { examRegistry } from '../shared/exam-registry';
import { flattenConceptNodes, gradeLearningQuestion, summarizeIncorrectConcepts } from '../shared/topic-engine';
import { topicRegistry } from '../shared/topic-registry';

describe('TYT Fizik Basınç', () => {
  it('canonical konuyu Kaldırma Kuvveti ile birlikte TYT Fizik altında gösterir', () => {
    expect(topicRegistry.get('pressure')).toEqual(pressureTopicDefinition);
    expect(topicRegistry.get('buoyancy')).toEqual(buoyancyTopicDefinition);
    const physics = examRegistry.get('yks')?.sessions.find(item => item.id === 'tyt')?.subjects.find(item => item.id === 'fizik');
    expect(physics?.topicIds).toEqual(['buoyancy', 'pressure']);
    const content = [buoyancyTopicDefinition, pressureTopicDefinition].map(definition => ({
      id: definition.id, logical_id: definition.id, kind: 'topic' as const, parent_id: 'physics',
      title: definition.title, status: 'published' as const, demo: true, revision: 1,
      payload: {}, source: { url: '', license: 'Test', attribution: '' },
    }));
    const html = renderToStaticMarkup(<ExamNavigationPage segments={['yks', 'tyt', 'fizik']} content={content} />);
    expect(html).toContain('Basınç');
    expect(html).toContain('Kaldırma Kuvveti');
    expect(html).toContain('/konu/pressure');
  });

  it('25 kart, açıklamalı 20 ana soru ve ayrı 12 soru bankası sorusunu doğrular', () => {
    expect(pressureTopicDefinition.flashcards).toHaveLength(25);
    expect(pressureMainQuiz).toHaveLength(20);
    expect(pressureQuestionBank).toHaveLength(12);
    const canonical = new Set(flattenConceptNodes(pressureTopicDefinition.conceptMap).map(node => node.id));
    const ids = new Set<string>();
    for (const item of [...pressureTopicDefinition.flashcards, ...pressureMainQuiz, ...pressureQuestionBank]) {
      expect(canonical.has(item.conceptId), item.id).toBe(true);
      expect(ids.has(item.id), item.id).toBe(false);
      ids.add(item.id);
    }
    for (const question of [...pressureMainQuiz, ...pressureQuestionBank]) {
      expect(question.options).toHaveLength(4);
      expect(question.options[question.correctAnswer].length).toBeGreaterThan(0);
      expect(question.explanation.length).toBeGreaterThan(20);
    }
    for (const level of ['kolay', 'orta', 'zor']) {
      expect(pressureQuestionBank.filter(item => item.difficulty === level)).toHaveLength(4);
    }
  });

  it('kavram haritası, ana test, kartlar, soru bankası ve 6 özgün SVG görseli ortak bileşenlerde açar', () => {
    expect(renderToStaticMarkup(<ConceptExplorer conceptMap={pressureTopicDefinition.conceptMap} />)).toContain('5 ana dalda bağlantıları keşfet');
    expect(renderToStaticMarkup(<TopicFlashcards definition={pressureTopicDefinition} />)).toContain('Basınç Kartları');
    expect(renderToStaticMarkup(<TopicQuiz definition={pressureTopicDefinition} />)).toContain('120 N');
    expect(renderToStaticMarkup(<QuestionBank definition={pressureTopicDefinition} />)).toContain('SORU BANKASI');
    const visuals = new Set(pressureQuestionBank.map(item => item.visualId).filter(Boolean));
    expect(visuals.size).toBeGreaterThanOrEqual(5);
    for (const id of visuals) {
      const svg = renderToStaticMarkup(<QuestionVisual visualId={id} />);
      expect(svg, id).toContain('<svg');
      expect(svg, id).toContain('aria-label=');
    }
    expect(pressureTopicDefinition.media.map(item => item.objectPath)).toEqual([
      'physics/pressure/video/Kati_basinci.mp4',
      'physics/pressure/video/Sivi_Basinci.mp4',
      'physics/pressure/video/Gaz_basinci.mp4',
    ]);
    expect(pressureTopicDefinition.media.every(item => item.type === 'video' && item.bucket === 'learning-media')).toBe(true);
  });

  it('yanlış yanıtı doğru canonical kavrama bağlar', () => {
    const question = pressureQuestionBank[0];
    const wrong = (question.correctAnswer + 1) % question.options.length;
    const record = gradeLearningQuestion(question, wrong);
    expect(record.isCorrect).toBe(false);
    expect(summarizeIncorrectConcepts(pressureTopicDefinition, [record])).toEqual([
      { conceptId: question.conceptId, title: 'Katı basıncı', count: 1 },
    ]);
  });

  it('yeni şema gerektirmeden mevcut v2 şemasına ekleyip tekrar çalıştırmada veri değiştirmez', async () => {
    const db = new PGlite();
    try {
      await db.exec(initialSchema);
      await db.exec(`
        INSERT INTO content(id,logical_id,kind,parent_id,title,revision,status,demo,payload,source)
        VALUES ('exam-v1','yks-2026','exam',null,'YKS',1,'published',true,'{}','{}'),
               ('physics-v1','physics','subject','yks-2026','Fizik',1,'published',true,'{}','{}'),
               ('buoyancy-v1','buoyancy','topic','physics','Kaldırma Kuvveti',1,'published',true,'{}','{}');
      `);
      expect(await db.transaction(tx => seedPressureContent(tx))).toBe(true);
      expect(await db.transaction(tx => seedPressureContent(tx))).toBe(false);
      const counts = (await db.query<{ kind: string; count: number }>("SELECT kind,count(*)::int AS count FROM content WHERE logical_id LIKE 'pressure%' GROUP BY kind")).rows;
      expect(Object.fromEntries(counts.map(row => [row.kind, row.count]))).toEqual({ topic: 1, objective: 6, lesson: 5, card: 25, question: 20 });
      expect((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM content WHERE logical_id='buoyancy'")).rows[0].count).toBe(1);
      expect((await db.query<{ version: number }>('SELECT version FROM schema_migrations ORDER BY version')).rows.map(row => row.version)).toEqual([1, 2]);
      await db.exec("INSERT INTO users(id,email,name,password_hash,adult_confirmed) VALUES('pressure-student','pressure@example.test','Test','unused',true)");
      for (const question of [pressureMainQuiz[0], pressureQuestionBank[0]]) {
        await db.transaction(tx => captureStaticMistake(tx, { id: 'pressure-student' }, {
          topicId: 'pressure', questionId: question.id, source: 'question-bank',
          selectedAnswer: (question.correctAnswer + 1) % question.options.length,
        }));
      }
      const notebook = await listMistakes(db, 'pressure-student');
      expect(notebook.items).toHaveLength(2);
      expect(notebook.items.every(item => item.topicId === 'pressure')).toBe(true);
    } finally {
      await db.close();
    }
  });

  it('kısmi içerik bulunduğunda transaction içinde hiçbir ek kayıt bırakmaz', async () => {
    const db = new PGlite();
    try {
      await db.exec(initialSchema);
      await db.exec(`
        INSERT INTO content(id,logical_id,kind,parent_id,title,revision,status,demo,payload,source)
        VALUES ('exam-v1','yks-2026','exam',null,'YKS',1,'published',true,'{}','{}'),
               ('physics-v1','physics','subject','yks-2026','Fizik',1,'published',true,'{}','{}'),
               ('pressure-v1','pressure','topic','physics','Eksik Basınç',1,'draft',true,'{}','{}');
      `);
      await expect(db.transaction(tx => seedPressureContent(tx))).rejects.toThrow('otomatik ekleme durduruldu');
      const count = (await db.query<{ count: number }>("SELECT count(*)::int AS count FROM content WHERE logical_id LIKE 'pressure%'")).rows[0].count;
      expect(count).toBe(1);
    } finally {
      await db.close();
    }
  });
});
