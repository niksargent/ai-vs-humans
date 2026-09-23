import type {Settings,Result} from './model.js';
export const settingNames:Partial<Record<keyof Settings,string>>={verification:'Warning check strength',decisionTime:'Time to check a warning',independent:'Separate warning-check channel',reserves:'Hospital backup',repairBackup:'Repair-tool backup',repairSupplies:'Repair materials',supplyDelivery:'Independent deliveries',connectedness:'Regional connectedness',aidStrength:'Help from neighbours',aidBudget:'Neighbour relief stock',independentStop:'Disconnect the agent',screening:'Health-threat screening',trustedChannels:'Trusted emergency messages',repairAssistance:'AI repair advice'};
export function settingValue(key:keyof Settings,value:number|boolean){return typeof value==='boolean'?(value?'On':'Off'):`${value}${['reserves','repairBackup'].includes(key)?' hours':key==='decisionTime'?' minutes':['verification','supplyDelivery','aidStrength','trustedChannels'].includes(key)?'%':''}`;}
export function protections(s:Settings){return [
 {id:'checks',title:'Check the attack warning',patch:{verification:100,decisionTime:120,independent:true}},
 {id:'hospital',title:'Keep hospital equipment powered',patch:{reserves:720}},
 {id:'repair',title:'Give repair crews power and supplies',patch:{repairBackup:720,repairSupplies:168,supplyDelivery:100}},
 {id:'refuges',title:'Separate systems; strengthen relief',patch:{connectedness:Math.min(s.connectedness,35),aidStrength:100,aidBudget:168}},
 {id:'assistance',title:'Let AI help crews find the fault',patch:{repairAssistance:true}},
 ...(s.agentEnabled?[{id:'isolation',title:'Disconnect the harmful agent',patch:{independentStop:true}}]:[]),
 ...(s.healthChallenge?[{id:'screening',title:'Stop the health threat at screening',patch:{screening:true}}]:[]),
 ...(s.informationCampaign?[{id:'trust',title:'Restore trusted emergency messages',patch:{trustedChannels:100}}]:[])
 ] as {id:string;title:string;patch:Partial<Settings>}[];}
export function settingChanges(s:Settings,patch:Partial<Settings>){return (Object.keys(patch) as (keyof Settings)[]).filter(k=>s[k]!==patch[k]).map(key=>({key,name:settingNames[key]||key,before:s[key],after:patch[key]!}));}
export function protectionEffect(before:Result,after:Result){
 const changes:string[]=[];
 if(before.affectedRegions!==after.affectedRegions)changes.push(`Regions hit: ${before.affectedRegions} → ${after.affectedRegions} of 6.`);
 if(before.recoveryModel.healthcareGap!==after.recoveryModel.healthcareGap)changes.push(`Region 1 care shortfall: ${before.recoveryModel.healthcareGap} → ${after.recoveryModel.healthcareGap} hours.`);
 if(before.restoreHours!==after.restoreHours||before.recoveryModel.completed!==after.recoveryModel.completed)changes.push(`Network repair: ${before.recoveryModel.completed?before.restoreHours+' hours':'unfinished at day 30'} → ${after.recoveryModel.completed?after.restoreHours+' hours':'unfinished at day 30'}.`);
 if(before.escalation!==after.escalation)changes.push(after.escalation?'The warning now starts a conflict.':'The warning no longer starts a conflict.');
 if(before.civilisation.endStatus!==after.civilisation.endStatus)changes.push(`World outcome: ${before.nodes.collapse.label} → ${after.nodes.collapse.label}.`);
 const otherCare=after.civilisation.regions.filter((r,i)=>i>0&&r.recovery.healthcareGap!==before.civilisation.regions[i].recovery.healthcareGap).map(r=>r.name);if(otherCare.length)changes.push(`Care also changes in ${otherCare.join(', ')}.`);
 if(before.civilisation.aidReceived!==after.civilisation.aidReceived)changes.push(`Help delivered: ${Math.round(before.civilisation.aidReceived)} → ${Math.round(after.civilisation.aidReceived)} relief packages.`);
 if(before.pathways.controlLost&&!after.pathways.controlLost)changes.push('People can stop the agent.');
 return changes.length?changes.join(' '):!after.incident&&!after.recoveryModel.healthcareGap?'Your services already hold in this replay. The extra protection is ready; Replay this world to test it against different random events.':after.pathways.harmfulOperation&&after.pathways.controlLost?'Settings changed, but the agent is still undoing repairs. Disconnect it to let the crews make progress.':'Settings changed, but the main care, repair-time and world-outcome results are unchanged in this scenario. Open the changed settings to investigate further.';
}
