import type {Settings} from './model.js';

export interface PathwayFrame {time:number; healthcare:number; workforce:number; trust:number; hostile:boolean; demand:number;}
export interface PathwayResult {
  research:{made:number;checked:number;unchecked:number;backlog:number;history:{day:number;made:number;checked:number;backlog:number}[]};
  researchFault:boolean; agentDeployed:boolean; controlLost:boolean; stoppedAt:number|null; harmfulOperation:boolean;
  healthIntroduced:boolean; misinformation:boolean; healthGapHours:number; peakDemand:number;
  frames:PathwayFrame[]; events:{id:string;time:number;parents:string[];description:string}[];
}
// Introduced challenges, not event-arrival probabilities. All coefficients are teaching assumptions.
export function simulatePathways(s:Settings):PathwayResult {
  const permitted=s.authority===2||s.authority===1&&s.humanApproval;
  let made=0,checked=0,backlog=0,unchecked=0;
  const history:PathwayResult['research']['history']=[];
  for(let day=1;day<=30;day++){
    const candidates=s.researchEnabled&&s.capability>=1?Math.min(s.computeCapacity,s.experimentCapacity,s.researchSpeed)/100*4:0;
    made+=candidates;backlog+=candidates;
    const evaluated=Math.min(backlog,s.evaluationCapacity/100*4);backlog-=evaluated;checked+=evaluated;
    if(permitted&&!s.waitForChecks){unchecked+=backlog;backlog=0;}
    history.push({day,made,checked,backlog});
  }
  const researchFault=s.researchEnabled&&s.faultyChange&&permitted&&unchecked>=1;
  const agentDeployed=s.agentEnabled&&s.capability===2&&permitted;
  const controlLost=agentDeployed&&s.resistsStop&&s.externalResources&&!s.independentStop;
  const stoppedAt=agentDeployed&&!controlLost?s.stopDelay:null;
  const harmfulOperation=agentDeployed&&s.harmfulGoal;
  const healthIntroduced=s.healthChallenge&&s.scienceAssistance&&s.maliciousActor&&s.physicalAccess&&!s.screening;
  const misinformation=s.informationCampaign&&s.capability>=1;
  const frames:PathwayFrame[]=[];
  let healthGapHours=0,peakDemand=1;
  for(let time=0;time<=720;time++){
    // An abstract demand pulse, NOT pathogen characteristics or an epidemic/death forecast.
    const responseAt=s.healthResponseDelay;
    const pulse=!healthIntroduced?0:time<responseAt?Math.min(1,time/168):Math.max(0,Math.min(1,responseAt/168)-(time-responseAt)/168);
    const trust=misinformation&&time<s.informationHours?Math.max(s.trustedChannels/100,1-s.informationReach/100):1;
    const demand=1+pulse*s.healthDemand/100;
    const healthcare=Math.min(1,(1+s.healthSurge/100)/demand);
    const workforce=1-Math.min(.4,.1*(demand-1));
    const hostile=harmfulOperation&&(stoppedAt===null||time<stoppedAt);
    frames.push({time,healthcare,workforce,trust,hostile,demand});
    if(time<720&&healthcare<.999)healthGapHours++;
    peakDemand=Math.max(peakDemand,demand);
  }
  const events:PathwayResult['events']=[];
  if(s.researchEnabled)events.push({id:'development',time:-720,parents:[],description:`Before this crisis, AI proposes ${made.toFixed(0)} changes in 30 days. ${unchecked.toFixed(0)} are released before checks finish; ${backlog.toFixed(0)} wait in the queue.`});
  if(agentDeployed)events.push({id:'control',time:s.stopDelay,parents:['access'],description:controlLost?`People send a stop order after ${s.stopDelay} hours, but the agent keeps operating using resources outside their control.`:`People stop the agent after ${s.stopDelay} hours. Repair work can continue without it interfering.`});
  if(healthIntroduced)events.push({id:'bio',time:0,parents:[],description:'Someone misuses AI scientific help to cause a health emergency. They have real-world access, and screening fails to stop them. More people need hospital care; illness also keeps workers home.'});
  if(healthIntroduced){
    const peakAt=Math.min(168,s.healthResponseDelay);
    events.push({id:'bio-peak',time:peakAt,parents:['bio','hospital'],description:`Demand reaches ${peakDemand.toFixed(1)} times normal. At this point, staffed facilities can meet ${Math.round(frames[peakAt].healthcare*100)}% of demand before any power shortage is counted.`});
    if(healthGapHours){
      const covered=frames.find(f=>f.time>peakAt&&f.healthcare>=1);
      if(covered)events.push({id:'bio-response',time:covered.time,parents:['bio','hospital'],description:'The assumed response reduces extra demand enough for staffed facilities to cope again. A separate power failure can still keep hospital equipment off.'});
    }
  }
  if(misinformation)events.push({id:'information',time:0,parents:[],description:`False AI-generated messages tell people to ignore official instructions. Trusted channels preserve ${Math.round(frames[0].trust*100)}% of response coordination.`});
  return {research:{made,checked,unchecked,backlog,history},researchFault,agentDeployed,controlLost,stoppedAt,harmfulOperation,healthIntroduced,misinformation,healthGapHours,peakDemand,frames,events};
}
