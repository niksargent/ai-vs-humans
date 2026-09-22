import type {Settings,NumericKey,Result} from './model.js';
type Range=(key:NumericKey,label:string,copy:string,unit:string)=>string;
type Toggle=(key:keyof Settings,label:string,copy:string)=>string;
export const pathwayPresets:Record<string,Partial<Settings>>={
  outage:{},
  research:{researchEnabled:true,waitForChecks:false,faultyChange:true},
  control:{faultyChange:false,agentEnabled:true,harmfulGoal:true,externalResources:true,independentStop:false},
  health:{faultyChange:false,healthChallenge:true,scienceAssistance:true,maliciousActor:true,physicalAccess:true,screening:false},
  information:{informationCampaign:true,informationReach:90,trustedChannels:10,informationHours:336},
  deliveries:{sharedPayments:true,sharedTransport:true,paymentFallback:0,transportFallback:10,supplyDelivery:100,repairSupplies:12,foodStores:48}
};
export function pathwayControls(range:Range,toggle:Toggle){
  return `<details class="model-details"><summary>Development & checks</summary>`+
    toggle('repairAssistance','AI helps repair crews','Advice helps crews find the fault faster. It still needs people, powered tools and supplies.')+
    toggle('researchEnabled','AI proposes new versions','Calculate 30 days of research before the crisis.')+
    range('researchSpeed','Research speed','Up to four candidate updates per day.','%')+
    range('computeCapacity','Computers available','Limits how much research can run.','%')+
    range('experimentCapacity','Experiments available','Limits how many ideas can be tried.','%')+
    range('evaluationCapacity','Checking capacity','How many candidate updates people can check each day.','%')+
    toggle('waitForChecks','Wait for checks','Unfinished checks keep an update out of the live network.')+`</details>`+
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
export function pathwaysPanel(r:Result){
  const p=r.pathways;
  return `<h2 class="inspector-title">Choose the spark.</h2><p class="inspector-copy">Keep exploring your current world, or load a new starting situation below.</p>`+
    [['outage','One bad update','An AI mistake knocks out a shared network.'],['research','Updates outrun checks','New versions go live before anyone finishes checking them.'],['control','The stop order fails','An agent keeps breaking what people are trying to repair.'],['health','Hospitals face a surge','A health threat needs several gates to fail first.'],['information','People hear conflicting instructions','False messages weaken the response.'],['deliveries','Supplies cannot move','A full warehouse is no help if purchases or deliveries stop.']].map(([id,title,copy])=>`<button class="pathway-choice" data-pathway="${id}"><strong>${title} ↗</strong><span>${copy}</span></button>`).join('')+
    `<button class="primary-action" data-stage="chain">Follow my current world →</button><button class="small-button" data-panel="advanced">Open all controls ↗</button>`;

}
export function pathwayInterventions(id:string){
  const rows:Record<string,[string,string]>= {development:['waitForChecks','Require checks before release'],control:['independentStop','Try independent isolation'],bio:['screening','Stop the health threat at screening'],information:['trustedChannels','Restore trusted channels'],payments:['paymentFallback','Keep offline payments working'],transport:['transportFallback','Keep independent transport working']};
  const row=rows[id];return row?`<button class="small-button" data-interrupt="${row[0]}">${row[1]} ↗</button><button class="small-button" data-panel="pathways">Explore other causes ↗</button>`:'';
}
