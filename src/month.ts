import {DEFAULTS,draw,validateSettings,type Settings} from './model.js';
import {simulatePathways} from './pathways.js';
import {simulateCivilisation} from './civilisation.js';
export interface MonthSettings {releasesPerDay:number;checkedFault:number;uncheckedFault:number;}
export const MONTH_DEFAULTS:MonthSettings={releasesPerDay:1,checkedFault:1,uncheckedFault:10};
export function validateMonth(raw:unknown):MonthSettings {
 if(raw===undefined)return {...MONTH_DEFAULTS};
 if(!raw||typeof raw!=='object')throw Error('Invalid month settings.');
 const r=raw as MonthSettings;
 for(const key of ['releasesPerDay','checkedFault','uncheckedFault'] as const){const v=r[key];if(!Number.isFinite(v)||!Number.isInteger(v)||v<0||v>(key==='releasesPerDay'?4:100))throw Error(`Invalid ${key}.`);}
 if(r.checkedFault>r.uncheckedFault)throw Error('Checked updates cannot be more error-prone than unchecked updates.');
 return {releasesPerDay:r.releasesPerDay,checkedFault:r.checkedFault,uncheckedFault:r.uncheckedFault};
}
export const outcomeNames={quiet:'No disruption',held:'Weathered the shocks',repairing:'Still fighting to recover',rebuilt:'Rebuilt after collapse',collapse:'Civilisation in crisis',nuclear:'Nuclear catastrophe'};
export type MonthOutcome=keyof typeof outcomeNames;
export interface Release {hour:number;checked:boolean;fault:boolean;escalation:boolean;nuclear:boolean;}
export interface MonthRun {
 seed:number;outcome:MonthOutcome;made:number;checked:number;waiting:number;ready:number;releases:Release[];faults:number[];
 collapseAt:number|null;recoveredAt:number|null;nuclearAt:number|null;careGap:number|null;
 timeline:{hour:number;regions:number;repairing:number}[];
}
export function releaseSchedule(input:Settings,options:MonthSettings,seed:number){
 const s=validateSettings(input),o=validateMonth(options),permitted=s.authority===2||s.authority===1&&s.humanApproval;
 let made=0,checked=0,waiting=0,ready=0;
 const releases:Release[]=[];
 days: for(let day=0;day<30;day++){
  const ideas=s.researchEnabled&&s.capability>=1?4*Math.min(s.researchSpeed,s.computeCapacity,s.experimentCapacity)/100:0;
  made+=ideas;waiting+=ideas;
  const evaluated=Math.min(waiting,4*s.evaluationCapacity/100);waiting-=evaluated;ready+=evaluated;checked+=evaluated;
  for(let slot=0;slot<o.releasesPerDay;slot++){
   if(!permitted)break;
   const isChecked=ready>=1-1e-9;
   if(isChecked)ready=Math.max(0,ready-1);else if(!s.waitForChecks&&waiting>=1-1e-9)waiting=Math.max(0,waiting-1);else break;
   const hour=day*24+Math.floor((slot+1)*24/(o.releasesPerDay+1));
   const fault=draw(seed,`month:${day}:${slot}:fault`)<(isChecked?o.checkedFault:o.uncheckedFault)/100;
   const minutes=Math.round(90-.65*s.verification+(s.independent?0:60*(1-s.fallback/100)));
   const verified=(s.independent||s.fallback>0)&&minutes<=s.decisionTime&&draw(seed,`month:${day}:${slot}:verify`)<s.verification/100;
   const escalation=fault&&s.aiAdvice&&!verified&&s.tension>=50&&draw(seed,`month:${day}:${slot}:escalate`)<s.tension/100;
   const nuclear=escalation&&s.tension>=80&&draw(seed,`month:${day}:${slot}:nuclear`)<.2;
   releases.push({hour,checked:isChecked,fault,escalation,nuclear});
   if(nuclear)break days;
  }
 }
 return {made,checked,waiting,ready,releases};
}
export function simulateMonth(input:Settings,options:MonthSettings,seed=42):MonthRun {
 const s=validateSettings(input),schedule=releaseSchedule(s,options,seed),p=simulatePathways(s);
 const faults=schedule.releases.filter(r=>r.fault).map(r=>r.hour);
 // Continuing harm is an explicitly selected background challenge, not another release draw.
 if(p.harmfulOperation&&(p.controlLost||s.stopDelay>0))faults.unshift(0);
 const world=simulateCivilisation(s,faults.length>0,s.capability===2&&s.sharedProvider,p,faults);
 const nuclearAt=schedule.releases.find(r=>r.nuclear)?.hour??null;
 const scopeEnd=nuclearAt??720;
 const collapseAt=world.crossedAt!==null&&world.crossedAt<=scopeEnd?world.crossedAt:null;
 const recoveredAt=world.recoveredAt!==null&&world.recoveredAt<=scopeEnd?world.recoveredAt:null;
 const damaged=world.regions.some(r=>r.recovery.healthcareGap||r.recovery.emergencyGap||r.recovery.foodShortageHours);
 const outcome:MonthOutcome=nuclearAt!==null?'nuclear':world.endStatus==='collapse'?'collapse':world.endStatus==='disrupted'?'repairing':world.endStatus==='recovered'?'rebuilt':!faults.length&&!damaged?'quiet':'held';
 return {seed,...schedule,faults,outcome,nuclearAt,collapseAt,recoveredAt,careGap:nuclearAt!==null?null:world.regions[0].recovery.healthcareGap,
  timeline:world.frames.filter(f=>f.time%12===0&&f.time<=scopeEnd).map(f=>({hour:f.time,regions:f.failingRegions,repairing:f.repairProgress.filter(x=>x<1).length}))};
}
export function monthEnsemble(s:Settings,o:MonthSettings,seed:number,count=128){
 if(!Number.isInteger(count)||count<1||count>256)throw Error('Run count must be 1–256.');
 const runs=Array.from({length:count},(_,i)=>simulateMonth(s,o,(seed+i)>>>0));
 const buckets=Object.fromEntries(Object.keys(outcomeNames).map(k=>[k,runs.filter(r=>r.outcome===k).length])) as Record<MonthOutcome,number>;
 const collapseBins=[0,0,0,0,0];
 for(const r of runs)if(r.collapseAt!==null)collapseBins[Math.min(4,Math.floor(r.collapseAt/168))]++;
 return {count,runs,buckets,collapseBins,noCollapse:runs.filter(r=>r.collapseAt===null&&r.nuclearAt===null).length,unknownAfterNuclear:runs.filter(r=>r.nuclearAt!==null&&r.collapseAt===null).length};
}
export type MonthEnsemble=ReturnType<typeof monthEnsemble>;
// Deliberate boundary scenarios, never inserted into the random sample.
export const monthChallenges:Record<string,{title:string;settings:Partial<Settings>;options:MonthSettings}>={
 balanced:{title:'One warning, many endings',settings:{researchEnabled:true,waitForChecks:true,tension:90,verification:70,decisionTime:90,independent:true,repairBackup:720},options:{releasesPerDay:2,checkedFault:5,uncheckedFault:15}},
 rebuild:{title:'Can a broken world rebuild?',settings:{researchEnabled:true,researchSpeed:5,reach:6,collapseDays:1,foodStores:24,aidStrength:0,fallback:50,repairBackup:720,crews:100},options:{releasesPerDay:1,checkedFault:20,uncheckedFault:50}},
 guarded:{title:'Give the checks a chance',settings:{researchEnabled:true,waitForChecks:true,verification:100,decisionTime:120,independent:true,reserves:720,fallback:100,reach:3},options:{releasesPerDay:1,checkedFault:1,uncheckedFault:10}},
 race:{title:'Race the repair crews',settings:{researchEnabled:true,waitForChecks:false,researchSpeed:100,computeCapacity:100,experimentCapacity:100,evaluationCapacity:0,reach:6,crews:25,repairBackup:24,foodStores:48},options:{releasesPerDay:4,checkedFault:1,uncheckedFault:30}},
 brink:{title:'A crisis with nuclear stakes',settings:{researchEnabled:true,waitForChecks:false,researchSpeed:100,computeCapacity:100,experimentCapacity:100,evaluationCapacity:0,tension:100,verification:0},options:{releasesPerDay:4,checkedFault:1,uncheckedFault:20}},
 refuge:{title:'Keep a way back',settings:{researchEnabled:true,waitForChecks:true,reach:4,aidStrength:100,aidBudget:168,repairBackup:720,verification:100,decisionTime:120},options:{releasesPerDay:1,checkedFault:10,uncheckedFault:30}}
};
