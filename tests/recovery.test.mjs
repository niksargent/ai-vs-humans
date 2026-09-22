import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,simulate} from '../dist/src/model.js';
import {simulateRecovery} from '../dist/src/recovery.js';
const run=s=>simulateRecovery({...DEFAULTS,...s},true,true);

test('Ideal repair completes at its work requirement; no automatic fallback speedup',()=>{
  const r=run({fallback:100,reserves:720,foodBackup:720,repairBackup:720});
  assert.equal(r.restoredAt,72);assert.equal(r.hospitalGap,0);assert.equal(r.suppliesUsed,72);
});
test('No crew means no work even with abundant electricity and supplies',()=>{
  const r=run({crews:0,fallback:100});
  assert.equal(r.restoredAt,null);assert.equal(r.status,'stalled');assert.equal(r.progress,0);
  assert.equal(r.suppliesUsed,0);assert.ok(!r.milestones.some(m=>m.kind==='restored'));
});
test('Power loss creates a delayed repair stall when tool backup expires',()=>{
  const r=run({fallback:0,repairBackup:24});
  assert.ok(r.progress>0&&r.progress<1);assert.equal(r.status,'stalled');
  const at=r.frames.find(f=>f.time===24),late=r.frames.at(-1);
  assert.equal(at.rate,0);assert.equal(at.work,late.work);
  assert.equal(r.milestones.find(m=>m.kind==='tools').time,24);
});
test('Independent tool power breaks that stall',()=>{
  assert.equal(run({fallback:0,repairBackup:24}).restoredAt,null);
  assert.ok(run({fallback:100,repairBackup:24}).restoredAt<720);
});
test('Finite parts stop work; independent deliveries restart an otherwise empty store',()=>{
  const empty=run({repairSupplies:0,supplyDelivery:0,fallback:100});
  assert.equal(empty.progress,0);assert.equal(empty.final.limiting,'repair supplies');
  const supplied=run({repairSupplies:0,supplyDelivery:100,fallback:100});
  assert.equal(supplied.completed,true);assert.equal(supplied.suppliesUsed,72);
});
test('Supplies are conserved and all stores remain nonnegative across varied conditions',()=>{
  for(const fallback of [0,20,100])for(const supplyDelivery of [0,30,100])for(const repairSupplies of [0,12,96]){
    const r=run({fallback,supplyDelivery,repairSupplies});
    assert.ok(Math.abs(repairSupplies+r.suppliesDelivered-r.suppliesUsed-r.final.parts)<.0011);
    assert.ok(r.suppliesUsed<=72+1e-8);
    for(const f of r.frames){for(const k of ['parts','hospitalBackup','foodBackup','repairBackup','foodStock','work'])assert.ok(f[k]>=0, k);}
  }
});
test('Hospital, refrigeration and tool generators are distinct stores',()=>{
  const r=run({reserves:12,foodBackup:24,repairBackup:36});
  assert.equal(r.frames.find(f=>f.time===12).hospitalBackup,0);
  assert.equal(r.frames.find(f=>f.time===12).foodBackup,12);
  assert.equal(r.frames.find(f=>f.time===12).repairBackup,24);
});
test('Hospital and food failures lower later crew productivity rather than instantly spreading red',()=>{
  const r=run({reserves:24,foodStores:0,supplyDelivery:0,foodBackup:48});
  assert.ok(r.frames.find(f=>f.time===24).crews<r.frames.find(f=>f.time===23).crews);
  assert.ok(run({foodStores:720}).restoredAt<run({foodStores:0}).observedHours);
});
test('Thirty-day limit is censored; continuing work is distinguished from a stall',()=>{
  const r=run({crews:5,fallback:100});
  assert.equal(r.restoredAt,null);assert.equal(r.status,'progressing');assert.ok(r.final.rate>0);
  const full=simulate({...DEFAULTS,crews:5,fallback:100});
  assert.ok(!full.events.some(e=>e.id==='repair'));
  assert.match(full.nodes.recovery.label,/Still repairing/);
});
test('Half-hour and quarter-hour steps preserve the qualitative result and recovery within two hours',()=>{
  for(const settings of [{},{fallback:100},{reserves:720},{repairSupplies:0,supplyDelivery:30}]){
    const s={...DEFAULTS,...settings};
    const a=simulateRecovery(s,true,true,1),b=simulateRecovery(s,true,true,.5),c=simulateRecovery(s,true,true,.25);
    assert.equal(a.status,c.status);assert.ok(Math.abs(a.observedHours-c.observedHours)<=2);
    assert.ok(Math.abs(b.observedHours-c.observedHours)<=1);
  }
});
test('More protection never worsens recovery across representative settings',()=>{
  for(const base of [{},{fallback:0},{repairSupplies:0,supplyDelivery:0},{crews:25}]){
    const s={...DEFAULTS,...base},a=run(s);
    for(const [key,value] of Object.entries({fallback:100,reserves:720,foodBackup:720,foodStores:720,repairBackup:720,repairSupplies:168,supplyDelivery:100,crews:100})){
      const b=run({...s,[key]:value});assert.ok(b.progress>=a.progress-1e-8,key);assert.ok(b.observedHours<=a.observedHours,key);
    }
  }
});
