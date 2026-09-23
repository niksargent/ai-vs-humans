import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,controls,simulate} from '../dist/src/model.js';
import {updateSchedule,releaseExplanation} from '../dist/src/updates.js';
import {simulateCivilisation,REGION_PROFILES} from '../dist/src/civilisation.js';
import {pathwayPresets} from '../dist/src/pathway-ui.js';
import {primaryEdges} from '../dist/src/world-view.js';
const s={...DEFAULTS,aiAdvice:false,researchSpeed:100,computeCapacity:100,experimentCapacity:100,mistakeRate:100};

test('Zero tests plus release hold queues all updates; releasing untested updates exposes all faults',()=>{
 const held=updateSchedule({...s,waitForChecks:true,evaluationCapacity:0});
 assert.equal(held.made,600);assert.equal(held.waiting,600);assert.equal(held.releases.length,0);
 assert.match(releaseExplanation({...s,waitForChecks:true,evaluationCapacity:0},held),/testing capacity is zero/);
 const released=updateSchedule({...s,waitForChecks:false,evaluationCapacity:0});
 assert.equal(released.waiting,0);assert.equal(released.releases.length,600);assert.ok(released.releases.every(x=>x.fault&&!x.checked));
});
test('Full testing capacity covers full production; perfect tests withhold every mistake',()=>{
 const r=updateSchedule({...s,evaluationCapacity:100,checkEffectiveness:100,waitForChecks:true});
 assert.equal(r.checked,600);assert.equal(r.caught,600);assert.equal(r.waiting,0);assert.equal(r.releases.length,0);
});
test('Requiring a test does not promise the test will catch the fault',()=>{
 const r=updateSchedule({...s,evaluationCapacity:100,checkEffectiveness:0,waitForChecks:true});
 assert.equal(r.checked,600);assert.equal(r.caught,0);assert.equal(r.releases.length,600);assert.ok(r.releases.every(x=>x.checked&&x.fault));
});
test('With the same tested projects, stronger detection never increases escaped faults',()=>{
 let previous=Infinity;
 for(let strength=0;strength<=100;strength+=5){const r=updateSchedule({...s,mistakeRate:40,evaluationCapacity:100,waitForChecks:true,checkEffectiveness:strength});const faults=r.releases.filter(x=>x.fault).length;assert.ok(faults<=previous);previous=faults;}
});
test('All produced work is accounted for when permission blocks release',()=>{
 const r=updateSchedule({...s,authority:0,waitForChecks:true,evaluationCapacity:5,checkEffectiveness:50});
 assert.equal(r.releases.length,0);assert.equal(r.made,r.caught+r.ready+r.waiting);
 assert.match(releaseExplanation({...s,authority:0},r),/await permission/);
});
test('A late first failure cannot quietly build an unlimited repair stockpile',()=>{
 const r=simulateCivilisation({...DEFAULTS,repairSupplies:12,aidStrength:0},true,true,undefined,[600]).regions[0].recovery;
 assert.ok(r.frames.every(f=>f.parts<=12+.001));assert.equal(r.frames[599].parts,12);
 assert.ok(Math.abs(12+r.suppliesDelivered-r.suppliesUsed-r.final.parts)<.002);
});
test('Regional differences vary distribution without adding total reserves',()=>{
 assert.ok(Math.abs(REGION_PROFILES.reduce((a,b)=>a+b,0)-6)<1e-9);
 for(const regionDifference of [0,50,100]){const r=simulate({...DEFAULTS,regionDifference});for(const key of ['reserves','repairSupplies','foodStores'])assert.ok(Math.abs(r.civilisation.regions.reduce((sum,x)=>sum+x.settings[key],0)-6*DEFAULTS[key])<1e-7);}
});
test('Maximum hospital surge can cover maximum selected extra demand',()=>{
 const r=simulate({...DEFAULTS,...pathwayPresets.health,healthDemand:controls.healthDemand.max,healthSurge:controls.healthSurge.max});
 assert.equal(r.recoveryModel.healthcareGap,0);
});
test('Development is always wired into capability and release permission',()=>{
 const r=simulate(DEFAULTS);
 for(const [from,to] of [['ai','development'],['development','access']]){assert.ok(primaryEdges.some(([a,b])=>a===from&&b===to));assert.ok(r.nodes[to].parents.includes(from));}
});
test('A faster stop order only helps when the agent can actually be stopped',()=>{
 const world={...DEFAULTS,...pathwayPresets.control,aiAdvice:false,independentStop:true};
 assert.equal(simulate({...world,stopDelay:0}).incident,false);
 assert.ok(simulate({...world,stopDelay:168}).recoveryModel.healthcareGap>0);
 assert.equal(simulate({...world,independentStop:false,stopDelay:0}).pathways.controlLost,true);
});
