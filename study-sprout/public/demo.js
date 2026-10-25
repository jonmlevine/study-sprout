import {SAMPLE_NOTES,localDate,addDays} from './engine.js';
let report=null;
const status=document.querySelector('#verification');
fetch('/api/config').then(r=>r.json()).then(c=>{document.querySelector('#ai-status').textContent=c.ociVerified?'Verified this server run':c.ociAvailable?'Configured · not yet verified':'Offline · OCI not configured';}).catch(()=>document.querySelector('#ai-status').textContent='Server unavailable');
const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
document.querySelector('#url-status').textContent=local?'Local only · not public':location.protocol==='https:'?'HTTPS origin · verify access':'HTTP origin · HTTPS pending';
document.querySelector('#run-checks').addEventListener('click',async()=>{
  const button=document.querySelector('#run-checks');button.disabled=true;document.querySelector('#export-report').disabled=true;status.textContent='Running local checks…';report=null;
  const durations=[],checks=[];
  const input={subject:'Demo verification · Biology',notes:SAMPLE_NOTES,startDate:localDate(),examDate:addDays(localDate(),7),minutes:30,provider:'offline'};
  const assert=(name,ok)=>{checks.push({name,passed:Boolean(ok)});if(!ok)throw new Error(name);};
  const request=data=>fetch('/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
  try{
    for(let i=0;i<5;i++){
      const start=performance.now();const res=await request(input);assert(`Request ${i+1} returns a plan`,res.ok);const p=await res.json();durations.push(Math.round((performance.now()-start)*10)/10);
      const daily={};for(const s of p.sessions)daily[s.date]=(daily[s.date]||0)+s.minutes;
      assert(`Plan ${i+1} respects the daily time budget`,Object.values(daily).every(n=>n<=input.minutes));
      assert(`Plan ${i+1} finishes before the exam`,p.sessions.every(s=>s.date<p.examDate&&s.date>=p.startDate));
      assert(`Plan ${i+1} has source evidence`,p.topics.every(t=>t.questions.length&&t.questions.every(q=>SAMPLE_NOTES.includes(q.sourceQuote)&&q.options.length===4)));
    }
    assert('Invalid study time is rejected',(await request({...input,minutes:0})).status===400);
    assert('Private environment file is not served',(await fetch('/.env')).status===404);
    assert('Backend implementation is not served',(await fetch('/oci.mjs')).status===404);
    const sorted=[...durations].sort((a,b)=>a-b);
    report={measuredAt:new Date().toISOString(),scope:'Offline local smoke checks; not OCI, a load test, or a student outcome study.',samples:durations,medianMs:sorted[2],maxMs:sorted[4],checks};
    status.textContent=`${checks.length} / ${checks.length} checks passed.\n5 offline requests · median ${report.medianMs} ms · maximum ${report.maxMs} ms.\nMeasured ${new Date().toLocaleTimeString()}. No cloud AI call was made.`;
    document.querySelector('#export-report').disabled=false;
  }catch(e){status.textContent=`Verification stopped: ${e.message}. ${checks.filter(c=>c.passed).length} checks passed before the failure.`;}
  finally{button.disabled=false;}
});
document.querySelector('#export-report').addEventListener('click',()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='study-sprout-verification.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
