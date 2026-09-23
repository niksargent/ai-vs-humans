import {updateSchedule,type UpdateSchedule} from './updates.js';
import {draw} from './random.js';
export {draw} from './random.js';
import {regionalSpread,type RegionalSpread} from './spread.js';
import {simulatePathways,type PathwayResult} from './pathways.js';
import type {RecoveryResult} from './recovery.js';
import {simulateCivilisation,type CivilisationResult} from './civilisation.js';
export const MODEL_VERSION = '0.9.0';
export interface Settings {
  mistakeRate:number; checkEffectiveness:number;
  repairAssistance:boolean; waitForChecks:boolean; researchSpeed:number; computeCapacity:number; experimentCapacity:number; evaluationCapacity:number;
  agentEnabled:boolean; resistsStop:boolean; externalResources:boolean; independentStop:boolean; harmfulGoal:boolean; stopDelay:number;
  healthChallenge:boolean; scienceAssistance:boolean; maliciousActor:boolean; physicalAccess:boolean; screening:boolean;
  healthDemand:number; healthSurge:number; healthResponseDelay:number;
  informationCampaign:boolean; informationReach:number; trustedChannels:number; informationHours:number;
  sharedPayments:boolean; sharedTransport:boolean; paymentFallback:number; transportFallback:number;
  capability:number; authority:number; tension:number; verification:number; fallback:number;
  reserves:number; repair:number; decisionTime:number; independent:boolean;
  humanApproval:boolean; aiAdvice:boolean; sharedProvider:boolean;
  connectedness:number; foodBackup:number; crews:number; repairBackup:number; repairSupplies:number; supplyDelivery:number; foodStores:number;
  regionDifference:number; aidStrength:number; aidDelay:number; aidBudget:number;
  responseBackup:number; collapseRegions:number; collapseDays:number;
}
export const DEFAULTS:Settings = {
  mistakeRate:15,checkEffectiveness:90,repairAssistance:false,waitForChecks:false,researchSpeed:20,computeCapacity:75,experimentCapacity:75,evaluationCapacity:25,
  agentEnabled:false,resistsStop:true,externalResources:false,independentStop:true,harmfulGoal:false,stopDelay:24,
  healthChallenge:false,scienceAssistance:false,maliciousActor:false,physicalAccess:false,screening:true,
  healthDemand:300,healthSurge:25,healthResponseDelay:168,
  informationCampaign:false,informationReach:75,trustedChannels:50,informationHours:168,
  sharedPayments:false,sharedTransport:false,paymentFallback:25,transportFallback:25,
  capability:2, authority:2, tension:75, verification:35, fallback:20,
  reserves:24, repair:72, decisionTime:30, independent:true,
  humanApproval:false, aiAdvice:true, sharedProvider:true, connectedness:50, foodBackup:48, crews:100, repairBackup:168, repairSupplies:96, supplyDelivery:30, foodStores:168,
  regionDifference:50,aidStrength:50,aidDelay:48,aidBudget:48,responseBackup:72,collapseRegions:4,collapseDays:14
};
export type Status = 'safe'|'exposed'|'harm'|'quiet'|'unknown';
export interface NodeState {status:Status; label:string; reason:string; parents:string[]; rule:string;}
export interface Result {
  updates:UpdateSchedule; spread:RegionalSpread; pathways:PathwayResult; civilisation:CivilisationResult;
  recoveryModel:RecoveryResult; nodes:Record<string,NodeState>; seed:number; settings:Settings;
  incident:boolean; powerOutage:number; hospitalGap:number; restoreHours:number;
  warning:boolean; verified:boolean; escalation:boolean; nuclear:boolean; nuclearAt:number|null;
  foodGap:number; emergencyGap:number; affectedRegions:number;
  regions:{name:string; comms:boolean; power:boolean; hospital:boolean; food:boolean; emergency:boolean}[];
  verificationMinutes:number; verificationAvailable:boolean; events:{id:string; time:number; parents:string[]; description:string}[];
}
export const controls = {
  mistakeRate:{min:0,max:100,step:1},checkEffectiveness:{min:0,max:100,step:5},
  researchSpeed:{min:0,max:100,step:5},computeCapacity:{min:0,max:100,step:5},experimentCapacity:{min:0,max:100,step:5},evaluationCapacity:{min:0,max:100,step:5},
  stopDelay:{min:0,max:168,step:6},healthDemand:{min:0,max:400,step:25},healthSurge:{min:0,max:200,step:25},healthResponseDelay:{min:24,max:552,step:24},
  informationReach:{min:0,max:100,step:5},trustedChannels:{min:0,max:100,step:5},informationHours:{min:24,max:720,step:24},
  paymentFallback:{min:0,max:100,step:5},transportFallback:{min:0,max:100,step:5},
  capability:{min:0,max:2,step:1},authority:{min:0,max:2,step:1},tension:{min:0,max:100,step:5},
  verification:{min:0,max:100,step:5},fallback:{min:0,max:100,step:5},reserves:{min:0,max:720,step:6},
  repair:{min:12,max:168,step:6},decisionTime:{min:10,max:120,step:5},
  connectedness:{min:0,max:100,step:5},foodBackup:{min:0,max:720,step:6},
  crews:{min:0,max:100,step:5},repairBackup:{min:0,max:720,step:6},repairSupplies:{min:0,max:168,step:6},supplyDelivery:{min:0,max:100,step:5},foodStores:{min:0,max:720,step:6},
  regionDifference:{min:0,max:100,step:5},aidStrength:{min:0,max:100,step:5},aidDelay:{min:12,max:168,step:12},aidBudget:{min:0,max:168,step:6},responseBackup:{min:0,max:720,step:6},collapseRegions:{min:2,max:6,step:1},collapseDays:{min:1,max:28,step:1}
} as const;
export type NumericKey = keyof typeof controls;
export function validateSettings(raw:unknown):Settings {
  if (!raw || typeof raw!=='object') throw Error('Missing scenario settings.');
  const r=raw as Record<string,unknown>, out={...DEFAULTS};
  for(const k of Object.keys(DEFAULTS) as (keyof Settings)[]) {
    if(typeof DEFAULTS[k]==='boolean') {if(typeof r[k]!=='boolean') throw Error(`Invalid ${k}.`); (out as any)[k]=r[k];}
    else {const c=controls[k as NumericKey], v=r[k]; if(typeof v!=='number'||!Number.isFinite(v)||v<c.min||v>c.max||Math.abs((v-c.min)/c.step-Math.round((v-c.min)/c.step))>1e-7) throw Error(`Invalid ${k}.`); (out as any)[k]=v;}
  } return out;
}
export function simulate(input:Settings,seed=42):Result {
  const s=validateSettings(input);
  const permitted=s.authority===2 || (s.authority===1 && s.humanApproval);
  const pathways=simulatePathways(s,seed);
  const verificationMinutes=Math.round(90-0.65*s.verification+(s.independent?0:60*(1-s.fallback/100)));
  const verificationAvailable=s.independent||s.fallback>0;
  const timely=verificationAvailable&&verificationMinutes<=s.decisionTime;
  const agentWarning=pathways.harmfulOperation&&(pathways.controlLost||s.stopDelay>0)&&s.aiAdvice;
  const agentVerified=agentWarning&&timely&&draw(seed,'agent:verify')<s.verification/100;
  const agentEscalation=agentWarning&&!agentVerified&&s.tension>=50&&draw(seed,'agent:escalate')<s.tension/100;
  const agentNuclear=agentEscalation&&s.tension>=80&&draw(seed,'agent:nuclear')<.2;
  const updates=updateSchedule(s,seed,agentNuclear?0:720);
  if(agentNuclear){pathways.research={made:0,checked:0,unchecked:0,backlog:0,history:[]};pathways.researchFault=false;pathways.events=pathways.events.filter(e=>e.id!=='development');}
  const faultHours=updates.releases.filter(r=>r.fault).map(r=>r.hour);
  if(pathways.harmfulOperation&&(pathways.controlLost||s.stopDelay>0))faultHours.unshift(0);
  const incident=faultHours.length>0;
  const powerAffected=incident&&s.capability===2&&s.sharedProvider;
  const spread=regionalSpread(s.connectedness,seed);
  if(pathways.harmfulOperation){spread.reasons=spread.reasons.map((text,i)=>i===0?'The harmful agent disrupts services here.':spread.routes[i]==='shared'?'The same AI-operated system disrupts services here too.':text);}
  const civilisation=simulateCivilisation(s,incident,powerAffected,pathways,faultHours,seed);
  // The causal board describes Region 1; the regional display and collapse result cover all six.
  const recoveryModel=civilisation.regions[0].recovery;
  // Duration fields measure observed interruption; only restoredAt states a completion time.
  const restoreHours=recoveryModel.restoredAt??recoveryModel.observedHours;
  const powerOutage=powerAffected?recoveryModel.frames.filter(f=>f.time<720&&f.power<1).length:0;
  const {hospitalGap,foodGap,emergencyGap}=recoveryModel;
  const endText=recoveryModel.completed?`${restoreHours}h`:'30 days+';
  const affectedRegions=incident?spread.count:0;
  const regions=civilisation.regions.map(r=>({name:r.name,comms:r.exposed,
    power:r.exposed&&powerAffected,hospital:r.recovery.healthcareGap>0,
    food:r.recovery.foodGap>0||r.recovery.foodShortageHours>0,emergency:r.recovery.emergencyGap>0}));
  const warning=incident && s.aiAdvice;
  const faults=updates.releases.filter(r=>r.fault);
  const verified=warning&&(!agentWarning||agentVerified)&&faults.every(r=>r.verified);
  const escalation=agentEscalation||updates.releases.some(r=>r.escalation);
  const nuclear=agentNuclear||updates.releases.some(r=>r.nuclear);
  const nuclearAt=agentNuclear?0:updates.releases.find(r=>r.nuclear)?.hour??null;

  const nodes:Record<string,NodeState>={};
  const set=(id:string,status:Status,label:string,reason:string,parents:string[],rule:string)=>nodes[id]={status,label,reason,parents,rule};
  set('ai','quiet',['Can suggest changes','Can configure a network','Can coordinate services'][s.capability],
    ['AI proposes changes. It cannot execute them.','AI can make communications changes if permitted.','AI can operate communications and connected power controls if permitted.'][s.capability],[], 'Ability and permission are independent. This fixture describes operational reach, not a universal intelligence scale.');
  set('access',permitted?'exposed':'safe', ['Advice only',s.humanApproval?'Change approved':'Human approval required','Acts without asking'][s.authority],
    permitted?'AI can put its update into the live network. If the update is bad, people using that network lose their connection.':'AI cannot put this update into the live network. People keep their connection.', ['ai'],'A change executes only with network capability AND automatic authority or explicit approval. Advice never grants launch authority.');
  set('comms',incident?'harm':'safe',incident?'Communications interrupted':'Network keeps working',
    pathways.harmfulOperation&&incident?'The agent disrupts the network and keeps undoing repairs while it remains active. Calls and messages fail in the exposed regions.':incident?`${updates.releases.filter(r=>r.fault).length} faulty updates reach the network this month. Calls and messages fail in ${affectedRegions} regions. ${recoveryModel.completed?`Crews finish repairs after ${restoreHours} hours.`:'It is still down after 30 days.'}`:'No faulty update reaches the network this month. Calls and messages keep working.', ['access','development','control'],'Incident = faulty proposal AND network capability AND execution permission. Repair work accumulates each hour, limited by crews, communications, power and consumable supplies. Service failures affect later work. See recovery details.');
  set('checks',verified?'safe':warning?'exposed':'quiet',verified?'Warning challenged':warning?(!verificationAvailable?'Check has no working channel':timely?'Check missed the error':'Check arrives too late'):'No warning to check',
    warning&&!verificationAvailable?'The checking team uses the broken network too. Give them an independent channel before extra time or stronger checks can help.':warning?`Verification needs ${verificationMinutes} minutes; the decision window is ${s.decisionTime} minutes. ${verified?'The check succeeds in this case.':timely?'The check is timely but does not catch this case.':'A check cannot protect this decision after its deadline.'}`:'The AI-mediated warning route was not reached.', ['comms'],`A working independent channel or remaining fallback communication is required. Verification time = 90 − 0.65 × check strength, plus up to 60 minutes if checks depend on failed communications. A timely check succeeds when its fixed event draw is below check strength / 100. All are illustrative assumptions.`);
  set('warning',warning&&!verified?'exposed':verified?'safe':'quiet',verified?'False warning rejected':warning?'False warning survives':'Warning route not reached',
    warning?`After communications fail, AI wrongly warns that an attack is coming. ${verified?'People check another source and reject the warning.':'People must decide whether to believe it.'}`:'AI does not send a false attack warning in this case.', ['comms','checks'],'This case introduces a misleading warning if communications fail and AI advice is enabled. It is not an estimate of actual error frequency.');
  set('military',escalation?'harm':warning?'safe':'quiet',escalation?'Crisis escalates':warning?'Escalation interrupted':'No escalation in this case',
    escalation?'Leaders believe the false warning and escalate the crisis. Rival countries are already on edge. People still decide whether to use weapons.':'The false warning does not cause a conflict here: people catch it, tensions are lower, or leaders choose not to act on it.', ['warning'],`Requires surviving warning, rivalry ≥ 50, and the escalation draw < rivalry / 100. This response rule is authored for exploration, not calibrated.`);
  set('power',powerOutage?'harm':'safe',powerOutage?`Power lost · ${powerOutage}h total`:'Power stays available',
    powerOutage?'The power system uses the same network. When that network fails, electricity is cut too.':'Power controls use a separate system, or the bad update was stopped. Electricity stays on.', ['comms'],'Power interruption requires the incident, cross-service capability and a shared control provider. It returns when the shared repair job finishes. Incomplete work remains unresolved at day 30.');
  set('hospital',Math.min(...recoveryModel.frames.map(f=>f.healthcare))<.5?'harm':recoveryModel.healthcareGap?'exposed':'safe',recoveryModel.healthcareGap>hospitalGap?`Care shortfall · ${recoveryModel.healthcareGap}h`:hospitalGap?`Power gap · ${hospitalGap}h${recoveryModel.completed?'':'+'}`:'Critical services sustained',
    recoveryModel.healthcareGap>hospitalGap?`Power alone cannot meet the extra demand. Care falls short for ${recoveryModel.healthcareGap} hours in Region 1. More staff and facilities, or a quicker response, reduce the strain.`:hospitalGap?`Hospital generators last ${s.reserves} hours. Essential equipment ${recoveryModel.completed?`loses power for ${hospitalGap} hours before repairs finish`:`has been without power for ${hospitalGap} hours by day 30, and the outage continues`}.`:powerOutage?`Generators cover the ${powerOutage} hours of outage ${recoveryModel.completed?'before repair':'observed so far'}.`:'The hospital keeps its electricity supply.', ['power','bio'], 'Hospital backup is consumed once each hour without mains power. Gaps count actual unsupported hours inside the 30-day window. Hospital support affects crew capacity on subsequent repair steps.');
  set('fallback',s.fallback>=50?'safe':s.fallback?'exposed':'quiet',`${s.fallback}% independent operation`,
    `${s.fallback}% of communication and tool capacity can work independently. Radios keep crews in touch and independent power keeps some tools working after generators run out.`, [],'Independent capacity supports repair coordination, tools and emergency communications. It also helps military checks if they use the affected channel. It is not a probability of survival.');
  set('repair',!incident?'quiet':recoveryModel.completed?'safe':recoveryModel.status==='stalled'?'harm':'exposed',
    !incident?'No repair needed':recoveryModel.completed?`Repaired · ${restoreHours}h`:`${Math.floor(recoveryModel.progress*100)}% repaired · day 30`,
    !incident?'The bad update was stopped, so crews do not need to repair this fault.':recoveryModel.completed?`Crews complete ${recoveryModel.final.target} hours of repair work in ${restoreHours} elapsed hours. Power, calls, supplies and the needs of their families affect how much work they can do.`:`After 30 days, ${Math.floor(recoveryModel.progress*100)}% of the work is done. ${recoveryModel.status==='stalled'?'Work has stopped':'Work is continuing slowly'}. The main limit is ${recoveryModel.final.limiting}. This does not tell us when, or whether, later help arrives.`,
    ['comms','fallback','power','hospital','food','emergency','crews','supplies','aid','control','information'],
    'Each hour: work rate = crew availability × coordination × tool-power support, capped by available repair supplies. Hospital and food support affect crew availability. Optional AI repair advice raises potential work by 25% with network-level ability; materials and tool limits still apply. Every unit of work consumes one unit of repair supplies. The 30-day boundary is a calculation limit, not a collapse threshold.');
  const lowestCrew=Math.min(...recoveryModel.frames.map(f=>f.crews));
  set('crews',!incident?'quiet':lowestCrew>=.99?'safe':lowestCrew===0?'harm':'exposed',`Crew low point · ${Math.round(lowestCrew*100)}%`,
    `The starting crew is ${s.crews}% staffed. During this case, working capacity falls as low as ${Math.round(lowestCrew*100)}%. When hospitals, food deliveries or emergency response fail, fewer workers can stay on the repair job.`,['hospital','food','emergency','bio'],
    'Crew capacity = staffing × health-wave workforce fraction × (0.6 + 0.4 × hospital support) × (0.5 + 0.5 × food support) × (0.8 + 0.2 × emergency support). Coefficients are authored assumptions, not worker mortality or measured disaster estimates.');
  set('supplies',!incident?'quiet':recoveryModel.final.parts>0?'safe':recoveryModel.final.deliveries>0?'exposed':'harm',`${Math.floor(recoveryModel.final.parts)} supply units left`,
    `Crews start with ${s.repairSupplies} units of repair materials and fuel. One unit supports one full-speed hour of repair work. Independent deliveries keep up to ${s.supplyDelivery}% of normal supply arriving when power and calls fail. Payment and transport bottlenecks can reduce this further.`,['payments','transport'],
    'Stock next = stock + actual deliveries − actual repair work; stock is never negative. Independent delivery share bypasses grid/network failure; other deliveries require both. Hospital, food and repair-site backup are separate stocks and are not refilled in this experiment.');
  set('recovery',nuclear?'unknown':recoveryModel.completed?'safe':recoveryModel.status==='stalled'?'harm':'exposed',
    nuclear?'Wider recovery unknown':!incident?'Network keeps working':recoveryModel.completed?`Outage ends · ${restoreHours}h`:recoveryModel.status==='stalled'?'Repairs stalled · day 30':'Still repairing · day 30',
    nuclear?'The service calculation covers network failures only. It does not calculate the effects of nuclear weapons.':recoveryModel.completed?'The network and connected power controls work again after the month’s failures. Fixing them does not undo harm during the outage.':'Essential services remain disrupted at day 30. Later recovery is unknown; this is not a civilisation-collapse finding.',
    ['hospital','food','repair'],'Recovery is recorded only when accumulated work reaches the required workload. There is no automatic repair deadline. Local repair alone does not determine the whole-world outcome.');
  set('development',updates.releases.some(r=>r.fault)?'harm':updates.waiting?'exposed':updates.made?'safe':'quiet',`${updates.releases.filter(r=>r.fault).length} faulty updates escaped`,
    `${updates.made} updates produced this month. ${updates.mistakes} contain mistakes; checks catch ${updates.caught}. ${updates.releases.length} go live, including ${updates.releases.filter(r=>r.fault).length} faulty updates. ${updates.waiting+updates.ready} wait for checks or permission. Turn AI project pace to change how much work arrives.`,[],
    'Up to 20 candidates/day, limited by project pace, computers and experiments. Testing handles up to 4/day. Mistake rate applies to each project; testing effectiveness is the chance a tested mistake is caught. Caught mistakes are withheld. Each escaped mistake adds repair work; stocks are not reset.');
  set('control',pathways.controlLost?'harm':pathways.agentDeployed?'safe':'quiet',pathways.controlLost?'Stop order fails':pathways.agentDeployed?`Stopped after ${s.stopDelay}h`:'Agent route off',
    pathways.controlLost?`The agent keeps operating after people tell it to stop. ${s.harmfulGoal?'It keeps breaking the network, so repairs cannot finish.':'It has no harmful goal in this case. Loss of control alone does not create an outage.'}`:'The agent needs connected-service ability and permission to act. Independent isolation or revocable resources let people stop it.',
    ['ai','access'],'Loss of control requires deployed agent AND resistance to stopping AND outside resources AND no independent stop. A harmful goal is separate. Harmful operation prevents network repair progress until stopped; it does not grant weapons or laboratory access.');
  set('information',!pathways.misinformation?'quiet':pathways.frames[0].trust>=1?'safe':'exposed',pathways.misinformation?`${Math.round(pathways.frames[0].trust*100)}% response reach`:'No false-message campaign',
    pathways.misinformation?'False messages tell people not to trust emergency instructions. Trusted radio, local teams and independent sources keep some coordination working.':'No AI-generated false-message campaign is introduced.',[],
    'During the selected campaign duration, response multiplier = max(trusted channels, 1 − campaign reach). The campaign requires AI messaging ability but not network-write permission. This reduces practical response and repair coordination, not a measured probability of persuasion or government collapse.');
  const localCoordination=Math.min(...civilisation.frames.map(f=>f.coordination[0]));
  set('governance',localCoordination<.5?'harm':localCoordination<1?'exposed':'safe',`Response low · ${Math.round(localCoordination*100)}%`,
    `Region 1 can coordinate emergency services for ${s.responseBackup} hours using its backup plans. After that, working communications and food support determine how much response it can sustain.`,['comms','food','information'],
    'Emergency coordination is 1 while continuity backup lasts; after depletion it equals max(communications, relief-team support) × (0.5 + 0.5 × food support). This is operational response capacity, not a prediction of political legitimacy or government overthrow.');
  set('aid',civilisation.aidReceived>0?'safe':civilisation.independentRegions?'exposed':'quiet',civilisation.aidReceived>0?`${Math.round(civilisation.aidReceived)} relief units arrived`:civilisation.independentRegions?'Independent regions remain':'No untouched region',
    `Working regions can share spare crews, powered tools, materials and food. Each has ${s.aidBudget} relief packages beyond its own needs. They wait a day after recovery, then supplies take ${s.aidDelay} hours to travel. ${civilisation.aidSent.toFixed(1)} packages were sent in this case.`,['spread','repair'],
    'Each donor exports at most aidStrength / 100 packages/hour from its finite separate aid budget. Shipments are shared equally among unfinished regions. One package carries a crew/tool work-hour, a repair-supply unit and a food-support hour. Arrivals enter the next local step. In-transit and unused arrivals are recorded. No donor essential stock is spent.');
  set('collapse',nuclear?'unknown':civilisation.crossedAt!==null?'harm':civilisation.peakRegions?'exposed':'safe',
    nuclear?'Wider outcome unknown':civilisation.crossedAt!==null?civilisation.recoveredAt!==null?'Threshold crossed; recovered':'Collapse threshold crossed':'Collapse threshold not met',
    `This model calls it collapse when power, healthcare and food support are each below 50%, and emergency coordination is below 50%, in at least ${s.collapseRegions} of six equal-weight regions for ${s.collapseDays} continuous days. The longest such period was ${(civilisation.longestHours/24).toFixed(1)} days.`,['governance','hospital','food','power','aid','recovery'],
    'An adjustable educational definition, not an established scientific boundary. Extinction, deaths and nuclear damage are not calculated. Earlier threshold crossing is retained after recovery. Recovery requires all regions to regain the basket and coordination for 24 hours.');
  set('bio',pathways.healthIntroduced?(Math.min(...pathways.frames.map(f=>f.healthcare))<.5?'harm':pathways.healthGapHours?'exposed':'safe'):s.healthChallenge?'safe':'quiet',pathways.healthIntroduced?`${pathways.healthGapHours}h demand above capacity`:s.healthChallenge?'Health threat blocked':'Health route off',
    pathways.healthIntroduced?`More people need care at the same time. Peak demand reaches ${pathways.peakDemand.toFixed(1)} times normal. Hospitals also need power; illness reduces the available workforce.`:'This route needs an introduced threat, AI scientific assistance, a malicious actor, physical access and failed screening. Remove any gate and this introduced threat is blocked.',[],
    'An abstract extra-demand pulse grows over 168 hours until the response starts, then falls to zero over at most 168 hours. Care support = min(1, (1 + surge capacity) / demand), further limited by hospital power. Workforce loss scales with extra demand: 0.1 × (demand − 1), capped at 40%. Zero extra demand causes no workforce loss. This is not a pathogen or epidemic forecast.');
  for(const [id,title] of [['payments','Payments'],['transport','Transport']] as const){
    const values=recoveryModel.frames.map(f=>f[id]);const low=Math.min(...values);
    set(id,low<.5?'harm':low<1?'exposed':'safe',low===1?'Kept working throughout':`${Math.round(low*100)}% working at worst`,
      id==='payments'?'A shop can have food but be unable to take a payment. Cash, offline payment and emergency credit can keep purchases moving.':'Trucks need working dispatch systems. Separate local delivery routes can carry food, fuel and spare parts when the shared system fails.',
      ['comms','power'],'Only shares this failure when its shared-system switch is on. Service = fallback + (1 − fallback) × min(power, communications). Deliveries use the minimum of existing delivery support, payments and transport, not their product. Emergency aid is pre-authorised and uses its separately specified routes and travel time.');
  }
  const foodShortage=recoveryModel.foodShortageHours;
  const lowestFood=Math.min(...recoveryModel.frames.map(f=>f.foodSupply));
  set('food',lowestFood<.5||foodGap?'harm':foodShortage?'exposed':'safe',foodShortage?`Food supply shortfall · ${foodShortage}h`:foodGap?`Cold storage lost · ${foodGap}h${recoveryModel.completed?'':'+'}`:'Food stays chilled',
    foodShortage?`Stored food runs out before deliveries can keep up. Food supply falls short for ${foodShortage} hours. ${foodGap?'Refrigeration also fails.':'Fridges still work, but working fridges cannot deliver food.'}`:foodGap?`Fridge backup lasts ${s.foodBackup} hours. Refrigeration ${recoveryModel.completed?`is lost for ${foodGap} hours`:`has been lost for ${foodGap} hours by day 30 and is still off`}. Stored food and independent deliveries can still support workers. ${recoveryModel.foodShortageHours?`Food deliveries fall short after stores run out, for ${recoveryModel.foodShortageHours} hours in this window.`:'The stored food and deliveries cover workers through this window.'}`:'Fridges keep running. Food deliveries and stored food also support workers during repairs.',
    ['power','payments','transport'],'Fridge backup and stored food are separate stocks. Food deliveries cover a fraction of demand; stores meet the remainder until empty. Without refrigeration, the delivered-food support factor halves. This is an illustrative support model, not a spoilage, starvation or death estimate.');
  set('emergency',Math.min(...recoveryModel.frames.map(f=>f.emergency))===0?'harm':emergencyGap?'exposed':'safe',emergencyGap?`Help delayed · ${emergencyGap}h`:'Help can get through',
    !incident&&pathways.misinformation?`The network works, but false instructions disrupt emergency coordination for ${emergencyGap} hours.`:emergencyGap?`Calls and dispatch screens fail. Separate radios and local teams cover ${s.fallback}% of the normal response. ${recoveryModel.completed?`Full service returns after ${emergencyGap} hours.`:'Service is still reduced at day 30.'}`:'Separate radios and local teams keep help moving, or the network never fails.',
    ['comms','fallback','information'],'Emergency support is limited by communications and trusted instructions. Disruption duration counts hours below full service; it is not an ambulance waiting time.');
  set('spread',affectedRegions===6?'harm':affectedRegions?'exposed':'safe',affectedRegions?`${affectedRegions} of 6 regions affected`:'No regions affected',
    affectedRegions?`${affectedRegions} of 6 regions are hit. ${spread.routes.filter(x=>x==='shared').length} others share the failing AI system; ${spread.routes.filter(x=>x==='dependency').length} are reached through services they depend on. Select a region below to see its route. Turn Regional connectedness to change how easily trouble travels.`:'This update does not cause an outage in any region.',
    ['comms'],'Six fictional regions of equal weight. Connectedness samples a shared rollout and directed service dependencies with fixed named draws. Shared rollout failures are correlated. All reached regions receive the same repair challenge at incident onset; spread timing is not simulated. Higher connectedness also increases the rate at which healthy donors can send aid. Region profiles scale the chosen reserves. Aid follows finite budgets and travel delays. Counts describe this experiment, not countries or population. Military consequences are not included in this regional service display.');
  const events:Result['events']=[...pathways.events];
  const event=(id:string,time:number,parents:string[])=>events.push({id,time,parents,description:nodes[id]?.reason||id});
  for(const release of updates.releases.filter(r=>r.fault)){
    events.push({id:'comms',time:release.hour,parents:['development','access'],description:`Update ${release.id} goes wrong on day ${Math.floor(release.hour/24)+1}. It adds another repair job across ${affectedRegions} connected regions.`});
    if(powerAffected)event('power',release.hour,['comms']);
    if(s.aiAdvice)event('warning',release.hour+s.decisionTime/60,['comms']);
    if(release.verified)event('checks',release.hour+verificationMinutes/60,['warning']);
    if(release.escalation)event('military',release.hour+s.decisionTime/60,['warning']);
    if(release.nuclear)events.push({id:'nuclear',time:release.hour+s.decisionTime/60+1,parents:['military'],description:'Leaders use nuclear weapons after a false attack warning. The aftermath is outside this service model.'});
  }
  if(pathways.harmfulOperation&&incident){event('comms',0,['control']);if(agentWarning)event('warning',s.decisionTime/60,['comms']);if(agentEscalation)event('military',s.decisionTime/60,['warning']);if(agentNuclear)events.push({id:'nuclear',time:s.decisionTime/60+1,parents:['military'],description:'Leaders use nuclear weapons after a false warning caused by the agent disruption.'});}
  if(hospitalGap)event('hospital',recoveryModel.frames.find(f=>f.hospital<1)?.time??720,['power']); if(incident&&recoveryModel.completed)event('repair',restoreHours,['comms','fallback']);
  if(foodGap)event('food',recoveryModel.frames.find(f=>f.coldStorage<1)?.time??720,['power']);
  if(emergencyGap)event('emergency',recoveryModel.frames.find(f=>f.emergency<1)?.time??720,['comms','fallback']);
  for(const m of recoveryModel.milestones)if(m.kind!=='restored')events.push({id:`recovery-${m.kind}`,time:m.time,parents:['repair'],description:m.description});
  if(civilisation.firstAidUsedAt!==null)events.push({id:'mutual-aid',time:civilisation.firstAidUsedAt,parents:['aid'],description:'Outside relief teams and supplies begin supporting repairs and food needs.'});
  if(civilisation.crossedAt!==null)events.push({id:'service-collapse',time:civilisation.crossedAt,parents:['governance','hospital','food','power'],description:'The network-service experiment crosses its chosen multi-region collapse threshold. Nuclear consequences are outside this calculation.'});
  if(civilisation.recoveredAt!==null)events.push({id:'civilisation-recovery',time:civilisation.recoveredAt,parents:['service-collapse','repair','aid'],description:'All six regions have regained essential services and emergency coordination for 24 hours.'});
  events.sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));
  return {updates,spread,pathways,civilisation,recoveryModel,nodes,seed,settings:s,incident,powerOutage,hospitalGap,restoreHours,warning,verified,escalation,nuclear,verificationMinutes,verificationAvailable,nuclearAt,events,foodGap,emergencyGap,affectedRegions,regions};
}
export function summariseChange(before:Result,after:Result):string {
  if(before.settings.collapseDays!==after.settings.collapseDays||before.settings.collapseRegions!==after.settings.collapseRegions)return 'The definition changed. Services and repairs did not change.';
  if(before.recoveryModel.completed!==after.recoveryModel.completed)return after.recoveryModel.completed?`The repair now finishes after ${after.restoreHours} hours.`:'The repair is now unfinished at day 30. Later recovery is unknown.';
  if(before.affectedRegions!==after.affectedRegions)return `${after.affectedRegions} of 6 regions now lose their network. Separate networks keep the others working.`;
  if(before.foodGap!==after.foodGap)return after.foodGap?`Food warehouses lose refrigeration for ${after.foodGap} hours${after.recoveryModel.completed?'.':' by day 30; the outage is still continuing.'}`:'Food warehouses now have enough backup to keep their fridges running.';
  if(before.incident&&!after.incident)return 'The faulty change is held back. Neither downstream branch receives this incident.';
  if(!before.incident&&after.incident)return 'The faulty change can now execute. One communications failure reaches both branches.';
  if(before.escalation&&!after.escalation)return `Escalation is interrupted. ${after.hospitalGap?`The hospital still has a ${after.hospitalGap}-hour service gap.`:'Hospital services remain sustained.'}`;
  if(!before.escalation&&after.escalation)return 'The warning now leads to escalation in this case. Military advice still does not grant launch authority.';
  if(before.hospitalGap!==after.hospitalGap)return after.hospitalGap?`The hospital service gap changes from ${before.hospitalGap} to ${after.hospitalGap} hours.`:'Backup now covers the outage. Hospital services continue even though the incident can still occur.';
  if(before.restoreHours!==after.restoreHours)return `Restoration changes from ${before.restoreHours} to ${after.restoreHours} hours. The initial incident is unchanged.`;
  if(before.verificationMinutes!==after.verificationMinutes)return `Verification now needs ${after.verificationMinutes} minutes, against a ${after.settings.decisionTime}-minute decision window.`;
  return 'Setting changed; this version of events still has the same outcome. Use the button beside this message to open the part it controls.';
}
export function ensemble(settings:Settings,seed:number,count=256) {
  let escalation=0,nuclear=0,health=0,worldwide=0,collapse=0;
  for(let i=0;i<count;i++){const r=simulate(settings,(seed+i)>>>0);escalation+=+r.escalation;nuclear+=+r.nuclear;health+=+(r.hospitalGap>0);worldwide+=+(r.affectedRegions===6);collapse+=+(!r.nuclear&&r.civilisation.endStatus==='collapse');}
  return {count,escalation,nuclear,health,worldwide,collapse};
}
