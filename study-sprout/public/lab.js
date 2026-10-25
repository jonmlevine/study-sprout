import {reviewSignals,localDate,addDays} from './engine.js';
import {sourcePoints,createReflection,learningEvidence,rescueScenario} from './lab-model.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=d=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
let section='map';
const stat=(value,label,detail)=>`<div class="lab-stat"><strong>${value}</strong><span>${label}</span><small>${detail}</small></div>`;
const download=(data,name)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
export function labPage(plan){
  return `<div id="learning-lab"><div class="page-heading"><div><div class="eyebrow">TURN UNCERTAINTY INTO A USEFUL NEXT STEP</div><h1>Grow your understanding<span class="green">.</span></h1><p>Explain it. Check the evidence. Make room to improve.</p></div>${plan?'<button class="btn outline" data-lab="export">Export learning evidence ↗</button>':''}</div>${plan?`<nav class="lab-tabs" aria-label="Learning lab sections">${[['map','Topic evidence'],['recall','Explain it back'],['rescue','Exam recovery'],['outcomes','Learning progress']].map(([id,label])=>`<button class="${section===id?'active':''}" data-lab="tab" data-section="${id}" ${section===id?'aria-current="page"':''}>${label}</button>`).join('')}</nav><div id="lab-content"></div>`:'<section class="card lab-empty"><h2>Start with your own notes.</h2><p>Create a study plan to reveal your topic evidence and practice explaining ideas.</p><button class="btn primary" data-action="new">Create a study plan →</button></section>'}</div>`;
}

