import {validateInput,offlineTopics,createPlan} from './engine.js';

// Offline plans need no server, account, token, or network transmission of notes.
export function browserPlan(raw){
  const input=validateInput(raw);
  return createPlan(input,offlineTopics(input.notes),'offline');
}
export async function readRuntime(fetcher=fetch){
  try{
    const response=await fetcher('./api/config',{signal:AbortSignal.timeout(5000)});
    if(!response.ok)throw new Error('No backend');
    const data=await response.json();
    if(data.storage!=='browser')throw new Error('Not a Study Sprout server');
    return {...data,backendAvailable:data.backendAvailable!==false};
  }catch{return {ociAvailable:false,ociVerified:false,backendAvailable:false,storage:'browser',access:'guest'};}
}
