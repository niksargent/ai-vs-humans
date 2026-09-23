import {updateSchedule} from './updates.js';
import {simulate,validateSettings,type Settings} from './model.js';
import {simulatePathways} from './pathways.js';
import {simulateCivilisation} from './civilisation.js';
// Kept in saved-world files for backwards compatibility; current controls live in Settings.
export interface MonthSettings {releasesPerDay:number;checkedFault:number;uncheckedFault:number;}
export const MONTH_DEFAULTS:MonthSettings={releasesPerDay:20,checkedFault:1,uncheckedFault:15};
export function validateMonth(raw:unknown):MonthSettings {
 if(raw===undefined)return {...MONTH_DEFAULTS};
 const r=raw as MonthSettings;
 if(!r||typeof r!=='object')throw Error('Invalid month settings.');
 for(const key of ['releasesPerDay','checkedFault','uncheckedFault'] as const)if(!Number.isFinite(r[key])||r[key]<0||r[key]>100)throw Error(`Invalid ${key}.`);
 return {...r};
}
export const outcomeNames={quiet:'No disruption',held:'Weathered the shocks',repairing:'Still fighting to recover',rebuilt:'Rebuilt after collapse',collapse:'Civilisation in crisis',nuclear:'Nuclear catastrophe'};
export type MonthOutcome=keyof typeof outcomeNames;
export interface Release {hour:number;checked:boolean;fault:boolean;escalation:boolean;nuclear:boolean;}
export interface MonthRun {
 seed:number;outcome:MonthOutcome;mistakes:number;caught:number;made:number;checked:number;waiting:number;ready:number;releases:Release[];faults:number[];
 collapseAt:number|null;recoveredAt:number|null;nuclearAt:number|null;careGap:number|null;
 timeline:{hour:number;regions:number;repairing:number}[];
}
export function releaseSchedule(input:Settings,_options:MonthSettings,seed:number){return updateSchedule(validateSettings(input),seed);}
export function simulateMonth(input:Settings,_options:MonthSettings,seed=42):MonthRun {
 const r=simulate(input,seed),schedule=r.updates,world=r.civilisation;
 const faults=schedule.releases.filter(e=>e.fault).map(e=>e.hour);
 if(r.pathways.harmfulOperation&&(r.pathways.controlLost||input.stopDelay>0))faults.unshift(0);
 const nuclearAt=r.nuclearAt,scopeEnd=nuclearAt??720;
 const collapseAt=world.crossedAt!==null&&world.crossedAt<=scopeEnd?world.crossedAt:null;
 const recoveredAt=world.recoveredAt!==null&&world.recoveredAt<=scopeEnd?world.recoveredAt:null;
 const damaged=world.regions.some(region=>region.recovery.healthcareGap||region.recovery.emergencyGap||region.recovery.foodShortageHours);
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
 balanced:{title:'One warning, many endings',settings:{mistakeRate:25,checkEffectiveness:80,waitForChecks:true,tension:90,verification:70,decisionTime:90,independent:true,repairBackup:720},options:{releasesPerDay:2,checkedFault:5,uncheckedFault:15}},
 rebuild:{title:'Can a broken world rebuild?',settings:{researchSpeed:5,mistakeRate:5,checkEffectiveness:0,waitForChecks:true,evaluationCapacity:25,connectedness:100,collapseDays:1,foodStores:24,aidStrength:0,fallback:50,repairBackup:720,crews:100},options:{releasesPerDay:1,checkedFault:20,uncheckedFault:50}},
 guarded:{title:'Give the checks a chance',settings:{mistakeRate:10,checkEffectiveness:100,waitForChecks:true,verification:100,decisionTime:120,independent:true,reserves:720,fallback:100,connectedness:40},options:{releasesPerDay:1,checkedFault:1,uncheckedFault:10}},
 race:{title:'Race the repair crews',settings:{mistakeRate:30,checkEffectiveness:90,waitForChecks:false,researchSpeed:100,computeCapacity:100,experimentCapacity:100,evaluationCapacity:0,connectedness:100,crews:25,repairBackup:24,foodStores:48},options:{releasesPerDay:4,checkedFault:1,uncheckedFault:30}},
 brink:{title:'A crisis with nuclear stakes',settings:{mistakeRate:30,checkEffectiveness:90,waitForChecks:false,researchSpeed:100,computeCapacity:100,experimentCapacity:100,evaluationCapacity:0,tension:100,verification:0},options:{releasesPerDay:4,checkedFault:1,uncheckedFault:20}},
 refuge:{title:'Keep a way back',settings:{waitForChecks:true,connectedness:60,aidStrength:100,aidBudget:168,repairBackup:720,verification:100,decisionTime:120},options:{releasesPerDay:1,checkedFault:10,uncheckedFault:30}}
};
