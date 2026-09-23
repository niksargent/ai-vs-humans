import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,simulate} from '../dist/src/model.js';
import {simulatePathways} from '../dist/src/pathways.js';
import {pathwayPresets} from '../dist/src/pathway-ui.js';
import {worldNodes,primaryEdges} from '../dist/src/world-view.js';
import {evidenceFor} from '../dist/src/evidence.js';
const run=patch=>simulate({...DEFAULTS,...patch});

test('Extra checking time cannot restore a failed verification channel',()=>{
 const s={verification:100,decisionTime:120,independent:false,fallback:0};
 const a=run(s),b=run({...s,independent:true});
 assert.equal(a.verificationAvailable,false);assert.equal(a.verified,false);
 assert.match(a.nodes.checks.label,/no working channel/);
 assert.equal(b.verified,true);assert.equal(b.escalation,false);
 assert.equal(a.hospitalGap,b.hospitalGap);
 assert.equal(run({...s,fallback:5}).verificationAvailable,true);
});
test('A zero-sized health shock cannot silently remove workers or delay repair',()=>{
 const s={...pathwayPresets.health,faultyChange:true,healthDemand:0};
 const a=run(s),b=run({...s,healthChallenge:false});
 assert.ok(a.pathways.frames.every(f=>f.workforce===1&&f.demand===1));
 assert.deepEqual(a.civilisation.regions.map(r=>r.recovery),b.civilisation.regions.map(r=>r.recovery));
});
test('Larger health demand cannot create more workers',()=>{
 let previous;
 for(const healthDemand of [0,100,200,300,400]){
  const p=simulatePathways({...DEFAULTS,...pathwayPresets.health,healthDemand});
  assert.ok(p.frames.every(f=>f.workforce>=.6&&f.workforce<=1));
  if(previous)for(let i=0;i<p.frames.length;i++)assert.ok(p.frames[i].workforce<=previous.frames[i].workforce);
  previous=p;
 }
});
test('Cold fridges cannot hide a food supply failure',()=>{
 const r=run({sharedProvider:false,sharedPayments:true,paymentFallback:0,supplyDelivery:0,foodStores:0,aidStrength:0});
 assert.equal(r.foodGap,0);assert.ok(r.recoveryModel.foodShortageHours>0);
 assert.equal(r.nodes.food.status,'harm');assert.equal(r.regions[0].food,true);
 assert.match(r.nodes.food.label,/supply shortfall/);
});
test('Working radios cannot hide complete loss of trusted emergency instructions',()=>{
 const r=run({faultyChange:false,fallback:100,informationCampaign:true,informationReach:100,trustedChannels:0});
 assert.equal(r.nodes.emergency.status,'harm');
 assert.equal(run({...r.settings,trustedChannels:100}).nodes.emergency.status,'safe');
});
test('Every map module has evidence scope and every overview wire matches a declared dependency',()=>{
 const r=run({});
 for(const node of worldNodes){const e=evidenceFor(node.id);assert.ok(e?.mechanism&&e.assumption&&e.source,node.id);}
 for(const [from,to] of primaryEdges)assert.ok(r.nodes[to].parents.includes(from),`${from} -> ${to}`);
});
test('Compound pathways keep support bounded and stocks conserved',()=>{
 for(const connectedness of [0,60,100])for(const fallback of [0,50,100])for(const healthDemand of [0,400]){
  const r=run({...pathwayPresets.health,...pathwayPresets.information,...pathwayPresets.deliveries,faultyChange:true,connectedness,fallback,healthDemand});
  for(const region of r.civilisation.regions){const m=region.recovery;
   assert.ok(Math.abs(region.settings.repairSupplies+m.suppliesDelivered-m.suppliesUsed-m.final.parts)<.002);
   for(const f of m.frames)for(const key of ['power','communications','healthcare','foodSupply','emergency','payments','transport','trust'])assert.ok(Number.isFinite(f[key])&&f[key]>=0&&f[key]<=1,key);
  }
  assert.ok(Math.abs(r.civilisation.aidSent-r.civilisation.aidReceived-r.civilisation.aidInTransit)<1e-6);
 }
});


test('Development explanation reports actual released mistakes and checking results',()=>{
 for(const patch of [pathwayPresets.research,{waitForChecks:true,checkEffectiveness:100},{authority:0},{mistakeRate:0},{researchSpeed:0}]){
  const r=run(patch),faults=r.updates.releases.filter(e=>e.fault).length;
  assert.equal(r.pathways.researchFault,faults>0);
  assert.ok(r.nodes.development.reason.includes(`${faults} faulty updates`));
  assert.ok(r.nodes.development.reason.includes(`checks catch ${r.updates.caught}`));
 }
});

