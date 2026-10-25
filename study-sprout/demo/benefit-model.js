export function elapsedMs(timer,now){
  if(!timer)return 0;
  return timer.accumulatedMs+(timer.runningSince===null?0:Math.max(0,now-timer.runningSince));
}
export function startTimer(timer,now){
  if(timer?.runningSince!==null&&timer?.runningSince!==undefined)return timer;
  return {...(timer||{accumulatedMs:0,pauses:0}),runningSince:now};
}
export function pauseTimer(timer,now){
  if(!timer||timer.runningSince===null)return timer;
  return {...timer,accumulatedMs:elapsedMs(timer,now),runningSince:null,pauses:timer.pauses+1};
}
export function validateDecision(decision,budget){
  const topic=String(decision.topic||'').trim(),action=String(decision.action||'').trim(),minutes=Number(decision.minutes);
  if(!topic||topic.length>120)throw new Error('Name the topic you chose (up to 120 characters).');
  if(!action||action.length>300)throw new Error('Describe your next study action (up to 300 characters).');
  if(!Number.isInteger(minutes)||minutes<1||minutes>budget)throw new Error(`Choose between 1 and ${budget} study minutes.`);
  return {topic,action,minutes};
}
export function compareTimes(manualMs,sproutMs){
  if(!Number.isFinite(manualMs)||!Number.isFinite(sproutMs)||manualMs<=0||sproutMs<=0)throw new Error('Complete both timed attempts before comparing.');
  const differenceMs=manualMs-sproutMs;
  return {manualMs,sproutMs,differenceMs,percentChange:differenceMs/manualMs*100};
}
export function median(values){
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
}
export function summarizeComparisons(records){
  const pairs=records.map(r=>compareTimes(r.manual.durationMs,r.sprout.durationMs));
  return {count:pairs.length,manualMs:median(pairs.map(p=>p.manualMs)),sproutMs:median(pairs.map(p=>p.sproutMs)),differenceMs:median(pairs.map(p=>p.differenceMs)),percentChange:median(pairs.map(p=>p.percentChange))};
}
export function formatDuration(ms){
  if(ms===null||ms===undefined)return '—';
  const tenths=Math.round(Math.abs(ms)/100),minutes=Math.floor(tenths/600),seconds=Math.floor(tenths%600/10);
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${tenths%10}`;
}
export function planContext(plan){
  // Exact context comparison avoids mixing results from different notes, deadlines or budgets.
  return JSON.stringify([plan.id,plan.subject,plan.notes,plan.examDate,plan.minutes]);
}
