import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate,DEFAULTS} from '../dist/src/model.js';
import {freshContinuation,validateContinuation,evaluateContinuation,gateIds} from '../dist/src/continuation.js';
import {continuationPanel} from '../dist/src/continuation-ui.js';
import {pathwayPresets} from '../dist/src/pathway-ui.js';
const health=simulate({...DEFAULTS,...pathwayPresets.health});
const hostile=simulate({...DEFAULTS,...pathwayPresets.control});
test('A service outage alone does not establish either extinction continuation',()=>{
  const r=simulate({...DEFAULTS,connectedness:0,fallback:100}),l=freshContinuation();
  assert.equal(evaluateContinuation(r,l).state,'not-started');l.route='hostile';
  assert.equal(evaluateContinuation(r,l).state,'not-started');
});
test('Collapse and nuclear use open questions, never fill in survival assumptions',()=>{
  const l=freshContinuation(),r=simulate({...DEFAULTS,connectedness:100,crews:25,repairBackup:24,foodStores:48});
  assert.notEqual(r.civilisation.crossedAt,null);assert.equal(evaluateContinuation(r,l).state,'unresolved');
  assert.equal(evaluateContinuation({...r,nuclear:true},l).unknowns.length,4);
});
test('Every extra condition remains independently unknown until assumed',()=>{
  for(const route of ['physical','hostile']){
    const l=freshContinuation();l.route=route;const r=route==='physical'?health:hostile;
    assert.equal(evaluateContinuation(r,l).unknowns.length,4);
    for(const id of gateIds){l[route][id]='yes';assert.equal(evaluateContinuation(r,l).extinction,'not-resolved');}
    assert.equal(evaluateContinuation(r,l).state,'assumed');
    for(const id of gateIds){l[route][id]='no';assert.equal(evaluateContinuation(r,l).state,'interrupted');l[route][id]='yes';}
  }
});
test('Benign loss of control cannot initiate the hostile continuation',()=>{
  const r=simulate({...DEFAULTS,...pathwayPresets.control,harmfulGoal:false}),l=freshContinuation();l.route='hostile';
  for(const id of gateIds)l.hostile[id]='yes';
  assert.equal(r.pathways.controlLost,true);assert.equal(evaluateContinuation(r,l).state,'not-started');
});
test('Assumptions do not change model results or transfer between routes',()=>{
  const before=JSON.stringify(health),l=freshContinuation();l.physical.reach='no';
  assert.equal(evaluateContinuation(health,l).state,'interrupted');
  l.route='hostile';assert.equal(evaluateContinuation(hostile,l).state,'unresolved');
  assert.equal(JSON.stringify(health),before);assert.deepEqual(simulate(health.settings),health);
});
test('Saved assumptions round-trip; missing old data resets safely; invalid data is rejected',()=>{
  const l=freshContinuation();l.route='hostile';l.hostile.recovery='no';
  assert.deepEqual(validateContinuation(JSON.parse(JSON.stringify(l))),l);
  assert.deepEqual(validateContinuation(undefined),freshContinuation());
  for(const raw of [null,{},false,{...l,route:'other'},{...l,physical:{...l.physical,power:true}},{...l,hostile:null}])assert.throws(()=>validateContinuation(raw));
});
test('The all-assumed view still names the unresolved extinction boundary',()=>{
  const l=freshContinuation();for(const id of gateIds)l.physical[id]='yes';
  const html=continuationPanel(health,l);assert.ok(html.includes('No refuge remains in your story'));
  assert.ok(html.includes('not proof that these events would happen or that every person would die.'));assert.ok(!html.includes('extinction probability'));
});

test('Survival entry provides a starting action, not choices that do nothing',()=>{
 const html=continuationPanel(simulate({...DEFAULTS,authority:0}),freshContinuation());
 assert.ok(html.includes('Load a collapse scenario'));
 assert.ok(!html.includes('data-survival-answer'));
 assert.ok(!html.includes('<select'));
});

test('A surviving refuge changes the story and canvas without changing the world',async()=>{
 const {survivalCanvas,threatReadouts}=await import('../dist/src/survival-ui.js');
 const lens=freshContinuation(),before=JSON.stringify(health);
 for(const id of gateIds)lens.physical[id]='yes';
 assert.ok(threatReadouts(health,lens).includes('No refuge in your story'));
 lens.physical.reach='no';
 assert.ok(continuationPanel(health,lens,'reach').includes('A way to survive remains'));
 assert.ok(survivalCanvas(health,lens,'reach').includes('HOLDS IN YOUR STORY'));
 assert.ok(threatReadouts(health,lens).includes('Your what-if story'));
 assert.equal(JSON.stringify(health),before);
});
