export const SAMPLE_NOTES = `Photosynthesis
Photosynthesis converts light energy into chemical energy stored in glucose. Plants use carbon dioxide and water to produce glucose and oxygen. Chlorophyll is the pigment that absorbs light for photosynthesis.

Chloroplasts
Chloroplasts are the organelles where photosynthesis takes place. Thylakoids are membrane sacs inside chloroplasts that contain chlorophyll. The stroma is the fluid surrounding the thylakoids.

Light-dependent reactions
Light-dependent reactions take place in the thylakoid membranes. Water is split to release oxygen, electrons, and hydrogen ions. Light energy is used to produce ATP and NADPH.

The Calvin cycle
The Calvin cycle takes place in the stroma of the chloroplast. It uses ATP and NADPH to convert carbon dioxide into G3P, a sugar precursor. Rubisco is the enzyme that catalyzes carbon fixation.

Limiting factors
Light intensity, carbon dioxide concentration, and temperature can limit the rate of photosynthesis. Increasing light intensity increases the rate until another factor becomes limiting. Very high temperatures can reduce photosynthesis by damaging enzymes.

Why it matters
Photosynthesis supplies much of the chemical energy that supports food chains. The oxygen released during photosynthesis comes from water. Plants also carry out cellular respiration to release energy from glucose.`;

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function addDays(date, count) {
  const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+count); return localDate(d);
}
export function dayDistance(a,b) {
  return Math.round((Date.parse(`${b}T12:00:00Z`)-Date.parse(`${a}T12:00:00Z`))/86400000);
}
export function validateInput(input) {
  if (!input || typeof input !== 'object') throw new Error('Enter a subject and your study notes.');
  const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim() : '';
  const minutes = Number(input.minutes);
  const startDate = input.startDate;
  const examDate = input.examDate;
  const validDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0,10) === d;
  if (!subject || subject.length > 80) throw new Error('Use a subject name between 1 and 80 characters.');
  if (notes.length < 100 || notes.length > 20000) throw new Error('Add between 100 and 20,000 characters of study notes.');
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 180) throw new Error('Choose 10–180 study minutes per day.');
  if (!validDate(startDate) || !validDate(examDate)) throw new Error('Choose valid start and exam dates.');
  const days = dayDistance(startDate, examDate);
  if (days < 1 || days > 180) throw new Error('Choose an exam date 1–180 days after your start date.');
  return {subject, notes, minutes, startDate, examDate};
}
const STOP = new Set('about after again also another because before being between could during every first from have into more much other over same some such than that their them then there these they this those through under used uses using very what when where which while with would your takes place take most'.split(' '));
const words = text => [...new Map((text.match(/\b[A-Za-z][A-Za-z-]{3,}\b/g)||[]).filter(w=>!STOP.has(w.toLowerCase())).map(w=>[w.toLowerCase(),w])).values()];
function sentences(text) { return (text.match(/[^.!?\n]+[.!?]?/g)||[]).map(x=>x.trim()).filter(x=>x.split(/\s+/).length >= 6); }
function hash(text) { let h=0; for (const c of text) h=(h*31+c.charCodeAt(0))>>>0; return h; }
export function offlineTopics(notes) {
  let chunks = notes.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  if (chunks.length === 1) {
    const all = sentences(notes); chunks = [];
    const size = Math.max(2,Math.ceil(all.length/6));
    for(let i=0;i<all.length;i+=size) chunks.push(all.slice(i,i+size).join(' '));
  }
  // Keep all material represented when there are more than eight sections.
  if (chunks.length > 8) {
    const size = Math.ceil(chunks.length/8); const grouped=[];
    for(let i=0;i<chunks.length;i+=size) grouped.push(chunks.slice(i,i+size).join('\n'));
    chunks=grouped;
  }
  const vocabulary = words(notes);
  const topics = chunks.map((chunk,i)=>{
    const lines=chunk.split('\n').filter(Boolean);
    const heading=lines.length>1 && lines[0].length<75 && !/[.!?]$/.test(lines[0]);
    const body=heading ? lines.slice(1).join(' ') : chunk;
    const facts=sentences(body);
    const title=heading ? lines[0].replace(/^#+\s*/, '') : `Key ideas ${i+1}: ${words(body).slice(0,2).join(' & ')}`;
    const questions=facts.slice(0,5).map((fact,j)=>{
      const candidates=words(fact).sort((a,b)=>b.length-a.length);
      const term=candidates[j%candidates.length];
      if(!term) return null;
      const distractors=vocabulary.filter(w=>w.toLowerCase()!==term.toLowerCase() && !fact.toLowerCase().includes(w.toLowerCase())).sort((a,b)=>hash(a+fact)-hash(b+fact)).slice(0,3);
      if(distractors.length<3) return null;
      const options=[term,...distractors].sort((a,b)=>hash(fact+a)-hash(fact+b));
      return {id:`q${i}-${j}`,topicId:`t${i}`,question:`Complete the statement from your notes: “${fact.replace(new RegExp(`\\b${term}\\b`,'gi'),'_____')}”`,options,answer:options.indexOf(term),explanation:fact,sourceQuote:fact};
    }).filter(Boolean);
    return {id:`t${i}`,title,summary:facts.slice(0,3).join(' '),sourceQuote:facts[0]||body,questions};
  }).filter(t=>t.summary && t.questions.length);
  if(!topics.length) throw new Error('Add more complete sentences and distinct terms so we can create a useful quiz. Separate topics with blank lines.');
  return topics;
}
export function normalizeAITopics(data, notes) {
  if(!data || !Array.isArray(data.topics) || data.topics.length<1 || data.topics.length>8) throw new Error('The AI response did not contain a valid topic list. Try again.');
  const normalized = s => s.replace(/\s+/g,' ').trim().toLowerCase();
  const source=normalized(notes);
  const text=(value,max)=>typeof value==='string' && value.trim().length>0 && value.length<=max;
  return data.topics.map((t,i)=>{
    if(!text(t.title,100)||!text(t.summary,1500)||!text(t.sourceQuote,1500)||!source.includes(normalized(t.sourceQuote))||!Array.isArray(t.questions)||t.questions.length<1||t.questions.length>5) throw new Error('The AI returned an incomplete or ungrounded topic. Try again.');
    const questions=t.questions.map((q,j)=>{
      if(!text(q.question,1000)||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!text(x,400))||new Set(q.options.map(normalized)).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!text(q.explanation,1500)||!text(q.sourceQuote,1500)||!source.includes(normalized(q.sourceQuote))) throw new Error('The AI returned an invalid quiz or missing source evidence. Try again.');
      return {id:`q${i}-${j}`,topicId:`t${i}`,question:q.question,options:q.options,answer:q.answer,explanation:q.explanation,sourceQuote:q.sourceQuote};
    });
    return {id:`t${i}`,title:t.title,summary:t.summary,sourceQuote:t.sourceQuote,questions};
  });
}
export function createPlan(raw, topics, provider='offline') {
  const input=validateInput(raw);
  const days=dayDistance(input.startDate,input.examDate);
  // Keep each topic together and share the daily budget between whole sessions.
  const sessionsPerDay=Math.ceil(topics.length/days);
  const duration=Math.min(25,Math.floor(input.minutes/sessionsPerDay));
  if(duration<5) throw new Error('There is too much material for this deadline. Add study time, move the exam date, or use fewer notes.');
  const sessions=topics.map((topic,i)=>({id:`s${i}-0`,topicId:topic.id,title:topic.title,minutes:duration,date:addDays(input.startDate,Math.floor(i/sessionsPerDay)),part:1,done:false}));
  return {id:globalThis.crypto.randomUUID(),...input,topics,sessions,provider,attempts:[],createdAt:new Date().toISOString()};
}
export function topicScores(plan) {
  const scores={};
  // Keep the latest response for each question, so successful review replaces an old miss.
  for(const attempt of plan.attempts) for(const answer of attempt.answers) {
    if(!scores[answer.topicId]) scores[answer.topicId]={};
    scores[answer.topicId][answer.questionId]=answer.correct;
  }
  return plan.topics.map(t=>{
    const answers=Object.values(scores[t.id]||{});
    return {topicId:t.id,total:answers.length,correct:answers.filter(Boolean).length,score:answers.length?Math.round(answers.filter(Boolean).length/answers.length*100):null};
  });
}
export function chooseQuiz(plan, topicIds=null, count=5) {
  const signals=reviewSignals(plan);
  const topics=plan.topics.filter(t=>!topicIds||topicIds.includes(t.id)).sort((a,b)=>{
    return signals.find(s=>s.topicId===b.id).priority-signals.find(s=>s.topicId===a.id).priority;
  });
  const latest=new Map();
  for(const attempt of plan.attempts) for(const answer of attempt.answers) latest.set(answer.questionId,answer);
  const questionPriority=q=>{const a=latest.get(q.id);return !a?60:!a.correct?(a.confidence==='sure'?100:90):a.confidence==='guess'?50:a.confidence==='unsure'?40:10;};
  const ordered=new Map(topics.map(t=>[t.id,[...t.questions].sort((a,b)=>questionPriority(b)-questionPriority(a))]));
  const result=[];
  // Round-robin sampling covers multiple topics before repeating one.
  for(let round=0;result.length<count;round++) {
    let added=false;
    for(const topic of topics) {
      if(ordered.get(topic.id)[round]&&result.length<count){result.push(ordered.get(topic.id)[round]);added=true;}
    }
    if(!added) break;
  }
  return result;
}

