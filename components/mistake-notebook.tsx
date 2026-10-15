'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, NotebookPen, RotateCcw, Tag, TriangleAlert } from 'lucide-react';
import { api } from './client';
import { mistakeReasonLabels, type MistakeNotebookItem, type MistakeNotebookResponse, type MistakeReason } from '@/shared/mistakes';
import { getTopicDefinition } from '@/shared/topic-registry';
import { BankQuestionFigure } from './bank-question-figure';

const reasons=Object.entries(mistakeReasonLabels) as [MistakeReason,string][];

export function MistakeNotebook(){
  const [data,setData]=useState<MistakeNotebookResponse|null>(null);
  const [error,setError]=useState('');
  const [showResolved,setShowResolved]=useState(false);
  const load=()=>api<MistakeNotebookResponse>('mistakes').then(setData).catch(e=>setError(e.message));
  useEffect(()=>{load();},[]);
  const items=useMemo(()=>data?.items.filter(item=>showResolved||!item.resolved)??[],[data,showResolved]);
  if(error)return <section className="card"><h2>Yanlış defteri açılamadı</h2><p>{error}</p></section>;
  if(!data)return <div className="page-loading"><NotebookPen size={28}/>Yanlışların düzenleniyor…</div>;

  return <div className="mistake-notebook">
    <div className="page-title"><div><span className="eyebrow">AKILLI YANLIŞ DEFTERİ</span><h1>Yanlışını saklama, nedenini yakala.</h1><p>Yanlış ve boş sorular otomatik eklenir. Önerilen etiketi değiştirebilir, kendi etiketini ekleyebilirsin.</p></div></div>
    <div className="stats-grid">
      <section className="card stat-card"><TriangleAlert size={22}/><strong>{data.summary.totalOpen}</strong><h3>Açık yanlış</h3><p>Tekrar çalışılmayı bekleyen kayıtlar</p></section>
      <section className="card stat-card"><RotateCcw size={22}/><strong>{data.summary.totalEvents}</strong><h3>Toplam hata olayı</h3><p>Aynı sorunun tekrar yanlışları dahil</p></section>
      <section className="card stat-card"><Tag size={22}/><strong>{data.summary.byReason[0]?mistakeReasonLabels[data.summary.byReason[0].reason]:'—'}</strong><h3>En sık neden</h3><p>{data.summary.byReason[0]?.count??0} hata</p></section>
    </div>
    <div className="row-between notebook-toolbar"><h2>Kayıtların</h2><label className="checkbox"><input type="checkbox" checked={showResolved} onChange={e=>setShowResolved(e.target.checked)}/>Çözülenleri göster</label></div>
    {!items.length?<section className="card empty"><CheckCircle2 size={32}/><h3>Şimdilik açık yanlışın yok</h3><p>Yanlış veya boş bıraktığın sorular burada otomatik birikir.</p></section>:<div className="mistake-list">{items.map(item=><MistakeCard key={item.id} item={item} onSaved={load}/>)}</div>}
  </div>;
}

function MistakeCard({item,onSaved}:{item:MistakeNotebookItem;onSaved:()=>void}){
  const [reason,setReason]=useState<MistakeReason>(item.reason);
  const [tags,setTags]=useState<string[]>(item.customTags);
  const [tag,setTag]=useState('');
  const [note,setNote]=useState(item.note);
  const [resolved,setResolved]=useState(item.resolved);
  const [busy,setBusy]=useState(false);
  const topic=getTopicDefinition(item.topicId);
  const addTag=()=>{const value=tag.trim();if(!value||tags.includes(value)||tags.length>=8)return;setTags([...tags,value]);setTag('');};
  const save=async()=>{setBusy(true);try{await api('mistakes/'+item.id,'PUT',{reason,customTags:tags,note,resolved});onSaved();}finally{setBusy(false);}};
  return <article className="card mistake-card">
    <div className="row-between"><div><span className="eyebrow">{topic?.title??item.topicId}</span><h3>{item.question.text}</h3></div><span className="pill gray">{item.wrongCount} kez yanlış/boş</span></div>
    <div className="answer-comparison"><span>Son yanıtın: <strong>{item.question.selectedAnswer==null?'Boş':item.question.options[item.question.selectedAnswer]}</strong></span><span>Doğru: <strong>{item.question.options[item.question.correctAnswer]}</strong></span></div>
    <BankQuestionFigure figure={item.question.figure} />
    {item.question.explanation && <details><summary>Açıklamalı çözüm</summary><p>{item.question.explanation}</p></details>}
    <div className="mistake-fields">
      <label>Neden?<select value={reason} onChange={e=>setReason(e.target.value as MistakeReason)}>{reasons.map(([value,label])=><option key={value} value={value}>{label}{value===item.suggestedReason?' · önerilen':''}</option>)}</select></label>
      <label>Notun<textarea rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Bu soruda neyi kaçırdım?"/></label>
      <div><span className="field-label">Kendi etiketlerin</span><div className="tag-editor">{tags.map(value=><button type="button" key={value} className="pill gray" onClick={()=>setTags(tags.filter(x=>x!==value))}>{value} ×</button>)}<input value={tag} maxLength={32} onChange={e=>setTag(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag();}}} placeholder="Örn. formülü ezberledim"/><button type="button" className="button secondary" onClick={addTag}>Ekle</button></div></div>
      <label className="checkbox"><input type="checkbox" checked={resolved} onChange={e=>setResolved(e.target.checked)}/>Bu yanlışı artık çözdüm</label>
    </div>
    <button className="button" disabled={busy} onClick={save}>{busy?'Kaydediliyor…':'Kaydet'}</button>
  </article>;
}
