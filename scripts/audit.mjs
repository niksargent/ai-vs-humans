import {writeFile} from 'node:fs/promises';
import {DEFAULTS,simulate,MODEL_VERSION} from '../dist/src/model.js';
import {pathwayPresets} from '../dist/src/pathway-ui.js';
const summary=s=>{const r=simulate({...DEFAULTS,...s},42);return {repairHours:r.recoveryModel.restoredAt,careShortfallHours:r.recoveryModel.healthcareGap,foodShortfallHours:r.recoveryModel.foodShortageHours,collapseAt:r.civilisation.crossedAt,peakRegions:r.civilisation.peakRegions,escalation:r.escalation};};
const fragile={connectedness:100,crews:25,repairBackup:24,foodStores:48};
const output={model:MODEL_VERSION,seed:42,scope:'Fixed introduced incidents; sensitivity checks, not frequency estimates.',presets:Object.fromEntries(Object.entries(pathwayPresets).map(([k,s])=>[k,summary(s)])),resilience:[0,50,100].map(fallback=>({fallback,...summary({...fragile,fallback})})),collapseDefinition:[1,7,14,28].map(collapseDays=>({collapseDays,...summary({...fragile,collapseDays})})),research:[0,25,50,75,100].map(researchSpeed=>{const r=simulate({...DEFAULTS,...pathwayPresets.research,researchSpeed});return {researchSpeed,made:r.pathways.research.made,checked:r.pathways.research.checked,unchecked:r.pathways.research.unchecked,incident:r.incident};})};
await writeFile('docs/STEP_5_SENSITIVITY.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