function mapView(p){
  const signals=reviewSignals(p),e=learningEvidence(p),gaps=signals.reduce((n,s)=>n+s.gaps,0);
  return `<section class="lab-banner"><div><span class="pill">YOUR EVIDENCE MAP</span><h2>Find the gap. Choose your next step.</h2><p>Topics are ordered by your latest quiz and explain-back evidence. Every priority has a reason.</p></div><div class="lab-orbit" aria-hidden="true">↗<small>recall<br>reflect<br>replan</small></div></section><div class="lab-stats">${stat(`${e.checked}/${e.available}`,'Questions checked','Distinct questions, not attempts')}${stat(e.confidentMistakes,'Confident mistakes','Latest answer per question')}${stat(gaps,'Explanation gaps','Your latest self-check per topic')}</div><div class="lab-topic-grid">${signals.map((s,i)=>{const t=e.topics.find(t=>t.topicId===s.topicId);return `<article class="card lab-topic"><div class="lab-card-head"><span class="lab-number">${String(i+1).padStart(2,'0')}</span><span class="pill ${s.priority>=80?'lab-alert':''}">${esc(s.label)}</span></div><h2>${esc(s.title)}</h2><p>${esc(s.reason)}</p><div class="lab-coverage"><span style="width:${t.checked/t.total*100}%"></span></div><small>${t.checked} / ${t.total} questions checked · ${t.correct} correct on latest answers</small><div class="lab-actions"><button class="btn primary" data-lab="explain" data-topic="${s.topicId}">Explain it back →</button><button class="btn outline" data-action="topic-quiz" data-id="${s.topicId}">Quiz this topic</button></div></article>`;}).join('')}</div><p class="lab-note">Coverage is how much you have checked, not a mastery score. Source self-checks and quiz results remain separate evidence.</p>`;
}
function recallView(p){
  const d=p.labDraft,t=p.topics.find(t=>t.id===d?.topicId),points=t?sourcePoints(p,t.id):[];
  if(!t)return `<section class="card lab-empty"><span class="pill">EXPLAIN-BACK STUDIO</span><h2>Could you teach this to a friend?</h2><p>First explain an idea without your notes. Then compare your explanation with exact source excerpts. Mark what you missed so your plan can respond.</p><div class="lab-topic-picker">${reviewSignals(p).map(s=>`<button class="btn outline" data-lab="explain" data-topic="${s.topicId}">${esc(s.title)} →</button>`).join('')}</div><p class="lab-note">You assess the explanation yourself. The app does not automatically grade its correctness.</p></section>`;
  return `<section class="card lab-studio"><div class="lab-card-head"><span class="pill">${d.revealed?'02 · COMPARE WITH YOUR SOURCE':'01 · RECALL WITHOUT NOTES'}</span><button class="text-link" data-lab="choose">Choose another topic</button></div><h2>${esc(t.title)}</h2><p>Explain the main idea, how it works, and why it matters. Include an example if useful.</p><label for="explain-text">Your explanation</label><textarea id="explain-text" maxlength="5000" ${d.revealed?'readonly':''} placeholder="Imagine explaining this to a classmate…">${esc(d.explanation||'')}</textarea><small>${d.revealed?'Your original explanation is kept unchanged for comparison.':'Draft saved in this browser as you type. Sources stay hidden until you reveal them.'}</small>${d.revealed?`<div class="lab-source-list">${points.map((s,i)=>`<fieldset class="lab-source"><legend>Source point ${i+1}</legend><blockquote>${esc(s.quote)}</blockquote><div class="lab-ratings">${[['covered','I covered this'],['missing','I missed this'],['unsure','I’m unsure']].map(([v,label])=>`<label><input type="radio" name="${s.id}" value="${v}" ${d.ratings?.[s.id]===v?'checked':''}>${label}</label>`).join('')}</div></fieldset>`).join('')}</div><p class="lab-note">These are excerpts from your notes, not an exhaustive marking scheme. A covered point can still contain an error; check with a teacher when needed.</p><button class="btn primary" data-lab="save-reflection">Save self-check & update priorities →</button>`:'<button class="btn primary" data-lab="reveal">Reveal source points →</button>'}<div id="lab-error" role="alert"></div></section>`;
}
function outcomesView(p){
  const e=learningEvidence(p),change=e.paired?e.latest-e.baseline:null;
  return `<section class="lab-banner"><div><span class="pill">OBSERVED PROGRESS</span><h2>Show what changed. Keep the evidence.</h2><p>Compare your first and latest answers to the same questions. Activity, recall and self-checks tell different parts of the story.</p></div></section><div class="lab-stats">${stat(e.paired?`${e.baseline}% → ${e.latest}%`:'—','Matched-question accuracy',`${e.paired} questions answered at least twice`)}${stat(change===null?'—':`${change>0?'+':''}${change} pp`,'Observed change','Same questions · familiarity can help')}${stat(e.delayedCount?`${e.delayedCorrect}/${e.delayedCount}`:'—','Recall after 48+ hours',`${e.delayedCount} repeated questions with a 48h gap`)}</div><div class="lab-two"><article class="card lab-detail"><h2>What these numbers mean</h2><p>Matched accuracy compares the same set of questions on your first and most recent attempts, so different topic mixes do not distort that comparison.</p><p>The 48-hour count uses questions whose first and latest recorded attempts are at least 48 hours apart. Answers were shown during practice, and extra practice may have happened between attempts.</p><p><strong>This is personal practice evidence.</strong> It does not establish causation, unseen-question transfer, or an exam score. ${e.paired?'':'Repeat a quiz to start a comparison.'}</p><button class="btn primary" data-action="quiz">Practice & collect evidence →</button></article><article class="card lab-detail"><h2>Your learning trail</h2><p>${p.attempts.length} completed quizzes across ${e.days} recorded quiz days.</p><p>${(p.reflections||[]).length} saved explain-backs · ${(p.adaptations||[]).length} plan adaptations.</p><a class="btn outline" href="#benefit">Measure decision time →</a><p class="lab-note">No sample results are mixed into your records.</p></article></div><div class="section-heading spaced"><h2>Recent explain-backs</h2></div>${(p.reflections||[]).length?`<div class="lab-history">${p.reflections.slice(-8).reverse().map(r=>`<details class="card lab-detail"><summary>${esc(p.topics.find(t=>t.id===r.topicId)?.title)} · ${r.checks.filter(c=>c.rating!=='covered').length} gaps · ${esc(new Date(r.date).toLocaleString())}</summary><p class="lab-original">${esc(r.explanation)}</p>${r.checks.map(c=>`<p><span class="pill">${esc(c.rating)}</span> ${esc(c.quote)}</p>`).join('')}</details>`).join('')}</div>`:'<p class="lab-note">Your saved explanations and source checks will appear here.</p>'}`;
}
function rescueView(p){return `<section class="lab-banner"><div><span class="pill">EXAM RECOVERY SIMULATOR</span><h2>Life happens. See your options.</h2><p>Change your available time or mark days off. Preview the tradeoffs before committing to a new plan.</p></div></section><div class="lab-two rescue-layout"><section class="card lab-detail"><form id="rescue-form"><label>Exam date<input id="rescue-exam" type="date" min="${addDays(localDate(),1)}" max="${addDays(localDate(),180)}" value="${p.examDate}"></label><label>Minutes available per day<input id="rescue-minutes" type="number" min="10" max="180" step="1" value="${p.minutes}"></label><fieldset class="lab-days"><legend>Days you cannot study</legend><p>Checked days receive no new work.</p><div id="rescue-days"></div></fieldset></form><p class="lab-note">Reviews follow your latest evidence. Already completed work stays recorded, even on a day off or above a new time limit.</p></section><section class="card lab-detail"><div id="rescue-preview" aria-live="polite"></div><button class="btn primary" id="apply-rescue" disabled>Apply recovery plan →</button><div id="rescue-status" role="status"></div></section></div>`;}

