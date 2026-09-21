import {Suspense} from 'react';
import {LearningApp} from '@/components/learning-app';
export default function Page(){return <Suspense fallback={<div className="page-loading">İvme yükleniyor…</div>}><LearningApp/></Suspense>;}
