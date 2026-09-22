import {seedDatabase} from '../server/seed';
import {closeDb} from '../server/db';
seedDatabase()
  .then((created)=>console.log(created
    ? 'Özgün demo paket hazır: 4 bölüm, 10 kart, 5 başlangıç + 15 alıştırma + 5 kontrol sorusu.'
    : 'Demo seed zaten mevcut; veri değiştirilmedi.'))
  .catch((error:unknown)=>{
    console.error(`Demo seed başarısız: ${error instanceof Error ? error.name : 'UnknownError'}`);
    process.exitCode=1;
  })
  .finally(closeDb);
