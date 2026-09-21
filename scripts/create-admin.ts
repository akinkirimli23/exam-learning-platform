import {randomUUID,randomBytes} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {query,closeDb} from '../server/db';
import {passwordHash} from '../server/core';
async function main(){const email=process.env.ADMIN_EMAIL||'yonetici@ivme.local';const existing=await query('SELECT id FROM users WHERE email=$1',[email]);if(existing.rows.length){console.log('Hesap zaten var; şifre veya rol değiştirilmedi.');return;}const password=process.env.ADMIN_PASSWORD||randomBytes(18).toString('base64url');await query("INSERT INTO users(id,email,name,password_hash,role,adult_confirmed,exam_id) VALUES($1,$2,'İçerik Yöneticisi',$3,'admin',true,'yks-2026')",[randomUUID(),email,await passwordHash(password)]);const folder=path.resolve(process.env.DATA_DIR||'data');await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'admin-access.txt'),`Yalnız yerel pilot yöneticisi\nE-posta: ${email}\nŞifre: ${password}\nİlk girişte Ayarlar üzerinden şifreyi değiştirin.\n`,{flag:'wx'});console.log('Yönetici oluşturuldu. Giriş bilgileri git dışında data/admin-access.txt dosyasına yazıldı.');}
main().finally(closeDb);
