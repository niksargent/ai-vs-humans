import {DEFAULTS,simulate} from '../dist/src/model.js';
import {pathwayPresets} from '../dist/src/pathway-ui.js';
export const scenarios=[
 ['No release permission',{authority:0}],
 ['Food stores protect people',{foodBackup:0,foodStores:720}],
 ['Advice only',{capability:0,researchSpeed:0}],
 ['No new projects',{researchSpeed:0}],
 ['Repeated faults, military advice off',{}],
 ['Perfect testing',{waitForChecks:true,evaluationCapacity:100,checkEffectiveness:100}],
 ['Test queue',{waitForChecks:true,evaluationCapacity:0}],
 ['Small fault, fast repairs',{researchSpeed:1/6,mistakeRate:100,checkEffectiveness:0,repair:12,fallback:50}],
 ['Half capacity fallback',{fallback:50,sharedPayments:true,sharedTransport:true,paymentFallback:50,transportFallback:50}],
 ['Independent systems',{fallback:100,sharedPayments:true,sharedTransport:true,paymentFallback:100,transportFallback:100}],
 ['Payments and transport fail',{...pathwayPresets.deliveries,fallback:0}],
 ['No crews or deliveries',{crews:0,repairSupplies:0,supplyDelivery:0,aidStrength:0,fallback:0}],
 ['Thin crews',{crews:50}],
 ['Stores run dry',{repairSupplies:0,supplyDelivery:5,aidStrength:0}],
 ['Stopped agent',{...pathwayPresets.control,independentStop:true,stopDelay:24}],
 ['Unstoppable agent',{...pathwayPresets.control}],
 ['Moderate care surge',{...pathwayPresets.health,healthDemand:100,healthSurge:25}],
 ['Severe care surge',{...pathwayPresets.health}],
 ['False messages, some trusted voices',{...pathwayPresets.information,trustedChannels:50}],
 ['False messages overwhelm response',{...pathwayPresets.information,trustedChannels:0,informationReach:100}],
 ['Warning checked',{verification:100,decisionTime:120}],
 ['Rivals do not escalate',{verification:0,tension:0}],
 ['Nuclear brink',{verification:0,tension:100,researchSpeed:100,mistakeRate:100}],
 ['Global breakdown',{fallback:0,connectedness:100,reserves:0,foodStores:0,foodBackup:0,responseBackup:0,repairBackup:0,repairSupplies:0,supplyDelivery:0,aidStrength:0}],
 ['Local breakdown',{fallback:0,connectedness:0,reserves:0,foodStores:0,foodBackup:0,responseBackup:0,repairBackup:0,repairSupplies:0,supplyDelivery:0,aidStrength:0}],
 ['Relief gets through',{researchSpeed:1/6,mistakeRate:100,checkEffectiveness:0,connectedness:0,repair:168,aidStrength:100,aidDelay:12,aidBudget:168,fallback:50}],
].map(([name,patch])=>({name,settings:{...DEFAULTS,aiAdvice:false,...patch},seed:42}));
// Military scenarios deliberately enable the warning route.
for(const s of scenarios)if(/Warning|Rivals|Nuclear/.test(s.name))s.settings.aiAdvice=true;
if(process.argv[1]?.endsWith('scenario-worlds.mjs')){
 const found={};for(const s of scenarios){const r=simulate(s.settings,s.seed);for(const [id,n] of Object.entries(r.nodes)){(found[id]??={})[n.status]??=s.name;}}
 console.log(JSON.stringify(found,null,2));
}
