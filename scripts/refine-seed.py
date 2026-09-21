from pathlib import Path
p=Path('server/seed.ts')
s=p.read_text(encoding='utf-8')
s=s.replace("import {questionSchema} from '@/shared/contracts';", "import {questions} from './questions';")
start=s.index('  async function q(')
s=s[:start]+"  for(const item of questions){const {id,...payload}=item;await put(id,'question','buoyancy',id.toUpperCase(),payload);}\n});}\n"
s=s.replace('10.2.2 Kaldırma Kuvveti bulunur.', '10.2.2.1 ve 10.2.2.2 kaldırma kuvveti kazanımları bulunur (PDF s. 164). Matematiksel model verilir; hesaplamalara girilmez. Sorular kavramsal uygulamalardır.')
s=s.replace('Örnek: 1000 kg/m³ özkütleli suda 0,002 m³ hacim batmışsa ve g = 10 m/s² ise Fₖ = 1000 × 10 × 0,002 = 20 N olur.', 'Bu pilotta model, değişkenlerin etkisini yorumlamak için kullanılır. 2026 resmî kapsam açıklaması doğrultusunda sayısal işlem sorularına girilmez.')
p.write_text(s,encoding='utf-8')
