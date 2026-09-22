import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,simulate} from '../dist/src/model.js';
import {simulateCivilisation,classifyWorld} from '../dist/src/civilisation.js';
const run=o=>simulateCivilisation({...DEFAULTS,...o},true,true);
const fragile={reach:6,crews:25,repairBackup:24,foodStores:48};

test('Widespread interruption is not automatically civilisation collapse',()=>{
  const c=run({reach:6});assert.equal(c.crossedAt,null);assert.equal(c.endStatus,'functioning');
  assert.ok(c.peakRegions>=4);assert.ok(c.longestHours<336);
});
test('Sustained simultaneous loss crosses the explicit threshold',()=>{
  const c=run(fragile);assert.equal(c.endStatus,'collapse');assert.ok(c.crossedAt>0);
  assert.ok(c.longestHours>=336);assert.equal(c.recoveredAt,null);
});
test('Independent survivors with finite aid interrupt the same fragile chain',()=>{
  const c=run({...fragile,reach:4,aidStrength:100,aidBudget:168});
  assert.equal(c.crossedAt,null);assert.equal(c.endStatus,'functioning');
  assert.ok(c.regions.slice(0,4).every(r=>r.recovery.completed));
  assert.ok(c.regions.slice(4).every(r=>r.deprivationHours===0&&r.aidSent>0));
});
test('Withholding aid from the same two survivors leaves the fragile regions in collapse',()=>{
  const c=run({...fragile,reach:4,aidStrength:0});
  assert.equal(c.endStatus,'collapse');assert.equal(c.aidSent,0);
  assert.ok(c.regions.slice(4).every(r=>r.recovery.completed&&r.deprivationHours===0));
});
test('Collapse history survives subsequent recovery',()=>{
  const c=run({reach:6,aidStrength:0,regionDifference:0});
  assert.equal(c.crossedAt,543);assert.equal(c.recoveredAt,634);assert.equal(c.endStatus,'recovered');
});
test('Aid is delayed, bounded by donor surplus, and conserved through transit',()=>{
  const c=run({aidStrength:100,aidBudget:6});
  assert.ok(c.shipments.every(x=>x.arrivesAt-x.sentAt===DEFAULTS.aidDelay));
  assert.ok(c.shipments.every(x=>x.sentAt>=24));
  for(const r of c.regions){assert.ok(r.aidSent<=6+1e-8);assert.ok(Math.abs(r.aidBudgetLeft+r.aidSent-6)<1e-8);}
  assert.ok(Math.abs(c.aidSent-c.aidReceived-c.aidInTransit)<1e-8);
  for(const r of c.regions.filter(r=>r.exposed))assert.ok(r.recovery.frames.filter(f=>f.time<=72).every(f=>f.aid===0));
});
test('Exhausted surplus stops dispatch and does not consume donor essentials',()=>{
  const c=run({...fragile,reach:4,aidStrength:100,aidBudget:6});
  for(const r of c.regions.slice(4)){assert.equal(r.aidBudgetLeft,0);assert.equal(r.recovery.hospitalGap,0);assert.ok(Math.abs(r.recovery.final.foodStock-r.settings.foodStores)<.001);}
  assert.ok(c.shipments.every(s=>s.sentAt<30));
});
test('Late shipments are counted as unused, not retroactive rescue',()=>{
  const c=run({fallback:100,reserves:720,foodBackup:720,aidDelay:168});
  assert.equal(c.regions[0].recovery.restoredAt,72);
  assert.ok(c.regions[0].aidUnused>0);
  assert.equal(c.regions[0].aidReceived,c.regions[0].aidUnused);
  assert.equal(c.firstAidUsedAt,null);
});
test('Regional differences alter local reserves without changing total population weights',()=>{
  const c=run({aidStrength:0});
  assert.notEqual(c.regions[0].settings.reserves,c.regions[1].settings.reserves);
  assert.notEqual(c.regions[0].recovery.restoredAt,c.regions[1].recovery.restoredAt);
  const same=run({regionDifference:0,aidStrength:0});
  assert.equal(same.regions[0].recovery.restoredAt,same.regions[1].recovery.restoredAt);
});
test('Changing the collapse definition does not alter physical events',()=>{
  const a=run(fragile),b=run({...fragile,collapseDays:28});
  assert.deepEqual(a.regions.map(r=>r.recovery),b.regions.map(r=>r.recovery));assert.deepEqual(a.shipments,b.shipments);
  assert.notEqual(a.crossedAt,b.crossedAt);
});
test('Short separated crises do not accumulate into a continuous collapse',()=>{
  const frames=Array.from({length:101},(_,time)=>({time,failingRegions:time%30<20?4:0,essentialFailures:Array(6).fill(time%30<20?3:0),coordination:Array(6).fill(time%30<20?0:1),repairProgress:Array(6).fill(0),continuousHours:0}));
  const c=classifyWorld(frames,4,24);assert.equal(c.crossedAt,null);assert.equal(c.longestHours,20);
});
test('Exactly half capacity is not below half, and healthy food blocks the combined test',()=>{
  const c=run({...fragile,supplyDelivery:100});
  assert.equal(c.peakRegions,0);assert.equal(c.crossedAt,null);
});
test('Preventing the initiating update leaves all regions safe and sends no aid',()=>{
  const r=simulate({...DEFAULTS,...fragile,authority:0});
  assert.equal(r.civilisation.crossedAt,null);assert.equal(r.civilisation.aidSent,0);
  assert.equal(r.civilisation.independentRegions,6);
});
test('Nuclear use does not become an unsupported calculated global outcome',()=>{
  let r;for(let seed=0;seed<100;seed++){r=simulate({...DEFAULTS,tension:100},seed);if(r.nuclear)break;}
  assert.equal(r.nuclear,true);assert.equal(r.nodes.collapse.status,'unknown');
});
