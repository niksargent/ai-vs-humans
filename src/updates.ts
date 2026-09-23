import type {Settings} from './model.js';
import {draw} from './random.js';
export interface UpdateRelease {id:number;hour:number;checked:boolean;mistake:boolean;fault:boolean;verified:boolean;escalation:boolean;nuclear:boolean;}
export interface UpdateSchedule {made:number;checked:number;waiting:number;ready:number;mistakes:number;caught:number;releases:UpdateRelease[];history:{day:number;made:number;checked:number;backlog:number}[];}
// Project identities keep the same mistake/check draws when pace or defences change.
// Capacity and error coefficients are teaching assumptions, not measured AI forecasts.
export function updateSchedule(s:Settings,seed=42,until=720):UpdateSchedule {
 const permitted=s.authority===2||s.authority===1&&s.humanApproval;
 const queue:{id:number;mistake:boolean}[]=[],ready:{id:number;mistake:boolean;checked:boolean}[]=[];
 const releases:UpdateRelease[]=[],history:UpdateSchedule['history']=[];
 let made=0,checked=0,mistakes=0,caught=0,production=0,testing=0;
 const rate=s.capability>=1?20*Math.min(s.researchSpeed,s.computeCapacity,s.experimentCapacity)/100:0;
 days: for(let day=0;day<30&&day*24<until;day++){
  production+=rate;
  while(production>=1-1e-9){production-=1;const id=++made,mistake=draw(seed,`update:${id}:mistake`)<s.mistakeRate/100;mistakes+=+mistake;queue.push({id,mistake});}
  testing=Math.min(testing+20*s.evaluationCapacity/100,queue.length);
  while(testing>=1-1e-9&&queue.length){testing-=1;const item=queue.shift()!;checked++;if(item.mistake&&draw(seed,`update:${item.id}:catch`)<s.checkEffectiveness/100)caught++;else ready.push({...item,checked:true});}
  if(!s.waitForChecks)while(queue.length)ready.push({...queue.shift()!,checked:false});
  if(permitted){
   const count=ready.length;
   for(let slot=0;slot<count;slot++){
    const item=ready.shift()!,hour=day*24+Math.min(23,Math.floor((slot+1)*24/(count+1)));
    const minutes=Math.round(90-.65*s.verification+(s.independent?0:60*(1-s.fallback/100)));
    const verified=item.mistake&&(s.independent||s.fallback>0)&&minutes<=s.decisionTime&&draw(seed,`update:${item.id}:verify`)<s.verification/100;
    const escalation=item.mistake&&s.aiAdvice&&!verified&&s.tension>=50&&draw(seed,`update:${item.id}:escalate`)<s.tension/100;
    const nuclear=escalation&&s.tension>=80&&draw(seed,`update:${item.id}:nuclear`)<.2;
    releases.push({...item,hour,fault:item.mistake,verified,escalation,nuclear});
    if(nuclear){history.push({day:day+1,made,checked,backlog:queue.length});break days;}
   }
  }
  history.push({day:day+1,made,checked,backlog:queue.length});
 }
 return {made,checked,waiting:queue.length,ready:ready.length,mistakes,caught,releases,history};
}

export function releaseExplanation(s:Settings,u:Pick<UpdateSchedule,'made'|'waiting'|'ready'|'checked'|'caught'> & {releases:{fault:boolean}[]}):string {
 if(!u.made)return s.researchSpeed===0?'Project pace is zero. No new updates are produced.':s.capability===0?'AI can only suggest changes here. No working updates are produced.':'Computers or experiments are at zero. No updates are produced.';
 const faults=u.releases.filter(r=>r.fault).length;
 if(s.waitForChecks&&s.evaluationCapacity===0)return `${u.waiting} updates are waiting. You require tests, but testing capacity is zero, so none can go live.`;
 if(s.authority===0||s.authority===1&&!s.humanApproval)return `${u.ready} updates await permission${u.waiting?` and ${u.waiting} await testing`:''}. No updates can go live until you allow them.`;
 return `${u.checked} tested · ${u.caught} mistakes caught · ${u.releases.length} released · ${faults} faulty updates escaped.${u.waiting?` ${u.waiting} updates still await testing.`:''} ${s.waitForChecks?'Only tested updates can go live. A test can still miss a mistake.':'Untested updates can go live when the testers cannot keep up.'}`;
}
