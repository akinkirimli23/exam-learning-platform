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

  it('25 kartı ve 20 ana soruyu doğrular; 12 arşiv sorusunu yayımlamadan korur', () => {
    expect(pressureTopicDefinition.flashcards).toHaveLength(25);
    expect(pressureMainQuiz).toHaveLength(20);
    expect(pressureQuestionBank).toHaveLength(12);
    expect(pressureTopicDefinition.questionBank).toBeUndefined();
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

  it('öğrenme bileşenlerini açar; soru bankasını hazırlanıyor durumunda tutar ve arşiv görsellerini korur', () => {
    expect(renderToStaticMarkup(<ConceptExplorer conceptMap={pressureTopicDefinition.conceptMap} />)).toContain('8 ana dalda bağlantıları keşfet');
    expect(renderToStaticMarkup(<TopicFlashcards definition={pressureTopicDefinition} />)).toContain('Basınç Kartları');
    expect(renderToStaticMarkup(<TopicQuiz definition={pressureTopicDefinition} />)).toContain('120 N');
    const bankHtml = renderToStaticMarkup(<QuestionBank definition={pressureTopicDefinition} />);
    expect(bankHtml).toContain('Basınç soru bankası hazırlanıyor');
    expect(bankHtml).not.toContain('Teste başla');
    const visuals = new Set(pressureQuestionBank.map(item => item.visualId).filter(Boolean));
    expect(visuals.size).toBeGreaterThanOrEqual(5);
    for (const id of visuals) {
      const svg = renderToStaticMarkup(<QuestionVisual visualId={id} />);
      expect(svg, id).toContain('<svg');
      expect(svg, id).toContain('aria-label=');
    }
    expect(pressureTopicDefinition.media.map(item => item.objectPath)).toEqual([
      'physics/pressure/reviewed-2026-10-15/video/Kati_Basincini_Hesaplamak_Incelenmis.mp4',
      'physics/pressure/reviewed-2026-10-15/video/Sivi_Basincinda_Ustalasmak_Incelenmis.mp4',
      'physics/pressure/reviewed-2026-10-15/video/Gaz_Basincini_Anlamak_Incelenmis.mp4',
      'physics/pressure/reviewed-2026-10-15/slides/Basinc_ve_Kuvvet_Ders_Rehberi.pdf',
      'physics/pressure/reviewed-2026-10-15/infographic/Basinc_Konu_Ozeti.png',
      'physics/pressure/reviewed-2026-10-15/infographic/Basinc_Kavram_Haritasi.png',
    ]);
    expect(pressureTopicDefinition.media.map(item => item.type)).toEqual(['video', 'video', 'video', 'slides', 'infographic', 'infographic']);
    expect(pressureTopicDefinition.media.every(item => item.bucket === 'learning-media')).toBe(true);
    expect(pressureTopicDefinition.media.filter(item => item.type === 'video').every(item => item.editorialNote?.includes('düzeltme kartları'))).toBe(true);
  });

  it('referanstaki sekiz dalı ve 37 alt kavramı canonical ağ içinde eksiksiz tutar', () => {
    const map = pressureTopicDefinition.conceptMap;
    expect(map.children.map(node => node.title)).toEqual([
      'Temel Kavramlar', 'Katı Basıncı', 'Sıvı Basıncı', 'Sıvı Basınç Kuvveti',
      'Basınç Uygulamaları', 'Akışkanların Basıncı', 'Gaz Basıncı', 'Ölçüm Araçları ve Deneyler',
    ]);
    expect(map.children.map(node => node.children.length)).toEqual([5, 5, 5, 3, 3, 5, 6, 5]);
    expect(flattenConceptNodes(map)).toHaveLength(46);
    const byId = new Map(flattenConceptNodes(map).map(node => [node.id, node]));
    for (const id of ['solid-pressure', 'liquid-pressure', 'pascal-principle', 'gas-pressure', 'daily-applications']) {
      expect(byId.has(id)).toBe(true);
    }
    expect(byId.get('solid-force-transfer')?.detailedDescription).toContain('statik dengeli');
    expect(byId.get('pascal-principle')?.detailedDescription).toContain('basınç değişimi');
    expect(byId.get('bernoulli')?.detailedDescription).toContain('aynı akım çizgisinde');
    expect(byId.get('ideal-gas')?.formula).toBe('PV = nRT');
    expect(byId.get('torricelli')?.detailedDescription).toContain('1643');
  });

  it('yanlış yanıtı doğru canonical kavrama bağlar', () => {
    const question = pressureQuestionBank[0];
    const wrong = (question.correctAnswer + 1) % question.options.length;
    const record = gradeLearningQuestion(question, wrong);
    expect(record.isCorrect).toBe(false);
    expect(summarizeIncorrectConcepts(pressureTopicDefinition, [record])).toEqual([
      { conceptId: question.conceptId, title: 'Katı Basıncı', count: 1 },
    ]);
  });

  it('yan yüzey kuvvetinde alan merkezi ile basınç merkezini ve hidrolik koşullarını ayırır', () => {
    const byId = new Map(flattenConceptNodes(pressureTopicDefinition.conceptMap).map(node => [node.id, node]));
    expect(byId.get('liquid-force-formula')?.formula).toBe('F_g = P_ort,g·A = ρg h_C A');
    expect(byId.get('liquid-force-formula')?.detailedDescription).toContain('her şekil için iki uç derinliğinin ortalaması değildir');
    expect(byId.get('liquid-side-pressure')?.detailedDescription).toContain('basınç merkezi');
    expect(byId.get('liquid-side-pressure')?.formula).toContain('dikdörtgende');
    expect(byId.get('hydraulic-lifts')?.detailedDescription).toContain('farklı piston seviyelerinde');
    const card = pressureTopicDefinition.flashcards.find(item => item.id === 'pressure-card-016')!;
    expect(card.back).toContain('Aynı seviyedeki');
    const question = pressureMainQuiz.find(item => item.id === 'pressure-q-014')!;
    expect(question.question).toContain('Aynı seviyede');
    expect(question.options[question.correctAnswer]).toBe('400');
    expect(40 * 20 / 2).toBe(Number(question.options[question.correctAnswer]));
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
      const pascal = (await db.query<{ payload: { body: string } }>("SELECT payload FROM content WHERE logical_id='pressure-lesson-pascal'")).rows[0];
      expect(pascal.payload.body).toContain('Aynı seviyedeki ve aynı dış basınca açık pistonlarda');
      expect(pascal.payload.body).toContain('hidrostatik basınç farkı');
      expect((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM content WHERE logical_id='buoyancy'")).rows[0].count).toBe(1);
      expect((await db.query<{ version: number }>('SELECT version FROM schema_migrations ORDER BY version')).rows.map(row => row.version)).toEqual([1, 2]);
      await db.exec("INSERT INTO users(id,email,name,password_hash,adult_confirmed) VALUES('pressure-student','pressure@example.test','Test','unused',true)");
      const question = pressureMainQuiz[0];
      await db.transaction(tx => captureStaticMistake(tx, { id: 'pressure-student' }, {
        topicId: 'pressure', questionId: question.id, source: 'question-bank',
        selectedAnswer: (question.correctAnswer + 1) % question.options.length,
      }));
      const draftQuestion = pressureQuestionBank[0];
      await expect(db.transaction(tx => captureStaticMistake(tx, { id: 'pressure-student' }, {
        topicId: 'pressure', questionId: draftQuestion.id, source: 'question-bank',
        selectedAnswer: (draftQuestion.correctAnswer + 1) % draftQuestion.options.length,
      }))).rejects.toThrow('Soru bulunamadı.');
      const notebook = await listMistakes(db, 'pressure-student');
      expect(notebook.items).toHaveLength(1);
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
