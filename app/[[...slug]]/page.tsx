import {Suspense} from 'react';
import {LearningApp} from '@/components/learning-app';
import {databaseMatchesSupabaseProject,databaseProjectFingerprint} from '@/server/db';
export default function Page(){const matches=databaseMatchesSupabaseProject();return <div data-database-project-matches-supabase={matches===null?'unconfigured':String(matches)} data-database-project-fingerprint={process.env.VERCEL_ENV==='preview'?databaseProjectFingerprint():undefined}><Suspense fallback={<div className="page-loading">İvme yükleniyor…</div>}><LearningApp/></Suspense></div>;}
