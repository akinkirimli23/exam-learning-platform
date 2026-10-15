// Volumetric vector primitives. Scene labels contain original givens only.
const { scenes } = require('./buoyancy-booklet-scenes.cjs');
const esc = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const defs = `<defs>
<linearGradient id="glass"><stop stop-color="#4d9cce" stop-opacity=".38"/><stop offset=".06" stop-color="#effaff" stop-opacity=".9"/><stop offset=".15" stop-color="#98d4f2" stop-opacity=".12"/><stop offset=".62" stop-color="#f5fcff" stop-opacity=".06"/><stop offset=".91" stop-color="#80bee6" stop-opacity=".16"/><stop offset="1" stop-color="#256d9e" stop-opacity=".5"/></linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b2daf1"/><stop offset=".28" stop-color="#faffff"/><stop offset=".52" stop-color="#498fb8"/><stop offset=".72" stop-color="#e7faff"/><stop offset="1" stop-color="#28709a"/></linearGradient>
<linearGradient id="water" x1=".08" y1="0" x2=".83" y2="1"><stop stop-color="#a0ecff"/><stop offset=".35" stop-color="#49ccef"/><stop offset=".76" stop-color="#18acd9"/><stop offset="1" stop-color="#047cba"/></linearGradient>
<linearGradient id="salt" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#95e5eb"/><stop offset=".56" stop-color="#31b8ce"/><stop offset="1" stop-color="#087caa"/></linearGradient>
<linearGradient id="oil" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#fff1ae"/><stop offset=".65" stop-color="#f6d76b"/><stop offset="1" stop-color="#d7ad3c"/></linearGradient>
<radialGradient id="surface" cx=".35" cy=".22" r=".9"><stop stop-color="#e1fbff"/><stop offset=".55" stop-color="#7ddff4"/><stop offset="1" stop-color="#32adce"/></radialGradient>
<linearGradient id="wood" x1="0" y1="0" x2=".15" y2="1"><stop stop-color="#ffd18e"/><stop offset=".27" stop-color="#edaa5d"/><stop offset=".7" stop-color="#dc984d"/><stop offset="1" stop-color="#bd7835"/></linearGradient>
<linearGradient id="woodside"><stop stop-color="#d19349"/><stop offset="1" stop-color="#a75c23"/></linearGradient>
<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dfe9f0"/><stop offset=".42" stop-color="#9eb4c5"/><stop offset="1" stop-color="#4a687f"/></linearGradient>
<radialGradient id="steel" cx=".29" cy=".22" r=".8"><stop stop-color="#f4fbff"/><stop offset=".2" stop-color="#b6d9f4"/><stop offset=".52" stop-color="#4282b6"/><stop offset="1" stop-color="#183d71"/></radialGradient>
<radialGradient id="purple" cx=".3" cy=".22" r=".85"><stop stop-color="#f1e5ff"/><stop offset=".3" stop-color="#a99bd9"/><stop offset=".7" stop-color="#6e60a6"/><stop offset="1" stop-color="#3a386d"/></radialGradient>
<radialGradient id="orange" cx=".3" cy=".2" r=".8"><stop stop-color="#fff3b3"/><stop offset=".25" stop-color="#ffc16c"/><stop offset=".7" stop-color="#ed8a31"/><stop offset="1" stop-color="#b65a18"/></radialGradient>
<linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fdff" stop-opacity=".96"/><stop offset=".45" stop-color="#b9e4ee" stop-opacity=".86"/><stop offset="1" stop-color="#73b7d0" stop-opacity=".94"/></linearGradient>
<linearGradient id="stone" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#b7c6d1"/><stop offset=".5" stop-color="#718b9e"/><stop offset="1" stop-color="#364f66"/></linearGradient>
<linearGradient id="instrument"><stop stop-color="#164e7e"/><stop offset=".18" stop-color="#64b6da"/><stop offset=".35" stop-color="#effcff"/><stop offset=".65" stop-color="#9cd3e9"/><stop offset="1" stop-color="#165681"/></linearGradient>
<filter id="shadow" x="-.3" y="-1" width="1.6" height="3"><feGaussianBlur stdDeviation="7"/></filter>
</defs><style>text{font-family:Arial,Helvetica,sans-serif;fill:#12374f;font-size:27px}.caption{font-size:25px;fill:#275874}.given{font-size:24px;fill:#1b435e}.name{font-weight:700;font-size:29px}.leader{stroke:#567d94;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}.rope{fill:none;stroke:#4c5967;stroke-width:3}.fine{fill:none;stroke:#fff;stroke-opacity:.55;stroke-width:1.5}</style>`;

