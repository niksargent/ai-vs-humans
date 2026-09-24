import test from 'node:test';
import assert from 'node:assert/strict';
import {cueForWorldChange} from '../dist/src/sound.js';

function world({nuclear=false,collapse=false,services={}}={}){
  return {
    nuclear,
    civilisation:{crossedAt:collapse?24:null},
    nodes:Object.fromEntries(Object.entries(services).map(([id,status])=>[id,{status}])),
  };
}

test('sound follows consequential world transitions rather than a render',()=>{
  const safe=world({services:{comms:'safe',hospital:'safe'}});
  const warning=world({services:{comms:'harm',hospital:'safe'}});
  const crisis=world({collapse:true,services:{comms:'harm',hospital:'harm'}});
  assert.equal(cueForWorldChange(safe,warning),'warning');
  assert.equal(cueForWorldChange(warning,crisis),'crisis');
  assert.equal(cueForWorldChange(crisis,warning),'resolve');
  assert.equal(cueForWorldChange(warning,safe),'resolve');
  assert.equal(cueForWorldChange(safe,safe,null),null);
  assert.equal(cueForWorldChange(safe,safe),'switch');
});

test('nuclear use takes priority over service alarms',()=>{
  const safe=world({services:{comms:'safe'}});
  const nuclear=world({nuclear:true,services:{comms:'harm'}});
  assert.equal(cueForWorldChange(safe,nuclear),'crisis');
  assert.equal(cueForWorldChange(nuclear,safe),'resolve');
});
