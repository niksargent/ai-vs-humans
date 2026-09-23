import {writeFileSync} from 'node:fs';
import {DEFAULTS,controls,simulate,MODEL_VERSION} from '../dist/src/model.js';
import {pathwayPresets} from '../dist/src/pathway-ui.js';
import {monthChallenges} from '../dist/src/month.js';
const contexts={default:{},...pathwayPresets,...Object.fromEntries(Object.entries(monthChallenges).map(([k,v])=>[k,v.settings])),
 stoppedAgent:{...pathwayPresets.control,independentStop:true,aiAdvice:false},
 transportOnly:{sharedTransport:true,sharedPayments:false,transportFallback:0,researchSpeed:20,aiAdvice:false},
 fastChecked:{researchSpeed:100,computeCapacity:100,experimentCapacity:100,waitForChecks:true,aiAdvice:false},
 slowChecked:{researchSpeed:5,waitForChecks:true,mistakeRate:50,checkEffectiveness:50,aiAdvice:false},
 approved:{authority:1,humanApproval:true},warning:{verification:75,decisionTime:60,independent:false},
 repair:{researchSpeed:5,mistakeRate:20,checkEffectiveness:0,aiAdvice:false,aidStrength:0},
 fragile:{researchSpeed:10,connectedness:100,fallback:0,foodStores:24,repairBackup:24,aiAdvice:false},
 relief:{researchSpeed:5,mistakeRate:20,checkEffectiveness:0,connectedness:50,aidStrength:100,aidBudget:168,aiAdvice:false},
 compound:{...pathwayPresets.health,...pathwayPresets.control,...pathwayPresets.information,...pathwayPresets.deliveries,researchSpeed:20,screening:false,aiAdvice:false}};
function metrics(r){return {made:r.updates.made,checked:r.updates.checked,caught:r.updates.caught,waiting:r.updates.waiting,ready:r.updates.ready,releases:r.updates.releases.length,faults:r.updates.releases.filter(x=>x.fault).length,incident:r.incident,regions:r.affectedRegions,escalation:r.escalation,nuclear:r.nuclear,controlLost:r.pathways.controlLost,health:r.pathways.healthIntroduced,trust:r.pathways.frames[0].trust,care:r.civilisation.regions.reduce((a,x)=>a+x.recovery.healthcareGap,0),food:r.civilisation.regions.reduce((a,x)=>a+x.recovery.foodShortageHours,0),work:r.civilisation.regions.reduce((a,x)=>a+x.recovery.final.work,0),restored:r.restoreHours,aid:r.civilisation.aidReceived,collapse:r.civilisation.crossedAt,end:r.civilisation.endStatus,coordination:r.civilisation.regions.reduce((a,x)=>a+x.coordinationLowHours,0)};}
const rows=[];
for(const key of Object.keys(DEFAULTS)){
 const values=typeof DEFAULTS[key]==='boolean'?[false,true]:[controls[key].min,DEFAULTS[key],controls[key].max];
 const hits=[];let comparisons=0;
 for(const [context,patch] of Object.entries(contexts))for(const seed of [9,42,73]){
  const low=metrics(simulate({...DEFAULTS,...patch,[key]:values[0]},seed));
  for(const value of values.slice(1)){
   const high=metrics(simulate({...DEFAULTS,...patch,[key]:value},seed));comparisons++;
   const changed=Object.keys(low).filter(k=>low[k]!==high[k]);
   if(changed.length)hits.push({context,seed,from:values[0],to:value,changed,low,high});
  }
 }
 rows.push({key,range:values,comparisons,effective: hits.length,metrics:[...new Set(hits.flatMap(x=>x.changed))],examples:hits.slice(0,2)});
}
writeFileSync('docs/SETTINGS_AUDIT.json',JSON.stringify({version:MODEL_VERSION,contexts:Object.keys(contexts),seeds:[9,42,73],rows},null,2));
console.log(JSON.stringify({settings:rows.length,comparisons:rows.reduce((a,r)=>a+r.comparisons,0),inactive:rows.filter(r=>!r.effective).map(r=>r.key),summary:rows.map(r=>`${r.key}: ${r.effective}/${r.comparisons} [${r.metrics.join(',')}]`)},null,2));