function text(x,y,value,cls='',anchor='middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${String(value).split('|').map((line,i)=>`<tspan x="${x}" dy="${i?30:0}">${esc(line)}</tspan>`).join('')}</text>`;
}
const shadow = (x,y,w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="12" fill="#a88c62" opacity=".27" filter="url(#shadow)"/>`;
function cube(x,y,w=100,h=100,material='wood',name='') {
  const dx=Math.min(20,w*.2),dy=dx*.65,wood=material==='wood',edge=wood?'#b47535':material==='ice'?'#79b7cb':'#58758e';
  const grain=wood?[12,23,36,50,65,81,94].filter(v=>v<h-4).map(v=>`<path d="M${x+4} ${y+v}q${w*.22} -4 ${w*.45} 0t${w*.5} 0" stroke="#955920" stroke-width="1.2" fill="none" opacity=".38"/>`).join(''):'';
  return `<g><path d="M${x} ${y}l${dx} ${-dy}h${w}l${-dx} ${dy}Z" fill="${wood?'#ffdc9f':material==='ice'?'#effcff':'#e2eaf0'}" stroke="${edge}" stroke-width="1.5"/>
  <path d="M${x+w} ${y}l${dx} ${-dy}v${h}l${-dx} ${dy}Z" fill="${wood?'url(#woodside)':material==='ice'?'#78b6ce':'#567389'}" stroke="${edge}" stroke-width="1.5"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="url(#${material})" stroke="${edge}" stroke-width="1.6"/>${grain}<path d="M${x+3} ${y+h-3}V${y+3}H${x+w-3}" class="fine"/>
  ${material==='ice'?`<path d="M${x+7} ${y+h*.62}l${w*.48} ${-h*.55}m${w*.12} 0l${w*.23} ${h*.35}" stroke="#f4ffff" stroke-width="5" opacity=".65" fill="none"/>`:''}${name?text(x+w/2,y+h*.57,name,'name'):''}</g>`;
}
function sphere(x,y,r=45,material='steel',name='') {
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${material})" stroke="${material==='orange'?'#b96924':'#3f6584'}" stroke-width="1.5"/>
  <ellipse cx="${x-r*.34}" cy="${y-r*.43}" rx="${r*.24}" ry="${r*.13}" fill="white" opacity=".28" transform="rotate(-35 ${x-r*.34} ${y-r*.43})"/>
  <path d="M${x-r*.72} ${y+r*.14}q${r*.2} ${r*.67} ${r*.93} ${r*.62}" stroke="#d9ecff" stroke-opacity=".2" stroke-width="2" fill="none"/>${name?text(x,y-r-15,name,'name'):''}</g>`;
}
function rock(x,y,scale=1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-52 18L-43-18L-15-42L19-39L47-19L55 16L29 44L-7 48L-38 36Z" fill="url(#stone)" stroke="#516a7d" stroke-width="1.5"/>
  <path d="M-43-18L-8-6L-15-42L19-39L-8-6L47-19L55 16L20 16L29 44L-7 48L-8-6L-38 36Z" fill="#dce8f0" opacity=".14"/>
  <path d="M-15-42L-8-6L-43-18M-8-6L20 16L55 16M20 16L29 44M-8-6L-7 48M-8-6L47-19" fill="none" stroke="#eff7fb" stroke-opacity=".24" stroke-width="1.5"/></g>`;
}
function object(kind,x,y,w=100,h=100,name='') {
  if(kind==='rock')return rock(x+w/2,y+h/2,Math.min(w,h)/100);
  if(['steel','purple','orange'].includes(kind))return sphere(x+w/2,y+h/2,Math.min(w,h)/2,kind,name);
  return cube(x,y,w,h,kind,name);
}
function tank({x=150,y=65,w=500,h=310,water=190,objects='',liquid='water',layer,number=1}) {
  const bottom=y+h,rx=w/2,ry=Math.min(24,w*.055),cx=x+rx;
  const silhouette=`M${x} ${y}V${bottom-ry}Q${x} ${bottom+ry} ${cx} ${bottom+ry}T${x+w} ${bottom-ry}V${y}`;
  const wet=`M${x+6} ${water}V${bottom-ry}Q${x+6} ${bottom+ry-7} ${cx} ${bottom+ry-7}T${x+w-6} ${bottom-ry}V${water}Z`;
  return `<g>${shadow(cx,bottom+ry+15,w*.54)}<path d="${silhouette}" fill="url(#glass)" stroke="#5595ba" stroke-width="2"/><path d="${wet}" fill="url(#${liquid})" opacity=".93"/>
  ${layer?`<path d="M${x+6} ${water}H${x+w-6}V${layer}H${x+6}Z" fill="url(#oil)" opacity=".96"/><ellipse cx="${cx}" cy="${layer}" rx="${rx-6}" ry="${ry*.66}" fill="#9edfee" opacity=".8" stroke="#53afbc" stroke-width="1.5"/>`:''}
  <ellipse cx="${cx}" cy="${water}" rx="${rx-6}" ry="${ry*.72}" fill="${layer?'#fff4ba':'url(#surface)'}" fill-opacity=".86" stroke="${layer?'#c8ab49':'#2fafd1'}" stroke-width="1.5"/>
  ${objects}<defs><clipPath id="wet${number}"><path d="${wet}"/></clipPath></defs><g clip-path="url(#wet${number})"><rect x="${x+6}" y="${water}" width="${w-12}" height="${h}" fill="#13b1dc" opacity=".1"/>
  <path d="M${x+24} ${water+19}V${bottom-19}" stroke="white" stroke-width="9" stroke-opacity=".32" stroke-linecap="round"/></g>
  <path d="${silhouette}" fill="url(#glass)" stroke="#29749e" stroke-width="3"/><path d="M${x+14} ${y+19}V${bottom-26}" stroke="white" stroke-width="7" stroke-opacity=".88" stroke-linecap="round"/>
  <path d="M${x+25} ${y+23}V${bottom-25}" stroke="#b6e9fb" stroke-width="2.5" stroke-opacity=".7"/><path d="M${x+w-12} ${y+22}V${bottom-23}" stroke="#c6efff" stroke-width="4" stroke-opacity=".6"/>
  <path d="M${x+7} ${bottom-6}Q${cx} ${bottom+ry+8} ${x+w-7} ${bottom-6}" stroke="#a4e8ff" stroke-width="3" fill="none" opacity=".8"/>
  <ellipse cx="${cx}" cy="${y}" rx="${rx+4}" ry="${ry}" fill="none" stroke="url(#rim)" stroke-width="7"/><ellipse cx="${cx}" cy="${y}" rx="${rx-3}" ry="${ry-4}" fill="none" stroke="#5095bd" stroke-width="1.5"/>
  <path d="M${x+12} ${y-6}Q${cx} ${y-ry-10} ${x+w-12} ${y-6}" fill="none" stroke="white" stroke-width="2.5" opacity=".9"/></g>`;
}
function spring(x,y,reading='') {
  const ticks=Array.from({length:12},(_,i)=>`<path d="M${x+9} ${y+17+i*6}h${i%3===0?10:5}" stroke="#466b83" stroke-width="1.2"/>`).join('');
  return `<g><path d="M${x-60} ${y-19}H${x+60}" stroke="#8b603c" stroke-width="10" stroke-linecap="round"/><path d="M${x-58} ${y-22}H${x+58}" stroke="#d9b687" stroke-width="2"/>
  <path d="M${x} ${y-18}V${y}" class="rope"/><rect x="${x-25}" y="${y}" width="50" height="108" rx="13" fill="url(#instrument)" stroke="#316181" stroke-width="2"/>
  <rect x="${x-15}" y="${y+11}" width="30" height="83" rx="4" fill="#effbff" stroke="#75b1ca" stroke-width="1"/>
  <path d="M${x-3} ${y+15}l-7 5 14 7-14 7 14 7-14 7 14 7-14 7 7 5v18" fill="none" stroke="#637a8d" stroke-width="2"/>${ticks}
  <path d="M${x-14} ${y+77}h26" stroke="#e56e4c" stroke-width="2.5"/><path d="M${x} ${y+108}v11q0 15 11 7" class="rope"/>${reading?text(x+48,y+60,reading,'name','start'):''}</g>`;
}
function arrow(x,y,length){return `<path d="M${x} ${y}v${length}m-9 -15l9 15 9-15" stroke="#e78046" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;}
function boat(x,y,w=220,load='') {
  const h=w*.31;
  return `<g><path d="M${x} ${y}Q${x+w/2} ${y+14} ${x+w} ${y}L${x+w*.82} ${y+h}Q${x+w*.5} ${y+h+12} ${x+w*.18} ${y+h}Z" fill="url(#wood)" stroke="#9b632b" stroke-width="2"/>
  <path d="M${x+w/2} ${y+8}L${x+w*.52} ${y+h+7}L${x+w*.82} ${y+h}L${x+w} ${y}Z" fill="url(#woodside)" opacity=".8"/>
  <ellipse cx="${x+w/2}" cy="${y}" rx="${w/2}" ry="14" fill="#885b39" stroke="#f6cb8c" stroke-width="4"/>
  <path d="M${x+w*.14} ${y+h*.45}Q${x+w/2} ${y+h*.62} ${x+w*.9} ${y+h*.43}" fill="none" stroke="#f5c585" stroke-width="2" opacity=".6"/>${load}</g>`;
}
function floating(s){const h=112,y=185-h*(1-(s.fraction??.65));return tank({water:185,objects:object(s.material||'wood',340,y,112,h,s.name||'')})+text(400,443,s.label||'','given');}
function submerged(s){return tank({water:165,objects:object(s.material||'metal',340,s.bottom?300:225,112,s.bottom?95:112)})+text(400,443,s.label||'','given');}
function pairFloat(s){return s.values.map((v,i)=>{const x=55+i*370,y=210-105*(1-v.fraction);return tank({x,y:75,w:310,h:300,water:210,objects:object(s.material||'wood',x+96,y,105,105),liquid:i?'salt':'water',number:i+1})+text(x+155,42,v.title,'name')+text(x+155,443,v.label||'','given');}).join('');}
function hanger(s){const x=400,y=s.partial?200:220,water=s.partial?255:165;let a=s.bottom?`<path d="M400 ${y+110}V393" class="rope"/><path d="M383 393h34" stroke="#316b8c" stroke-width="5"/>`:`<path d="M400 ${s.spring?160:31}V${y+(s.material==='rock'?9:0)}" class="rope"/>`;
  if(!s.bottom&&!s.spring)a+='<path d="M325 31h150" stroke="#856347" stroke-width="9" stroke-linecap="round"/>';
  return tank({water,objects:object(s.material||'steel',345,y,110,110)+a})+(s.spring?spring(x,35,s.reading):'')+text(400,443,s.label||'','given');}
function dynamo(s){return spring(190,45,s.air)+spring(563,45,s.reading)+'<path d="M190 174V265M563 174V282" class="rope"/>'+rock(190,302,.9)+tank({x:425,y:215,w:275,h:165,water:266,objects:rock(563,319,.9)})+text(190,443,'Havada','caption')+text(563,443,s.liquid||'Sıvıda','caption');}
function layers(s){return tank({water:120,layer:235,objects:cube(344,177,112,116)})+text(135,165,s.upper,'given','end')+'<path d="M145 169h40" class="leader"/>'+text(135,315,s.lower,'given','end')+'<path d="M145 310h40" class="leader"/>'+text(400,443,s.label,'given');}
function overflow(s){const water=155,y=s.state==='float'?125:s.state==='bottom'?295:235;return tank({x:100,y:70,w:390,h:300,water,objects:object(s.material||'wood',245,y,100,100)})+
  '<path d="M489 155h82q15 0 15 15v93" stroke="#398fb5" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M488 152h84q15 0 15 15v96" stroke="#c4f5ff" stroke-width="6" fill="none"/><path d="M587 267v30" stroke="#0fa5d1" stroke-width="6" stroke-dasharray="3 9" stroke-linecap="round"/>'+
  tank({x:535,y:300,w:150,h:80,water:342,number:2})+[320,335,350,365].map(y=>`<path d="M661 ${y}h14" stroke="#558aa5" stroke-width="1.5"/>`).join('')+text(610,431,'Taşan sıvı','caption')+text(290,443,s.label,'given');}
function three(s){const shapes=s.above?object('wood',220,85,90,90,'K')+object('metal',365,85,90,90,'L')+object('metal',510,85,90,90,'M'):sphere(264,175,43,'orange','K')+sphere(410,267,43,'steel','L')+sphere(551,356,43,'purple','M');return tank({x:120,w:560,water:s.above?265:190,objects:shapes})+text(400,443,s.label,'given');}
function push(s){return tank({water:160,objects:object(s.material||'orange',345,230,110,110)+arrow(400,72,143)})+text(400,443,s.label,'given');}
function twoHangers(s){return tank({water:155,objects:'<path d="M285 26V223M520 327V394" class="rope"/>'+sphere(285,275,52,'steel',s.names?.[0]||'K')+sphere(520,275,52,'orange',s.names?.[1]||'L')})+'<path d="M230 26h110" stroke="#8c6540" stroke-width="9" stroke-linecap="round"/>'+text(400,443,s.label,'given');}
function boatPair(s){const right=s.state==='float'?cube(662,194,52,70,'wood'):cube(650,310,54,70,'metal');return tank({x:45,y:80,w:320,h:300,water:235,objects:boat(75,210,240,cube(185,149,65,62,s.material||'metal')),number:1})+tank({x:425,y:80,w:320,h:300,water:235,objects:boat(445,210,190)+right,number:2})+text(205,43,'Önce','name')+text(585,43,'Sonra','name')+text(400,451,s.label,'given');}
function boatSingle(s){return tank({water:225,objects:boat(240,190,320,cube(365,127,70,63,'metal'))})+text(400,443,s.label,'given');}
function pairBoats(s){return s.values.map((v,i)=>{const x=55+i*370;return tank({x,y:75,w:310,h:300,water:230,objects:boat(x+40,230-72*(1-v.fraction),230),number:i+1,liquid:i?'water':'salt'})+text(x+155,42,v.title,'name');}).join('');}
function loaded(s){return tank({water:200,objects:cube(340,150,112,112)+cube(370,108,52,42,'metal')})+text(400,443,s.label,'given');}
function scaleScene(s){return spring(400,20)+tank({x:190,y:185,w:420,h:180,water:235,objects:'<path d="M400 149V274" class="rope"/>'+rock(400,311,.88)})+'<rect x="178" y="385" width="444" height="37" rx="12" fill="url(#metal)" stroke="#486c87" stroke-width="2"/><rect x="348" y="392" width="104" height="23" rx="4" fill="#17364b"/><path d="M190 424h48m325 0h48" stroke="#47667a" stroke-width="5" stroke-linecap="round"/>'+text(400,462,s.label,'given');}
function graph(s){const grid=Array.from({length:5},(_,i)=>`<path d="M145 ${110+i*48}H666M${195+i*95} 75V350" stroke="#dbeaf0" stroke-width="1"/>`).join(''),line=s.plateau?'M145 350L390 135H666':'M145 350L630 100';return `<g>${grid}<path d="M145 70V350H683m-11-8l11 8-11 8M137 82l8-12 8 12" stroke="#225677" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="${line}" stroke="#7e390e" stroke-opacity=".12" stroke-width="14" fill="none" transform="translate(0 4)"/><path d="${line}" stroke="#ea9851" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${line}" stroke="#ffd5a0" stroke-width="2" fill="none" transform="translate(0 -2)"/>${text(140,42,'Fₖ','name')}${text(660,391,s.axis,'given')}${text(122,380,'0','given')}${s.label?text(400,446,s.label,'given'):''}</g>`;}
function tube(s){const shape=(x,y,ball)=>`<path d="M${x} ${y}v92a29 29 0 0 0 58 0V${y}" fill="url(#glass)" stroke="#4c8cac" stroke-width="3"/><ellipse cx="${x+29}" cy="${y}" rx="31" ry="6" fill="#edfcff" stroke="#428ab1" stroke-width="2"/><path d="M${x+8} ${y+14}v78" stroke="white" stroke-width="4" opacity=".9"/>${ball?sphere(x+29,y+100,13):''}`;
  return tank({x:45,y:75,w:320,h:300,water:205,objects:shape(178,135,true),number:1})+tank({x:425,y:75,w:320,h:300,water:205,objects:shape(498,100,false)+sphere(677,374,14),number:2})+text(205,39,'Önce','name')+text(585,39,'Sonra','name')+text(400,451,'Metal bilye tüpten çıkarılıyor','given');}
const templates={floating,submerged,pairFloat,hanger,dynamo,layers,overflow,three,push,twoHangers,boatPair,boatSingle,pairBoats,loaded,scaleScene,graph,tube};
function renderScene(scene,title){return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480" role="img"><title>${esc(title)}</title>${defs}${templates[scene.kind](scene)}</svg>\n`;}
module.exports={renderScene,scenes};
