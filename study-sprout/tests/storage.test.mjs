import test from 'node:test';
import assert from 'node:assert/strict';
import {progressStore} from '../public/storage.js';
import {createJudgePlan,chooseQuiz} from '../public/engine.js';

function memoryStorage() {
  const values=new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}
const blocked={getItem(){throw new Error('Blocked');},setItem(){throw new Error('Blocked');}};
const progress=()=>{const plan=createJudgePlan('2026-10-25');return {plans:[plan],activeId:plan.id};};

test('saved work and quiz evidence survive reload with the existing version 1 format',()=>{
  const browser={localStorage:memoryStorage(),sessionStorage:memoryStorage()},state=progress();
  state.plans[0].sessions[0].done=true;
  state.plans[0].attempts.push({day:'2026-10-25',answers:[{questionId:'q0-0',topicId:'t0',correct:false,confidence:'sure'}]});
  browser.localStorage.setItem('progress',JSON.stringify({...state,version:1}));
  const loaded=progressStore('progress',browser);
  assert.equal(loaded.state.plans[0].sessions[0].done,true);
  assert.equal(loaded.state.plans[0].attempts[0].answers[0].confidence,'sure');
  assert.equal(loaded.warning,'');
});

test('blocked local storage falls back to session storage and survives a tab reload',()=>{
  const browser={localStorage:blocked,sessionStorage:memoryStorage()},state=progress();
  const store=progressStore('progress',browser);
  assert.equal(store.save(state),true);
  assert.equal(store.status,'Saved for this tab only');
  assert.match(store.warning,/tab closes/);
  assert.equal(progressStore('progress',browser).state.activeId,state.activeId);
});

test('quota failure restores the latest tab copy instead of an older local copy',()=>{
  const local=memoryStorage(),browser={localStorage:local,sessionStorage:memoryStorage()},state=progress();
  const store=progressStore('progress',browser);
  store.save(state);
  const write=local.setItem;
  local.setItem=()=>{throw new Error('Quota exceeded');};
  state.plans[0].sessions[0].done=true;
  store.save(state);
  const reloaded=progressStore('progress',browser);
  assert.equal(reloaded.state.plans[0].sessions[0].done,true);
  assert.equal(reloaded.status,'Saved for this tab only');
  local.setItem=write;
  reloaded.save(reloaded.state);
  assert.equal(reloaded.status,'Saved on this browser');
  assert.equal(progressStore('progress',browser).state.plans[0].sessions[0].done,true);
});

test('invalid saved data remains untouched while a new session uses separate fallback storage',()=>{
  for(const raw of ['{broken',JSON.stringify({version:1,activeId:'bad',plans:[{id:'bad',topics:null}]})]) {
    const browser={localStorage:memoryStorage(),sessionStorage:memoryStorage()};
    browser.localStorage.setItem('progress',raw);
    const store=progressStore('progress',browser);
    assert.match(store.warning,/original data has been left unchanged/);
    assert.equal(store.save(progress()),true);
    assert.equal(browser.localStorage.getItem('progress'),raw);
    assert.equal(progressStore('progress',browser).state.plans.length,1);
  }
});

test('fully blocked storage reports memory-only state instead of claiming persistence',()=>{
  const store=progressStore('progress',{localStorage:blocked,sessionStorage:blocked});
  assert.equal(store.save(progress()),false);
  assert.equal(store.status,'Not saved: memory only');
  assert.match(store.warning,/cannot survive reload/);
});

test('judge demo has two repeatable questions and resets only its own progress',()=>{
  const first=createJudgePlan('2026-10-25'),second=createJudgePlan('2026-10-25');
  assert.equal(first.notes.length,99);
  assert.equal(first.examDate,'2026-11-01');
  const questions=chooseQuiz(first);
  assert.equal(questions.length,2);
  assert.deepEqual(questions.map(q=>q.options),[['membranes','pigments','enzymes','sunlight'],['membranes','chemical','sunlight','Plants']]);
  assert.deepEqual(questions.map(q=>q.answer),[3,0]);
  first.sessions[0].done=true;
  assert.equal(second.sessions[0].done,false);
  const browser={localStorage:memoryStorage(),sessionStorage:memoryStorage()},real=progress();
  progressStore('study-strides-v1',browser).save(real);
  progressStore('study-sprout-judge-v1',browser).save({plans:[second],activeId:second.id});
  assert.equal(progressStore('study-strides-v1',browser).state.activeId,real.activeId);
});
