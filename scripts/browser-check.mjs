import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import os from 'node:os';
import {DEFAULTS,simulate} from '../dist/src/model.js';
const initial=simulate(DEFAULTS);
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
await page.goto('http://127.0.0.1:4173');
await page.screenshot({path:'test-results/whole-world.png',fullPage:true});
const environment={browser:browser.version(),platform:os.platform(),cpu:os.cpus()[0]?.model};
const timing=await page.evaluate(async()=>{
  const {DEFAULTS,simulate,ensemble}=await import('/src/model.js');
  let start=performance.now();for(let i=0;i<100;i++)simulate(DEFAULTS,i);const caseMs=(performance.now()-start)/100;
  start=performance.now();ensemble(DEFAULTS,42,256);return {caseMs,ensemble256Ms:performance.now()-start};
});
const checks=[];
const pass=label=>{checks.push(label);console.log('PASS',label);};
assert.equal(await page.locator('[data-node]').count(),24);
assert.match(await page.locator('#readout').innerText(),new RegExp(initial.hospitalGap+' hours'));
pass('Whole-world map and calculated initial outcomes');

await page.locator('#compare-checks').click();
assert.match(await page.locator('#readout').innerText(),/Yes → No/);
await page.locator('.model-details summary').click();
assert.match(await page.locator('#readout').innerText(),new RegExp(initial.hospitalGap+'h → '+initial.hospitalGap+'h'));
await page.screenshot({path:'test-results/paired-comparison.png',fullPage:true});
pass('Stronger checks interrupt escalation without changing hospital damage');
await page.locator('#undo-button').click();
assert.equal(await page.locator('[data-key="verification"]').getAttribute('aria-valuenow'),'35');
pass('Undo restores actual parameter state');

await page.locator('[data-key="authority"]').focus();
await page.keyboard.press('Home');
assert.match(await page.locator('[data-node="comms"]').textContent(),/held back/);
assert.match(await page.locator('#readout').innerText(),/Critical services sustained/);
pass('Keyboard control blocks direct execution and both downstream branches');

await page.locator('#reset-button').click();
const dial=await page.locator('[data-key="reserves"]').boundingBox();
await page.mouse.move(dial.x+dial.width/2,dial.y+dial.height/2);
await page.mouse.down();await page.mouse.move(dial.x+dial.width/2,dial.y-110,{steps:8});await page.mouse.up();
assert.equal(await page.locator('[data-key="reserves"]').getAttribute('aria-valuenow'),'720');
assert.match(await page.locator('#readout').innerText(),/Critical services sustained/);
pass('Vertical pointer dial changes reserve capacity and hospital outcome');

await page.locator('#reset-button').click();
await page.locator('[data-node="comms"]').click();
assert.match(await page.locator('#readout').innerText(),/AI installs a bad update/);
await page.locator('.model-details summary').click();
assert.ok(await page.locator('#readout a[href^="https://"]').count());
pass('Component inspector exposes actual reason, rule and source');
await page.keyboard.press('Escape');
assert.match(await page.locator('#readout').innerText(),/IN THIS CASE/);

await page.locator('#advanced-button').click();
await page.locator('#adv-sharedProvider').uncheck();
await page.locator('#readout [data-panel="outcomes"]').click();
assert.match(await page.locator('[data-node="hospital"]').textContent(),/sustained/);
assert.match(await page.locator('[data-node="military"]').textContent(),/Crisis escalates/);
pass('Shared dependency toggle isolates health without changing the military branch');

const settingsBefore=await page.evaluate(()=>localStorage.getItem('switchboard-v1'));
await page.locator('#explore-menu summary').click();
await page.locator('[data-focus="military"]').click();
assert.equal(await page.locator('#zoom-label').innerText(),'168%');
assert.equal(await page.evaluate(()=>localStorage.getItem('switchboard-v1')),settingsBefore);
await page.screenshot({path:'test-results/military-focus.png',fullPage:true});
await page.locator('#home-view').click();
assert.equal(await page.locator('#zoom-label').innerText(),'100%');
await page.locator('#viewport').focus();await page.keyboard.press('+');
assert.notEqual(await page.locator('#zoom-label').innerText(),'100%');
await page.keyboard.press('Home');
assert.equal(await page.locator('#zoom-label').innerText(),'100%');
pass('Focus and keyboard zoom leave scenario settings unchanged');

await page.locator('#explore-menu summary').click();
await page.locator('[data-mode="conditions"]').click();
assert.match(await page.locator('#readout').innerText(),/POSSIBLE ROUTES/);
assert.match(await page.locator('#case-label').innerText(),/NOT BEEN SAMPLED/);
pass('Conditions view distinguishes enabled routes from event occurrence');
await page.locator('#explore-menu summary').click();
await page.locator('[data-mode="case"]').click();

await page.locator('[data-panel="range"]').click();
await page.waitForFunction(()=>document.querySelectorAll('.hist-row').length===3);
assert.match(await page.locator('#readout').innerText(),/0 \/ 256/);
pass('Worker ensemble updates from the current settings');

await page.locator('#extinction-button').click();
assert.equal(await page.locator('dialog').evaluate(el=>el.open),true);
assert.match(await page.locator('#dialog-body').innerText(),/Extinction is not resolved by this model/);
await page.keyboard.press('Escape');
assert.equal(await page.locator('dialog').evaluate(el=>el.open),false);
pass('Extinction lens states additional requirements and model limits');

await page.locator('#save-button').click();
const download=page.waitForEvent('download');await page.locator('#download-scenario').click();
await (await download).saveAs('test-results/saved-scenario.json');
await page.keyboard.press('Escape');
await page.locator('#reset-button').click();
await page.locator('#save-button').click();
await page.locator('#import-scenario').setInputFiles('test-results/saved-scenario.json');
await page.waitForFunction(()=>!document.querySelector('dialog').open);
assert.match(await page.locator('[data-node="hospital"]').textContent(),/sustained/);
await page.reload();
assert.match(await page.locator('[data-node="hospital"]').textContent(),/sustained/);
pass('Scenario export, import and local persistence preserve model settings');

for(const size of [{width:1280,height:720},{width:1920,height:1080}]){
  await page.setViewportSize(size);await page.locator('#reset-button').click();
  const metrics=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,height:document.documentElement.scrollHeight,controls:document.querySelector('.control-deck').getBoundingClientRect().bottom,world:document.querySelector('.world').getBoundingClientRect().bottom,legend:document.querySelector('.map-bottom').getBoundingClientRect().bottom}));
  assert.equal(metrics.width,size.width);assert.ok(metrics.legend<=metrics.world+1);
  await page.screenshot({path:`test-results/world-${size.width}.png`,fullPage:true});
  console.log('LAYOUT',size,metrics);
}
await page.emulateMedia({reducedMotion:'reduce'});
await page.locator('#trace-button').click();
assert.equal(await page.locator('.wire.active').first().evaluate(el=>getComputedStyle(el).animationName),'none');
pass('Target desktop layouts have no horizontal overflow; reduced motion disables trace animation');
await browser.close();
await writeFile('test-results/browser-errors.json',JSON.stringify(errors,null,2));
await writeFile('test-results/browser-report.json',JSON.stringify({checks,errors,environment,timing},null,2));
console.log('Environment and timing',environment,timing);
assert.deepEqual(errors,[]);
