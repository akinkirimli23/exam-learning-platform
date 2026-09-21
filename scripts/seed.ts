import {seedDatabase} from '../server/seed';
import {closeDb} from '../server/db';
seedDatabase().then(()=>console.log('Özgün demo paket hazır: 4 bölüm, 10 kart, 5 başlangıç + 15 alıştırma + 5 kontrol sorusu.')).finally(closeDb);
