import {writeFile} from 'node:fs/promises';
import {DEFAULTS,MODEL_VERSION,simulate} from '../dist/src/model.js';
import {regionalSpread} from '../dist/src/spread.js';
const footprints=[10,30,50,70,90].map(connectedness=>{
 const counts=Array(6).fill(0);
 for(let seed=0;seed<1000;seed++)counts[regionalSpread(connectedness,seed).count-1]++;
 return {connectedness,replays:1000,regionsHitOneThroughSix:counts};
});
const outcomes=[];
for(const connectedness of [30,50,80])for(const fragile of [false,true]){
 const settings={...DEFAULTS,connectedness,aiAdvice:false,...(fragile?{crews:25,repairBackup:24,foodStores:48}:{})};
 const counts={functioning:0,recovered:0,disrupted:0,collapse:0};
 for(let seed=0;seed<128;seed++)counts[simulate(settings,seed).civilisation.endStatus]++;
 outcomes.push({connectedness,fragile,replays:128,counts});
}
const report={model:MODEL_VERSION,scope:'Illustrative sampled model, not measured disaster odds. Outcome audit disables military advice to isolate regional service effects. Seeds start at zero.',footprints,outcomes};
await writeFile('docs/CONNECTEDNESS_AUDIT.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