export function mountLab(p,{save,refresh,notify}){
  if(!p)return;
  const root=document.querySelector('#learning-lab'),content=root.querySelector('#lab-content');
  function draw(){content.innerHTML=section==='map'?mapView(p):section==='recall'?recallView(p):section==='rescue'?rescueView(p):outcomesView(p);if(section==='rescue')mountRescue();}
  function error(message){const el=root.querySelector('#lab-error');if(el)el.textContent=message;else notify(message);}
  root.onclick=e=>{
    const button=e.target.closest('[data-lab]');if(!button)return;
    const action=button.dataset.lab;
    if(action==='tab'){section=button.dataset.section;refresh();}
    if(action==='explain'){
      if(p.labDraft?.topicId!==button.dataset.topic){
        p.labDrafts=p.labDrafts||{};
        if(p.labDraft)p.labDrafts[p.labDraft.topicId]=p.labDraft;
        p.labDraft=p.labDrafts[button.dataset.topic]||{topicId:button.dataset.topic,explanation:'',ratings:{},revealed:false};save();
      }
      section='recall';refresh();
    }
    if(action==='choose'){section='map';refresh();}
    if(action==='reveal'){
      const d=p.labDraft;if(!d.explanation?.trim()){error('Write your explanation before revealing the source.');return;}
      d.revealed=true;save();draw();
    }
    if(action==='save-reflection'){
      try{const r=createReflection(p,p.labDraft);p.reflections=[...(p.reflections||[]),r];if(p.labDrafts)delete p.labDrafts[r.topicId];delete p.labDraft;save();section='map';refresh();notify('Self-check saved. Your explanation gaps now guide review priorities.');}catch(e){error(e.message);}
    }
    if(action==='export')download({exportedAt:new Date().toISOString(),subject:p.subject,mode:p.provider,metrics:learningEvidence(p),priorities:reviewSignals(p),reflections:p.reflections||[],quizAttempts:p.attempts,adaptations:p.adaptations||[],limitations:'Personal practice evidence, not causal learning gains or an exam prediction. Repeated questions may benefit from familiarity. Reflections are learner self-assessments and contain source excerpts.'},'study-sprout-learning-evidence.json');
  };
  root.oninput=e=>{if(e.target.id==='explain-text'&&p.labDraft&&!p.labDraft.revealed){p.labDraft.explanation=e.target.value;save();}};
  root.onchange=e=>{if(section==='recall'&&e.target.type==='radio'&&p.labDraft){p.labDraft.ratings[e.target.name]=e.target.value;save();}};
  function mountRescue(){
    let blocked=new Set(p.unavailableDates||[]),preview=null;
    const exam=root.querySelector('#rescue-exam'),minutes=root.querySelector('#rescue-minutes'),days=root.querySelector('#rescue-days'),holder=root.querySelector('#rescue-preview'),apply=root.querySelector('#apply-rescue');
    root.querySelector('#rescue-form').onsubmit=e=>e.preventDefault();
    function update(){
      preview=null;apply.disabled=true;
      try{
        preview=rescueScenario(p,{examDate:exam.value,minutes:Number(minutes.value),blockedDates:[...blocked]});
        days.innerHTML=preview.calendar.map(d=>`<label><input type="checkbox" value="${d.date}" ${d.blocked?'checked':''}>${dateLabel(d.date)}</label>`).join('');
        holder.innerHTML=`<span class="pill ${preview.canApply?'':'lab-alert'}">${preview.canApply?'THIS PLAN FITS':'MORE ROOM NEEDED'}</span><h2>${preview.overflow?`${preview.overflow} minutes do not fit`:`${preview.pending} minutes scheduled`}</h2><p>${preview.availableDays} available days · ${preview.reviewCount} review topics · ${preview.overdueCount} overdue sessions.</p>${preview.overflow?'<p class="lab-warning">Increase daily time, restore a study day, or adjust the exam date if it is flexible. Applying is blocked so no work disappears.</p>':''}${preview.overBudgetCompleted.length?'<p class="lab-warning">Some completed days exceed this new limit. Those records are preserved; no extra work is added on those days.</p>':''}<div class="lab-calendar">${preview.calendar.map(d=>`<div class="${d.blocked?'blocked':''}"><span>${dateLabel(d.date)}</span><strong>${d.minutes} min</strong><small>${d.blocked?'Day off':`of ${preview.minutes} min`}</small></div>`).join('')}</div><details><summary>Inspect the proposed study sessions</summary><div class="lab-schedule">${preview.sessions.filter(s=>!s.done).map(s=>`<p><strong>${dateLabel(s.date)} · ${s.minutes} min</strong><br>${esc(s.title)}<br><small>${esc(s.reason)}</small></p>`).join('')}</div></details>`;
        apply.disabled=!preview.canApply;
      }catch(e){holder.innerHTML=`<p class="lab-warning">${esc(e.message)}</p>`;}
    }
    exam.oninput=minutes.oninput=update;
    days.onchange=e=>{if(e.target.type!=='checkbox')return;const value=e.target.value;e.target.checked?blocked.add(value):blocked.delete(value);update();days.querySelector(`input[value="${value}"]`)?.focus();};
    apply.onclick=()=>{
      if(!preview?.canApply)return;
      p.sessions=preview.sessions;p.minutes=preview.minutes;p.examDate=preview.examDate;p.unavailableDates=preview.blockedDates;
      p.adaptations=[...(p.adaptations||[]),{date:new Date().toISOString(),type:'exam-recovery',reviews:preview.reviewCount,overdue:preview.overdueCount,minutes:p.minutes,examDate:p.examDate,blockedDates:[...blocked]}];
      save();refresh();notify('Recovery plan applied. Your calendar now respects your days off.');
    };update();
  }
  draw();
}
