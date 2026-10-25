import {validateInput,normalizeAITopics,addDays} from './engine.js';

function validProgress(saved) {
  if(saved?.version!==1||!Array.isArray(saved.plans)||!(saved.activeId===null||typeof saved.activeId==='string'))return false;
  try {
    for(const plan of saved.plans) {
      validateInput(plan);
      normalizeAITopics({topics:plan.topics},plan.notes);
      if(!plan.topics.every(t=>typeof t.id==='string'&&t.questions.every(q=>typeof q.id==='string'&&q.topicId===t.id)))return false;
      if(typeof plan.id!=='string'||!['offline','oci'].includes(plan.provider))return false;
      const topics=new Set(plan.topics.map(t=>t.id));
      if(!Array.isArray(plan.sessions)||!plan.sessions.length||!plan.sessions.every(s=>typeof s.id==='string'&&typeof s.title==='string'&&topics.has(s.topicId)&&Number.isInteger(s.minutes)&&s.minutes>0&&typeof s.done==='boolean'&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)&&addDays(s.date,0)===s.date))return false;
      if(!Array.isArray(plan.attempts)||!plan.attempts.every(a=>Array.isArray(a.answers)&&a.answers.every(x=>topics.has(x.topicId)&&typeof x.questionId==='string'&&typeof x.correct==='boolean')))return false;
    }
    return saved.activeId===null||saved.plans.some(p=>p.id===saved.activeId);
  }catch{return false;}
}

export function progressStore(key,browser=globalThis) {
  const readOnly=new Set(),warnings=new Set(),candidates=[];
  let mode='memory',updatedAt=0;
  for(const name of ['localStorage','sessionStorage']) {
    try {
      const raw=browser[name].getItem(key);
      if(raw!==null) {
        const saved=JSON.parse(raw);
        if(!validProgress(saved))throw new Error('Invalid progress');
        candidates.push({saved,name});
      }
      if(mode==='memory')mode=name;
    }catch {
      readOnly.add(name);
      warnings.add('Some saved progress could not be read. The original data has been left unchanged.');
    }
  }
  candidates.sort((a,b)=>(Number(b.saved.updatedAt)||0)-(Number(a.saved.updatedAt)||0));
  const saved=candidates[0];
  if(saved){mode=saved.name;updatedAt=Number(saved.saved.updatedAt)||0;}
  return {
    state:saved?.saved||{plans:[],activeId:null},
    get status(){return mode==='localStorage'?'Saved on this browser':mode==='sessionStorage'?'Saved for this tab only':'Not saved: memory only';},
    get warning(){return [...warnings,mode==='sessionStorage'?'Progress survives reload in this tab, but may be lost when the tab closes.':mode==='memory'?'Progress cannot survive reload. Export your plan before leaving.':''].filter(Boolean).join(' ');},
    save(state) {
      updatedAt=Math.max(Date.now(),updatedAt+1);
      const raw=JSON.stringify({...state,version:1,updatedAt});
      for(const name of ['localStorage','sessionStorage']) {
        if(readOnly.has(name))continue;
        try{browser[name].setItem(key,raw);mode=name;return true;}catch{}
      }
      mode='memory';
      return false;
    }
  };
}
