import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { DB } from './db';
import type { UserDTO } from '@/shared/contracts';
const scrypt=promisify(scryptCallback);
export class AppError extends Error{constructor(public status:number,message:string){super(message);}}
export const fail=(status:number,message:string):never=>{throw new AppError(status,message);};
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function passwordHash(password:string){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64) as Buffer;return `${salt}:${key.toString('hex')}`;}
export async function verifyPassword(password:string,value:string){const [salt,key]=value.split(':');if(!salt||!key)return false;const result=await scrypt(password,salt,64) as Buffer;const expected=Buffer.from(key,'hex');return expected.length===result.length&&timingSafeEqual(expected,result);}
export function userDTO(u:any):UserDTO{return {id:u.id,name:u.name,email:u.email,role:u.role,dailyGoal:u.daily_goal,weeklyGoal:u.weekly_goal,examId:u.exam_id,timezone:u.timezone,notifications:u.notifications};}
export async function auth(db:DB,request:Request,admin=false){const bearer=request.headers.get('authorization');const token=bearer?.startsWith('Bearer ')?bearer.slice(7):request.headers.get('cookie')?.match(/(?:^|;\s*)ivme_session=([^;]+)/)?.[1];if(!token)fail(401,'Devam etmek için giriş yapın.');const {rows}=await db.query('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>now()',[hash(token!)]);const u=rows[0];if(!u)fail(401,'Oturumunuz sona erdi. Yeniden giriş yapın.');if(admin&&u.role!=='admin')fail(403,'Bu işlem için yönetici yetkisi gerekiyor.');return u;}
export async function session(db:DB,userId:string){const token=randomBytes(32).toString('base64url');await db.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval \'14 days\')',[hash(token),userId]);return token;}
export async function limit(db:DB,key:string,max:number,seconds=900){const now=new Date();const {rows}=await db.query(`INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<$3 THEN 1 ELSE rate_limits.count+1 END,expires_at=CASE WHEN rate_limits.expires_at<$3 THEN $2 ELSE rate_limits.expires_at END RETURNING count`,[key,new Date(+now+seconds*1000),now]);if(rows[0].count>max)fail(429,'İşlem sınırına ulaştınız. Biraz sonra tekrar deneyin.');}
export function dayAt(date:Date,tz:string){return new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function dayDiff(a:string,b:string){return Math.round((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000);}
export function addDays(day:string,count:number){return new Date(Date.parse(day+'T12:00:00Z')+count*86400000).toISOString().slice(0,10);}
export function streak(days:{day:string;kind:string}[],today:string){const sorted=[...days].sort((a,b)=>b.day.localeCompare(a.day));if(!sorted.length||dayDiff(today,sorted[0].day)>1)return 0;let value=0,expected=sorted[0].day;for(const row of sorted){if(row.day!==expected)break;if(row.kind==='study')value++;expected=addDays(expected,-1);}return value;}
export function grade(snapshot:any[],answers:Record<string,number|null>,penalty:number){let correct=0,wrong=0,blank=0;for(const q of snapshot){const a=answers[q.id];if(a==null)blank++;else if(a===q.payload.correct)correct++;else wrong++;}return {correct,wrong,blank,net:Math.round((correct-wrong*penalty)*100)/100,total:snapshot.length};}
export const demoAllowed=()=>process.env.DEMO_CONTENT!=='false' && (process.env.NODE_ENV!=='production'||process.env.DEMO_CONTENT==='true');
