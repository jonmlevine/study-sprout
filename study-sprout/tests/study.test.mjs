import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,verify,createHash} from 'node:crypto';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {SAMPLE_NOTES,offlineTopics,createPlan,chooseQuiz,topicScores,validateInput,normalizeAITopics,dayDistance,addDays} from '../public/engine.js';
import {makeServer} from '../server.mjs';
import {signedHeaders,generateOCI} from '../oci.mjs';

const input={subject:'Biology',notes:SAMPLE_NOTES,startDate:'2026-10-25',examDate:'2026-11-01',minutes:30};
test('offline material generates source-grounded questions with distinct options',()=>{
  const topics=offlineTopics(SAMPLE_NOTES);assert.equal(topics.length,6);
  for(const t of topics) {assert.ok(t.summary);for(const q of t.questions){assert.ok(SAMPLE_NOTES.includes(q.sourceQuote));assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.sourceQuote.includes(q.options[q.answer]));}}
});
test('scheduling respects every daily budget and finishes before the exam',()=>{
  const topics=offlineTopics(SAMPLE_NOTES);
  for(const minutes of [10,15,20,30,45,180])for(const days of [3,7,31,180]){
    const p=createPlan({...input,minutes,examDate:addDays(input.startDate,days)},topics);const totals={};
    for(const s of p.sessions){assert.ok(s.date<p.examDate);assert.ok(s.date>=p.startDate);assert.ok(s.minutes>0);totals[s.date]=(totals[s.date]||0)+s.minutes;}
    assert.ok(Object.values(totals).every(n=>n<=minutes));assert.equal(new Set(p.sessions.map(s=>s.topicId)).size,topics.length);assert.equal(p.sessions.length,topics.length);
  }
});
test('date calculations cross DST and year boundaries without losing days',()=>{
  assert.equal(dayDistance('2026-10-31','2026-11-02'),2);assert.equal(addDays('2026-12-31',1),'2027-01-01');
});
test('invalid or impossible study requests are rejected',()=>{
  assert.equal(validateInput({...input,notes:'Short notes'}).notes,'Short notes');
  for(const change of [{notes:'   '},{notes:'a'.repeat(20001)},{minutes:0},{minutes:30.5},{subject:' '},{examDate:'2026-10-25'},{examDate:'2026-02-30'},{examDate:'2027-12-31'},{startDate:'bad'}])assert.throws(()=>validateInput({...input,...change}));
  assert.throws(()=>createPlan({...input,minutes:10,examDate:'2026-10-26'},offlineTopics(SAMPLE_NOTES)),/too much material/);
});
test('quiz covers multiple topics and topic review uses the latest answer',()=>{
  const p=createPlan(input,offlineTopics(SAMPLE_NOTES));const questions=chooseQuiz(p);assert.equal(questions.length,5);assert.equal(new Set(questions.map(q=>q.topicId)).size,5);
  const q=questions[0];p.attempts.push({answers:[{questionId:q.id,topicId:q.topicId,correct:false}]});assert.equal(topicScores(p).find(s=>s.topicId===q.topicId).score,0);
  p.attempts.push({answers:[{questionId:q.id,topicId:q.topicId,correct:true}]});const score=topicScores(p).find(s=>s.topicId===q.topicId);assert.equal(score.score,100);assert.equal(score.total,1);
  assert.ok(chooseQuiz(p,[q.topicId]).every(x=>x.topicId===q.topicId));
});
test('AI output rejects unsupported evidence and invalid answer indices',()=>{
  const valid={topics:offlineTopics(SAMPLE_NOTES)};assert.equal(normalizeAITopics(valid,SAMPLE_NOTES).length,6);
  const bad=structuredClone(valid);bad.topics[0].questions[0].sourceQuote='This sentence is not in the notes.';assert.throws(()=>normalizeAITopics(bad,SAMPLE_NOTES),/evidence/);
  const badAnswer=structuredClone(valid);badAnswer.topics[0].questions[0].answer=4;assert.throws(()=>normalizeAITopics(badAnswer,SAMPLE_NOTES));
});
test('OCI signing covers the UTF-8 body, target, host and required headers',()=>{
  const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const url=new URL('https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/chat'),body=JSON.stringify({notes:'α biology 🌱'});
  const config={OCI_TENANCY_ID:'tenancy',OCI_USER_ID:'user',OCI_FINGERPRINT:'fingerprint'};
  const h=signedHeaders(url,body,config,privateKey,'Sun, 25 Oct 2026 12:00:00 GMT');
  assert.equal(h['content-length'],String(Buffer.byteLength(body)));assert.equal(h['x-content-sha256'],createHash('sha256').update(body).digest('base64'));
  const names=h.authorization.match(/headers="([^"]+)"/)[1].split(' ');const signature=h.authorization.match(/signature="([^"]+)"/)[1];
  const signed=names.map(n=>`${n}: ${n==='(request-target)'?'post '+url.pathname:h[n]}`).join('\n');
  assert.ok(verify('RSA-SHA256',Buffer.from(signed),publicKey,Buffer.from(signature,'base64')));
});
test('OCI adapter constructs GENERIC chat and validates a mocked response',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'study-sprout-test-'));const keyFile=path.join(dir,'key.pem');
  try {
    const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});await writeFile(keyFile,privateKey.export({type:'pkcs8',format:'pem'}));
    const env={OCI_REGION:'us-chicago-1',OCI_TENANCY_ID:'t',OCI_USER_ID:'u',OCI_FINGERPRINT:'f',OCI_COMPARTMENT_ID:'c',OCI_MODEL_ID:'m',OCI_PRIVATE_KEY_PATH:keyFile};
    const result=await generateOCI(input,env,async(url,options)=>{
      assert.equal(url.protocol,'https:');const body=JSON.parse(options.body);assert.equal(body.chatRequest.apiFormat,'GENERIC');assert.equal(body.servingMode.servingType,'ON_DEMAND');assert.ok(options.headers.authorization.startsWith('Signature '));
      return {ok:true,json:async()=>({chatResponse:{choices:[{message:{content:[{type:'TEXT',text:JSON.stringify({topics:offlineTopics(SAMPLE_NOTES)})}]}}]}})};
    });assert.equal(result.length,6);
    await assert.rejects(generateOCI(input,env,async()=>({ok:false,status:401})),/HTTP 401/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('HTTP app serves UI, creates plans, rejects bad requests and protects private files',async()=>{
  const server=makeServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const index=await fetch(base);assert.equal(index.status,200);assert.match(await index.text(),/Study Sprout/);
    const demo=await fetch(base+'/demo');assert.equal(demo.status,200);assert.match(await demo.text(),/DEMAND REALITY/);
    assert.equal((await fetch(base+'/adaptive.js')).status,200);
    assert.equal((await fetch(base+'/storage.js')).status,200);
    assert.equal((await fetch(base+'/?judge=1')).status,200);
    const config=await(await fetch(base+'/api/config')).json();assert.equal(config.storage,'browser');
    const request=data=>fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const good=await request(input);assert.equal(good.status,200);assert.equal((await good.json()).topics.length,6);
    const shortNotes='Plants convert sunlight into chemical energy. Chloroplasts contain membranes, enzymes and pigments.';
    assert.ok(shortNotes.length<100);assert.equal((await request({...input,notes:shortNotes})).status,200);
    assert.equal((await request({...input,minutes:0})).status,400);
    assert.equal((await request({...input,provider:'unknown'})).status,400);
    assert.equal((await fetch(base+'/.env')).status,404);assert.equal((await fetch(base+'/oci.mjs')).status,404);
    const cross=await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://other.example'},body:JSON.stringify(input)});assert.equal(cross.status,403);
    const badJSON=await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(badJSON.status,400);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
