'use client';

const common = { width: '100%', maxWidth: 520, height: 'auto', display: 'block', margin: '18px auto' } as const;

export function PressureVisual({ visualId }: { visualId: string }) {
  if (visualId === 'pressure-solid-area') return (
    <svg viewBox="0 0 520 240" role="img" aria-label="Aynı yükün A ve 2A temas alanlarına dağılımı" style={common}>
      <line x1="25" y1="188" x2="495" y2="188" stroke="currentColor" strokeWidth="3" />
      <rect x="95" y="72" width="78" height="115" rx="5" fill="#b5c9f8" stroke="currentColor" strokeWidth="2" />
      <rect x="305" y="105" width="156" height="82" rx="5" fill="#b5c9f8" stroke="currentColor" strokeWidth="2" />
      <text x="134" y="50" textAnchor="middle" fill="currentColor">F</text><text x="383" y="83" textAnchor="middle" fill="currentColor">F</text>
      <text x="134" y="218" textAnchor="middle" fill="currentColor">A</text><text x="383" y="218" textAnchor="middle" fill="currentColor">2A</text>
    </svg>
  );
  if (visualId === 'pressure-liquid-depth') return (
    <svg viewBox="0 0 520 290" role="img" aria-label="Aynı sıvıda h ve 2h derinliğindeki K ve L noktaları" style={common}>
      <rect x="80" y="30" width="360" height="235" rx="12" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="83" y="63" width="354" height="199" fill="#b6ddf5" opacity=".7" />
      <line x1="83" y1="63" x2="437" y2="63" stroke="currentColor" strokeWidth="2" />
      <circle cx="250" cy="128" r="8" fill="#225ab4" /><circle cx="250" cy="193" r="8" fill="#225ab4" />
      <text x="270" y="133" fill="currentColor">K · h</text><text x="270" y="198" fill="currentColor">L · 2h</text>
    </svg>
  );
  if (visualId === 'pressure-hydraulic') return (
    <svg viewBox="0 0 520 260" role="img" aria-label="Bağlı sıvıda küçük ve büyük pistonlu hidrolik düzenek" style={common}>
      <path d="M76 74V222H442V73" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M79 138V219H439V138" fill="#b6ddf5" stroke="none" />
      <rect x="55" y="104" width="90" height="18" fill="#7087a6" /><rect x="322" y="104" width="145" height="18" fill="#7087a6" />
      <line x1="100" y1="46" x2="100" y2="99" stroke="currentColor" strokeWidth="3" /><line x1="394" y1="46" x2="394" y2="99" stroke="currentColor" strokeWidth="3" />
      <text x="100" y="37" textAnchor="middle" fill="currentColor">F₁ / A₁</text><text x="394" y="37" textAnchor="middle" fill="currentColor">F₂ / A₂</text>
      <text x="260" y="190" textAnchor="middle" fill="currentColor">Kapalı sıvı</text>
    </svg>
  );
  if (visualId === 'pressure-atmosphere') return (
    <svg viewBox="0 0 520 275" role="img" aria-label="Atmosfer basıncı altında açık su kabında derinlik noktası" style={common}>
      <path d="M80 75V242H440V75" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="83" y="108" width="354" height="131" fill="#b6ddf5" opacity=".75" />
      <line x1="83" y1="108" x2="437" y2="108" stroke="currentColor" strokeWidth="2" />
      <path d="M260 25V89m-8-10 8 11 8-11" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x="280" y="50" fill="currentColor">Patm</text><circle cx="260" cy="190" r="7" fill="#225ab4" /><text x="280" y="195" fill="currentColor">Pmutlak = Patm + ρgh</text>
    </svg>
  );
  if (visualId === 'pressure-communicating') return (
    <svg viewBox="0 0 520 260" role="img" aria-label="Kesitleri farklı bağlı kaplarda aynı derinlikteki K ve L noktaları" style={common}>
      <path d="M70 45V220H440V45M160 45V165H325V45" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M73 92V217H437V92h-109v76H157V92Z" fill="#b6ddf5" opacity=".75" />
      <circle cx="115" cy="155" r="7" fill="#225ab4" /><circle cx="385" cy="155" r="7" fill="#225ab4" />
      <line x1="75" y1="155" x2="438" y2="155" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
      <text x="108" y="146" fill="currentColor">K</text><text x="379" y="146" fill="currentColor">L</text>
    </svg>
  );
  if (visualId === 'pressure-liquid-layers') return (
    <svg viewBox="0 0 520 280" role="img" aria-label="Üstte 0,5 metre hafif, altta 1 metre yoğun sıvı tabakası" style={common}>
      <rect x="95" y="25" width="330" height="230" rx="10" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="98" y="62" width="324" height="62" fill="#c5e9e6" /><rect x="98" y="124" width="324" height="128" fill="#82addd" />
      <text x="260" y="98" textAnchor="middle" fill="#173454">0,5 m · 800 kg/m³</text>
      <text x="260" y="191" textAnchor="middle" fill="#173454">1 m · 1200 kg/m³</text>
      <text x="260" y="273" textAnchor="middle" fill="currentColor">Taban: P₁ + P₂</text>
    </svg>
  );
  return null;
}
