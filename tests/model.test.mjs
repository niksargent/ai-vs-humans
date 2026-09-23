import {simulateRecovery} from '../dist/src/recovery.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,simulate,validateSettings,ensemble,draw} from '../dist/src/model.js';
import {differences,changedNodes} from '../dist/src/feedback.js';

test('Partial reach is amber; all regions red; protected regions green',()=>{
  assert.equal(simulate({...DEFAULTS,connectedness:40}).nodes.spread.status,'exposed');
  assert.equal(simulate({...DEFAULTS,connectedness:100}).nodes.spread.status,'harm');
  assert.equal(simulate({...DEFAULTS,authority:0}).nodes.spread.status,'safe');
});
test('Emergency response distinguishes partial service from complete disruption',()=>{
  assert.equal(simulate({...DEFAULTS,fallback:50}).nodes.emergency.status,'exposed');
  assert.equal(simulate({...DEFAULTS,fallback:0}).nodes.emergency.status,'harm');
  assert.equal(simulate({...DEFAULTS,fallback:100}).nodes.emergency.status,'safe');
});
test('Hospital protection feeds back into repair speed without changing military events',()=>{
  const a=simulate(DEFAULTS),b=simulate({...DEFAULTS,reserves:720});
  assert.equal(b.hospitalGap,0);assert.ok(b.recoveryModel.final.work>a.recoveryModel.final.work);assert.ok(differences(a,b).some(d=>d.label==='Hospital power gap'&&d.after==='0h'));assert.equal(a.escalation,b.escalation);
  assert.ok(changedNodes(a,b).includes('hospital'));
  assert.ok(!changedNodes(a,b).includes('military'));
  assert.deepEqual(differences(b,b),[]);
});

test('Without mutual aid, reach changes footprint but not Region 1 duration or military draw',()=>{
  const local=simulate({...DEFAULTS,connectedness:0,aidStrength:0}),wide=simulate({...DEFAULTS,connectedness:100,aidStrength:0});
  assert.equal(local.regions.filter(r=>r.comms).length,1);
  assert.equal(wide.regions.filter(r=>r.comms).length,6);
  assert.equal(local.hospitalGap,wide.hospitalGap);
  assert.equal(local.escalation,wide.escalation);
  assert.ok(local.regions.slice(1).every(r=>!r.power&&!r.hospital&&!r.food&&!r.emergency));
});
test('Food backup has an exact depletion boundary when other repair inputs hold',()=>{
  const s={...DEFAULTS,repair:72,fallback:100,reserves:720,aidStrength:0,regionDifference:0};
  const before=simulateRecovery({...s,foodBackup:66},true,true),after=simulateRecovery({...s,foodBackup:72},true,true);
  assert.equal(before.foodGap,6);assert.equal(after.foodGap,0);
  assert.equal(before.hospitalGap,after.hospitalGap);
  assert.equal(after.final.coldStorage,1);
});
test('Separate power protects food and hospitals but cannot restore emergency communications',()=>{
  const r=simulate({...DEFAULTS,sharedProvider:false});
  assert.equal(r.foodGap,0);assert.equal(r.hospitalGap,0);assert.ok(r.emergencyGap>0);
});
test('Full independent capacity maintains emergency response even when the main network fails',()=>{
  const r=simulate({...DEFAULTS,fallback:100});
  assert.equal(r.incident,true);assert.equal(r.emergencyGap,0);
  assert.ok(r.regions.every(r=>!r.emergency));
});
test('Stopping the update prevents every regional service interruption',()=>{
  const r=simulate({...DEFAULTS,authority:0,connectedness:100,foodBackup:0,reserves:0});
  assert.equal(r.affectedRegions,0);assert.equal(r.foodGap,0);assert.equal(r.emergencyGap,0);
  assert.ok(r.regions.every(r=>!r.comms&&!r.power&&!r.hospital&&!r.food&&!r.emergency));
});

