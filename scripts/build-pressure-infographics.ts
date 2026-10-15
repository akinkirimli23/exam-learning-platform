/**
 * Reproducible, code-native teaching illustrations. No source raster is edited.
 * Run from the repository root: npx tsx scripts/build-pressure-infographics.ts
 * Outputs are editorial imports, not public assets or database changes.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { pressureConceptMap } from '../shared/content/physics/pressure/concepts';

const OUT = path.resolve('imports/pressure-learning-media/prepared');
const WIDTH = 2400;
const ink = '#19324d';
const muted = '#50677d';
const font = "'Segoe UI', Arial, sans-serif";
const palettes = [
  { accent: '#d87b27', light: '#fff4e6' },
  { accent: '#078ab3', light: '#e9f7fe' },
  { accent: '#7350bb', light: '#f3eeff' },
  { accent: '#14897b', light: '#e8f8f3' },
  { accent: '#246ec3', light: '#eaf3ff' },
  { accent: '#ca536d', light: '#fff0f3' },
  { accent: '#668332', light: '#f3f7e9' },
  { accent: '#7161a8', light: '#f3f0fb' },
];

function escape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formattedText(value: string, size: number) {
  const pattern = /_([A-Za-zÇĞİÖŞÜçğıöşü]+)/gu;
  let content = '';
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    content += escape(value.slice(cursor, match.index)) +
      `<tspan baseline-shift="sub" font-size="${size * .68}">${escape(match[1])}</tspan>`;
    cursor = match.index + match[0].length;
  }
  return content + escape(value.slice(cursor));
}

function text(x: number, y: number, value: string, size = 26, fill = ink, weight = 400, anchor = 'start') {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${formattedText(value, size)}</text>`;
}

// Conservative glyph estimates leave generous space for Windows and Linux fonts.
function estimatedWidth(value: string, size: number) {
  return [...value].reduce((sum, character) => sum + (
    /[ilıİtfr.,:;!|']/u.test(character) ? 0.33 :
      /[MW@%Σ]/u.test(character) ? 0.96 :
        /[A-ZÇĞÖŞÜ]/u.test(character) ? 0.69 :
          /\s/u.test(character) ? 0.31 : 0.58
  ) * size, 0);
}

function wrap(value: string, width: number, size: number) {
  const lines: string[] = [];
  let current = '';
  for (const word of value.split(/\s+/u)) {
    const next = current ? `${current} ${word}` : word;
    if (current && estimatedWidth(next, size) > width) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

function paragraph(x: number, y: number, value: string, width: number, size = 25, lineHeight = 35, fill = muted, weight = 400) {
  const lines = wrap(value, width, size);
  return { svg: lines.map((line, index) => text(x, y + index * lineHeight, line, size, fill, weight)).join(''), height: lines.length * lineHeight };
}

function rect(x: number, y: number, width: number, height: number, fill: string, radius = 18, extra = '') {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" ${extra}/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, color = '#69879e', width = 3, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
}

function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 6) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 12 + width;
  const a = [x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6)];
  const b = [x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6)];
  return line(x1, y1, x2, y2, color, width, 'stroke-linecap="round"') + `<path d="M${x2} ${y2}L${a.join(' ')}L${b.join(' ')}Z" fill="${color}"/>`;
}

const defs = `<defs>
  <linearGradient id="header" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#102d4e"/><stop offset="1" stop-color="#075a7c"/></linearGradient>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#f6f9fc"/></linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#73daed" stop-opacity=".75"/><stop offset="1" stop-color="#1096cc" stop-opacity=".92"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b5ddee" stop-opacity=".75"/><stop offset=".13" stop-color="#fff" stop-opacity=".04"/><stop offset=".8" stop-color="#d2eefa" stop-opacity=".03"/><stop offset="1" stop-color="#83b6d0" stop-opacity=".65"/></linearGradient>
  <linearGradient id="wood-front" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffd08a"/><stop offset="1" stop-color="#df8b35"/></linearGradient>
  <linearGradient id="wood-top" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffdfaa"/><stop offset="1" stop-color="#f1b365"/></linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e9edf4"/><stop offset=".5" stop-color="#9eaec3"/><stop offset="1" stop-color="#586b87"/></linearGradient>
  <radialGradient id="balloon" cx=".32" cy=".25"><stop stop-color="#ffc293"/><stop offset=".65" stop-color="#ef835f"/><stop offset="1" stop-color="#d35265"/></radialGradient>
  <filter id="card-shadow" x="-8%" y="-8%" width="116%" height="120%"><feDropShadow dx="0" dy="8" stdDeviation="11" flood-color="#233d59" flood-opacity=".08"/></filter>
</defs>`;

function svg(width: number, height: number, title: string, description: string, content: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">${escape(description)}</desc>${defs}${content}</svg>\n`;
}

function header(title: string, subtitle: string, tag: string) {
  return rect(0, 0, WIDTH, 218, 'url(#header)', 0) +
    `<path d="M1900 0h500v218h-650z" fill="#fff" opacity=".035"/>` +
    `<circle cx="2232" cy="109" r="76" fill="none" stroke="#a1d7e5" stroke-width="2" opacity=".4"/>` +
    `<circle cx="2232" cy="109" r="58" fill="#ffffff" opacity=".07"/>` + text(2232, 134, 'P', 76, '#fff', 700, 'middle') +
    text(72, 57, 'İVME  /  TYT FİZİK', 23, '#99dcec', 700) +
    text(72, 125, title, 54, '#fff', 750) + text(72, 174, subtitle, 27, '#cce3ee') +
    text(2070, 190, tag, 19, '#bcd9e6', 600, 'end');
}

function cube(x: number, y: number, width: number, height: number, depth: number) {
  return `<path d="M${x} ${y}l${depth} ${-depth * .55}h${width}l${-depth} ${depth * .55}Z" fill="url(#wood-top)" stroke="#a66b31" stroke-width="2"/>` +
    `<path d="M${x + width} ${y}l${depth} ${-depth * .55}v${height}l${-depth} ${depth * .55}Z" fill="#c5833d" stroke="#a66b31" stroke-width="2"/>` +
    rect(x, y, width, height, 'url(#wood-front)', 2, 'stroke="#a66b31" stroke-width="2"') +
    [0.21, 0.37, 0.65, 0.82].map(fraction => `<path d="M${x + 5} ${y + height * fraction}q${width * .3} -4 ${width - 10} 0" fill="none" stroke="#bf7a35" stroke-opacity=".25" stroke-width="2"/>`).join('');
}

function solidDiagram() {
  return `<g transform="translate(0,4)">
    <ellipse cx="188" cy="245" rx="118" ry="15" fill="#e4d5bf" opacity=".45"/>
    <ellipse cx="511" cy="245" rx="147" ry="15" fill="#e4d5bf" opacity=".45"/>
    ${line(58, 235, 674, 235, '#b5a38d', 4)}
    ${cube(143, 104, 84, 130, 26)}${cube(418, 169, 168, 65, 26)}
    ${arrow(185, 25, 185, 94, '#d2762c')}${arrow(503, 90, 503, 159, '#d2762c')}
    ${text(218, 54, 'F', 28, '#b65e17', 700)}${text(536, 117, 'F', 28, '#b65e17', 700)}
    ${text(185, 277, 'A', 28, ink, 650, 'middle')}${text(505, 277, '2A', 28, ink, 650, 'middle')}
    ${text(185, 313, 'P', 25, muted, 600, 'middle')}${text(505, 313, 'P / 2', 25, muted, 600, 'middle')}
  </g>`;
}

function liquidDiagram() {
  const x = 94, y = 33, width = 393, height = 226, surface = 89;
  return `<g>
    <ellipse cx="292" cy="269" rx="222" ry="15" fill="#416b82" opacity=".09"/>
    <path d="M${x} ${y}v${height - 12}q0 24 32 24h${width - 64}q32 0 32 -24V${y}" fill="url(#glass)" stroke="#628ca8" stroke-width="4"/>
    <path d="M${x + 5} ${surface}h${width - 10}v${height - surface + y}q-3 18 -30 18H${x + 35}q-27 0 -30 -18Z" fill="url(#water)"/>
    <ellipse cx="290" cy="${surface}" rx="191" ry="13" fill="#98e5f0" stroke="#36accc" stroke-width="2"/>
    <path d="M${x + 15} 51v173q0 17 17 19" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="290" cy="${y}" rx="198" ry="14" fill="#e1f4fb" fill-opacity=".6" stroke="#628ca8" stroke-width="4"/>
    <ellipse cx="290" cy="${y}" rx="185" ry="8" fill="none" stroke="#fff" stroke-width="3"/>
    ${line(302, surface, 552, surface, '#578599', 2, 'stroke-dasharray="6 7"')}
    <circle cx="304" cy="158" r="8" fill="#0c5477"/>${text(324, 167, 'K', 27, '#064d70', 700)}
    <circle cx="304" cy="227" r="8" fill="#0c5477"/>${text(324, 236, 'L', 27, '#064d70', 700)}
    ${line(531, surface, 531, 158, '#078ab3', 3)}${line(522, 158, 540, 158, '#078ab3', 3)}${line(522, surface, 540, surface, '#078ab3', 3)}
    ${line(605, surface, 605, 227, '#078ab3', 3)}${line(596, 227, 614, 227, '#078ab3', 3)}${line(596, surface, 614, surface, '#078ab3', 3)}
    ${text(545, 133, 'h', 25, ink, 650)}${text(618, 169, '2h', 25, ink, 650)}
    ${text(290, 310, 'Aynı sıvıda: P_L = 2P_K', 25, ink, 600, 'middle')}
  </g>`;
}

function hydraulicDiagram() {
  return `<g>
    <ellipse cx="370" cy="269" rx="272" ry="15" fill="#5c4e8c" opacity=".08"/>
    <path d="M117 88V260H620V88M211 88V197H410V88" fill="none" stroke="#657897" stroke-width="5" stroke-linejoin="round"/>
    <path d="M121 141V256H616V141H414V201H207V141Z" fill="url(#water)"/>
    <path d="M126 157V245h477" fill="none" stroke="#d6f9ff" stroke-width="5" opacity=".6"/>
    ${rect(105, 119, 119, 23, 'url(#metal)', 4, 'stroke="#63728d" stroke-width="3"')}
    ${rect(396, 119, 238, 23, 'url(#metal)', 4, 'stroke="#63728d" stroke-width="3"')}
    ${rect(446, 54, 136, 56, '#d4c5eb', 8, 'stroke="#9276b5" stroke-width="3"')}
    ${line(224, 130, 396, 130, '#957bc2', 2, 'stroke-dasharray="6 7"')}
    ${arrow(163, 43, 163, 108, '#d87b27')}${text(190, 71, 'F₁', 27, '#a35d23', 700)}
    ${arrow(665, 233, 665, 152, '#7350bb')}${text(678, 187, 'F₂', 27, '#7350bb', 700)}
    ${text(164, 180, 'A₁', 27, '#074e73', 650, 'middle')}${text(516, 180, 'A₂', 27, '#074e73', 650, 'middle')}
    ${text(369, 308, 'ΔP₁ = ΔP₂', 30, '#7350bb', 700, 'middle')}
  </g>`;
}

function forceDiagram() {
  return `<g>
    ${rect(64, 42, 332, 224, '#e7f7fc', 12, 'stroke="#a8ccdc" stroke-width="3"')}
    ${rect(68, 75, 324, 187, 'url(#water)', 0)}${line(68, 75, 392, 75, '#3aaaca', 3)}
    ${rect(357, 109, 21, 144, 'url(#metal)', 2, 'stroke="#667a93" stroke-width="2"')}
    ${arrow(324, 125, 353, 125, '#087f90', 4)}${arrow(304, 158, 353, 158, '#087f90', 4)}${arrow(284, 192, 353, 192, '#087f90', 4)}${arrow(264, 225, 353, 225, '#087f90', 4)}
    <circle cx="368" cy="181" r="8" fill="#fabb58" stroke="#fff" stroke-width="2"/>
    ${text(388, 189, 'C', 25, '#145d6b', 700)}${line(429, 75, 429, 181, '#168a90', 3)}
    ${line(420, 75, 438, 75, '#168a90', 3)}${line(420, 181, 438, 181, '#168a90', 3)}${text(443, 136, 'h_C', 26, '#145d6b', 600)}
    ${text(232, 310, 'C: ıslanan alanın alan merkezi', 23, muted, 600, 'middle')}
    <path d="M527 92v165h128V92" fill="none" stroke="#658ba2" stroke-width="4"/>
    ${rect(531, 119, 120, 51, '#f9d88c', 0)}${rect(531, 170, 120, 83, '#54bbd9', 0)}
    ${text(590, 151, 'ρ₁, h₁', 23, ink, 600, 'middle')}${text(590, 216, 'ρ₂, h₂', 23, '#084a67', 600, 'middle')}
  </g>`;
}

function flowDiagram() {
  const streams = [0, 1, 2, 3, 4].map(index => {
    const y = 96 + index * 27;
    const middle = 135 + index * 10;
    return `<path d="M74 ${y}H203C266 ${y} 290 ${middle} 343 ${middle}H452C513 ${middle} 529 ${y} 607 ${y}H670" fill="none" stroke="#228ab2" stroke-width="2.5" opacity=".65"/>`;
  }).join('');
  return `<g>
    <path d="M70 76H198C267 76 290 119 344 119H452C513 119 534 76 675 76V225H607C531 225 510 181 452 181H344C290 181 267 225 198 225H70Z" fill="url(#water)" fill-opacity=".7" stroke="#638da4" stroke-width="4"/>
    ${streams}${line(71, 150, 673, 150, '#fff', 2, 'stroke-dasharray="5 8" opacity=".65"')}
    ${arrow(111, 150, 183, 150, '#df8531', 8)}${arrow(344, 150, 453, 150, '#df8531', 8)}
    ${text(165, 47, 'A₁ büyük', 25, ink, 600, 'middle')}${text(398, 92, 'A₂ küçük', 25, ink, 600, 'middle')}
    ${text(369, 280, 'A₁v₁ = A₂v₂', 28, '#176aa8', 700, 'middle')}
    ${text(369, 318, 'Yatay ideal akış: v₂ > v₁, P₂ < P₁', 23, muted, 500, 'middle')}
  </g>`;
}

function gasDiagram() {
  const dots = [[131, 168], [168, 213], [207, 173], [249, 223], [287, 166], [309, 220], [140, 242], [209, 241], [264, 196]];
  return `<g>
    <ellipse cx="219" cy="274" rx="146" ry="14" fill="#4b6b83" opacity=".08"/>
    <path d="M93 72v193h252V72" fill="url(#glass)" stroke="#71849c" stroke-width="4"/>
    ${rect(98, 142, 242, 118, '#e7e5fa', 0)}${rect(84, 119, 270, 23, 'url(#metal)', 4, 'stroke="#6b7690" stroke-width="3"')}
    ${rect(196, 61, 46, 58, 'url(#metal)', 3, 'stroke="#6b7690" stroke-width="2"')}
    ${arrow(219, 12, 219, 51, '#ca536d', 6)}${text(260, 45, 'F', 26, '#a93b54', 700)}
    ${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#9b80d1"/>`).join('')}
    ${text(218, 311, 'Gaz tanecikleri duvarlara çarpar.', 22, muted, 600, 'middle')}
    <ellipse cx="543" cy="135" rx="84" ry="108" fill="url(#balloon)" stroke="#ce676b" stroke-width="2"/>
    <ellipse cx="515" cy="85" rx="18" ry="29" fill="#fff" opacity=".32" transform="rotate(25 515 85)"/>
    <path d="M535 240l-9 18h33l-10-18M542 259c-21 18 13 29-4 45" fill="#d66c70" stroke="#ad5365" stroke-width="2"/>
    ${text(543, 144, 'P_iç', 25, '#803447', 650, 'middle')}${text(657, 135, 'P_dış', 24, ink, 600, 'middle')}
    ${text(543, 312, 'Zar gerilimini unutma.', 22, muted, 600, 'middle')}
  </g>`;
}

type SummaryCard = {
  title: string;
  eyebrow: string;
  formula: string;
  formulaSize?: number;
  diagram: string;
  points: string[];
};

const summaryCards: SummaryCard[] = [
  {
    title: 'Katılarda temas basıncı', eyebrow: '01  /  KUVVETİ ALANA DAĞIT', formula: 'P_ort = F_dik / A', diagram: solidDiagram(),
    points: [
      '1 Pa = 1 N/m². Yüzeye dik kuvveti ve gerçek temas alanını kullan.',
      'F_dik sabitse alan büyüdükçe ortalama basınç azalır.',
      'Katılarda kuvvetin her koşulda “aynen iletildiği” söylenemez.',
    ],
  },
  {
    title: 'Durgun sıvıda derinlik', eyebrow: '02  /  AYNI SIVI, AYNI YÜZEY BASINCI', formula: 'P_g = ρgh   |   P_mutlak = P_atm + ρgh', formulaSize: 29, diagram: liquidDiagram(),
    points: [
      'Homojen durgun sıvıda h düşey derinliktir; kap biçimi formüle girmez.',
      'Şekilde P_K ve P_L yalnız sıvı kaynaklı gösterge basınçlarıdır.',
      'h veya ρ artarsa, diğerleri sabitken sıvı basıncı artar.',
    ],
  },
  {
    title: 'Pascal ve hidrolik', eyebrow: '03  /  İLETİLEN NİCELİK: BASINÇ ARTIŞI', formula: 'F₁ / A₁ = F₂ / A₂', diagram: hydraulicDiagram(),
    points: [
      'Kapalı durgun sıvıda dışarıdan uygulanan ΔP her yöne azalmadan iletilir.',
      'Kuvvet oranı: aynı seviye ve dış basınç; piston ağırlığı/sürtünme ihmal.',
      'Sıkıştırılamaz, sızdırmaz sıvıda A₁d₁ = A₂d₂. İdeal modelde enerji kazancı yok.',
    ],
  },
  {
    title: 'Basınçtan kuvvete', eyebrow: '04  /  ALAN MERKEZİ VE KATMANLAR', formula: 'F_g = ρg h_C A', diagram: forceDiagram(),
    points: [
      'Açık kaptaki homojen durgun sıvı ve düz yüzey: h_C, alan merkezinin derinliği.',
      'Dikey dikdörtgende h_C = (h_üst + h_alt)/2; her şekil için geçerli değildir.',
      'Dengeli katmanlarda ΔP = g Σ(ρᵢhᵢ); P_mutlak = P_yüzey + ΔP.',
    ],
  },
  {
    title: 'Akış ve Bernoulli', eyebrow: '05  /  KOŞULLARI SAĞLANAN İDEAL MODEL', formula: 'P + ½ρv² + ρgz = sabit', diagram: flowDiagram(),
    points: [
      'Kararlı, sıkıştırılamaz, kayıpsız akışta aynı akım çizgisinde uygulanır.',
      'Hız artışı ve statik basınç düşüşü ilişkisi aynı yükseklikte yorumlanır.',
      'Akış yönünü ve kanat kaldırmasını tek bir basınç kuralına indirgeme.',
    ],
  },
  {
    title: 'Gazlar ve atmosfer', eyebrow: '06  /  MUTLAK BASINÇ, MUTLAK SICAKLIK', formula: 'PV = nRT', diagram: gasDiagram(),
    points: [
      'İdeal gazda P mutlak, T kelvin. Boyle: n ve T sabitse P₁V₁ = P₂V₂.',
      'Balonda zar gerilimi nedeniyle iç ve dış basınçlar farklı olabilir.',
      'Yüksekte P_atm genelde azalır; dış basınç azalınca kaynama sıcaklığı düşer.',
    ],
  },
];

function summary() {
  const cardWidth = 736, cardHeight = 800, gap = 24;
  let body = rect(0, 0, WIDTH, 2080, '#f1f5fa', 0) + header(
    'BASINÇ: KATI, SIVI VE GAZLAR',
    'Önce ortamı belirle. Kuvveti, basınç türünü ve modelin koşullarını birlikte düşün.',
    'KONU ÖZETİ  /  01',
  );
  summaryCards.forEach((card, index) => {
    const x = 72 + (index % 3) * (cardWidth + gap);
    const y = 252 + Math.floor(index / 3) * (cardHeight + gap);
    const palette = palettes[index];
    let content = rect(0, 0, cardWidth, cardHeight, 'url(#paper)', 25, 'stroke="#dbe4ee" stroke-width="1.5" filter="url(#card-shadow)"') +
      rect(0, 0, cardWidth, 9, palette.accent, 4) +
      text(30, 47, card.eyebrow, 19, palette.accent, 700) +
      text(30, 92, card.title, 34, ink, 750) +
      `<g transform="translate(0,111)">${card.diagram}</g>` +
      rect(27, 453, cardWidth - 54, 67, palette.light, 13) +
      text(cardWidth / 2, 497, card.formula, card.formulaSize ?? 34, palette.accent, 700, 'middle');
    let pointY = 556;
    for (const point of card.points) {
      const block = paragraph(49, pointY, point, cardWidth - 80, 23, 30);
      content += `<circle cx="32" cy="${pointY - 8}" r="4" fill="${palette.accent}"/>` + block.svg;
      pointY += block.height + 11;
    }
    if (pointY > cardHeight - 7) throw new Error(`Summary text exceeds card: ${card.title} (${pointY}).`);
    body += `<g transform="translate(${x},${y})">${content}</g>`;
  });
  body += rect(72, 1940, 2256, 78, '#e5edf5', 17) +
    text(101, 1986, 'SEMBOLLER', 22, '#3f5e77', 750) +
    text(286, 1986, 'ρ: özkütle   ·   h: düşey derinlik   ·   A: alan   ·   g: yerçekimi ivmesi   ·   P_g: açık yüzeye göre gösterge basıncı', 24, '#3f5e77', 500);
  return svg(WIDTH, 2080, 'TYT Fizik Basınç Konu Özeti', 'Altı bilimsel bölüm: katı basıncı, durgun sıvı, Pascal ilkesi, sıvı basınç kuvveti, Bernoulli ve gazlar. Formüllerin varsayımları her bölümde belirtilmiştir. Tüm çizimler özgün SVG geometrisidir.', body);
}

// Short editorial notes preserve every canonical leaf while keeping the poster legible.
const mapNotes: Record<string, string> = {
  'pressure-definition': 'Ortalama basınç = yüzeye dik kuvvet / temas alanı.',
  'pressure-symbol': 'Basınç P veya p; basınç kuvveti F ile gösterilir.',
  'pressure-formula': 'P_ort = F_dik/A. Yüzeye paralel bileşeni kullanma.',
  'pressure-unit': '1 Pa = 1 N/m². Alanı SI hesabında m² cinsine getir.',
  'pressure-force': 'Düz yüzeyde sabit P için F = P·A; değişiyorsa yerel katkıları topla.',
  'solid-pressure-formula': 'P_ort = F_dik/A. Gerçek temas alanını seç.',
  'solid-force-transfer': 'Kuvvetin aynı değer ve doğrultuda aktarılması yalnız uygun ideal statik düzeneklerde söylenebilir.',
  'solid-pressure-transfer': 'Temas alanları farklıysa aynı kuvvet farklı basınç oluşturabilir.',
  'solid-area-effect': 'F_dik sabitken A küçülürse ortalama P artar.',
  'solid-examples': 'Bıçak, çivi ve ince topuk: dar temas alanında basınç artar.',
  'liquid-pressure-formula': 'Açık homojen durgun sıvıda P_g = ρgh; P_mutlak = P_atm + ρgh.',
  'pascal-principle': 'Kapalı durgun akışkana uygulanan ΔP her yöne azalmadan iletilir; toplam P her noktada eşit değildir.',
  'liquid-depth-density': 'g sabitken h veya ρ artışı sıvı kaynaklı basıncı artırır.',
  'liquid-layers': 'Taban ile yüzey arasındaki ΔP = g Σ(ρᵢhᵢ). Mutlak basınç = yüzey basıncı + ΔP.',
  'liquid-vessel-graphs': 'Sabit hacimsel debide dh/dt = Q/A(h): genişleyen kapta eğim azalır; daralanda artar.',
  'liquid-force-formula': 'Açık homojen durgun sıvıda düz yüzey: F_g = ρg h_C A. C, ıslanan alanın alan merkezidir.',
  'liquid-side-pressure': 'Dikey dikdörtgende h_C = (h_üst + h_alt)/2. Basınç merkezi genelde C ile aynı değildir.',
  'vessel-shape-weight': 'Eğik duvarların düşey kuvveti nedeniyle taban kuvveti sıvı ağırlığından farklı olabilir.',
  'communicating-vessels': 'Bağlı kollarda aynı sıvı ve aynı yüzey basıncı varsa serbest yüzeyler aynı seviyededir.',
  'u-tubes': 'Dengede bağlantılı aynı sıvının aynı seviyesinde P eşittir; katman katkılarını ayrı hesapla.',
  'hydraulic-lifts': 'Aynı seviye/dış basınç; piston ağırlığı ve sürtünme ihmal: F₁/A₁ = F₂/A₂. Sıkıştırılamaz, sızdırmaz sıvıda A₁d₁ = A₂d₂.',
  'bernoulli': 'Kararlı, sıkıştırılamaz, kayıpsız akış; aynı akım çizgisinde P + ½ρv² + ρgz = sabit.',
  'flow-area-speed': 'Kararlı sıkıştırılamaz akışta A₁v₁ = A₂v₂; daralan kesitte ortalama hız artar.',
  'speed-static-pressure': 'Aynı yükseklikte ideal akışta hız artışı statik basınç düşüşüyle birliktedir. Evrensel bir kural değildir.',
  'flow-direction': 'Pompa, yükseklik ve kayıplar da etkilidir; akış her zaman yüksek statik P’den düşük P’ye gitmez.',
  'fluid-examples': 'Kanat kaldırması, çatı ve şemsiyede akış alanını birlikte değerlendir; tek nedene indirgeme.',
  'torricelli': 'Barometrenin temeli 1643. Uygun koşullarda P_atm ≈ ρ_cıva gh.',
  'altitude-pressure': 'Yüksekte atmosfer basıncı genellikle azalır; tüm atmosferde sabit ρ varsayma.',
  'ideal-gas': 'PV = nRT. P mutlak basınç, T kelvin, n mol miktarıdır.',
  'boyle': 'Aynı miktar ideal gazda n ve T sabitse P₁V₁ = P₂V₂; P mutlak basınçtır.',
  'elastic-balloons': 'Zar gerilimi ve eğrilik iç–dış basınç farkı oluşturabilir; basınçlar her zaman eşit değildir.',
  'boiling-point': 'Buhar basıncı dış basınca ulaşınca kaynama olur; dış basınç azalırsa kaynama sıcaklığı düşer.',
  'barometer': 'Açık hava basıncını ölçer; cıvalı ve aneroid türleri vardır.',
  'manometer': 'Basınç farkını ölçer. Açık uçlu U borusu gaz basıncını atmosferle karşılaştırır.',
  'bathymeter': 'Su derinliğini belirler; basınç temelli ve başka ölçüm ilkeleri kullanan türler vardır.',
  'altimeter': 'Yüksekliği gösterir. Basınç altimetresi atmosfer modeli ve doğru ayar gerektirir.',
  'magdeburg': '17. yüzyıl gösterisi: iç hava azaltılınca dış atmosferin basınç farkı yarımküreleri bir arada tutar.',
};

function mapPanel(index: number) {
  const branch = pressureConceptMap.children[index];
  const palette = palettes[index];
  const width = 1110;
  let y = 160;
  let rows = '';
  branch.children.forEach((child, childIndex) => {
    const note = mapNotes[child.id];
    if (!note) throw new Error(`Missing reviewed concept note: ${child.id}`);
    const title = paragraph(78, y, child.title, 985, 28, 35, ink, 700);
    const detail = paragraph(78, y + title.height + 1, note, 985, 25, 34, muted);
    const nextY = y + title.height + detail.height + 31;
    rows += `<circle cx="44" cy="${y - 8}" r="10" fill="${palette.light}" stroke="${palette.accent}" stroke-width="3"/>` +
      (childIndex < branch.children.length - 1 ? line(44, y + 3, 44, nextY - 21, palette.accent, 2, 'opacity=".27"') : '') +
      title.svg + detail.svg;
    y = nextY;
  });
  const height = y + 6;
  const card = rect(0, 0, width, height, '#fff', 25, 'stroke="#d9e4ef" stroke-width="1.5" filter="url(#card-shadow)"') +
    rect(0, 0, width, 112, palette.light, 25) + rect(0, 85, width, 28, palette.light, 0) +
    rect(26, 25, 62, 62, palette.accent, 15) + text(57, 68, String(index + 1).padStart(2, '0'), 29, '#fff', 750, 'middle') +
    text(109, 55, branch.title, 33, ink, 750) + text(110, 89, branch.shortDescription, 24, palette.accent, 500) + rows;
  return { svg: card, height };
}

function conceptMap() {
  const canonicalLeaves = pressureConceptMap.children.flatMap(branch => branch.children);
  if (canonicalLeaves.length !== 37 || Object.keys(mapNotes).length !== canonicalLeaves.length ||
    pressureConceptMap.children.length !== 8) throw new Error('Canonical concept structure changed; review infographic notes.');
  const panels = pressureConceptMap.children.map((_, index) => mapPanel(index));
  let y = 360;
  let panelMarkup = '';
  const connectors: string[] = [];
  for (let row = 0; row < 4; row++) {
    const left = panels[row * 2], right = panels[row * 2 + 1];
    const rowHeight = Math.max(left.height, right.height);
    panelMarkup += `<g transform="translate(64,${y})">${left.svg}</g><g transform="translate(1226,${y})">${right.svg}</g>`;
    connectors.push(line(1174, y + 56, 1226, y + 56, '#7998b0', 3));
    connectors.push(`<circle cx="1200" cy="${y + 56}" r="7" fill="#0a7396" stroke="#f1f5fa" stroke-width="3"/>`);
    y += rowHeight + 34;
  }
  const height = y + 131;
  const body = rect(0, 0, WIDTH, height, '#f1f5fa', 0) + header(
    'BASINÇ / KAVRAM HARİTASI',
    '8 ana dal · 37 alt kavram · Formülü koşullarıyla birlikte hatırla.',
    'KAVRAM HARİTASI  /  02',
  ) +
    rect(720, 253, 960, 72, '#0a7396', 21) + text(1200, 300, 'BASINÇ   ·   P_ort = F_dik / A   ·   1 Pa = 1 N/m²', 29, '#fff', 650, 'middle') +
    line(1200, 325, 1200, y - 34, '#b9cbd9', 3) + connectors.join('') + panelMarkup +
    rect(64, y + 6, 2272, 82, '#e5edf5', 17) +
    text(96, y + 56, 'ÇALIŞMA İPUCU', 23, '#3d5c75', 750) +
    text(340, y + 56, 'Önce ortamı seç → Basınç türünü ayır → Modelin koşullarını denetle → Birimleri kontrol et.', 26, '#3d5c75', 500);
  return { svg: svg(WIDTH, height, 'TYT Fizik Basınç Kavram Haritası', 'Kanonik etkileşimli haritayla aynı sekiz dal ve otuz yedi alt kavram, okunaklı iki sütun düzeninde. Pascal basınç değişimi, alan merkezi, Bernoulli varsayımları ve ideal gaz koşulları belirtilmiştir.', body), height };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const map = conceptMap();
  for (const [name, source] of [['Basinc_Konu_Ozeti', summary()], ['Basinc_Kavram_Haritasi', map.svg]] as const) {
    const svgPath = path.join(OUT, `${name}.svg`);
    const pngPath = path.join(OUT, `${name}.png`);
    await writeFile(svgPath, source, 'utf8');
    const info = await sharp(Buffer.from(source)).png({ compressionLevel: 9 }).toFile(pngPath);
    console.log(`${name}: ${info.width}×${info.height}; SVG + PNG; ${info.size} bytes PNG`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Infographic build failed.');
  process.exitCode = 1;
});
