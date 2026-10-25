import test from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_NOTES,offlineTopics,createPlan,reviewSignals,replanRemaining,chooseQuiz} from '../public/engine.js';
const input={subject:'Biology',notes:SAMPLE_NOTES,startDate:'2026-10-25',examDate:'2026-11-01',minutes:30};
const plan=()=>createPlan(input,offlineTopics(SAMPLE_NOTES));
function answer(p,topic,correct,confidence,date='2026-10-25T12:00:00Z'){
  const q=p.topics[topic].questions[0];p.attempts.push({date,day:date.slice(0,10),answers:[{questionId:q.id,topicId:q.topicId,correct,confidence}]});return q;
}
test('confident mistakes rank above other misses and uncertain correct answers',()=>{
  const p=plan();answer(p,0,true,'guess');answer(p,1,false,'unsure');answer(p,2,false,'sure');
  const s=reviewSignals(p,'2026-10-25');assert.equal(s[0].topicId,p.topics[2].id);assert.equal(s[0].confidentWrong,1);assert.equal(s[1].topicId,p.topics[1].id);assert.equal(s[2].topicId,p.topics[0].id);
  assert.equal(chooseQuiz(p)[0].topicId,p.topics[2].id);
});
test('review due dates distinguish missed, uncertain and confident answers',()=>{
  const p=plan();answer(p,0,false,'sure');answer(p,1,true,'guess');answer(p,2,true,'sure');
  const s=reviewSignals(p,'2026-10-25');assert.equal(s.find(s=>s.topicId==='t0').dueAt,'2026-10-25');assert.equal(s.find(s=>s.topicId==='t1').dueAt,'2026-10-26');assert.equal(s.find(s=>s.topicId==='t2').dueAt,'2026-10-28');
});
test('a later correct answer replaces a misconception signal',()=>{
  const p=plan();answer(p,0,false,'sure');answer(p,0,true,'sure','2026-10-26T12:00:00Z');const s=reviewSignals(p,'2026-10-26').find(s=>s.topicId==='t0');assert.equal(s.wrong,0);assert.equal(s.confidentWrong,0);assert.equal(s.dueAt,'2026-10-29');
});
test('catch-up previews preserve completed work and respect every remaining daily budget',()=>{
  const p=plan();p.sessions[0].done=true;p.sessions[0].completedOn='2026-10-26';answer(p,1,false,'sure');const original=JSON.stringify(p);
  const result=replanRemaining(p,{today:'2026-10-26',minutes:30});assert.equal(result.canApply,true);assert.equal(JSON.stringify(p),original);assert.equal(result.sessions.filter(s=>s.done).length,1);assert.ok(result.daily.every(d=>d.minutes<=30));assert.ok(result.sessions.filter(s=>!s.done).every(s=>s.date>='2026-10-26'&&s.date<p.examDate));assert.equal(result.sessions.filter(s=>s.kind==='review').reduce((n,s)=>n+s.minutes,0),10);
  assert.equal(result.sessions.filter(s=>s.kind!=='review').reduce((n,s)=>n+s.minutes,0),150);
});
test('replanning repeatedly does not duplicate reviews or drop unfinished review fragments',()=>{
  const p=plan();answer(p,0,false,'sure');p.sessions[0].done=true;p.sessions[0].completedOn='2026-10-25';
  const first=replanRemaining(p,{today:'2026-10-25',minutes:30});p.sessions=first.sessions;
  const piece=p.sessions.find(s=>s.kind==='review'&&s.date==='2026-10-25');assert.equal(piece.minutes,5);piece.done=true;piece.completedOn='2026-10-25';
  const second=replanRemaining(p,{today:'2026-10-25',minutes:30});assert.equal(second.sessions.filter(s=>s.kind==='review').reduce((n,s)=>n+s.minutes,0),10);
  p.sessions=second.sessions;const third=replanRemaining(p,{today:'2026-10-25',minutes:30});assert.equal(third.sessions.filter(s=>s.kind==='review').reduce((n,s)=>n+s.minutes,0),10);
});
test('over-capacity previews surface unplaced work and cannot be applied',()=>{
  const p=plan();answer(p,0,false,'sure');const result=replanRemaining(p,{today:'2026-10-31',minutes:10});assert.equal(result.canApply,false);assert.ok(result.unplaced.length>0);const scheduled=result.sessions.reduce((n,s)=>n+s.minutes,0),unplaced=result.unplaced.reduce((n,s)=>n+s.minutes,0);assert.equal(scheduled+unplaced,160);assert.ok(result.daily.every(d=>d.minutes<=10));
});
test('past exams and invalid planning dates are handled without hidden loss',()=>{
  const p=plan();assert.equal(replanRemaining(p,{today:'2026-11-02'}).canApply,false);assert.throws(()=>replanRemaining(p,{today:'2026-02-30'}));assert.throws(()=>replanRemaining(p,{minutes:0}));
});
test('lowering the budget never rewrites already-completed time',()=>{
  const p=plan();p.sessions[0].done=true;p.sessions[0].completedOn='2026-10-25';const r=replanRemaining(p,{today:'2026-10-25',minutes:10});assert.equal(r.overBudgetCompleted.length,1);assert.equal(r.sessions.find(s=>s.done).minutes,25);assert.ok(r.sessions.filter(s=>!s.done).every(s=>s.date!=='2026-10-25'));
});
