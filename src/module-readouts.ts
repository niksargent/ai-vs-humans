import type {Result,Status} from './model.js';
// Service colours describe the observed month. Red needs sustained severe disruption,
// rather than any small departure from perfect service.
export function serviceSeverity(values:number[]):{status:Status;hours:number;low:number;severeHours:number}{
 let run=0,severeHours=0;for(const value of values){run=value<.5?run+1:0;severeHours=Math.max(severeHours,run);}
 const hours=values.filter(v=>v<.999).length,low=Math.min(1,...values);
 return {status:!hours?'safe':severeHours>=24?'harm':'exposed',hours,low,severeHours};
}
export function harmoniseReadouts(r:Result){
 const {nodes:n,settings:s,updates:u,pathways:p,recoveryModel:m,civilisation:c}=r;
 const series={comms:'communications',power:'power',hospital:'healthcare',payments:'payments',transport:'transport',food:'foodSupply',emergency:'emergency',crews:'crews'} as const;
 const names={comms:'Calls',power:'Power',hospital:'Care',payments:'Payments',transport:'Transport',food:'Food supply',emergency:'Emergency help',crews:'Repair crews'};
 for(const [id,key] of Object.entries(series) as [keyof typeof series,typeof series[keyof typeof series]][]){
  const state=serviceSeverity(m.frames.filter(f=>f.time<720).map(f=>f[key]));
  // Food refrigeration matters even while stored food protects people.
  if(id==='food'&&state.status==='safe'&&r.foodGap>0)state.status='exposed';
  n[id].status=state.status;
  n[id].label=state.status==='safe'?`${names[id]} kept working`:id==='food'&&!state.hours?'Food protected · fridges fail':`${Math.round(state.low*100)}% at worst · ${state.hours}h strained`;
  n[id].reason=`${state.status==='safe'?`Full capacity remains available throughout the month.`:state.hours?`Available capacity drops below full service for ${state.hours} hours, reaching ${Math.round(state.low*100)}% at the lowest point.`:'Stored food protects people even though refrigeration fails.'} `+n[id].reason;
  n[id].rule+=' Lamp: green = full service; amber = partial or brief disruption; red = at least 24 continuous hours below half capacity. Food is amber when refrigeration fails but food support holds. Region 1, observed month; not a probability.';
 }
 if(n.governance.status==='safe')n.governance.label='Response teams stay coordinated';
 n.ai.status=s.capability===0?'safe':r.incident?'harm':'exposed';
 n.ai.label=s.capability===0?'Advice stays with people':r.incident?'Abilities used in disruption':'Can act if permitted';
 n.ai.rule+=' Lamp describes ability in this world: advice-only is green, operational capability is amber, capability involved in disruption is red. Intelligence alone is not harmful intent.';
 n.access.status=!(s.authority===2||s.authority===1&&s.humanApproval)?'safe':r.incident?'harm':'exposed';
 n.access.label=n.access.status==='harm'?'Harmful actions permitted':n.access.status==='exposed'?'Live changes allowed':'Live changes blocked';
 n.checks.status=!r.warning||r.verified?'safe':r.escalation?'harm':'exposed';
 n.warning.status=!r.warning||r.verified?'safe':r.escalation?'harm':'exposed';
 n.military.status=r.escalation?'harm':r.warning&&!r.verified?'exposed':'safe';
 if(n.military.status==='exposed')n.military.label='False warning · no escalation';
 n.fallback.status=s.fallback===100?'safe':s.fallback>0?'exposed':'harm';
 n.control.status=p.controlLost?'harm':p.agentDeployed&&p.harmfulOperation&&s.stopDelay>0?'exposed':'safe';
 if(n.control.status==='exposed')n.control.label=`Harm before stop · ${s.stopDelay}h`;
 n.information.status=!p.misinformation?'safe':serviceSeverity(p.frames.slice(0,720).map(f=>f.trust)).status;
 if(!p.healthIntroduced)n.bio.status='safe';
 if(!r.incident){n.repair.status='safe';n.supplies.status='safe';}
 if(!u.made)n.development.status='safe';
 n.aid.status=!r.incident?'safe':c.aidReceived>0?(m.completed?'safe':'exposed'):c.independentRegions&&s.aidStrength>0&&s.aidBudget>0?'exposed':'harm';
 n.aid.label=!r.incident?'No relief needed':c.aidReceived?`${Math.round(c.aidReceived)} units arrived${m.completed?'':' · repairs continue'}`:n.aid.status==='harm'?'No relief reaches repairs':'Relief has not arrived';
}
