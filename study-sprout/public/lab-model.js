import {localDate,dayDistance,addDays,replanRemaining} from './engine.js';

const normalized=s=>String(s).replace(/\s+/g,' ').trim().toLowerCase();
export function sourcePoints(plan,topicId){
  const topic=plan.topics.find(t=>t.id===topicId);
  if(!topic)return [];
  const seen=new Set();
  return [topic.sourceQuote,...topic.questions.map(q=>q.sourceQuote)].filter(quote=>{
    const key=normalized(quote||'');
    if(!key||seen.has(key)||!normalized(plan.notes).includes(key))return false;
    seen.add(key);return true;
  }).slice(0,5).map((quote,i)=>({id:`${topicId}-source-${i}`,quote}));
}
export function createReflection(plan,{topicId,explanation,ratings},now=new Date().toISOString()){
  const points=sourcePoints(plan,topicId);
  if(!points.length)throw new Error('This topic has no verifiable source points.');
  if(typeof explanation!=='string'||!explanation.trim()||explanation.length>5000)throw new Error('Write an explanation of 1–5,000 characters.');
  if(points.some(p=>!['covered','missing','unsure'].includes(ratings?.[p.id])))throw new Error('Check every source point before saving.');
  return {id:crypto.randomUUID(),topicId,date:now,explanation:explanation.trim(),checks:points.map(p=>({...p,rating:ratings[p.id]})),method:'Learner self-check against source excerpts; not AI grading'};
}

export function learningEvidence(plan){
  const valid=new Map(plan.topics.flatMap(t=>t.questions.map(q=>[q.id,t.id]))),history=new Map();
  for(const attempt of plan.attempts){
    for(const a of attempt.answers){
      if(valid.get(a.questionId)!==a.topicId||typeof a.correct!=='boolean')continue;
      const list=history.get(a.questionId)||[];
      list.push({...a,at:Date.parse(attempt.date)});history.set(a.questionId,list);
    }
  }
  const pairs=[...history.values()].filter(a=>a.length>1).map(a=>({first:a[0],last:a.at(-1)}));
  const delayed=pairs.filter(p=>Number.isFinite(p.first.at)&&Number.isFinite(p.last.at)&&p.last.at-p.first.at>=48*3600000);
  const pct=items=>items.length?Math.round(items.filter(Boolean).length/items.length*100):null;
  const latest=[...history.values()].map(a=>a.at(-1));
  return {available:valid.size,checked:history.size,paired:pairs.length,baseline:pct(pairs.map(p=>p.first.correct)),latest:pct(pairs.map(p=>p.last.correct)),delayedCount:delayed.length,delayedCorrect:delayed.filter(p=>p.last.correct).length,confidentMistakes:latest.filter(a=>!a.correct&&a.confidence==='sure').length,days:new Set(plan.attempts.map(a=>a.day||a.date?.slice(0,10)).filter(Boolean)).size,
    topics:plan.topics.map(t=>{const answers=t.questions.map(q=>history.get(q.id)?.at(-1)).filter(Boolean);return {topicId:t.id,total:t.questions.length,checked:answers.length,correct:answers.filter(a=>a.correct).length};})};
}

export function rescueScenario(plan,{today=localDate(),examDate=plan.examDate,minutes=plan.minutes,blockedDates=plan.unavailableDates||[]}={}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(examDate)||Number.isNaN(Date.parse(examDate))||new Date(examDate).toISOString().slice(0,10)!==examDate||dayDistance(today,examDate)<1||dayDistance(today,examDate)>180)throw new Error('Choose an exam date 1–180 days from today.');
  const preview=replanRemaining({...plan,examDate},{today,minutes,blockedDates});
  const days=Array.from({length:dayDistance(today,examDate)},(_,i)=>addDays(today,i));
  const calendar=days.map(date=>({date,blocked:blockedDates.includes(date),minutes:preview.daily.find(d=>d.date===date)?.minutes||0}));
  const pending=preview.sessions.filter(s=>!s.done).reduce((n,s)=>n+s.minutes,0);
  const overflow=preview.unplaced.reduce((n,s)=>n+s.minutes,0);
  return {...preview,examDate,blockedDates:[...blockedDates],calendar,pending,overflow,availableDays:calendar.filter(d=>!d.blocked).length};
}

export function validatePilot(raw){
  const code=String(raw.code||'').trim(),workflow=String(raw.workflow||'').trim(),observation=String(raw.observation||'').trim();
  if(!/^[A-Za-z0-9_-]{2,24}$/.test(code))throw new Error('Use an anonymous code of 2–24 letters, digits, underscores or hyphens.');
  if(!workflow||workflow.length>300||!observation||observation.length>600)throw new Error('Describe the current workflow and observed result within the limits.');
  if(!['student','tutor','other'].includes(raw.role)||!['never','monthly','weekly','daily'].includes(raw.frequency)||!['yes','maybe','no'].includes(raw.returnIntent)||!['real','rehearsal'].includes(raw.kind))throw new Error('Complete all interview fields.');
  const severity=Number(raw.severity);if(!Number.isInteger(severity)||severity<1||severity>5)throw new Error('Select a pain rating from 1 to 5.');
  if(raw.consent!==true)throw new Error('Confirm permission to record this anonymous feedback.');
  return {id:crypto.randomUUID(),date:new Date().toISOString(),code,workflow,observation,role:raw.role,frequency:raw.frequency,returnIntent:raw.returnIntent,kind:raw.kind,severity};
}
export function pilotSummary(records){
  const latest=new Map();for(const r of records)if(r.kind==='real')latest.set(r.code,r);
  const unique=[...latest.values()];return {participants:unique.length,frequent:unique.filter(r=>['weekly','daily'].includes(r.frequency)).length,severe:unique.filter(r=>r.severity>=4).length,returnYes:unique.filter(r=>r.returnIntent==='yes').length,rehearsals:records.filter(r=>r.kind==='rehearsal').length};
}
