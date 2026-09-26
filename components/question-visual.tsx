'use client';

import { PressureVisual } from './pressure-visual';

export function QuestionVisual({ visualId }: { visualId?: string }) {
  if (!visualId) return null;
  if (visualId.startsWith('pressure-')) return <PressureVisual visualId={visualId} />;
  const common = { width: '100%', maxWidth: 520, height: 'auto', display: 'block', margin: '18px auto' } as const;

  if (visualId === 'buoyancy-float-half') {
    return (
      <svg viewBox="0 0 520 260" role="img" aria-label="Sıvıda hacminin yaklaşık yarısı batmış yüzen blok" style={common}>
        <rect x="70" y="40" width="380" height="185" rx="16" fill="none" stroke="currentColor" strokeWidth="3"/>
        <rect x="73" y="135" width="374" height="87" fill="currentColor" opacity=".10"/>
        <line x1="73" y1="135" x2="447" y2="135" stroke="currentColor" strokeWidth="2" strokeDasharray="8 7"/>
        <rect x="205" y="88" width="110" height="94" rx="8" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="3"/>
        <text x="260" y="79" textAnchor="middle" fill="currentColor" fontSize="18">K</text>
        <text x="92" y="158" fill="currentColor" fontSize="16">sıvı</text>
      </svg>
    );
  }

  if (visualId === 'buoyancy-suspended-depths') {
    return (
      <svg viewBox="0 0 520 280" role="img" aria-label="Aynı sıvıda farklı derinliklerde askıda duran K ve L cisimleri" style={common}>
        <rect x="65" y="30" width="390" height="215" rx="16" fill="none" stroke="currentColor" strokeWidth="3"/>
        <rect x="68" y="68" width="384" height="174" fill="currentColor" opacity=".09"/>
        <line x1="68" y1="68" x2="452" y2="68" stroke="currentColor" strokeWidth="2"/>
        <rect x="150" y="103" width="72" height="56" rx="7" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="3"/>
        <rect x="300" y="168" width="72" height="56" rx="7" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="3"/>
        <text x="186" y="138" textAnchor="middle" fill="currentColor" fontSize="18">K</text>
        <text x="336" y="203" textAnchor="middle" fill="currentColor" fontSize="18">L</text>
      </svg>
    );
  }

  if (visualId === 'buoyancy-water-salt') {
    return (
      <svg viewBox="0 0 620 280" role="img" aria-label="Aynı cismin su ve daha yoğun tuzlu suda farklı batan hacimleri" style={common}>
        <g>
          <rect x="55" y="55" width="220" height="175" rx="14" fill="none" stroke="currentColor" strokeWidth="3"/>
          <rect x="58" y="120" width="214" height="107" fill="currentColor" opacity=".09"/>
          <line x1="58" y1="120" x2="272" y2="120" stroke="currentColor" strokeWidth="2"/>
          <rect x="125" y="90" width="80" height="82" rx="7" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="3"/>
          <text x="165" y="260" textAnchor="middle" fill="currentColor" fontSize="17">Su</text>
        </g>
        <g>
          <rect x="345" y="55" width="220" height="175" rx="14" fill="none" stroke="currentColor" strokeWidth="3"/>
          <rect x="348" y="120" width="214" height="107" fill="currentColor" opacity=".09"/>
          <line x1="348" y1="120" x2="562" y2="120" stroke="currentColor" strokeWidth="2"/>
          <rect x="415" y="74" width="80" height="82" rx="7" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="3"/>
          <text x="455" y="260" textAnchor="middle" fill="currentColor" fontSize="17">Tuzlu su</text>
        </g>
      </svg>
    );
  }

  if (visualId === 'buoyancy-pressure-cube') {
    return (
      <svg viewBox="0 0 520 300" role="img" aria-label="Tam batmış küpte üst ve alt yüzey basınç kuvvetleri" style={common}>
        <rect x="75" y="35" width="370" height="225" rx="16" fill="none" stroke="currentColor" strokeWidth="3"/>
        <rect x="78" y="70" width="364" height="187" fill="currentColor" opacity=".09"/>
        <rect x="195" y="118" width="130" height="95" rx="8" fill="currentColor" opacity=".17" stroke="currentColor" strokeWidth="3"/>
        <line x1="260" y1="85" x2="260" y2="115" stroke="currentColor" strokeWidth="4"/>
        <path d="M252 105 L260 116 L268 105" fill="none" stroke="currentColor" strokeWidth="4"/>
        <text x="278" y="100" fill="currentColor" fontSize="17">F₁</text>
        <line x1="260" y1="255" x2="260" y2="216" stroke="currentColor" strokeWidth="5"/>
        <path d="M251 227 L260 215 L269 227" fill="none" stroke="currentColor" strokeWidth="5"/>
        <text x="280" y="245" fill="currentColor" fontSize="17">F₂</text>
      </svg>
    );
  }

  if (visualId === 'buoyancy-two-fluids') {
    return (
      <svg viewBox="0 0 520 300" role="img" aria-label="Birbiriyle karışmayan iki sıvının ara yüzeyinde duran cisim" style={common}>
        <rect x="85" y="30" width="350" height="230" rx="16" fill="none" stroke="currentColor" strokeWidth="3"/>
        <rect x="88" y="75" width="344" height="90" fill="currentColor" opacity=".07"/>
        <rect x="88" y="165" width="344" height="92" fill="currentColor" opacity=".15"/>
        <line x1="88" y1="165" x2="432" y2="165" stroke="currentColor" strokeWidth="2" strokeDasharray="8 7"/>
        <rect x="215" y="125" width="90" height="82" rx="8" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="3"/>
        <text x="110" y="115" fill="currentColor" fontSize="17">d</text>
        <text x="110" y="210" fill="currentColor" fontSize="17">3d</text>
        <text x="260" y="174" textAnchor="middle" fill="currentColor" fontSize="17">2d</text>
      </svg>
    );
  }

  if (visualId === 'buoyancy-tethered-bottom') {
    return (
      <svg viewBox="0 0 520 320" role="img" aria-label="Sıvı içinde tabana iple bağlı dengedeki cisim" style={common}>
        <rect x="80" y="30" width="360" height="245" rx="16" fill="none" stroke="currentColor" strokeWidth="3"/>
        <rect x="83" y="70" width="354" height="202" fill="currentColor" opacity=".09"/>
        <rect x="210" y="110" width="100" height="75" rx="8" fill="currentColor" opacity=".20" stroke="currentColor" strokeWidth="3"/>
        <line x1="260" y1="185" x2="260" y2="270" stroke="currentColor" strokeWidth="3"/>
        <circle cx="260" cy="270" r="5" fill="currentColor"/>
        <line x1="260" y1="105" x2="260" y2="74" stroke="currentColor" strokeWidth="4"/>
        <path d="M251 84 L260 72 L269 84" fill="none" stroke="currentColor" strokeWidth="4"/>
        <text x="278" y="90" fill="currentColor" fontSize="17">Fᵦ</text>
        <text x="276" y="230" fill="currentColor" fontSize="17">ip</text>
      </svg>
    );
  }

  if (visualId === 'buoyancy-load-on-block') {
    return (
      <svg viewBox="0 0 520 290" role="img" aria-label="Yüzen K cisminin üzerine L yükü konulduğunda daha fazla batması" style={common}>
        <rect x="75" y="40" width="370" height="205" rx="16" fill="none" stroke="currentColor" strokeWidth="3"/>
        <rect x="78" y="145" width="364" height="97" fill="currentColor" opacity=".09"/>
        <line x1="78" y1="145" x2="442" y2="145" stroke="currentColor" strokeWidth="2"/>
        <rect x="205" y="115" width="110" height="95" rx="8" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="3"/>
        <rect x="228" y="78" width="64" height="38" rx="6" fill="currentColor" opacity=".28" stroke="currentColor" strokeWidth="3"/>
        <text x="260" y="173" textAnchor="middle" fill="currentColor" fontSize="18">K</text>
        <text x="260" y="103" textAnchor="middle" fill="currentColor" fontSize="17">L</text>
      </svg>
    );
  }

  return null;
}
