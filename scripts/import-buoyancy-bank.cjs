// Explicit local import only; never connects to a database or publishes content.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { replacementDiagrams } = require('./buoyancy-bank-diagrams.cjs');
const root = path.resolve(__dirname, '..');
const input = path.join(root, 'imports/buoyancy-question-bank');
const pack = JSON.parse(fs.readFileSync(path.join(input, 'question-bank-135.json'), 'utf8'));
const digest = value => createHash('sha256').update(value).digest('hex');

// Independently checked answer keys, not taken from the source answer field.
const checkedKeys = {
  'buoyancy-easy-01': 'BDCCA EEDBD ABCEA'.replaceAll(' ', ''),
  'buoyancy-easy-02': 'DEEB CBA CDB EDCAA'.replaceAll(' ', ''),
  'buoyancy-easy-03': 'CDBEC CEADB AEBDA'.replaceAll(' ', ''),
  'buoyancy-medium-01': 'DABAC EBEDC AEDBC'.replaceAll(' ', ''),
  'buoyancy-medium-02': 'EBDCB DABEC ADCAE'.replaceAll(' ', ''),
  'buoyancy-medium-03': 'ECCCE DDAAB BEABD'.replaceAll(' ', ''),
  'buoyancy-hard-01': 'DABDE ABBEC ACDCE'.replaceAll(' ', ''),
  'buoyancy-hard-02': 'CECCE ABABB ADEDD'.replaceAll(' ', ''),
  'buoyancy-hard-03': 'ABCBE CAEDD CAEBD'.replaceAll(' ', ''),
};
const corrections = [
  {
    id: 'buoyancy-medium-02-q15',
    issue: 'Anahtarın tahtaya bağlı kalıp kalmadığı belirsiz; gergin ip son dengeyi değiştirebilir.',
    stem: 'Bir gölde yüzen tahta parçasının üzerinde küçük, yoğun bir metal anahtar bulunmaktadır. Anahtarın tahta ile bütün bağları kesilip anahtar gölün dibine bırakılıyor; anahtar tabanda duruyor. Başlangıçtaki tahta + anahtar durumuna göre su seviyesi nasıl değişir? (Su kaybı yok; metalin özkütlesi sudan büyük.)',
  },
  {
    id: 'buoyancy-medium-03-q08',
    issue: 'Kapatılmış hava boşluğuna su girişinin nasıl gerçekleştiği açıklanmamış.',
    stem: 'Daha önce suda yüzen bir cismin içindeki hava boşluğu açılıyor, hava çıkarılarak boşluğa su dolduruluyor ve cisim yeniden kapatılıyor. Dış hacim değişmiyor; havanın kütlesi ihmal ediliyor. Bu işlem sonucunda hangi büyüklük değişir?',
  },
  {
    id: 'buoyancy-hard-01-q09',
    issue: 'Dış destekle tutulan cisimde toplam net kuvvet sıfır olabilir; destek kaldırılması belirtilmemiş.',
    stem: 'g=10 N/kg iken ağırlığı 6 N olan, 0,5 L hacimli cisim, özkütlesi 1 kg/L olan sıvıda tamamen batıktır. Birinci deneyde g=10 N/kg, ikinci deneyde g=20 N/kg alınır. Her deneyde dış destek kaldırılıp cisim ilk hızsız serbest bırakıldığı anda net aşağı kuvvetin büyüklüğü sırasıyla kaç N olur? (Kütle ve hacim sabit; sıvı direnci ihmal.)',
  },
  {
    id: 'buoyancy-hard-02-q07',
    issue: 'Kapalı küreye su girişi ve yeniden kapatılması açık değil.',
    stem: 'Suda yüzen plastik kürenin başlangıçtaki toplam kütlesi 600 g, dış hacmi 1 L’dir. İçindeki hava boşluğu açılıp hava çıkarılır, küreye 500 g su eklenir ve küre yeniden kapatılır. Dış hacim değişmiyor; havanın kütlesi ihmal ediliyor. Küre serbest bırakıldığında son durumda ne olur? (Suyun özkütlesi 1 kg/L.)',
  },
  {
    id: 'buoyancy-hard-02-q11',
    issue: 'Özkütle oranı için iki sıvıda da eşit batık hacim gerekli; tam batma koşulu eksik.',
    stem: 'Aynı metal cisim dinamometreye asıldığında havada 60 N gösteriyor. Cisim önce suya, sonra bilinmeyen sıvıya tamamen batırılıp tabana değmeden dengede tutulduğunda dinamometre sırasıyla 42 N ve 36 N gösteriyor. Suyun özkütlesi 1 g/cm³ ise bilinmeyen sıvının özkütlesi kaç g/cm³’tür? (Havanın kaldırması ihmal.)',
  },
  {
    id: 'buoyancy-hard-02-q14',
    issue: 'Veriler standart TYT su modeli için 1,6 kg/L gerektiriyor; su adı fiziksel olarak uygun değil.',
    stem: 'Aynı cisim K sıvısında 1 L, yağda 2 L batık hacimle her iki durumda da serbestçe yüzüyor. Yağın özkütlesi 0,8 kg/L ise K sıvısının özkütlesi kaç kg/L’dir? (Cismin kütlesi ve dış hacmi değişmiyor.)',
    solution: 'İki sıvıda da kaldırma kuvveti aynı ağırlığa eşittir: ρ_K × 1 L = 0,8 kg/L × 2 L. Buradan ρ_K = 1,6 kg/L bulunur. K, özkütlesi bilinmeyen bir sıvıdır; saf su olduğu varsayılmaz.',
  },
  {
    id: 'buoyancy-hard-03-q04',
    issue: 'A ve D seçenekleri aynı artış yargısını tekrarlıyor; çeldiriciler ayrıştırılmalı.',
    option: { key: 'D', text: 'Metal bilyenin dış hacmine eşit ek hacim yer değiştirdiği için yükselir.' },
  },
];
const revision = 'ivme-buoyancy-135-audit-v1';
const diagramCorrections = [
  { id: 'buoyancy-medium-02-q11', issue: 'Şemada metinde verilmeyen V=0,5 L ve taşma çıkışı var; tam batırılma gösterilmiyor.', alt: 'Elle tamamen suya batırılan 100 g oyuncak; el kuvveti aşağı yönlüdür. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-03-q04', issue: 'Yatay eksen V / derinlik olarak iki farklı nicelikle adlandırılmış.', alt: 'Kaldırma kuvveti, dik prizmanın batırma derinliğiyle önce doğrusal artar, tam batınca sabit kalır. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-03-q10', issue: 'Hacim-kuvvet deneyinin yatay ekseninde derinlik etiketi de var.', alt: 'Batık hacim ile kaldırma kuvveti doğrusal ilişkilidir: 1 L için 8 N, 3 L için 24 N. Şema ölçekli değildir.' },
  { id: 'buoyancy-hard-01-q14', issue: 'Batık yükseklik ve batırma derinliği karışmış; batık yüksekliğe karşı grafikte plato uygun değil.', alt: 'Kaldırma kuvveti ile batık yükseklik h doğrusal ilişkilidir; yükseklik azalınca kuvvet de azalır. Şema ölçekli değildir.' },
  { id: 'buoyancy-easy-01-q11', issue: 'Tam batırılan cisim taşma şemasında kısmen batık gösterilmiş.', alt: 'Taşma seviyesindeki kapta tamamen batık cisim ve taşma çıkışı. Şema ölçekli değildir.' },
  { id: 'buoyancy-easy-03-q05', issue: 'Kısmen batık taş tamamen batık çizilmiş.', alt: 'Dinamometreye asılı, henüz kısmen batık taş. Şema ölçekli değildir.' },
  { id: 'buoyancy-easy-03-q07', issue: 'Tam batık 500 cm³ cisim kısmen batık çizilmiş.', alt: '500 cm³ hacimli cisim taşma kabında tamamen batık. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-01-q05', issue: 'Yarısı batık ve ipe asılı başlangıç durumu tamamen batık ve ipsiz gösterilmiş.', alt: 'G=18 N, T=12 N olan cisim dinamometrede, hacminin yarısı sıvıda. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-01-q14', issue: 'Öğrencinin el kuvveti yerine tabana bağlı ip çizilmiş.', alt: 'Yüzen top elle aşağı bastırılarak tamamen su altında dengede tutuluyor. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-02-q03', issue: 'Dibe batan yoğun cisim su yüzeyinde çizilmiş.', alt: '200 g, 100 cm³ cisim taşma kabının tabanında; taşma çıkışı gösteriliyor. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-02-q05', issue: 'Tekneden bırakılan yüzen tahta son durumda tabanda çizilmiş.', alt: 'Tahta önce teknenin içinde; bırakıldıktan sonra su yüzeyinde yüzüyor. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-02-q08', issue: 'İki ayrı deneyin yüzme ve batma durumları tek yüzen cisimle gösterilmiş.', alt: 'K ayrı deneyde yüzüyor, L ayrı deneyde tabanda; her ikisinin dış hacmi 1 L. Şema ölçekli değildir.' },
  { id: 'buoyancy-medium-03-q01', issue: 'Soru hangi cismin yüzeceğini sorarken şema son dengeyi gösterip cevabı açıklıyor.', alt: 'Serbest bırakılmadan önce eşit hacimli K, L, M blokları sıvının üzerinde; kütleleri 100, 150, 200 g. Şema ölçekli değildir.' },
  { id: 'buoyancy-hard-01-q04', issue: 'Teknede başlayan ve tabana batan yoğun metal yüzeyde yüzen blok olarak çizilmiş.', alt: '6 kg, 2 L metal önce teknede, sonra suyun tabanında; tekne her iki durumda yüzüyor. Şema ölçekli değildir.' },
  { id: 'buoyancy-hard-02-q07', issue: 'Su ekleme etiketiyle hâlâ yüzen şema son durumla karışıyor; başlangıç ayrı belirtilmeli.', alt: 'Su eklenmeden önce başlangıçta yüzen 600 g, 1 L plastik küre. Şema ölçekli değildir.' },
  { id: 'buoyancy-hard-02-q09', issue: 'Yüzücünün aşağı bastırma kuvveti yerine tabana bağlı ip gösterilmiş.', alt: '5 L, 3 kg tahta elle tamamen su altında tutuluyor; el kuvveti aşağı yönlü. Şema ölçekli değildir.' },
  { id: 'buoyancy-hard-03-q04', issue: 'Deney tüpü yerine tekne ve içindeki bilye yerine dışarıdaki yük çizilmiş.', alt: 'Yüzen deney tüpünün içindeki metal bilye, sonraki durumda çıkarılıp su tabanına bırakılıyor. Şema ölçekli değildir.' },
];
const publicLevels = { easy: 'kolay', medium: 'orta', hard: 'zor' };
const duration = { easy: 20, medium: 25, hard: 30 };
const decisions = [], assets = {}, sourceAssets = {}, original = {}, tests = [];
const ids = new Set(), stems = new Set();
if (pack.tests.length !== 9) throw new Error('Exactly nine source tests required.');
for (const test of pack.tests) {
  if (test.questions.length !== 15 || checkedKeys[test.id]?.length !== 15) throw new Error(`Invalid test size: ${test.id}`);
  const perTest = JSON.parse(fs.readFileSync(path.join(input, 'tests', test.id + '.json'), 'utf8'));
  if (JSON.stringify(perTest) !== JSON.stringify(test)) throw new Error(`Combined and per-test sources differ: ${test.id}`);
  for (const [index, question] of test.questions.entries()) {
    if (ids.has(question.id)) throw new Error('Duplicate question id.');
    ids.add(question.id);
    original[question.id] = digest(JSON.stringify(question));
    const fix = corrections.find(item => item.id === question.id);
    if (fix?.stem) question.stem = fix.stem;
    if (fix?.solution) question.solution = fix.solution;
    if (fix?.option) question.options.find(option => option.key === fix.option.key).text = fix.option.text;
    const normalizedStem = question.stem.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
    if (stems.has(normalizedStem)) throw new Error('Duplicate question text.');
    stems.add(normalizedStem);
    if (question.number !== index + 1 || question.answer !== checkedKeys[test.id][index]) throw new Error(`Independent answer review failed: ${question.id}`);
    if (question.options.length !== 5 || question.options.map(option => option.key).join('') !== 'ABCDE') throw new Error('Five ordered choices required.');
    if (new Set(question.options.map(option => option.text.trim())).size !== 5) throw new Error('Repeated choice.');
    if (question.figure) {
      if (question.figure.path !== `assets/${question.id}.svg` || !question.figure.alt.trim()) throw new Error('Unexpected figure reference.');
      const originalSvg = fs.readFileSync(path.join(input, question.figure.path));
      sourceAssets[question.id + '.svg'] = digest(originalSvg);
      let text = originalSvg.toString('utf8');
      const drawingFix = diagramCorrections.find(item => item.id === question.id);
      if (drawingFix) {
        question.figure.alt = drawingFix.alt;
        if (replacementDiagrams[question.id]) {
          text = replacementDiagrams[question.id];
        } else if (question.id === 'buoyancy-medium-02-q11') {
          text = text.replace('x="365" y="138"', 'x="365" y="198"')
            .replace('<path d="M565 145H625V235" fill="none" stroke="#178fad" stroke-width="9" stroke-linecap="round"/>', '')
            .replace('<path d="M603 250 L624 278 L645 250" fill="none" stroke="#178fad" stroke-width="5"/>', '')
            .replace('V=0,5 L', 'Oyuncak: 100 g; elle tamamen batık')
            .replace('</svg>', '<line class="arrow" x1="402" y1="105" x2="402" y2="185"/><path class="arrow" d="M394 177L402 190L410 177"/><text class="small" x="420" y="122">El kuvveti</text></svg>');
        } else {
          const label = question.id === 'buoyancy-medium-03-q10' ? 'Batık hacim V (L)' : question.id === 'buoyancy-hard-01-q14' ? 'Batık yükseklik h' : 'Batırma derinliği h';
          text = text.replace('<text x="670" y="335" class="small">V / derinlik</text>', `<text x="535" y="365" class="small">${label}</text>`);
          if (question.id === 'buoyancy-hard-01-q14') text = text.replace('M170 320L395 142H650', 'M170 320L600 115');
        }
        if (text === originalSvg.toString('utf8')) throw new Error('Expected SVG correction did not apply.');
      }
      if (!text.startsWith('<svg ') || /<(?:script|foreignObject|iframe|object|image|use|a)\b|\bon[a-z]+\s*=|\b(?:href|src)\s*=|@import|<!DOCTYPE|<!ENTITY|url\s*\(/i.test(text)) throw new Error(`Unsafe SVG: ${question.id}`);
      const target = path.join(root, 'public/question-bank/buoyancy', question.id + '.svg');
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, text);
      assets[question.id + '.svg'] = digest(text);
    }
    decisions.push({ id: question.id, expectedAnswer: checkedKeys[test.id][index], contentSha256: digest(JSON.stringify(question)), sourceSha256: original[question.id], concepts: question.conceptIds, correctionRequiredInSource: Boolean(fix) || diagramCorrections.some(item => item.id === question.id) });
  }
  tests.push({ id: test.id, title: test.title, difficulty: publicLevels[test.level], description: test.description, questionCount: 15, durationMinutes: duration[test.level], visualCount: test.questions.filter(question => question.figure).length });
}
if (ids.size !== 135 || Object.keys(assets).length !== 64) throw new Error('135 questions and 64 diagrams required.');
const write = (relative, value) => { const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n'); };
write('server/content/buoyancy-question-bank.json', { ...pack, revision });
write('server/content/buoyancy-bank-audit.json', { revision, reviewedAt: '2026-10-15', questions: decisions, assets, sourceAssets, corrections, diagramCorrections, reviewScope: 'All 135 stems, answer choices and solutions manually checked; quantitative examples independently recalculated. Original import is untouched. Local editorial draft, not a production publication.' });
write('shared/content/physics/buoyancy/question-bank-tests.json', tests);
console.log(`Prepared ${ids.size} questions, ${tests.length} tests, ${Object.keys(assets).length} SVGs; ${corrections.length} text and ${diagramCorrections.length} diagram corrections recorded. No database writes.`);
