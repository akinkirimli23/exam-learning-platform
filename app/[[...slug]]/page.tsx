import {Suspense} from 'react';
import {LearningApp} from '@/components/learning-app';
import {databaseMatchesSupabaseProject} from '@/server/db';
export default function Page(){const matches=databaseMatchesSupabaseProject();return <div data-database-project-matches-supabase={matches===null?'unconfigured':String(matches)}><Suspense fallback={<div className="page-loading">İvme yükleniyor…</div>}><LearningApp/></Suspense></div>;}