// Transparent coaching rules. These are prioritization signals, not mastery or grade predictions.
export function reviewSignals(plan,today=localDate()) {
  const latest=new Map();
  for(const attempt of plan.attempts) for(const a of attempt.answers) {
    latest.set(a.questionId,{...a,day:attempt.day||attempt.date?.slice(0,10)||today,at:attempt.date||today});
  }
  return plan.topics.map(topic=>{
    const answers=topic.questions.map(q=>latest.get(q.id)).filter(Boolean);
    const wrong=answers.filter(a=>!a.correct),confidentWrong=wrong.filter(a=>a.confidence==='sure');
    const uncertain=answers.filter(a=>a.correct&&['guess','unsure'].includes(a.confidence));
    let priority=10,reason='Recall was correct. Revisit after a short gap.',label='Spaced recall';
    if(!answers.length){priority=40;reason='No quiz evidence yet. Check your understanding first.';label='Not checked';}
    else if(confidentWrong.length){priority=100;reason=`${confidentWrong.length} confident wrong answer${confidentWrong.length>1?'s':''}. Check the source before reinforcing this idea.`;label='Check a misconception';}
    else if(wrong.length){priority=80;reason=`${wrong.length} missed question${wrong.length>1?'s':''}. Read the evidence, then try recalling it.`;label='Needs another look';}
    else if(uncertain.length){priority=55;reason='Correct, but you were uncertain. Test recall again soon.';label='Build confidence';}
    const dueAt=answers.length?answers.map(a=>addDays(a.day,!a.correct?0:a.confidence==='sure'?3:1)).sort()[0]:today;
    const evidenceKey=String(hash(answers.map(a=>`${a.questionId}:${a.at}:${a.correct}:${a.confidence||'unsure'}`).join('|')));
    return {topicId:topic.id,title:topic.title,priority,reason,label,dueAt,due:dueAt<=today,answered:answers.length,wrong:wrong.length,confidentWrong:confidentWrong.length,uncertain:uncertain.length,evidenceKey};
  }).sort((a,b)=>b.priority-a.priority||a.dueAt.localeCompare(b.dueAt));
}

