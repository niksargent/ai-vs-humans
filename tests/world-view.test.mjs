import {test} from 'node:test';
import assert from 'node:assert/strict';
import {worldNodes,WORLD,primaryEdges,connection} from '../dist/src/world-view.js';
import {DEFAULTS,simulate} from '../dist/src/model.js';

test('every visible module resolves to a model state and occupies its own place',()=>{
 const result=simulate(DEFAULTS);
 assert.equal(new Set(worldNodes.map(n=>n.id)).size,worldNodes.length);
 for(const a of worldNodes){
  assert.ok(result.nodes[a.id],a.id);
  assert.ok(a.x>=0 && a.y>=0 && a.x+210<=WORLD.width && a.y+112<=WORLD.height,a.id);
  for(const b of worldNodes){
   if(a.id===b.id)continue;
   assert.ok(a.x+210<=b.x || b.x+210<=a.x || a.y+112<=b.y || b.y+112<=a.y,`${a.id} overlaps ${b.id}`);
  }
 }
});
test('overview and revealed causal links have finite curve endpoints',()=>{
 const result=simulate(DEFAULTS),ids=new Set(worldNodes.map(n=>n.id));
 const edges=[...primaryEdges,...worldNodes.flatMap(n=>result.nodes[n.id].parents.filter(id=>ids.has(id)).map(id=>[id,n.id]))];
 for(const [a,b] of edges){
  assert.ok(ids.has(a)&&ids.has(b));
  assert.match(connection(a,b),/^M[\d. -]+ C/);
  assert.doesNotMatch(connection(a,b),/NaN|undefined/);
 }
});
