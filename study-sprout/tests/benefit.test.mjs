import test from 'node:test';
import assert from 'node:assert/strict';
import {elapsedMs,startTimer,pauseTimer,validateDecision,compareTimes,summarizeComparisons,formatDuration,planContext} from '../public/benefit-model.js';
test('the stopwatch measures active time and excludes paused intervals',()=>{
  let t=startTimer(null,1000);assert.equal(elapsedMs(t,3500),2500);
  t=pauseTimer(t,3500);assert.equal(elapsedMs(t,9000),2500);assert.equal(t.pauses,1);
  t=startTimer(t,10000);assert.equal(elapsedMs(t,12500),5000);
  assert.deepEqual(startTimer(t,11000),t);t=pauseTimer(t,12500);assert.equal(t.accumulatedMs,5000);assert.equal(t.pauses,2);assert.deepEqual(pauseTimer(t,15000),t);
});
test('time differences retain slower results and reject missing durations',()=>{
  assert.deepEqual(compareTimes(60000,45000),{manualMs:60000,sproutMs:45000,differenceMs:15000,percentChange:25});
  assert.equal(compareTimes(30000,45000).differenceMs,-15000);assert.equal(compareTimes(30000,45000).percentChange,-50);
  assert.equal(compareTimes(30000,30000).differenceMs,0);
  for(const pair of [[0,100],[100,0],[-1,100],[NaN,100],[100,Infinity]])assert.throws(()=>compareTimes(...pair));
});
test('summary reports paired medians rather than invented savings',()=>{
  const records=[[60000,30000],[40000,50000],[100000,60000]].map(([a,b])=>({manual:{durationMs:a},sprout:{durationMs:b}}));
  assert.deepEqual(summarizeComparisons(records),{count:3,manualMs:60000,sproutMs:50000,differenceMs:30000,percentChange:40});
  assert.equal(summarizeComparisons([]).differenceMs,null);
});
test('a measured decision must contain a topic, action and affordable study time',()=>{
  assert.deepEqual(validateDecision({topic:' Cells ',action:' Recall functions ',minutes:'10'},20),{topic:'Cells',action:'Recall functions',minutes:10});
  for(const d of [{topic:'',action:'Read',minutes:10},{topic:'Cells',action:' ',minutes:10},{topic:'Cells',action:'Read',minutes:0},{topic:'Cells',action:'Read',minutes:21},{topic:'Cells',action:'Read',minutes:1.5}])assert.throws(()=>validateDecision(d,20));
});
test('measurements stay scoped to identical plan inputs and durations format correctly',()=>{
  const p={id:'one',subject:'Cells',notes:'Nucleus',examDate:'2026-11-01',minutes:30};assert.notEqual(planContext(p),planContext({...p,minutes:20}));assert.notEqual(planContext(p),planContext({...p,notes:'Mitochondria'}));assert.equal(planContext(p),planContext({...p,sessions:[{done:true}]}));
  assert.equal(formatDuration(65400),'01:05.4');assert.equal(formatDuration(-15000),'00:15.0');assert.equal(formatDuration(null),'—');assert.equal(formatDuration(59999),'01:00.0');
});
