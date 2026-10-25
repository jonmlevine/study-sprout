import {reviewSignals} from './engine.js';
import {elapsedMs,startTimer,pauseTimer,validateDecision,compareTimes,summarizeComparisons,formatDuration,planContext} from './benefit-model.js';
const KEY='study-sprout-time-benefit-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data={version:1,records:[],draft:null},root=null,plan=null,interval=null,controller=null,storageWarning='';
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.version===1&&Array.isArray(saved.records)){data=saved;}}
catch{storageWarning='Saved measurements could not be read. New measurements will start here.';}
// A crashed/reloaded running stopwatch has no trustworthy monotonic clock reference.
if(data.draft?.timer?.runningSince!==null&&data.draft?.timer?.runningSince!==undefined){data.draft.timer=null;data.draft.interrupted=true;data.draft.started=false;data.draft.decision={};}
const now=()=>performance.now();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{storageWarning='Browser storage is unavailable. Download your results before leaving.';}}
function records(){const context=planContext(plan);return data.records.filter(r=>r.context===context);}
function draft(){return data.draft?.context===planContext(plan)?data.draft:null;}
function currentMode(d){return d.order[d.completed.length];}
const modeName=m=>m==='manual'?'Manual planning':'With Study Sprout';
function getSuggestion(p){
  const signals=reviewSignals(p),due=signals.find(s=>(s.answered||s.gaps)&&s.due);
  if(due)return {topic:due.title,action:'Review the source explanation, then practice this topic.',minutes:Math.min(10,p.minutes),reason:due.reason,summary:p.topics.find(t=>t.id===due.topicId)?.summary||''};
  const next=p.sessions.find(s=>!s.done),topic=next?p.topics.find(t=>t.id===next.topicId):p.topics[0];
  return {topic:topic.title,action:next?.kind==='review'?'Review the source explanation and test your recall.':'Read the topic summary, then explain it from memory.',minutes:Math.min(next?.minutes||10,p.minutes),reason:next?'This is the next unfinished session in your saved plan.':'Your sessions are complete. A short recall check can help you choose what to revisit.',summary:topic.summary};
}
export function benefitPage(p){return `<div class="page-heading"><div><div class="eyebrow">MEASURE THE DIFFERENCE FOR YOURSELF</div><h1>Time well spent<span class="green">.</span></h1><p>Compare the time it takes to choose your next study action.</p></div></div>${p?'<div id="time-benefit-root"></div>':'<div class="card benefit-empty"><h2>Start with a study plan.</h2><p>Create a plan first so both timed attempts use the same notes, deadline, and daily budget.</p><button class="btn primary" data-action="new">Create a study plan →</button></div>'}`;}
export function stopBenefit(){
  if(root&&plan){const d=draft();if(d?.timer?.runningSince!==null&&d?.timer?.runningSince!==undefined){d.timer=pauseTimer(d.timer,now());d.pauseReason='Paused because you left this screen.';persist();}}
  clearInterval(interval);interval=null;controller?.abort();controller=null;root=null;plan=null;
}
export function mountBenefit(p){
  if(!p)return;root=document.querySelector('#time-benefit-root');plan=p;controller=new AbortController();
  root.addEventListener('click',handleClick,{signal:controller.signal});
  root.addEventListener('submit',event=>{event.preventDefault();},{signal:controller.signal});
  root.addEventListener('input',event=>{const d=draft();if(d&&event.target.name?.startsWith('decision-')){d.decision[event.target.name.slice(9)]=event.target.value;persist();}},{signal:controller.signal});
  const pauseOnLeave=()=>{const d=draft();if(d?.timer?.runningSince!==null&&d?.timer?.runningSince!==undefined){d.timer=pauseTimer(d.timer,now());d.pauseReason='Paused when this tab lost visibility. Resume when you are ready.';persist();paint();}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseOnLeave();},{signal:controller.signal});
  window.addEventListener('pagehide',pauseOnLeave,{signal:controller.signal});
  interval=setInterval(()=>{const d=draft(),clock=root?.querySelector('#benefit-clock');if(clock&&d)clock.textContent=formatDuration(elapsedMs(d.timer,now()));},100);
  paint();
}
function metricsMarkup(list){
  const s=summarizeComparisons(list),negative=s.differenceMs<0;
  return `<div class="benefit-metrics"><article><span>Manual decision time</span><strong>${formatDuration(s.manualMs)}</strong><small>${s.count?'Median active time':'No completed comparison yet'}</small></article><article><span>With Study Sprout</span><strong>${formatDuration(s.sproutMs)}</strong><small>Median active time</small></article><article class="${negative?'slower':'benefit-highlight'}"><span>${s.count?(negative?'More time with Study Sprout':'Less time with Study Sprout'):'Observed time difference'}</span><strong>${formatDuration(s.differenceMs)}</strong><small>${s.count?`${Math.abs(s.percentChange).toFixed(1)}% ${s.percentChange<0?'longer':'shorter'} · median paired change`:'Complete both attempts to measure'}</small></article></div><p class="benefit-count">${s.count===1?'1 paired attempt · a single personal observation':`${s.count} paired attempts for these notes, deadline, and time budget`}. No estimated time savings are included.</p>`;
}
function paint(){
  if(!root||!plan)return;
  const list=records(),d=draft();
  root.innerHTML=`<section class="benefit-intro card"><span class="pill">${esc(plan.subject)}</span><h2>Same task. Two ways to get there.</h2><p>Choose one topic to study next, describe the action you’ll take, and assign minutes within your ${plan.minutes}-minute daily budget.</p><div class="benefit-methods"><span><b>Manual</b> Decide using your source notes.</span><span><b>Study Sprout</b> Decide using your existing plan’s recommendation.</span></div><details><summary>What this measures—and what it doesn’t</summary><p>Timers measure active decision time, including reading and entering your decision. Paused time is excluded; pauses are recorded. Study Sprout’s recommendation already exists, so this comparison excludes note entry, initial plan generation, studying, and learning outcomes. The manual attempt is an in-app proxy for your usual workflow. Reusing the notes creates familiarity and order effects; alternate which method goes first. Shorter time alone does not prove an equally good decision.</p></details></section>${metricsMarkup(list)}${storageWarning?`<p class="form-error" role="alert">${esc(storageWarning)}</p>`:''}${d?draftMarkup(d):startMarkup(list)}${historyMarkup(list)}`;
}
function startMarkup(list){
  const next=list.length%2===0?'manual':'sprout';
  return `<section class="card benefit-start"><div><span class="eyebrow">A SMALL PERSONAL EXPERIMENT</span><h2>Try a timed comparison.</h2><p>Both rounds ask you to produce a usable next study action. Stop each timer only when you have chosen your topic, action, and minutes.</p></div><div class="benefit-start-controls"><label>Which method goes first?<select id="benefit-order"><option value="${next}">${modeName(next)} first · suggested</option value="${next==='manual'?'sprout':'manual'}">${modeName(next==='manual'?'sprout':'manual')} first</option></select></label><button class="btn primary" data-benefit="new">Start a new comparison →</button></div><p class="benefit-footnote">The suggested order alternates between completed comparisons. Both rounds use the same notes and a fixed recommendation snapshot.</p></section>`;
}
function draftMarkup(d){
  const mode=currentMode(d),running=d.timer?.runningSince!==null&&d.timer?.runningSince!==undefined;
  const completed=d.completed.map(r=>`<span class="pill">${modeName(r.mode)}: ${formatDuration(r.durationMs)}</span>`).join('');
  const material=mode==='manual'?`<details class="benefit-source" open><summary>Your original notes</summary><pre>${esc(d.notes)}</pre></details>`:`<div class="benefit-suggestion"><span class="pill">YOUR NEXT STUDY ACTION</span><h3>${esc(d.suggestion.topic)}</h3><p>${esc(d.suggestion.action)}</p><p><strong>${d.suggestion.minutes} minutes</strong> · ${esc(d.suggestion.reason)}</p><details><summary>Read the topic summary</summary><p>${esc(d.suggestion.summary)}</p></details><button class="btn outline" data-benefit="use-suggestion">Use this suggestion</button></div>`;
  return `<section class="card benefit-round"><div class="benefit-round-heading"><div><span class="eyebrow">ROUND ${d.completed.length+1} OF 2</span><h2>${modeName(mode)}</h2></div><div class="benefit-clock-wrap"><span id="benefit-clock" role="timer" aria-label="Active decision time" aria-live="off">${formatDuration(elapsedMs(d.timer,now()))}</span><small>${running?'Timer running':d.started?'Paused':'Ready when you are'}</small></div></div>${completed?`<div class="benefit-completed">${completed}</div>`:''}<p class="benefit-task">Choose a topic, an action, and 1–${d.minutes} study minutes. Exam: ${esc(d.examDate)}.</p>${d.interrupted?'<p class="form-error">The timer was interrupted by a reload. Restart this round to get a reliable measurement. A completed first round is still saved.</p>':''}${d.pauseReason?`<p class="benefit-pause-note">${esc(d.pauseReason)}</p>`:''}
    <div class="benefit-timer-controls"><button class="btn primary" data-benefit="${running?'pause':'start'}">${running?'Pause timer':d.started?'Resume timer':'Start timer & reveal material'}</button><button class="btn text" data-benefit="discard">Discard this comparison</button></div>
    ${running?`<div class="benefit-task-grid"><section>${material}</section><form id="benefit-decision" class="benefit-decision"><h3>Your next study action</h3><label>Topic<input name="decision-topic" maxlength="120" value="${esc(d.decision.topic||'')}" placeholder="What will you study?"></label><label>Study action<textarea name="decision-action" maxlength="300" placeholder="e.g. Explain the process from memory">${esc(d.decision.action||'')}</textarea></label><label>Study minutes<input name="decision-minutes" type="number" min="1" max="${d.minutes}" value="${esc(d.decision.minutes||'')}"></label><p>Study minutes describe your planned session; they are not the timer measurement.</p><div id="benefit-error" class="form-error" role="alert"></div><button type="button" class="btn primary" data-benefit="finish">${d.completed.length?'Finish & compare':'Finish this round'} →</button></form></div>`:`<div class="benefit-curtain">${d.started?'Material is hidden while paused. Resume to continue deciding.':'The notes or recommendation will appear after the timer starts.'}</div>`}</section>`;
}
function historyMarkup(list){
  if(!list.length)return '';
  return `<div class="section-heading spaced"><h2>Your measured comparisons</h2><button class="btn outline" data-benefit="export">Download results</button></div><div class="card benefit-history">${[...list].reverse().map(r=>{const c=compareTimes(r.manual.durationMs,r.sprout.durationMs);return `<details><summary><span>${new Date(r.finishedAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</span><strong>${formatDuration(c.differenceMs)} ${c.differenceMs<0?'longer':'less time'}</strong><span>${modeName(r.order[0])} first</span></summary><div class="benefit-history-details"><p>Manual: <strong>${formatDuration(c.manualMs)}</strong> · Study Sprout: <strong>${formatDuration(c.sproutMs)}</strong> · ${Math.abs(c.percentChange).toFixed(1)}% ${c.percentChange<0?'longer':'shorter'}.</p>${[r.manual,r.sprout].map(a=>`<p><strong>${modeName(a.mode)}</strong> — ${esc(a.decision.topic)}: ${esc(a.decision.action)} (${a.decision.minutes} study minutes). ${a.pauses} pause${a.pauses===1?'':'s'}.</p>`).join('')}<p class="benefit-footnote">These decisions are self-reported. Their quality has not been graded.</p></div></details>`;}).join('')}</div>`;
}
function handleClick(event){
  const button=event.target.closest('[data-benefit]');if(!button)return;
  const action=button.dataset.benefit,d=draft();
  if(action==='new'){
    const first=root.querySelector('#benefit-order').value;
    if(data.draft&&data.draft.context!==planContext(plan)&&!confirm('Replace the unfinished comparison for another plan? Completed results will remain.'))return;
    data.draft={id:crypto.randomUUID(),context:planContext(plan),planId:plan.id,subject:plan.subject,notes:plan.notes,minutes:plan.minutes,examDate:plan.examDate,provider:plan.provider,order:[first,first==='manual'?'sprout':'manual'],suggestion:getSuggestion(plan),completed:[],decision:{},timer:null,started:false,createdAt:new Date().toISOString()};persist();paint();
  }
  if(action==='start'&&d){d.timer=startTimer(d.timer,now());d.started=true;d.interrupted=false;d.pauseReason='';persist();paint();}
  if(action==='pause'&&d){d.timer=pauseTimer(d.timer,now());d.pauseReason='Paused time is excluded from active decision time.';persist();paint();}
  if(action==='discard'&&d&&confirm('Discard this unfinished comparison? Completed comparisons will remain.')){data.draft=null;persist();paint();}
  if(action==='use-suggestion'&&d?.timer&&d.timer.runningSince!==null){d.decision={topic:d.suggestion.topic,action:d.suggestion.action,minutes:d.suggestion.minutes};persist();paint();}
  if(action==='finish'&&d?.timer&&d.timer.runningSince!==null){
    try{
      const decision=validateDecision(d.decision,d.minutes),durationMs=elapsedMs(d.timer,now());
      if(durationMs<=0)throw new Error('Start the timer before finishing.');
      const result={mode:currentMode(d),durationMs,pauses:d.timer.pauses,decision,finishedAt:new Date().toISOString()};d.completed.push(result);
      if(d.completed.length===2){const manual=d.completed.find(x=>x.mode==='manual'),sprout=d.completed.find(x=>x.mode==='sprout');data.records.push({id:d.id,context:d.context,planId:d.planId,subject:d.subject,provider:d.provider,examDate:d.examDate,budgetMinutes:d.minutes,order:d.order,manual,sprout,finishedAt:new Date().toISOString()});data.draft=null;}
      else{d.timer=null;d.started=false;d.decision={};d.pauseReason='';}
      persist();paint();
    }catch(error){root.querySelector('#benefit-error').textContent=error.message;}
  }
  if(action==='export'){
    const list=records();const payload={app:'Study Sprout',exportedAt:new Date().toISOString(),metric:'Active time to choose a next study action from existing material',scope:'Within-person, self-reported task completion. Excludes initial setup, plan generation, study time and learning outcomes. Familiarity and order effects are possible. Not a causal estimate.',subject:plan.subject,summary:summarizeComparisons(list),comparisons:list.map(({context,...r})=>({...r,...compareTimes(r.manual.durationMs,r.sprout.durationMs)}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='study-sprout-time-benefit.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
}
