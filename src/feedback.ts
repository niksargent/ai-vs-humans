import type {Result} from './model.js';

export const controlColours:Record<string,string>={capability:'#86baff',authority:'#bf9aff',tension:'#ff9167',verification:'#ffce69',fallback:'#6ff0db',reserves:'#8ee798',reach:'#86baff',foodBackup:'#f3c77a',repair:'#6ff0db',decisionTime:'#ffce69',independent:'#ffce69',sharedProvider:'#86baff',aiAdvice:'#ff9167',faultyChange:'#bf9aff',humanApproval:'#bf9aff'};
Object.assign(controlColours,{crews:'#6ff0db',repairBackup:'#6ff0db',repairSupplies:'#f3c77a',supplyDelivery:'#f3c77a',foodStores:'#f3c77a'});
Object.assign(controlColours,{regionDifference:'#86baff',aidStrength:'#86baff',aidDelay:'#86baff',aidBudget:'#86baff',responseBackup:'#ffce69',collapseRegions:'#ff9167',collapseDays:'#ff9167'});
export const nodeControls:Record<string,string>={ai:'capability',access:'authority',military:'tension',checks:'verification',fallback:'fallback',hospital:'reserves',crews:'crews',supplies:'repairSupplies'};
export function differences(before:Result,after:Result){
  const metrics:[string,string|number,string|number,string][]=[
    ['Care below demand',before.recoveryModel.healthcareGap,after.recoveryModel.healthcareGap,'h'],
    ['Control lost',before.pathways.controlLost?'Yes':'No',after.pathways.controlLost?'Yes':'No',''],
    ['Unchecked releases',Math.floor(before.pathways.research.unchecked),Math.floor(after.pathways.research.unchecked),''],
    ['Collapse threshold crossed',before.civilisation.crossedAt!==null?'Yes':'No',after.civilisation.crossedAt!==null?'Yes':'No',''],
    ['Regions failing together',before.civilisation.peakRegions,after.civilisation.peakRegions,''],
    ['Regions hit',before.affectedRegions,after.affectedRegions,''],
    ['Hospital power gap',before.hospitalGap,after.hospitalGap,'h'],
    ['Food refrigeration gap',before.foodGap,after.foodGap,'h'],
    ['Emergency disruption',before.emergencyGap,after.emergencyGap,'h'],
    ['Network outage',before.recoveryModel.completed?before.restoreHours+'h':'30 days+',after.recoveryModel.completed?after.restoreHours+'h':'30 days+',''],
    ['Crisis escalates',before.escalation?'Yes':'No',after.escalation?'Yes':'No',''],
    ['Nuclear use',before.nuclear?'Yes':'No',after.nuclear?'Yes':'No',''],
  ];
  return metrics.filter(([,a,b])=>a!==b).map(([label,a,b,unit])=>({label,before:`${a}${unit}`,after:`${b}${unit}`,improved:typeof a==='number'&&typeof b==='number'?b<a:b==='No'||label==='Network outage'&&after.recoveryModel.completed&&(!before.recoveryModel.completed||after.restoreHours<before.restoreHours)}));
}
export function changedNodes(before:Result,after:Result){
  return Object.keys(after.nodes).filter(id=>before.nodes[id]?.label!==after.nodes[id].label||before.nodes[id]?.status!==after.nodes[id].status);
}

Object.assign(controlColours,{researchEnabled:"#86baff",waitForChecks:"#ffce69",independentStop:"#6ff0db",screening:"#8ee798",trustedChannels:"#ffce69",paymentFallback:"#f3c77a",transportFallback:"#f3c77a"});
