import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS} from '../dist/src/model.js';
import {releaseSchedule,simulateMonth,monthEnsemble,MONTH_DEFAULTS,monthChallenges,validateMonth} from '../dist/src/month.js';
import {simulateCivilisation,classifyWorld} from '../dist/src/civilisation.js';
const active={...DEFAULTS,researchEnabled:true};
const schedule=(patch={},options={})=>releaseSchedule({...active,...patch},{...MONTH_DEFAULTS,...options},42);

test('Candidates balance across catches, queues and releases',()=>{
 for(const researchSpeed of [0,5,25,100])for(const evaluationCapacity of [0,25,100])for(const waitForChecks of [false,true]){
  const r=schedule({researchSpeed,evaluationCapacity,waitForChecks,aiAdvice:false});
  assert.equal(r.made,r.waiting+r.ready+r.releases.length+r.caught);
  assert.ok(r.checked<=r.made);assert.ok(r.caught<=r.mistakes);
  assert.ok(r.releases.length<=600);
  if(waitForChecks)assert.ok(r.releases.every(x=>x.checked));
 }
});
test('Zero pace, unavailable computers and absent permission prevent update failures',()=>{
 for(const patch of [{researchSpeed:0},{computeCapacity:0},{experimentCapacity:0},{authority:0},{authority:1,humanApproval:false}])assert.equal(schedule({...patch,mistakeRate:100}).releases.length,0);
 assert.equal(schedule({evaluationCapacity:0,waitForChecks:true}).releases.length,0);
 assert.ok(schedule({evaluationCapacity:0,waitForChecks:false}).releases.length>0);
});
test('Pace spans zero to six hundred produced updates; same project draws survive pace changes',()=>{
 const s={computeCapacity:100,experimentCapacity:100,aiAdvice:false,evaluationCapacity:0,mistakeRate:30};
 const slow=schedule({...s,researchSpeed:5}),fast=schedule({...s,researchSpeed:100});
 assert.equal(slow.made,30);assert.equal(fast.made,600);
 assert.deepEqual(slow.releases.map(x=>x.mistake),fast.releases.slice(0,30).map(x=>x.mistake));
});
test('Mistakes and catching have exact zero and one boundaries',()=>{
 assert.equal(schedule({mistakeRate:0}).releases.filter(e=>e.fault).length,0);
 const r=schedule({mistakeRate:100,checkEffectiveness:100,waitForChecks:true});
 assert.equal(r.releases.length,0);assert.equal(r.caught,r.checked);
 assert.ok(schedule({mistakeRate:100,checkEffectiveness:0}).releases.every(e=>e.fault));
});
test('Board and month agree on every released fault, collapse, care and nuclear outcome',async()=>{
 const {simulate}=await import('../dist/src/model.js');
 for(const patch of [{},{researchSpeed:0},{researchSpeed:100},{waitForChecks:true,checkEffectiveness:100},{tension:100}]){
  const s={...DEFAULTS,...patch},board=simulate(s,42),month=simulateMonth(s,MONTH_DEFAULTS,42);
  assert.deepEqual(board.updates.releases,month.releases);
  assert.equal(board.nuclear,month.nuclearAt!==null);
  if(!board.nuclear){assert.equal(board.civilisation.crossedAt,month.collapseAt);assert.equal(board.hospitalGap,board.recoveryModel.hospitalGap);assert.equal(board.recoveryModel.healthcareGap,month.careGap);}
 }
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
 for(const patch of [{checkedFault:101},{releasesPerDay:NaN},{uncheckedFault:-1}])assert.throws(()=>validateMonth({...MONTH_DEFAULTS,...patch}));
});