export function replanRemaining(plan,{today=localDate(),minutes=plan.minutes}={}) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||Number.isNaN(Date.parse(today))||new Date(today).toISOString().slice(0,10)!==today)throw new Error('Choose a valid planning date.');
  if(!Number.isInteger(minutes)||minutes<10||minutes>180)throw new Error('Choose 10–180 minutes per day.');
  const completed=plan.sessions.filter(s=>s.done).map(s=>({...s,originalDate:s.originalDate||s.date,date:s.completedOn||s.date}));
  const used={};for(const s of completed){const date=s.completedOn||s.date;used[date]=(used[date]||0)+s.minutes;}
  // Rebuild outstanding reviews from current quiz evidence, rather than stacking duplicates.
  const signals=reviewSignals(plan,today);
  const reviews=signals.filter(s=>s.answered&&s.dueAt<plan.examDate).map(s=>({id:`r-${s.topicId}-${s.evidenceKey}`,topicId:s.topicId,title:s.title,minutes:Math.max(0,10-completed.filter(c=>c.kind==='review'&&c.topicId===s.topicId&&c.evidenceKey===s.evidenceKey).reduce((n,c)=>n+c.minutes,0)),kind:'review',reason:s.reason,priority:s.priority,dueAt:s.dueAt,evidenceKey:s.evidenceKey})).filter(s=>s.minutes>0);
  const learning=plan.sessions.filter(s=>!s.done&&s.kind!=='review').map(s=>({...s,priority:s.date<today?70:30,dueAt:today,reason:s.date<today?'Catch up on an unfinished session.':'Continue your original study plan.'}));
  const tasks=[...reviews,...learning].sort((a,b)=>b.priority-a.priority);
  const scheduled=[],unplaced=[];
  for(const task of tasks){
    let remaining=task.minutes,part=0;
    let date=task.dueAt>today?task.dueAt:today;
    while(remaining>0&&date<plan.examDate){
      const available=Math.max(0,minutes-(used[date]||0));
      if(available){const duration=Math.min(remaining,available);part++;scheduled.push({...task,id:`${task.id}-p${part}`,minutes:duration,date,part,done:false});used[date]=(used[date]||0)+duration;remaining-=duration;}
      date=addDays(date,1);
    }
    if(remaining)unplaced.push({...task,minutes:remaining});
  }
  const next=[...completed,...scheduled].sort((a,b)=>a.date.localeCompare(b.date)||Number(b.done)-Number(a.done));
  const daily=Object.entries(used).filter(([date])=>date>=today&&date<plan.examDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,total])=>({date,minutes:total}));
  return {sessions:next,unplaced,daily,minutes,reviewCount:reviews.length,overdueCount:learning.filter(s=>s.date<today).length,canApply:unplaced.length===0,overBudgetCompleted:daily.filter(d=>d.minutes>minutes),today};
}
