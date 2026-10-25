import test from 'node:test';
import assert from 'node:assert/strict';
import {browserPlan,readRuntime} from '../public/runtime.js';
import {SAMPLE_NOTES} from '../public/engine.js';
test('guest plans are created without authentication or a backend',()=>{
 const p=browserPlan({subject:'Guest',notes:SAMPLE_NOTES,startDate:'2026-10-25',examDate:'2026-11-01',minutes:30});
 assert.equal(p.provider,'offline');assert.equal(p.topics.length,6);assert.equal(p.attempts.length,0);
 assert.throws(()=>browserPlan({subject:'Guest',notes:'',startDate:'2026-10-25',examDate:'2026-11-01',minutes:30}));
});
test('static hosting and unavailable servers still allow the guest app to start',async()=>{
 const failed=await readRuntime(async()=>{throw new Error('No server');});assert.equal(failed.ociAvailable,false);assert.equal(failed.access,'guest');
 const missing=await readRuntime(async()=>({ok:false}));assert.equal(missing.backendAvailable,false);
 const staticConfig=await readRuntime(async()=>({ok:true,json:async()=>({storage:'browser',ociAvailable:false,backendAvailable:false})}));assert.equal(staticConfig.backendAvailable,false);
 const server=await readRuntime(async()=>({ok:true,json:async()=>({storage:'browser',ociAvailable:true})}));assert.equal(server.backendAvailable,true);assert.equal(server.ociAvailable,true);
});
