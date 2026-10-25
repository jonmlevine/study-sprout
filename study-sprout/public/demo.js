import {SAMPLE_NOTES,localDate,addDays} from './engine.js';
import {browserPlan,readRuntime} from './runtime.js';
let report=null;
const status=document.querySelector('#verification');
readRuntime().then(c=>{document.querySelector('#ai-status').textContent=c.ociVerified?'Verified this server run':c.ociAvailable?'Configured · not yet verified':'Offline · no cloud AI required';});
const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
document.querySelector('#url-status').textContent=local?'Local only · not public':location.protocol==='https:'?'HTTPS origin · verify access':'HTTP origin · HTTPS pending';
document.querySelector('#run-checks').addEventListener('click',async()=>{
  const button=document.querySelector('#run-checks');button.disabled=true;document.querySelector('#export-report').disabled=true;status.textContent='Running local checks…';report=null;
  const durations=[],checks=[];
  const input={subject:'Demo verification · Biology',notes:SAMPLE_NOTES,startDate:localDate(),examDate:addDays(localDate(),7),minutes:30,provider:'offline'};
  const assert=(name,ok)=>{checks.push({name,passed:Boolean(ok)});if(!ok)throw new Error(name);};
  const rejects=data=>{try{browserPlan(data);return false;}catch{return true;}};
  try{
    for(let i=0;i<5;i++){
      const start=performance.now();const p=browserPlan(input);assert(`Generation ${i+1} returns a plan`,Boolean(p.id));durations.push(Math.round((performance.now()-start)*10)/10);
      const daily={};for(const s of p.sessions)daily[s.date]=(daily[s.date]||0)+s.minutes;
      assert(`Plan ${i+1} respects the daily time budget`,Object.values(daily).every(n=>n<=input.minutes));
      assert(`Plan ${i+1} finishes before the exam`,p.sessions.every(s=>s.date<p.examDate&&s.date>=p.startDate));
      assert(`Plan ${i+1} has source evidence`,p.topics.every(t=>t.questions.length&&t.questions.every(q=>SAMPLE_NOTES.includes(q.sourceQuote)&&q.options.length===4)));
    }
    assert('Invalid study time is rejected',rejects({...input,minutes:0}));
    assert('Empty notes are rejected',rejects({...input,notes:''}));
    assert('An expired deadline is rejected',rejects({...input,examDate:input.startDate}));
    const sorted=[...durations].sort((a,b)=>a-b);
    report={measuredAt:new Date().toISOString(),scope:'Browser-only offline smoke checks; not server security validation, OCI, a load test, or a student outcome study.',samples:durations,medianMs:sorted[2],maxMs:sorted[4],checks};
    status.textContent=`${checks.length} / ${checks.length} checks passed.\n5 browser-only generations · median ${report.medianMs} ms · maximum ${report.maxMs} ms.\nMeasured ${new Date().toLocaleTimeString()}. No backend or cloud AI call was made.`;
    document.querySelector('#export-report').disabled=false;
  }catch(e){status.textContent=`Verification stopped: ${e.message}. ${checks.filter(c=>c.passed).length} checks passed before the failure.`;}
  finally{button.disabled=false;}
});
document.querySelector('#export-report').addEventListener('click',()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='study-sprout-verification.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
