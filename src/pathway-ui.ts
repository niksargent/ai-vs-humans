import {DEFAULTS,type Settings,type NumericKey,type Result} from './model.js';
type Range=(key:NumericKey,label:string,copy:string,unit:string)=>string;
type Toggle=(key:keyof Settings,label:string,copy:string)=>string;
export const pathwayPresets:Record<string,Partial<Settings>>={
  outage:{},
  research:{researchSpeed:100,computeCapacity:100,experimentCapacity:100,waitForChecks:false},
  control:{researchSpeed:0,agentEnabled:true,harmfulGoal:true,externalResources:true,independentStop:false},
  health:{researchSpeed:0,healthChallenge:true,scienceAssistance:true,maliciousActor:true,physicalAccess:true,screening:false},
  information:{informationCampaign:true,informationReach:90,trustedChannels:10,informationHours:336},
  deliveries:{sharedPayments:true,sharedTransport:true,paymentFallback:0,transportFallback:10,supplyDelivery:100,repairSupplies:12,foodStores:48}
};
export function pathwayControls(range:Range,toggle:Toggle){
  return `<details class="model-details"><summary>AI updates & testing</summary>`+
    toggle('repairAssistance','AI helps repair crews','Advice helps crews find the fault faster. It still needs people, powered tools and supplies.')+

    range('researchSpeed','AI project pace','0–20 updates per day. Zero means no new updates.','%')+
    range('mistakeRate','Mistake rate','Out of every 100 updates, how many contain a potentially harmful mistake?','%')+
    range('checkEffectiveness','Testing effectiveness','Out of every 100 tested mistakes, how many do the checks catch?','%')+
    range('computeCapacity','Computers available','Limits how much research can run.','%')+
    range('experimentCapacity','Experiments available','Limits how many ideas can be tried.','%')+
    range('evaluationCapacity','Update testing capacity','How many candidate updates people can check each day.','%')+
    toggle('waitForChecks','Test before release','Unfinished checks keep an update out of the live network.')+`</details>`+
    `<details class="model-details"><summary>Can people stop it?</summary>`+
    toggle('agentEnabled','Deploy a continuing agent','It keeps acting, rather than installing one update.')+
    toggle('resistsStop','Assume it resists stopping','A scenario assumption about behaviour, not a consequence of being clever.')+
    toggle('externalResources','Resources outside our control','It can keep operating after its original access is removed.')+
    toggle('independentStop','Independent isolation','People can disconnect it from essential systems.')+
    toggle('harmfulGoal','Assume it disrupts the network','Harmful behaviour is separate from ability or resistance to stopping.')+
    range('stopDelay','Time before people intervene','When the stop order is sent.','hours')+`</details>`+
    `<details class="model-details"><summary>Health crisis</summary>`+
    toggle('healthChallenge','Introduce a health threat','Tests a conditional chain, not how often one starts.')+
    toggle('scienceAssistance','AI scientific assistance','This is a separate ability from operating phone networks.')+
    toggle('maliciousActor','Someone intends harm','Scientific knowledge alone is not an attack.')+
    toggle('physicalAccess','Physical-world barriers crossed','Access and practical execution are stipulated; no procedures are modelled.')+
    toggle('screening','Screening stops this threat','An effective barrier blocks this introduced case.')+
    range('healthDemand','Extra demand for care','300% extra means up to four times normal demand.','%')+
    range('healthSurge','Extra care capacity','Staff and facilities available above normal demand.','%')+
    range('healthResponseDelay','Time before response turns the tide','The assumed demand pulse then declines over up to seven days.','hours')+`</details>`+
    `<details class="model-details"><summary>Information & response</summary>`+
    toggle('informationCampaign','Introduce false AI messages','Messages tell people to ignore emergency instructions.')+
    range('informationReach','Response put at risk','Share potentially diverted by the introduced campaign.','%')+
    range('trustedChannels','Trusted independent channels','Local teams and trusted broadcasts preserve response.','%')+
    range('informationHours','How long the campaign lasts','After this period, its extra coordination penalty ends.','hours')+`</details>`+
    `<details class="model-details"><summary>Payments & transport</summary>`+
    toggle('sharedPayments','Payments share the failed system','Purchases become a delivery bottleneck when digital payments fail.')+
    range('paymentFallback','Offline payments','Cash, offline payment and emergency credit.','%')+
    toggle('sharedTransport','Transport shares the failed system','Dispatch failure disrupts deliveries.')+
    range('transportFallback','Independent transport','Local routes that work without the shared dispatch system.','%')+`</details>`;
}
export const scenarioNames:Record<string,string>={outage:'Updates go wrong',research:'Updates outrun checks',control:'The stop order fails',health:'Hospitals face a surge',information:'People hear conflicting instructions',deliveries:'Supplies cannot move'};
export function currentScenario(s:Settings){const exact=Object.entries(pathwayPresets).find(([,patch])=>Object.entries({...DEFAULTS,...patch}).every(([k,v])=>s[k as keyof Settings]===v));if(exact)return {id:exact[0],name:scenarioNames[exact[0]],modified:false};const active=[s.researchSpeed>DEFAULTS.researchSpeed?'research':'',s.agentEnabled?'control':'',s.healthChallenge?'health':'',s.informationCampaign?'information':'',s.sharedPayments||s.sharedTransport?'deliveries':''].filter(Boolean);const id=active.length===1?active[0]:active.length?'combined':'outage';return {id,name:scenarioNames[id]||'Combined scenario',modified:true};}
export function pathwaysPanel(r:Result){
  const current=currentScenario(r.settings);
  return `<button class="current-scenario" data-stage="chain"><span class="etched-label">CURRENT SCENARIO${current.modified?' · ADJUSTED SETTINGS':''}</span><strong>${current.name}</strong><span>▶ Watch the story</span></button><h2 class="inspector-title">Choose a scenario</h2><p class="inspector-copy">Each scenario below loads its own starting settings. Your current scenario stays above; Undo restores your last change.</p>`+
    [['outage','Updates go wrong','An AI mistake knocks out a shared network.'],['research','Updates outrun checks','New versions go live before anyone finishes checking them.'],['control','The stop order fails','An agent keeps breaking what people are trying to repair.'],['health','Hospitals face a surge','A health threat needs several gates to fail first.'],['information','People hear conflicting instructions','False messages weaken the response.'],['deliveries','Supplies cannot move','A full warehouse is no help if purchases or deliveries stop.']].map(([id,title,copy])=>`<button class="pathway-choice" data-pathway="${id}" aria-pressed="${current.id===id&&!current.modified}"><strong>${title} ↗</strong><span>${copy}</span></button>`).join('')+
    `<button class="small-button" data-panel="advanced">⚙ World settings</button>`;

}
export function pathwayInterventions(id:string){
  const rows:Record<string,[string,string]>= {development:['waitForChecks','Require checks before release'],control:['independentStop','Try independent isolation'],bio:['screening','Stop the health threat at screening'],information:['trustedChannels','Restore trusted channels'],payments:['paymentFallback','Keep offline payments working'],transport:['transportFallback','Keep independent transport working']};
  const row=rows[id];return row?`<button class="small-button" data-interrupt="${row[0]}">${row[1]} ↗</button><button class="small-button" data-panel="pathways">Explore other causes ↗</button>`:'';
}
