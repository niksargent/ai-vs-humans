import {regionalSpread} from './spread.js';
import type {PathwayResult} from './pathways.js';
import type {Settings} from './model.js';
import {recoveryProcess,RECOVERY_HORIZON,type RecoveryFrame,type RecoveryResult} from './recovery.js';

export const REGION_PROFILES=[1,.6,1.4,.8,1.8,1.2];
export interface RegionalCase {
  name:string; exposed:boolean; reserveFactor:number; settings:Settings; recovery:RecoveryResult;
  aidSent:number; aidReceived:number; aidUnused:number; aidBudgetLeft:number;
  deprivationHours:number; longestDeprivation:number; coordinationLowHours:number;
}
export interface WorldFrame {time:number; failingRegions:number; essentialFailures:number[]; coordination:number[]; repairProgress:number[]; continuousHours:number;}
export interface CivilisationResult {
  regions:RegionalCase[]; frames:WorldFrame[]; shipments:{sentAt:number;arrivesAt:number;from:number;to:number;amount:number}[];
  crossedAt:number|null; recoveredAt:number|null; longestHours:number; peakRegions:number;
  endStatus:'functioning'|'recovered'|'disrupted'|'collapse'; independentRegions:number;
  aidSent:number; aidReceived:number; aidInTransit:number; thresholdRegions:number; thresholdHours:number;
  firstAidUsedAt:number|null;
}
// Region weights are equal. This is an explicit experiment definition, not a scientific collapse boundary.
export function classifyWorld(frames:WorldFrame[],minRegions:number,requiredHours:number){
  let run=0,longestHours=0,crossedAt:number|null=null,recoveredAt:number|null=null,stable=0,peakRegions=0;
  for(let i=0;i<frames.length-1;i++){
    const f=frames[i],dt=frames[i+1].time-f.time;
    peakRegions=Math.max(peakRegions,f.failingRegions);
    run=f.failingRegions>=minRegions?run+dt:0;longestHours=Math.max(longestHours,run);f.continuousHours=run;
    if(run>=requiredHours){if(crossedAt===null)crossedAt=f.time+dt;recoveredAt=null;}
    // Recovery requires ALL six regions to regain the basket and coordination for a full day.
    const healthy=f.essentialFailures.every(n=>n===0)&&f.coordination.every(n=>n>=.5);
    stable=healthy?stable+dt:0;
    if(crossedAt!==null&&stable>=24&&recoveredAt===null)recoveredAt=f.time+dt;
  }
  const last=frames.at(-1)!;last.continuousHours=run;
  const disrupted=last.essentialFailures.some(n=>n>0)||last.coordination.some(n=>n<.5)||last.repairProgress.some(n=>n<1);
  const endStatus: CivilisationResult['endStatus']=crossedAt!==null&&recoveredAt===null?'collapse':disrupted?'disrupted':crossedAt!==null?'recovered':'functioning';
  return {crossedAt,recoveredAt,longestHours,peakRegions,endStatus};
}
export function simulateCivilisation(s:Settings,incident:boolean,powerAffected:boolean,pathways?:PathwayResult,incidentHours?:number[],seed=42):CivilisationResult {
  const spread=regionalSpread(s.connectedness,seed);
  const profiles=REGION_PROFILES.map(base=>1+(base-1)*s.regionDifference/100);
  const settings=profiles.map(factor=>({...s,reserves:s.reserves*factor,foodBackup:s.foodBackup*factor,
    repairBackup:s.repairBackup*factor,repairSupplies:s.repairSupplies*factor,foodStores:s.foodStores*factor}));
  const processes=settings.map((local,i)=>recoveryProcess(local,incident&&spread.exposed[i],powerAffected&&spread.exposed[i],1,spread.exposed[i]?pathways?.frames:undefined,incidentHours?(spread.exposed[i]?incidentHours:[]):undefined));
  let positions=processes.map(p=>p.next());
  const final:Array<RecoveryResult|undefined>=positions.map(p=>p.done?p.value:undefined);
  const frameOf=(i:number):RecoveryFrame=>positions[i].done?(positions[i].value as RecoveryResult).final:positions[i].value as RecoveryFrame;
  const budgets=Array(6).fill(s.aidBudget),sent=Array(6).fill(0),received=Array(6).fill(0),unused=Array(6).fill(0);
  const arrivals=Array.from({length:RECOVERY_HORIZON+1},()=>Array(6).fill(0));
  const shipments:CivilisationResult['shipments']=[],frames:WorldFrame[]=[];
  const deprivation=Array(6).fill(0),localRun=Array(6).fill(0),longest=Array(6).fill(0),coordinationLow=Array(6).fill(0);
  const donorStable=Array(6).fill(0);
  for(let t=0;t<=RECOVERY_HORIZON;t++){
    const states=positions.map((_,i)=>frameOf(i));
    const coordination=states.map((f,i)=>{
      const restored=!incident||!spread.exposed[i]||f.work>=f.target-1e-9;
      const local=restored||f.disruptedHours<s.responseBackup*profiles[i]?1:Math.max(f.communications,Math.min(1,f.aid))*(.5+.5*f.foodSupply);
      return Math.min(local,f.trust);
    });
    const failures=states.map(f=>[f.power,f.healthcare,f.foodSupply].filter(v=>v<.5).length);
    const failing=failures.map((n,i)=>n===3&&coordination[i]<.5);
    frames.push({time:t,failingRegions:failing.filter(Boolean).length,essentialFailures:failures,coordination,repairProgress:states.map((f,i)=>!incident||!spread.exposed[i]?1:Math.min(1,f.target?f.work/f.target:1)),continuousHours:0});
    if(t===RECOVERY_HORIZON){for(let i=0;i<6;i++){received[i]+=arrivals[t][i];unused[i]+=arrivals[t][i];}break;}
    for(let i=0;i<6;i++){
      if(failing[i]){deprivation[i]++;localRun[i]++;longest[i]=Math.max(longest[i],localRun[i]);}else localRun[i]=0;
      if(coordination[i]<.5)coordinationLow[i]++;
    }
    // Donors export only their separately budgeted surplus after 24 stable hours.
    const recipients=states.map((f,i)=>incident&&spread.exposed[i]&&f.work<f.target-1e-9?i:-1).filter(i=>i>=0);
    for(let i=0;i<6;i++){
      const healthy=(!incident||!spread.exposed[i]||states[i].work>=states[i].target-1e-9)&&states[i].healthcare>=.999&&coordination[i]>=.999;
      donorStable[i]=healthy?donorStable[i]+1:0;
    }
    if(recipients.length)for(let donor=0;donor<6;donor++){
      if(donorStable[donor]<=24)continue;
      const amount=Math.min(budgets[donor],s.aidStrength/100*spread.aidAccess);
      if(amount<=0)continue;
      budgets[donor]-=amount;sent[donor]+=amount;
      const each=amount/recipients.length,arrival=t+s.aidDelay;
      for(const to of recipients){shipments.push({sentAt:t,arrivesAt:arrival,from:donor,to,amount:each});if(arrival<=RECOVERY_HORIZON)arrivals[arrival][to]+=each;}
    }
    // Advancing every process after allocation prevents iteration order from creating instant help.
    const next=positions.map((position,i)=>{
      const aid=arrivals[t][i];received[i]+=aid;
      if(position.done){unused[i]+=aid;return position;}
      if((!incident||!spread.exposed[i]||states[i].work>=states[i].target-1e-9)&&aid>0)unused[i]+=aid;
      const updated=processes[i].next(incident&&spread.exposed[i]&&states[i].work<states[i].target-1e-9?aid:0);
      if(updated.done){final[i]=updated.value;unused[i]+=aid;}
      else if(states[i].work<states[i].target-1e-9&&updated.value.work>=updated.value.target-1e-9)unused[i]+=aid;
      return updated;
    });
    positions=next;
  }
  for(let i=0;i<6;i++)if(!final[i])throw Error('Regional recovery did not finish its calculation.');
  const regions=settings.map((local,i)=>({name:`Region ${i+1}`,exposed:incident&&spread.exposed[i],reserveFactor:profiles[i],settings:local,recovery:final[i]!,aidSent:sent[i],aidReceived:received[i],aidUnused:unused[i],aidBudgetLeft:budgets[i],deprivationHours:deprivation[i],longestDeprivation:longest[i],coordinationLowHours:coordinationLow[i]}));
  const aidSent=sent.reduce((a,b)=>a+b,0),aidReceived=received.reduce((a,b)=>a+b,0);
  const usedTimes=regions.flatMap(r=>{const frame=r.recovery.frames.find(f=>f.aid>0&&f.work<f.target-1e-9&&f.time<r.recovery.observedHours);return frame?[frame.time]:[];});
  return {regions,frames,shipments,...classifyWorld(frames,s.collapseRegions,s.collapseDays*24),
    firstAidUsedAt:usedTimes.length?Math.min(...usedTimes):null,
    independentRegions:incident?6-spread.count:6,aidSent,aidReceived,aidInTransit:Math.max(0,aidSent-aidReceived),
    thresholdRegions:s.collapseRegions,thresholdHours:s.collapseDays*24};
}
