import type {PathwayFrame} from './pathways.js';
import type {Settings} from './model.js';

export const RECOVERY_HORIZON=720;
export interface RecoveryFrame {
  time:number; work:number; target:number; disruptedHours:number; rate:number; parts:number; hospitalBackup:number; foodBackup:number;
  repairBackup:number; foodStock:number; power:number; communications:number; hospital:number;
  coldStorage:number; foodSupply:number; emergency:number; crews:number; deliveries:number; limiting:string;
  aid:number; healthcare:number; payments:number; transport:number; trust:number;
}
export interface RecoveryResult {
  completed:boolean; restoredAt:number|null; horizon:number; observedHours:number;
  status:'unneeded'|'repaired'|'progressing'|'stalled'; progress:number;
  healthcareGap:number; hospitalGap:number; foodGap:number; emergencyGap:number; foodShortageHours:number;
  frames:RecoveryFrame[]; milestones:{time:number;kind:string;description:string}[];
  suppliesDelivered:number; suppliesUsed:number; final:RecoveryFrame;
}
// Explicit stocks and delayed dependencies. No probability or mortality calculation.
export function* recoveryProcess(s:Settings,incident:boolean,powerAffected:boolean,step=1,stresses?:PathwayFrame[],incidentHours?:number[]):Generator<RecoveryFrame,RecoveryResult,number|undefined> {
  if(!Number.isFinite(step)||step<=0||step>1)throw Error('Recovery step must be > 0 and <= 1 hour.');
  const independent=s.fallback/100;
  let target=incidentHours?0:incident?s.repair:0,disruptedHours=0;
  const arrivals=new Map<number,number>();
  for(const hour of incidentHours||[])arrivals.set(hour,(arrivals.get(hour)||0)+1);
  let time=0,work=0,parts=s.repairSupplies, hospitalBackup=s.reserves,foodBackup=s.foodBackup,
    repairBackup=s.repairBackup,foodStock=s.foodStores;
  let healthcareGap=0,restoredAt:number|null=!incident?0:null;
  const extended=!!incidentHours||!!stresses?.some(f=>f.healthcare<1||f.trust<1||f.hostile);
  let hospitalGap=0,foodGap=0,emergencyGap=0,foodShortageHours=0,suppliesDelivered=0,suppliesUsed=0;
  const milestones:RecoveryResult['milestones']=[],seen=new Set<string>();
  const record=(kind:string,description:string)=>{if(!seen.has(kind)){seen.add(kind);milestones.push({time,kind,description});}};
  const frames:RecoveryFrame[]=[];
  let frame:RecoveryFrame;
  let aid=0;
  const round=(n:number)=>Math.round(n*1000)/1000;
  while(true){
    const stress=stresses?.[Math.min(720,Math.floor(time))];
    const shocks=arrivals.get(time)||0;
    if(shocks){target+=shocks*s.repair;restoredAt=null;}
    const finished=work>=target-1e-9;
    if(finished&&restoredAt===null)restoredAt=round(time);
    const power=finished||!powerAffected?1:0;
    const communications=finished?1:independent;
    const hospital=power||hospitalBackup>1e-9?1:0;
    const healthcare=Math.min(hospital,stress?.healthcare??1);
    const trust=stress?.trust??1;
    const coldStorage=power||foodBackup>1e-9?1:0;
    const toolPower=power||repairBackup>1e-9?1:independent;
    // Independent delivery routes bypass the failed network and electricity dependency.
    const payments=!s.sharedPayments?1:s.paymentFallback/100+(1-s.paymentFallback/100)*Math.min(power,communications);
    const transport=!s.sharedTransport?1:s.transportFallback/100+(1-s.transportFallback/100)*Math.min(power,communications);
    const deliveries=Math.min(finished?1:s.supplyDelivery/100+(1-s.supplyDelivery/100)*Math.min(power,communications),payments,transport);
    const foodDelivery=deliveries*(.5+.5*coldStorage);
    const foodSupply=finished||foodStock>1e-9?1:Math.min(1,foodDelivery+aid);
    const emergency=Math.min(communications,trust);
    const crews=s.crews/100*(stress?.workforce??1)*(.6+.4*healthcare)*(.5+.5*foodSupply)*(.8+.2*emergency);
    const coordination=(.5+.5*communications)*trust;
    const potential=crews*coordination*toolPower*(s.repairAssistance&&s.capability>=1?1.25:1)+aid;
    const dt=Math.min(step,RECOVERY_HORIZON-time);
    const incoming=deliveries+aid;
    const rate=finished||stress?.hostile?0:Math.min(potential,parts/Math.max(dt,1e-9)+incoming);
    const factors:[string,number][]=[['crews',crews],['communications',coordination],['power for tools',toolPower],['repair supplies',potential?rate/potential:1]];
    const limiting=stress?.hostile?'agent still changing the network':finished?'none':factors.reduce((a,b)=>a[1]<=b[1]?a:b)[0];
    frame={time:round(time),work:round(work),target,disruptedHours,rate:round(rate),parts:round(parts),hospitalBackup:round(hospitalBackup),foodBackup:round(foodBackup),repairBackup:round(repairBackup),foodStock:round(foodStock),power,communications,hospital,coldStorage,foodSupply,emergency,crews,deliveries,limiting,aid,healthcare,payments,transport,trust};
    frames.push(frame);
    if(finished&&!extended||time>=RECOVERY_HORIZON-1e-9)break;
    // The supplied aid is used in the NEXT interval. Every region advances from the same prior hour.
    const nextAid=yield frame;
    if(!hospital)record('hospital','Hospital backup runs out. Some repair workers must care for others, so less work gets done.');
    if(!coldStorage)record('cold','Food warehouses lose refrigeration. Fresh-food deliveries become harder to maintain.');
    if(toolPower<1)record('tools','Repair-site generators run out. Only independently powered tools can keep working.');
    if(foodSupply<1)record('food','Stored food runs out. Fewer supplies reach workers, slowing repairs further.');
    if(!finished&&!stress?.hostile&&rate<potential-1e-9)record('supplies','Crews have too few repair supplies. Work is limited by what deliveries bring.');
    if(!finished&&rate<1e-9)record('stalled',`Repair work stops. Missing support: ${limiting}.`);
    const done=Math.min(rate*dt,Math.max(0,target-work));
    const delivered=incoming*dt;
    parts=Math.max(0,parts+delivered-done);suppliesDelivered+=delivered;suppliesUsed+=done;work+=done;
    if(healthcare<1)healthcareGap+=dt;
    hospitalGap+=(1-hospital)*dt;foodGap+=(1-coldStorage)*dt;
    if(emergency<1)emergencyGap+=dt;
    if(foodSupply<1)foodShortageHours+=dt;
    if(!power){hospitalBackup=Math.max(0,hospitalBackup-dt);foodBackup=Math.max(0,foodBackup-dt);repairBackup=Math.max(0,repairBackup-dt);}
    foodStock=Math.max(0,foodStock-Math.max(0,1-foodDelivery-aid)*dt);
    if(!finished)disruptedHours+=dt;
    time+=dt;
    aid=Math.max(0,nextAid||0);
  }
  const completed=work>=target-1e-9;
  if(incident&&completed)milestones.push({time:restoredAt!,kind:'restored',description:'The repair work is finished. The original network and its connected power controls work again.'});
  return {completed,restoredAt,horizon:RECOVERY_HORIZON,observedHours:round(time),
    status:target===0?'unneeded':completed?'repaired':frame.rate<1e-9?'stalled':'progressing',progress:target===0?1:Math.min(1,work/target),
    healthcareGap:round(healthcareGap),hospitalGap:round(hospitalGap),foodGap:round(foodGap),emergencyGap:round(emergencyGap),foodShortageHours:round(foodShortageHours),
    frames,milestones,suppliesDelivered,suppliesUsed,final:frame};
}
export function simulateRecovery(s:Settings,incident:boolean,powerAffected:boolean,step=1):RecoveryResult {
  const process=recoveryProcess(s,incident,powerAffected,step);
  let next=process.next();while(!next.done)next=process.next(0);
  return next.value;
}