test('Protection choices make exact changes, become no-ops once applied, and never widen reach',async()=>{
 const {protections,settingChanges,protectionEffect}=await import('../dist/src/protection.js');
 for(const patch of [{},{connectedness:0},{connectedness:100},pathwayPresets.control,pathwayPresets.health]){
  const s={...DEFAULTS,...patch};
  for(const option of protections(s)){
   const next={...s,...option.patch};
   assert.equal(settingChanges(next,option.patch).length,0);
   if(option.id==='refuges')assert.ok(next.connectedness<=s.connectedness);
  }
 }
 const s={...DEFAULTS,...pathwayPresets.control};
 const after=simulate({...s,reserves:720});
 assert.match(protectionEffect(simulate(s),after),/care shortfall|agent is still undoing repairs/);
});

test('Current scenario recognises presets and labels combined or adjusted settings',async()=>{
 const {currentScenario}=await import('../dist/src/pathway-ui.js');
 assert.deepEqual(currentScenario(DEFAULTS),{id:'outage',name:'Updates go wrong',modified:false});
 assert.equal(currentScenario({...DEFAULTS,...pathwayPresets.health}).id,'health');
 assert.equal(currentScenario({...DEFAULTS,reserves:720}).modified,true);
 assert.equal(currentScenario({...DEFAULTS,researchSpeed:100,agentEnabled:true}).id,'combined');
});

test('Connectedness is repeatable and monotone per replay, with local and global limits',async()=>{
 const {regionalSpread}=await import('../dist/src/spread.js');
 for(let seed=0;seed<256;seed++){
  assert.equal(regionalSpread(0,seed).count,1);
  assert.equal(regionalSpread(100,seed).count,6);
  let previous=regionalSpread(0,seed);
  for(let c=5;c<=100;c+=5){
   const next=regionalSpread(c,seed);
   assert.deepEqual(next,regionalSpread(c,seed));
   assert.ok(previous.exposed.every((hit,i)=>!hit||next.exposed[i]));
   assert.ok(next.aidAccess>=previous.aidAccess);
   previous=next;
  }
 }
});

test('One connectedness score allows different footprints, including shared and dependency routes',async()=>{
 const {regionalSpread}=await import('../dist/src/spread.js');
 const worlds=Array.from({length:256},(_,seed)=>regionalSpread(50,seed));
 assert.deepEqual([...new Set(worlds.map(w=>w.count))].sort(),[1,2,3,4,5,6]);
 assert.ok(worlds.some(w=>w.routes.includes('shared')&&w.routes.includes('dependency')));
 const r=simulate({...DEFAULTS,connectedness:40},42);
 assert.deepEqual(r.regions.map(x=>x.comms),[true,true,true,true,false,true]);
 assert.equal(r.civilisation.regions[4].recovery.hospitalGap,0);
 assert.ok(r.civilisation.regions[5].recovery.hospitalGap>0);
 assert.ok(Math.abs(r.civilisation.aidSent-r.civilisation.aidReceived-r.civilisation.aidInTransit)<1e-7);
});

test('Higher connectedness carries relief faster while a fixed footprint is unchanged',async()=>{
 const a=simulate({...DEFAULTS,connectedness:45},42),b=simulate({...DEFAULTS,connectedness:60},42);
 assert.deepEqual(a.spread.exposed,b.spread.exposed);
 assert.ok(b.civilisation.shipments[0].amount>a.civilisation.shipments[0].amount);
 assert.ok(b.civilisation.regions.every(r=>r.aidSent<=r.settings.aidBudget+1e-7));
});

test('Main dials alone reveal crisis and protection, with zero pace removing updates',()=>{
 const world={...DEFAULTS,connectedness:80,aiAdvice:false};
 const collapse=simulate({...world,fallback:0},42),protectedWorld=simulate({...world,researchSpeed:0},42);
 assert.equal(collapse.affectedRegions,6);assert.equal(collapse.civilisation.endStatus,'collapse');
 assert.equal(protectedWorld.civilisation.endStatus,'functioning');assert.equal(protectedWorld.updates.releases.length,0);
});

test('Scenario receipts reveal hidden switches without claiming unchanged dials moved',async()=>{
 const {scenarioChanges,scenarioReceipt}=await import('../dist/src/scenario-ui.js');
 const dials=['capability','authority','researchSpeed','connectedness','tension','verification','fallback','reserves'];
 const changes=scenarioChanges(DEFAULTS,'research');
 assert.ok(changes.some(c=>c.key==='researchSpeed'));
 const receipt=scenarioReceipt(DEFAULTS,'research',dials);
 assert.ok(receipt.includes('1 main dial changed.'));
 assert.ok(receipt.includes('AI project pace'));
 assert.ok(receipt.includes('data-setting-reveal="researchSpeed"'));
});
