import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,simulate} from '../dist/src/model.js';
import {simulatePathways} from '../dist/src/pathways.js';
import {pathwayPresets} from '../dist/src/pathway-ui.js';
const run=(extra={})=>simulate({...DEFAULTS,...extra});

test('Research output is resource-bounded and its queue is conserved',()=>{
  for(const waitForChecks of [true,false]){
    const p=simulatePathways({...DEFAULTS,researchEnabled:true,waitForChecks});
    assert.equal(p.research.made,90);assert.equal(p.research.checked,30);
    assert.equal(p.research.made,p.research.checked+p.research.backlog+p.research.unchecked);
    assert.ok(p.research.history.every(f=>f.backlog>=0));
  }
  assert.equal(run({...pathwayPresets.research,computeCapacity:0}).pathways.research.made,0);
  assert.equal(run({...pathwayPresets.research,experimentCapacity:0}).incident,false);
});
test('Deployment checks stop the stipulated fault without stopping research',()=>{
  const a=run(pathwayPresets.research),b=run({...pathwayPresets.research,waitForChecks:true});
  assert.equal(a.incident,true);assert.equal(b.incident,false);
  assert.equal(a.pathways.research.made,b.pathways.research.made);
  assert.equal(run({...pathwayPresets.research,authority:0}).incident,false);
  assert.equal(run({...pathwayPresets.research,evaluationCapacity:100}).incident,false);
});
test('Loss of control and harmful behaviour are separate',()=>{
  const benign=run({...pathwayPresets.control,harmfulGoal:false});
  assert.equal(benign.pathways.controlLost,true);assert.equal(benign.incident,false);
  assert.equal(benign.civilisation.crossedAt,null);
  const harmful=run(pathwayPresets.control);
  assert.equal(harmful.pathways.controlLost,true);assert.equal(harmful.recoveryModel.progress,0);
  assert.equal(harmful.recoveryModel.completed,false);
});
test('Each control prerequisite matters; isolation permits later repair',()=>{
  for(const patch of [{externalResources:false},{resistsStop:false},{independentStop:true}]){
    const r=run({...pathwayPresets.control,...patch});
    assert.equal(r.pathways.controlLost,false);assert.equal(r.pathways.stoppedAt,24);
    assert.equal(r.recoveryModel.frames[23].rate,0);assert.ok(r.recoveryModel.frames[24].rate>0);
    assert.equal(r.recoveryModel.completed,true);assert.ok(r.restoreHours>24);
  }
  for(const patch of [{authority:0},{capability:1},{agentEnabled:false}])assert.equal(run({...pathwayPresets.control,...patch}).incident,false);
  assert.equal(run({...pathwayPresets.control,independentStop:true,stopDelay:0}).incident,false);
});
test('A health threat requires all independent gates; network permission is not lab access',()=>{
  const active=run(pathwayPresets.health);assert.equal(active.pathways.healthIntroduced,true);
  assert.equal(active.incident,false);assert.ok(active.recoveryModel.healthcareGap>0);
  assert.equal(active.hospitalGap,0);assert.equal(active.civilisation.crossedAt,null);
  assert.deepEqual(active.recoveryModel.milestones,[], 'No repair story is invented when there is no network fault');
  for(const patch of [{healthChallenge:false},{scienceAssistance:false},{maliciousActor:false},{physicalAccess:false},{screening:true}]){
    assert.equal(run({...pathwayPresets.health,...patch}).recoveryModel.healthcareGap,0);
  }
  assert.equal(run({...pathwayPresets.health,authority:0,capability:0}).pathways.healthIntroduced,true);
});
test('Health response and surge capacity reduce unmet care; effects remain after network repair',()=>{
  const a=run(pathwayPresets.health),early=run({...pathwayPresets.health,healthResponseDelay:24}),surge=run({...pathwayPresets.health,healthSurge:200});
  assert.ok(early.recoveryModel.healthcareGap<a.recoveryModel.healthcareGap);
  assert.ok(surge.recoveryModel.healthcareGap<a.recoveryModel.healthcareGap);
  assert.equal(a.recoveryModel.restoredAt,0);assert.equal(a.recoveryModel.observedHours,720);
  assert.ok(a.events.some(e=>e.id==='bio-response'&&e.time>0));
  assert.ok(a.civilisation.regions.slice(3).every(r=>r.recovery.healthcareGap===0));
  const compound=run({...pathwayPresets.health,faultyChange:true});
  assert.ok(compound.restoreHours>run().restoreHours);
  assert.ok(compound.recoveryModel.frames.some(f=>f.time>compound.restoreHours&&f.healthcare<1));
});
test('Trusted channels can remove a campaign penalty without fixing the network',()=>{
  const a=run(pathwayPresets.information),b=run({...pathwayPresets.information,trustedChannels:100});
  assert.ok(a.restoreHours>b.restoreHours);assert.equal(b.restoreHours,run().restoreHours);
  assert.equal(b.incident,true);assert.ok(a.civilisation.frames[0].coordination[0]<.5);
  const healthy=run({...pathwayPresets.information,faultyChange:false});
  assert.equal(healthy.incident,false);assert.ok(healthy.emergencyGap>0);assert.equal(healthy.pathways.controlLost,false);
});
test('Payments and transport are separate bottlenecks, not multiplied duplicate losses',()=>{
  const base={...pathwayPresets.deliveries,paymentFallback:25,transportFallback:50};
  const r=run(base);assert.equal(r.recoveryModel.frames[0].payments,.25);
  assert.equal(r.recoveryModel.frames[0].transport,.5);assert.equal(r.recoveryModel.frames[0].deliveries,.25);
  const payment=run({...base,paymentFallback:100});assert.equal(payment.recoveryModel.frames[0].deliveries,.5);
  const both=run({...base,paymentFallback:100,transportFallback:100});assert.equal(both.recoveryModel.frames[0].deliveries,1);
  assert.ok(both.restoreHours<r.restoreHours);
});
test('New pathways preserve deterministic case and nonnegative stock accounting',()=>{
  const s={...pathwayPresets.health,faultyChange:true,...pathwayPresets.information,sharedPayments:true,sharedTransport:true};
  const a=run(s);assert.deepEqual(a,run(s));
  for(const region of a.civilisation.regions){const r=region.recovery;
    assert.ok(r.frames.every(f=>f.parts>=0&&f.foodStock>=0&&f.healthcare>=0&&f.healthcare<=1));
    assert.ok(Math.abs(region.settings.repairSupplies+r.suppliesDelivered-r.suppliesUsed-r.final.parts)<.002);
  }
  assert.ok(Math.abs(a.civilisation.aidSent-a.civilisation.aidReceived-a.civilisation.aidInTransit)<1e-6);
});

test('AI repair advice can help without adding authority or ignoring material limits',()=>{
  const a=run(),b=run({repairAssistance:true});
  assert.ok(b.restoreHours<a.restoreHours);assert.equal(a.incident,b.incident);
  assert.equal(run({repairAssistance:true,authority:0}).incident,false);
  const none=run({repairAssistance:true,repairSupplies:0,supplyDelivery:0,aidStrength:0,reach:6});
  assert.equal(none.recoveryModel.progress,0);
});

test('A health-stressed repaired region cannot immediately export relief',()=>{
  const r=run({...pathwayPresets.health,faultyChange:true,reach:6,regionDifference:100});
  assert.ok(r.civilisation.shipments.length>0);
  for(const shipment of r.civilisation.shipments){
    const frames=r.civilisation.regions[shipment.from].recovery.frames;
    for(let t=shipment.sentAt-24;t<shipment.sentAt;t++){
      const f=frames[Math.min(t,frames.length-1)];
      assert.ok(f.healthcare>=.999);
    }
  }
  for(const region of r.civilisation.regions)assert.ok(region.aidUnused<=region.aidReceived+1e-8);
});