test('Fixed settings and seed reproduce the full case and event record',()=>{
  assert.deepEqual(simulate(DEFAULTS,42),simulate({...DEFAULTS},42));
});
test('Advice cannot execute an unsafe update; both dependent branches remain untouched',()=>{
  for(let seed=0;seed<30;seed++) {
    const r=simulate({...DEFAULTS,authority:0},seed);
    assert.equal(r.incident,false);assert.equal(r.hospitalGap,0);assert.equal(r.escalation,false);
  }
});
test('Approval authority requires explicit human approval, independent of ability',()=>{
  assert.equal(simulate({...DEFAULTS,authority:1,humanApproval:false}).incident,false);
  assert.equal(simulate({...DEFAULTS,authority:1,humanApproval:true}).incident,true);
  assert.equal(simulate({...DEFAULTS,capability:0,authority:2}).incident,false);
});
test('One shared communications event reaches power and warning without duplicate sampling',()=>{
  const r=simulate(DEFAULTS);
  assert.equal(r.events.filter(e=>e.id==='comms').length,r.updates.releases.filter(e=>e.fault).length);
  assert.ok(r.events.find(e=>e.id==='power').parents.includes('comms'));
  assert.ok(r.events.find(e=>e.id==='warning').parents.includes('comms'));
});
test('Independent power prevents hospital harm while military case remains unchanged',()=>{
  const a=simulate(DEFAULTS),b=simulate({...DEFAULTS,sharedProvider:false});
  assert.equal(b.incident,true);assert.equal(b.hospitalGap,0);
  assert.equal(a.escalation,b.escalation);assert.equal(a.verified,b.verified);
});
test('Effective, timely verification stops escalation but cannot repair the shared network',()=>{
  const a=simulate(DEFAULTS),b=simulate({...DEFAULTS,verification:100});
  assert.equal(a.escalation,true);assert.equal(b.verified,true);assert.equal(b.escalation,false);
  assert.equal(a.hospitalGap,b.hospitalGap);assert.equal(a.restoreHours,b.restoreHours);
});
test('A strong check after its deadline cannot be counted as protective',()=>{
  const r=simulate({...DEFAULTS,verification:100,decisionTime:10});
  assert.equal(r.verified,false);assert.ok(r.verificationMinutes>r.settings.decisionTime);
});
test('Common communication failure delays checks that use the affected information channel',()=>{
  const independent=simulate({...DEFAULTS,verification:100});
  const shared=simulate({...DEFAULTS,verification:100,independent:false});
  assert.equal(independent.verified,true);assert.equal(shared.verified,false);
});
test('Reserve coverage has exact boundary behaviour; more backup cannot enlarge service gap',()=>{
  const s={...DEFAULTS,repair:72,fallback:100,reserves:720,aidStrength:0,regionDifference:0};
  assert.equal(simulateRecovery({...s,reserves:72},true,true).hospitalGap,0);
  assert.equal(simulateRecovery({...s,reserves:66},true,true).hospitalGap,10);
  assert.equal(simulateRecovery({...s,reserves:120},true,true).hospitalGap,0);
});
test('Fallback improves restoration; it does not erase the initial event',()=>{
  const a=simulate({...DEFAULTS,fallback:0}),b=simulate({...DEFAULTS,fallback:100});
  assert.equal(a.incident,b.incident);assert.ok(b.recoveryModel.final.work>a.recoveryModel.final.work);
});
test('Removing military AI advice removes this route without repairing hospitals',()=>{
  const a=simulate(DEFAULTS),b=simulate({...DEFAULTS,aiAdvice:false});
  assert.equal(b.warning,false);assert.equal(b.escalation,false);assert.equal(a.hospitalGap,b.hospitalGap);
});
test('Strategic use is an additional event; original network repair is not global recovery',()=>{
  let r;for(let seed=0;seed<500;seed++){r=simulate({...DEFAULTS,tension:100},seed);if(r.nuclear)break;}
  assert.equal(r.nuclear,true);assert.equal(r.nodes.recovery.status,'unknown');
  assert.ok(r.events.find(e=>e.id==='nuclear').parents.includes('military'));
});
test('Event-addressed draws are stable and domain-specific',()=>{
  assert.equal(draw(42,'verification'),draw(42,'verification'));
  assert.notEqual(draw(42,'verification'),draw(42,'escalation'));
});
test('A varied ensemble represents human responses, not stochastic reserve arithmetic',()=>{
  const e=ensemble({...DEFAULTS,researchSpeed:5},42);assert.equal(e.count,256);assert.ok(e.escalation>0&&e.escalation<256);assert.ok(e.health>0&&e.health<=256);
  assert.equal(ensemble({...DEFAULTS,verification:100},42).escalation,0);
});
test('Invalid, non-finite, mis-stepped and wrong-typed saved settings are rejected',()=>{
  for(const overrides of [{capability:4},{repair:NaN},{authority:'2'},{tension:101},{verification:33},{aiAdvice:'true'}])assert.throws(()=>validateSettings({...DEFAULTS,...overrides}));
});
test('No faulty proposal means no outage from this fixture, across extreme controls',()=>{
  for(const capability of [0,2])for(const authority of [0,2])for(const fallback of [0,100]){
    const r=simulate({...DEFAULTS,capability,authority,fallback,mistakeRate:0});assert.equal(r.incident,false);assert.equal(r.powerOutage,0);assert.equal(r.hospitalGap,0);
  }
});
