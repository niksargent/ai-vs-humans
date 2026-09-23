import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS} from '../dist/src/model.js';
import {releaseSchedule,simulateMonth,monthEnsemble,MONTH_DEFAULTS,monthChallenges,validateMonth} from '../dist/src/month.js';
import {simulateCivilisation,classifyWorld} from '../dist/src/civilisation.js';
const active={...DEFAULTS,researchEnabled:true};
const schedule=(patch={},options={})=>releaseSchedule({...active,...patch},{...MONTH_DEFAULTS,...options},42);

test('Candidate supply, evaluation and releases balance without inventing updates',()=>{
 for(const researchSpeed of [0,5,25,100])for(const evaluationCapacity of [0,25,100])for(const waitForChecks of [false,true]){
  const r=schedule({researchSpeed,evaluationCapacity,waitForChecks},{releasesPerDay:4,checkedFault:0,uncheckedFault:0});
  assert.ok(Math.abs(r.made-r.waiting-r.ready-r.releases.length)<1e-7);
  assert.ok(Math.abs(r.checked-r.ready-r.releases.filter(x=>x.checked).length)<1e-7);
  assert.ok(r.releases.length<=120);
  if(waitForChecks)assert.ok(r.releases.every(x=>x.checked));
 }
});
test('Stopped projects, unavailable compute and absent authority block release incidents',()=>{
 for(const patch of [{researchEnabled:false},{computeCapacity:0},{experimentCapacity:0},{authority:0},{authority:1,humanApproval:false}])assert.equal(schedule(patch,{checkedFault:100,uncheckedFault:100}).releases.length,0);
 assert.equal(schedule({evaluationCapacity:0,waitForChecks:true}).releases.length,0);
 assert.ok(schedule({evaluationCapacity:0,waitForChecks:false}).releases.length>0);
});
test('Cadence has a distinct effect from idea generation and checking',()=>{
 const a=schedule({}, {releasesPerDay:0}),b=schedule({}, {releasesPerDay:1});
 assert.equal(a.made,b.made);assert.equal(a.checked,b.checked);assert.equal(a.releases.length,0);assert.equal(b.releases.length,30);
});
test('Per-version risk has exact zero/one boundaries and shared regional causes',()=>{
 const zero=simulateMonth(active,{...MONTH_DEFAULTS,checkedFault:0,uncheckedFault:0},42);
 assert.equal(zero.faults.length,0);assert.equal(zero.outcome,'quiet');
 const one=schedule({}, {checkedFault:100,uncheckedFault:100});assert.ok(one.releases.every(r=>r.fault));
 const wide=releaseSchedule({...active,connectedness:100},MONTH_DEFAULTS,42),local=releaseSchedule({...active,connectedness:0},MONTH_DEFAULTS,42);
 assert.deepEqual(wide,local);
});
test('Late failures do not cause early outages or consume backups before they happen',()=>{
 const w=simulateCivilisation({...DEFAULTS,aidStrength:0,regionDifference:0},true,true,undefined,[360]);
 const r=w.regions[0].recovery;
 assert.ok(r.frames.filter(f=>f.time<360).every(f=>f.power===1&&f.hospitalBackup===24&&f.target===0));
 assert.equal(r.frames[360].power,0);assert.equal(r.frames[360].disruptedHours,0);
});
test('Repeated failures add work while keeping depleted stocks and aid finite',()=>{
 const s={...DEFAULTS,regionDifference:0,aidStrength:100,aidBudget:6};
 const w=simulateCivilisation(s,true,true,undefined,[0,240,480]);
 for(const region of w.regions){const r=region.recovery;
  assert.ok(Math.abs(region.settings.repairSupplies+r.suppliesDelivered-r.suppliesUsed-r.final.parts)<.002);
  assert.ok(region.aidSent<=6+1e-8);assert.ok(region.aidUnused<=region.aidReceived+1e-8);
 }
 const r=w.regions[0].recovery;assert.equal(r.final.target,216);
 assert.equal(r.frames[240].hospitalBackup,0);assert.equal(r.frames[480].hospitalBackup,0);
 assert.ok(Math.abs(w.aidSent-w.aidReceived-w.aidInTransit)<1e-7);
});
test('A renewed sustained collapse cancels an earlier recovery at the end',()=>{
 const frames=Array.from({length:121},(_,time)=>{const bad=time<30||time>=75;return {time,failingRegions:bad?6:0,essentialFailures:Array(6).fill(bad?3:0),coordination:Array(6).fill(bad?0:1),repairProgress:Array(6).fill(bad?0:1),continuousHours:0};});
 const r=classifyWorld(frames,4,24);assert.equal(r.crossedAt,24);assert.equal(r.recoveredAt,null);assert.equal(r.endStatus,'collapse');
});
test('Replays are deterministic, bins partition the sample and severe outcomes are reachable',()=>{
 const seen=new Set();
 for(const c of Object.values(monthChallenges)){
  const s={...DEFAULTS,...c.settings},a=monthEnsemble(s,c.options,42,32);
  assert.deepEqual(a,monthEnsemble(s,c.options,42,32));
  assert.equal(Object.values(a.buckets).reduce((x,y)=>x+y,0),32);
  assert.equal(a.collapseBins.reduce((x,y)=>x+y,0)+a.noCollapse+a.unknownAfterNuclear,32);
  for(const r of a.runs)seen.add(r.outcome);
 }
 for(const outcome of ['quiet','held','repairing','rebuilt','collapse','nuclear'])assert.ok(seen.has(outcome),outcome);
});
test('Nuclear use stops release history and masks the unmodelled aftermath',()=>{
 const c=monthChallenges.brink,r=simulateMonth({...DEFAULTS,...c.settings},c.options,42);
 assert.equal(r.outcome,'nuclear');assert.equal(r.careGap,null);
 assert.ok(r.releases.every(e=>e.hour<=r.nuclearAt));assert.ok(r.timeline.every(e=>e.hour<=r.nuclearAt));
});
test('Month settings round-trip and reject invalid assumptions',()=>{
 assert.deepEqual(validateMonth(JSON.parse(JSON.stringify(MONTH_DEFAULTS))),MONTH_DEFAULTS);
 assert.deepEqual(validateMonth(undefined),MONTH_DEFAULTS);
 for(const patch of [{checkedFault:101},{checkedFault:20,uncheckedFault:10},{releasesPerDay:NaN},{releasesPerDay:5},{uncheckedFault:-1}])assert.throws(()=>validateMonth({...MONTH_DEFAULTS,...patch}));
});
