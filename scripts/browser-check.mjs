// Optional standalone regression runner. During agent work, use the approved browser tools.
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
await mkdir('test-results',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');
 assert.equal(await page.locator('[data-node]').count(),25);
 assert.equal(await page.getByRole('slider').count(),7);
 assert.equal(await page.locator('.journey-rail button').count(),5);
 const stage=name=>page.locator(`.journey-rail [data-stage="${name}"]`).click();
 await stage('damage');
 await page.locator('[data-inspect="hospital"].instrument-readout').click();
 await page.locator('#readout [data-panel="advanced"]').click();
 await page.getByText('Regions, reserves & repairs',{exact:true}).click();
 await page.locator('#readout [data-panel="pathways"]').click();
 await page.locator('#panel-back').click();
 assert.ok(await page.getByText('Regions, reserves & repairs',{exact:true}).evaluate(el=>el.parentElement.open));
 await stage('rescue');
 await page.locator('[data-rescue="checks"]').click();
 assert.equal(await page.locator('[data-key="verification"]').getAttribute('aria-valuenow'),'100');
 await page.locator('#undo-button').click();
 assert.equal(await page.locator('[data-key="verification"]').getAttribute('aria-valuenow'),'35');
 await page.locator('#research-power').click();
 assert.match(await page.locator('#change-text').innerText(),/AI projects running/);
 await page.locator('#undo-button').click();
 await stage('damage');
 await page.locator('#readout [data-panel="range"]').click();
 await page.locator('.hist-row').first().waitFor();
 assert.equal(await page.locator('.hist-row').count(),3);
 await stage('chain');
 await page.locator('#story-next').click();
 assert.match(await page.locator('.story-number').innerText(),/02/);
 await page.locator('[data-density="compact"]').click();
 assert.doesNotMatch(await page.locator('#world-svg').textContent(),/undefined|NaN/);
 await page.locator('[data-density="normal"]').click();
 await page.locator('#desk-close').click();
 assert.ok(await page.locator('#main').evaluate(el=>el.classList.contains('desk-closed')));
 await page.locator('#desk-toggle').click();
 await stage('beyond');
 await page.locator('#readout [data-inspect="extinction"]').click();
 assert.ok(await page.locator('#dialog').evaluate(el=>el.open));
 await page.locator('#dialog-close').click();
 await stage('damage');
 for(const [width,height] of [[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`test-results/machine-${width}.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: navigation, model controls, replay, compact map, survival and responsive layouts');
} finally {await browser.close();}
