import { z } from 'zod';

export const registerSchema = z.object({ name: z.string().trim().min(2).max(60), email: z.string().email().max(200).transform(s=>s.toLowerCase()), password: z.string().min(10).max(128), adult: z.literal(true) });
export const loginSchema = z.object({ email: z.string().email().max(200).transform(s=>s.toLowerCase()), password: z.string().min(1).max(128), mobile: z.boolean().optional() });
export const settingsSchema = z.object({ name:z.string().trim().min(2).max(60), dailyGoal:z.number().int().min(5).max(15), weeklyGoal:z.number().int().min(1).max(7), notifications:z.boolean(), examId:z.string().min(1), timezone:z.string().max(80).refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true;}catch{return false;}},'Geçerli bir saat dilimi seçin.') });
export const kindSchema=z.enum(['exam','subject','topic','objective','lesson','card','question','media']);
export type Kind=z.infer<typeof kindSchema>;
export type ContentStatus='draft'|'reviewed'|'published'|'archived';
export const sourceSchema=z.object({url:z.string().url().or(z.literal('')),license:z.string().min(3).max(500),attribution:z.string().max(500)});
export const contentSchema=z.object({logicalId:z.string().optional(),kind:kindSchema,parentId:z.string().nullable(),title:z.string().min(2).max(180),demo:z.boolean().default(true),source:sourceSchema,payload:z.record(z.string(),z.unknown())});
export const questionSchema=z.object({text:z.string().min(10).max(5000),options:z.array(z.string().min(1).max(1000)).min(2).max(5),correct:z.number().int().min(0),steps:z.array(z.string().min(3)).min(2),distractors:z.array(z.string().min(3)).min(2),difficulty:z.enum(['Temel','Orta','İleri']),objectiveId:z.string().min(1),misconceptions:z.array(z.string()),pool:z.enum(['diagnostic','practice','control']),imageId:z.string().optional()}).refine(q=>q.correct<q.options.length && q.distractors.length===q.options.length,'Her seçenek için açıklama ve geçerli cevap gerekir.');
export const startSchema=z.object({topicId:z.string().min(1),mode:z.enum(['diagnostic','practice','exam','control','review']),idempotencyKey:z.string().uuid(),reviewId:z.string().optional()});
export type Mode=z.infer<typeof startSchema>['mode'];
export type PublicQuestion={id:string;logicalId:string;title:string;text:string;options:string[];difficulty:string;objectiveId:string;demo:boolean;imageId?:string};
export type Feedback={correct:number;steps:string[];distractors:string[];isCorrect:boolean};
export type AttemptDTO={id:string;topicId:string;mode:Mode;status:string;questions:PublicQuestion[];answers:Record<string,number|null>;feedback:Record<string,Feedback>;reviewed:string[];result:{correct:number;wrong:number;blank:number;net:number;total:number}|null;createdAt:string;isFresh:boolean;delayed:boolean;goal:number};
export type UserDTO={id:string;name:string;email:string;role:string;dailyGoal:number;weeklyGoal:number;examId:string|null;timezone:string;notifications:boolean};
export type ContentDTO={id:string;logical_id:string;kind:Kind;parent_id:string|null;title:string;demo:boolean;status:ContentStatus;revision:number;payload:Record<string,any>;source: {url:string;license:string;attribution:string}};
export type OverviewDTO={user:UserDTO;streak:number;weekly:number;points:number;badges:string[];days:{day:string;kind:string}[];history:{id:string;mode:Mode;result:AttemptDTO['result'];completed_at:string;is_fresh:boolean;delayed:boolean}[];reviews:{id:string;topic_id:string;question_id:string|null;due_at:string;kind:string;status:string}[];completedLessons:string[];todayCompleted:boolean;accuracy:number|null;freshAccuracy:number|null;delayedAccuracy:number|null};
