import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DEFAULTS,simulate} from '../dist/src/model.js';
import {worldNodes} from '../dist/src/world-view.js';
import {serviceSeverity} from '../dist/src/module-readouts.js';
import {monthPanel} from '../dist/src/month-ui.js';
const worlds=JSON.parse(fs.readFileSync(new URL('./fixtures/module-scenarios.json',import.meta.url)));
const results=new Map(worlds.map(w=>[w.name,simulate(w.settings,w.seed)]));
for(const node of worldNodes)for(const colour of ['safe','exposed','harm'])test(`${node.title} has a tested ${colour} world`,()=>{
 const w=worlds.find(w=>w.expected[node.id]===colour);assert.ok(w,`Missing ${colour} scenario for ${node.id}`);
 const n=results.get(w.name).nodes[node.id];assert.equal(n.status,colour);assert.ok(n.label&&n.reason&&n.rule);
});
for(const w of worlds)test(`Scenario: ${w.name} — lamps and outcome remain consistent`,()=>{
 const r=results.get(w.name);assert.deepEqual(Object.fromEntries(Object.entries(r.nodes).map(([id,n])=>[id,n.status])),w.expected);
 assert.deepEqual({faults:r.updates.releases.filter(x=>x.fault).length,nuclear:r.nuclear,regions:r.affectedRegions,collapse:r.nuclear?null:r.civilisation.crossedAt!==null},w.outcomes);
});
test('Brief deep failures and sustained partial service are amber; sustained deep failure is red',()=>{
 assert.equal(serviceSeverity(Array(720).fill(1)).status,'safe');
 assert.equal(serviceSeverity([...Array(23).fill(0),...Array(697).fill(1)]).status,'exposed');
 assert.equal(serviceSeverity(Array(720).fill(.5)).status,'exposed');
 assert.equal(serviceSeverity([...Array(24).fill(.49),...Array(696).fill(1)]).status,'harm');
});
test('Offline payment and transport protection span all three colours without changing faults',()=>{
 const baseline={...DEFAULTS,aiAdvice:false,sharedPayments:true,sharedTransport:true,fallback:0};
 let faults;
 for(const [backup,expected] of [[0,'harm'],[50,'exposed'],[100,'safe']]){
  const r=simulate({...baseline,paymentFallback:backup,transportFallback:backup});
  for(const id of ['payments','transport'])assert.equal(r.nodes[id].status,expected);
  const ids=r.updates.releases.filter(x=>x.fault).map(x=>x.id);if(faults)assert.deepEqual(ids,faults);faults=ids;
 }
});
test('Power can stay healthy, briefly fail, or remain severely disrupted',()=>{
 assert.equal(results.get('No release permission').nodes.power.status,'safe');
 assert.equal(results.get('Small fault, fast repairs').nodes.power.status,'exposed');
 assert.equal(results.get('Global breakdown').nodes.power.status,'harm');
});
test('The nuclear chain is reachable, and checking warnings blocks it with the same seed',()=>{
 const r=results.get('Nuclear brink');assert.equal(r.nuclear,true);assert.equal(r.nodes.recovery.status,'unknown');
 const protectedWorld=simulate({...r.settings,verification:100,decisionTime:120,independent:true},r.seed);
 assert.equal(protectedWorld.nuclear,false);assert.equal(protectedWorld.escalation,false);
});
test('Replay explorer explains fixed settings and contains no settings sliders or scenario loaders',()=>{
 const html=monthPanel(DEFAULTS,{},null,0,'');
 assert.match(html,/Same world settings. Different random events/);
 assert.doesNotMatch(html,/<input|data-month-setting|data-month-challenge/);
});
