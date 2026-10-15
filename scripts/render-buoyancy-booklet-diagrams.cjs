// Presentation-only SVG artwork. Source bank, answer keys and original figures stay untouched.
const fs = require('node:fs');
const path = require('node:path');
const { renderScene, scenes } = require('./lib/buoyancy-booklet-art.cjs');
const root = path.resolve(__dirname, '..');
const bank = JSON.parse(fs.readFileSync(path.join(root, 'server/content/buoyancy-question-bank.json'), 'utf8'));
const signature = text => { let value = 2166136261; for (const c of text) value = Math.imul(value ^ c.charCodeAt(0), 16777619); return (value >>> 0).toString(16); };
const folder = path.join(root, 'public/question-bank/buoyancy/booklet');
fs.mkdirSync(folder, { recursive: true });
const illustrations = {};
for (const test of bank.tests) for (const question of test.questions.filter(item => item.figure)) {
  const scene = scenes[question.id];
  if (!scene) throw new Error(`Missing reviewed scene: ${question.id}`);
  fs.writeFileSync(path.join(folder, question.id + '.svg'), renderScene(scene, question.figure.alt).replace(/[\t ]+$/gm, '').trimEnd() + '\n');
  illustrations[question.id] = { source: '/question-bank/buoyancy/' + question.id + '.svg', src: '/question-bank/buoyancy/booklet/' + question.id + '.svg', stemSignature: signature(question.stem) };
}
if (Object.keys(illustrations).length !== Object.keys(scenes).length) throw new Error('Orphaned illustration');
const definition = { testId: 'buoyancy-easy-01', examLabel: 'TYT FİZİK', topicLabel: 'KALDIRMA KUVVETİ', testLabel: 'KOLAY TEST 1', unitLabel: 'AKIŞKANLAR', badgeLabel: 'Sıvılarda kaldırma kuvveti', questionsPerPage: 4, illustrations };
fs.writeFileSync(path.join(root, 'shared/content/physics/buoyancy/question-booklet.json'), JSON.stringify(definition, null, 2) + '\n');
console.log(`Rendered ${Object.keys(illustrations).length} volumetric SVG diagrams; source questions, keys and SVGs untouched.`);
