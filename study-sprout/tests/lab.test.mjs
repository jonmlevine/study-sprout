import test from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_NOTES,offlineTopics,createPlan,reviewSignals,replanRemaining} from '../public/engine.js';
import {sourcePoints,createReflection,learningEvidence,rescueScenario,validatePilot,pilotSummary} from '../public/lab-model.js';
const today='2026-10-25';
const plan=()=>createPlan({subject:'Biology',notes:SAMPLE_NOTES,startDate:today,examDate:'2026-11-01',minutes:30},offlineTopics(SAMPLE_NOTES));
const reflection=(p,rating='missing')=>createReflection(p,{topicId:'t0',explanation:'Plants convert sunlight into chemical energy.',ratings:Object.fromEntries(sourcePoints(p,'t0').map(s=>[s.id,rating]))});
function answer(p,correct,date,question=0,confidence='sure'){const q=p.topics[0].questions[question];p.attempts.push({date,day:date.slice(0,10),answers:[{questionId:q.id,topicId:'t0',correct,confidence}]});}

test('explain-back only displays distinct source excerpts present in original notes',()=>{
 const p=plan();p.topics[0].questions.push({...p.topics[0].questions[0],sourceQuote:'Unsupported claim from outside the notes.'});
 const points=sourcePoints(p,'t0');assert.equal(points.length,3);assert.ok(points.every(s=>p.notes.includes(s.quote)));assert.deepEqual(sourcePoints(p,'invalid'),[]);
});
test('explain-back requires a complete self-check and preserves the original explanation',()=>{
 const p=plan();assert.throws(()=>createReflection(p,{topicId:'t0',explanation:'',ratings:{}}));assert.throws(()=>createReflection(p,{topicId:'t0',explanation:'My idea',ratings:{}}));
 const r=reflection(p);assert.equal(r.explanation,'Plants convert sunlight into chemical energy.');assert.equal(r.checks.length,3);assert.equal(p.reflections,undefined);
});
test('self-identified gaps affect reviews without becoming quiz results; latest self-check resolves them',()=>{
 const p=plan();p.reflections=[reflection(p)];let signal=reviewSignals(p,today).find(s=>s.topicId==='t0');assert.equal(signal.priority,90);assert.equal(signal.gaps,3);assert.equal(signal.answered,0);
 const r=replanRemaining(p,{today});assert.equal(r.reviewCount,1);assert.equal(learningEvidence(p).checked,0);
 p.reflections.push(reflection(p,'covered'));signal=reviewSignals(p,today).find(s=>s.topicId==='t0');assert.equal(signal.gaps,0);assert.equal(signal.priority,40);
});
test('confident quiz mistakes remain ahead of self-check gaps',()=>{
 const p=plan();p.reflections=[reflection(p)];answer(p,false,'2026-10-25T10:00:00Z');assert.equal(reviewSignals(p,today)[0].priority,100);
});
test('learning evidence matches questions and preserves negative changes',()=>{
 const p=plan();answer(p,true,'2026-10-25T10:00:00Z');answer(p,false,'2026-10-26T10:00:00Z');answer(p,true,'2026-10-26T11:00:00Z',1);
 const e=learningEvidence(p);assert.equal(e.checked,2);assert.equal(e.paired,1);assert.equal(e.baseline,100);assert.equal(e.latest,0);assert.equal(e.confidentMistakes,1);assert.equal(e.delayedCount,0);
});
test('delayed recall requires a real 48-hour interval and empty evidence stays empty',()=>{
 const p=plan();assert.equal(learningEvidence(p).baseline,null);answer(p,false,'2026-10-25T10:00:00Z');answer(p,true,'2026-10-27T09:59:59Z');assert.equal(learningEvidence(p).delayedCount,0);
 answer(p,true,'2026-10-27T10:00:00Z');const e=learningEvidence(p);assert.equal(e.delayedCount,1);assert.equal(e.delayedCorrect,1);
});
test('recovery respects days off, preserves completed work, and does not mutate the plan',()=>{
 const p=plan();p.sessions[0].done=true;p.sessions[0].completedOn=today;p.reflections=[reflection(p)];const original=JSON.stringify(p);
 const r=rescueScenario(p,{today,blockedDates:[today,'2026-10-26'],minutes:30});assert.equal(r.canApply,true);assert.equal(JSON.stringify(p),original);assert.ok(r.sessions.filter(s=>!s.done).every(s=>![today,'2026-10-26'].includes(s.date)));assert.equal(r.sessions.find(s=>s.done).minutes,25);
 assert.equal(r.pending+r.sessions.filter(s=>s.done).reduce((n,s)=>n+s.minutes,0),160);
});
test('impossible recovery accounts for every minute and blocks applying',()=>{
 const p=plan();const r=rescueScenario(p,{today,examDate:'2026-10-27',blockedDates:[today],minutes:10});assert.equal(r.canApply,false);assert.equal(r.pending+r.overflow,150);assert.equal(r.overflow,140);
 assert.throws(()=>rescueScenario(p,{today,examDate:today}));assert.throws(()=>rescueScenario(p,{today,blockedDates:['2026-02-30']}));
});
test('saved days off are respected by subsequent ordinary replanning',()=>{
 const p=plan();p.unavailableDates=[today];const r=replanRemaining(p,{today});assert.ok(r.sessions.every(s=>s.date!==today));
});
test('pilot evidence requires consent, deduplicates real participants, and excludes rehearsals',()=>{
 const raw={code:'P01',workflow:'Rereads notes',observation:'Found the source button',role:'student',frequency:'weekly',returnIntent:'yes',kind:'real',severity:4,consent:true};
 assert.throws(()=>validatePilot({...raw,consent:false}));assert.throws(()=>validatePilot({...raw,code:'An email@example.com'}));
 const a=validatePilot(raw),b=validatePilot({...raw,returnIntent:'no',severity:2}),c=validatePilot({...raw,code:'P02',kind:'rehearsal'});
 assert.deepEqual(pilotSummary([a,b,c]),{participants:1,frequent:1,severe:0,returnYes:0,rehearsals:1});
});
