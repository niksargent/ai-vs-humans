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
 for(const reach of [1,4,6])for(const fallback of [0,50,100])for(const healthDemand of [0,400]){
  const r=run({...pathwayPresets.health,...pathwayPresets.information,...pathwayPresets.deliveries,faultyChange:true,reach,fallback,healthDemand});
  for(const region of r.civilisation.regions){const m=region.recovery;
   assert.ok(Math.abs(region.settings.repairSupplies+m.suppliesDelivered-m.suppliesUsed-m.final.parts)<.002);
   for(const f of m.frames)for(const key of ['power','communications','healthcare','foodSupply','emergency','payments','transport','trust'])assert.ok(Number.isFinite(f[key])&&f[key]>=0&&f[key]<=1,key);
  }
  assert.ok(Math.abs(r.civilisation.aidSent-r.civilisation.aidReceived-r.civilisation.aidInTransit)<1e-6);
 }
});


test('Development explanation agrees with the fault and permission gates',()=>{
 const unchecked=run({...pathwayPresets.research});
 assert.equal(unchecked.pathways.researchFault,true);
 assert.match(unchecked.nodes.development.reason,/faulty update goes live/);
 assert.doesNotMatch(unchecked.nodes.development.reason,/Checks catch/);
 const held=run({...pathwayPresets.research,waitForChecks:true});
 assert.equal(held.pathways.researchFault,false);
 assert.match(held.nodes.development.reason,/No faulty update reaches/);
 const blocked=run({...pathwayPresets.research,authority:0});
 assert.equal(blocked.incident,false);
 assert.match(blocked.nodes.development.reason,/Permission blocks/);
 const noFault=run({...pathwayPresets.research,faultyChange:false});
 assert.equal(noFault.incident,false);
 assert.match(noFault.nodes.development.reason,/No faulty update is introduced/);
});
