import {freshContinuation,validateContinuation,type Continuation,type Gate,type Route,type Assumption} from './continuation.js';
import {continuationPanel} from './continuation-ui.js';
import {pathwayControls,pathwaysPanel,pathwayPresets,pathwayInterventions} from './pathway-ui.js';
import {controlColours,nodeControls,differences,changedNodes} from './feedback.js';
import {DEFAULTS,MODEL_VERSION,controls,simulate,summariseChange,validateSettings,type Settings,type Result,type NumericKey,type Status} from './model.js';
import {layout,wires,icon,svgDefs,sources} from './diagram.js';

const $=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let settings={...DEFAULTS},seed=42, mode:'case'|'conditions'='case';
let result=simulate(settings,seed), baseline:Result|null=null;
let continuation=freshContinuation();
let panel:'outcomes'|'node'|'advanced'|'compare'|'range'|'story'|'recovery'|'collapse'|'region'|'pathways'='outcomes',selected='';
let storyIndex=0;
let lastBefore:Result|null=null, changed:string[]=[], changeColour='#86baff', feedbackTimer=0;
let viewArea='Whole world';
let regionContext:number|null=null;
let history:{settings:Settings;seed:number;continuation:Continuation}[]=[];
let camera={x:0,y:0,w:1140,h:650};
let worker:Worker|null=null, requestId=0;
let range:{count:number;escalation:number;nuclear:number;health:number}|null=null;
const deckInfo:{key:NumericKey;title:string;question:string;node:string}[]=[
  {key:'capability',title:'AI ABILITIES',question:'What can it operate?',node:'ai'},
  {key:'authority',title:'PERMISSIONS',question:'Can it act without asking?',node:'access'},
  {key:'tension',title:'WORLD TENSION',question:'How close are rivals to conflict?',node:'military'},
  {key:'verification',title:'HUMAN CHECKS',question:'Can we challenge a warning?',node:'checks'},
  {key:'fallback',title:'INDEPENDENCE',question:'Can we operate without it?',node:'fallback'},
  {key:'reserves',title:'HOSPITAL BACKUP',question:'How long can services hold?',node:'hospital'}
];
function description(key:NumericKey):{value:string;unit:string;note:string} {
  switch(key){
    case 'capability':return {value:['Suggest','Configure','Coordinate'][settings.capability],unit:['proposals only','one network','connected services'][settings.capability],note:['Can suggest a change. Cannot execute it.','Can change how calls and messages are routed.','Can run phone networks and power controls.'][settings.capability]};
    case 'authority':return {value:['Advise','Ask first','Act'][settings.authority],unit:['no execution','approval required','without asking'][settings.authority],note:['It can suggest an update, but cannot install it.','A person must approve the proposed change.','It can install an update while people use the system.'][settings.authority]};
    case 'tension':return {value:settings.tension<50?'Low':settings.tension<80?'High':'Severe',unit:`${settings.tension} / 100`,note:'Rivals on edge are more likely to believe an attack warning.'};
    case 'verification':return {value:settings.verification<40?'Weak':settings.verification<75?'Stronger':'Robust',unit:`${settings.verification} / 100 · strength`,note:`Needs ${result.verificationMinutes} min. Decisions allow ${settings.decisionTime} min.`};
    case 'fallback':return {value:`${settings.fallback}%`,unit:'independent capacity',note:'Separate ways to coordinate repairs shorten the outage.'};
    case 'reserves':return {value:`${settings.reserves}h`,unit:'of essential power',note:'Generators keep essential hospital equipment running.'};
    default:return {value:String(settings[key]),unit:'',note:''};
  }
}
function initDeck(){
  $('#controls').innerHTML=deckInfo.map((d,i)=>`<article class="control-bank" data-bank="${d.key}"><div class="bank-top"><h2 class="bank-title">${d.title}</h2><span class="bank-number">0${i+1}</span></div><button class="bank-inspect" data-inspect="${d.node}" aria-label="Explain ${d.title.toLowerCase()}" title="What does this mean?">↗</button><p class="bank-question">${d.question}</p><div class="dial-row"><div class="dial-wrap"><button class="dial" data-key="${d.key}" role="slider" aria-label="${d.title.toLowerCase()}" aria-valuemin="${controls[d.key].min}" aria-valuemax="${controls[d.key].max}" aria-valuenow="${settings[d.key]}" title="Drag up or down. Arrow keys adjust."></button></div><div class="dial-value"></div></div><p class="control-note"></p></article>`).join('');
  document.querySelectorAll<HTMLButtonElement>('.dial').forEach(dial=>{
    const key=dial.dataset.key as NumericKey,c=controls[key];
    let startY=0,startValue=0,drag=false,recorded=false,dialBefore=result;
    dial.addEventListener('pointerdown',e=>{dialBefore=result;startY=e.clientY;startValue=settings[key];drag=true;recorded=false;dial.setPointerCapture(e.pointerId);dial.focus();e.preventDefault();});
    dial.addEventListener('pointermove',e=>{if(!drag)return;const next=Math.max(c.min,Math.min(c.max,Math.round((startValue+(startY-e.clientY)*(c.max-c.min)/150)/c.step)*c.step));if(next!==settings[key]){if(!recorded){remember();recorded=true;}change({...settings,[key]:next},false,dialBefore);}});
    dial.addEventListener('pointerup',()=>drag=false);dial.addEventListener('pointercancel',()=>drag=false);
    dial.addEventListener('keydown',e=>{if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','Home','End'].includes(e.key))e.preventDefault();let next=settings[key];if(['ArrowUp','ArrowRight'].includes(e.key))next+=c.step;if(['ArrowDown','ArrowLeft'].includes(e.key))next-=c.step;if(e.key==='Home')next=c.min;if(e.key==='End')next=c.max;if(next!==settings[key]){e.preventDefault();change({...settings,[key]:Math.max(c.min,Math.min(c.max,next))});}});
  });
}
function updateDeck(){for(const d of deckInfo){const bank=$(`[data-bank="${d.key}"]`),desc=description(d.key),c=controls[d.key];const dial=bank.querySelector<HTMLElement>('.dial')!;bank.querySelector<HTMLElement>('.dial-wrap')!.style.setProperty('--fill',`${270*(settings[d.key]-c.min)/(c.max-c.min)}deg`);dial.style.setProperty('--angle',`${-135+270*(settings[d.key]-c.min)/(c.max-c.min)}deg`);dial.setAttribute('aria-valuenow',String(settings[d.key]));dial.setAttribute('aria-valuetext',`${desc.value}, ${desc.unit}`);bank.querySelector('.dial-value')!.innerHTML=`${desc.value}<small>${desc.unit}</small>`;bank.querySelector('.control-note')!.textContent=desc.note;}}
function remember(){history.push({settings:{...settings},seed,continuation:validateContinuation(continuation)});if(history.length>80)history.shift();}
function persist(){try{localStorage.setItem('switchboard-v1',JSON.stringify(scenarioObject()));}catch{/* Browsing can continue without storage. */}}
function feedback(before:Result){
  lastBefore=before;
  const key=(Object.keys(settings) as (keyof Settings)[]).find(k=>settings[k]!==before.settings[k]);
  changeColour=controlColours[key||'capability']||'#86baff';
  changed=changedNodes(before,result);
  const source=Object.keys(nodeControls).find(id=>nodeControls[id]===key);if(source&&!changed.includes(source))changed.push(source);
  $('#world-svg').style.setProperty('--change-colour',changeColour);
  $('.change-strip').setAttribute('style',`--change-colour:${changeColour}`);
  const definitionChanged=before.settings.collapseDays!==settings.collapseDays||before.settings.collapseRegions!==settings.collapseRegions;
  const delta=definitionChanged?[]:differences(baseline||before,result);
  $('#change-text').innerHTML=delta.length?`<span class="delta-caption">${baseline?'SINCE YOU PINNED':'YOUR CHANGE'}</span>`+delta.map(d=>`<span class="delta-chip ${d.improved?'better':'worse'}"><span>${d.label}</span><s>${d.before}</s><b>→ ${d.after}</b></span>`).join(''):`<span class="delta-caption">${key?esc(deckInfo.find(d=>d.key===key)?.title||'SETTING CHANGED'):'SETTINGS'}</span> ${esc(summariseChange(before,result))}`;
  $('#pin-last-change').toggleAttribute('hidden',!!baseline||!delta.length);
  clearTimeout(feedbackTimer);feedbackTimer=window.setTimeout(()=>{changed=[];renderMap();},1800);
}
function clearFeedback(){lastBefore=null;changed=[];clearTimeout(feedbackTimer);$('#pin-last-change').hidden=true;}
function change(next:Settings,record=true,origin?:Result){if(record)remember();const before=origin||result;settings=validateSettings(next);result=simulate(settings,seed);range=null;requestId++;feedback(before);persist();render();}


function displayNode(id:string):{status:Status;label:string}{
  const n=result.nodes[id];if(mode==='case'||n.status==='unknown')return n;
  const possible=result.incident;
  switch(id){
    case 'comms':return {status:possible?'exposed':'safe',label:possible?'Faulty change can execute':'Execution route blocked'};
    case 'checks':return {status:result.verificationMinutes<=settings.decisionTime?'safe':'exposed',label:result.verificationMinutes<=settings.decisionTime?'A timely check is possible':'Check misses the deadline'};
    case 'warning':return {status:possible&&settings.aiAdvice?'exposed':'quiet',label:possible&&settings.aiAdvice?'Misleading advice can enter':'This advice route is absent'};
    case 'military':return {status:result.warning&&settings.tension>=50?'exposed':'safe',label:result.warning&&settings.tension>=50?'Escalation route enabled':'This route is constrained'};
    case 'power':return {status:result.powerOutage?'exposed':'safe',label:result.powerOutage?'Shared failure can reach power':'Power is independent here'};
    case 'hospital':return {status:result.recoveryModel.healthcareGap?'exposed':'safe',label:result.recoveryModel.healthcareGap?'Care can fall below demand':'Care covers this incident'};
    case 'food':return {status:result.foodGap?'exposed':'safe',label:result.foodGap?'Fridges may lose power':'Food backup lasts'};
    case 'emergency':return {status:result.emergencyGap?'exposed':'safe',label:result.emergencyGap?'Help may be delayed':'Help can get through'};
    case 'spread':return {status:result.incident?'exposed':'safe',label:`${result.affectedRegions} regions in reach`};
    case 'repair':return {status:result.recoveryModel.status==='stalled'?'exposed':'safe',label:result.recoveryModel.status==='stalled'?'Repair support runs out':'Repair work can progress'};
    case 'recovery':return {status:'unknown',label:'Outcome depends on events'};
    default:return n;
  }
}
function wrap(text:string,max=27){const words=text.split(' '),lines:string[]=[];let line='';for(const w of words){if((line+' '+w).trim().length>max&&line){lines.push(line);line=w;}else line+=(line?' ':'')+w;}if(line)lines.push(line);return lines.slice(0,2);}
function ancestors(id:string,set=new Set<string>()):Set<string>{if(set.has(id))return set;set.add(id);for(const p of result.nodes[id]?.parents||[])ancestors(p,set);return set;}
// Compress space between rows without flattening the text or the controls.
function mapY(y:number):number {
  const old=[0,58,160,220,322,382,484,542,644,680],next=[0,28,118,148,238,268,358,388,478,510];
  for(let i=1;i<old.length;i++)if(y<=old[i])return next[i-1]+(y-old[i-1])/(old[i]-old[i-1])*(next[i]-next[i-1]);
  return y-170;
}
function mapPath(path:string):string {
  return path.replace(/([MHVQ])([^MHVQ]+)/g,(_,cmd:string,coords:string)=>{
    const nums=coords.trim().split(/[ ,]+/).map(Number);
    return cmd+nums.map((n,i)=>cmd==='V'||(cmd!=='H'&&i%2===1)?Number(mapY(n).toFixed(2)):n).join(' ')+' ';
  });
}
function renderMap(){
  const step=panel==='story'?storySteps()[storyIndex]:null;
  const related=step?new Set(step.nodes):selected?ancestors(selected):null;
  const focused=document.activeElement?.getAttribute('data-node');
  const paths=wires.map(w=>{
    let status=displayNode(w.to).status;
    if(w.to==='repair'&&['power','hospital','food','crews','supplies'].includes(w.from))status=displayNode(w.from).status;
    if(w.from==='checks')status=result.verified?'safe':'quiet';
    if(w.from==='fallback')status=settings.fallback?'safe':'quiet';
    const active=!w.preview&&['harm','safe','exposed'].includes(status);
    const relevant=!related||(related.has(w.from)&&related.has(w.to));
    return `<path class="wire-track" d="${mapPath(w.d)}"/><path data-wire="${w.id}" class="wire ${w.preview?'preview':status} ${active?'active':''} ${relevant?'':'unrelated'} ${changed.includes(w.to)&&!w.preview?'just-changed':''}" d="${mapPath(w.d)}"/>${w.barrier&&w.from==='checks'?`<path class="barrier" opacity="${result.verified?1:.28}" d="${mapPath('M679 102 V116')}"/>`:''}`;
  }).join('');
  const cards=layout.map(n=>{const state=displayNode(n.id);return `<g class="node ${state.status} ${selected===n.id||step?.nodes.includes(n.id)?'selected':''} ${related?(related.has(n.id)?'related':'unrelated'):''}" data-node="${n.id}" transform="translate(${n.x} ${mapY(n.y)})" tabindex="0" role="button" aria-label="${n.title}: ${esc(state.label)}. Select to understand.">${nodeControls[n.id]?`<path class="control-colour-tab" style="stroke:${controlColours[nodeControls[n.id]]}" d="M18 -5 H53"/>`:""}${changed.includes(n.id)?'<rect class="change-halo" x="-5" y="-5" width="186" height="100" rx="11"/>':""}<rect class="node-body" x="0" y="0" width="176" height="90" rx="7"/><path class="node-topline" d="M9 1 H167"/><circle class="node-port" cx="0" cy="45" r="3"/><circle class="node-port" cx="176" cy="45" r="3"/><g class="node-icon" transform="translate(13 13) scale(.77)">${icon(n.icon)}</g><text class="node-kicker" x="40" y="24">${n.kicker}</text><circle class="lamp-spill" cx="159" cy="22" r="11"/><circle class="node-led-ring" cx="159" cy="22" r="6.5"/><circle class="node-lamp" cx="159" cy="22" r="4.3"/><circle class="node-led-highlight" cx="158" cy="20.8" r="1.3"/><text class="node-title" x="13" y="47">${n.title}</text>${wrap(state.label).map((line,i)=>`<text class="node-sub" x="13" y="${67+i*14}">${esc(line)}</text>`).join('')}${state.status==='unknown'?'<text class="node-status-icon" x="153" y="88">↗</text>':''}</g>`;}).join('');
  $('#world-svg').classList.toggle('story-active',panel==='story');
  $('#world-svg').innerHTML=svgDefs+`<g><text class="domain-label" x="30" y="16">THE WIDER PICTURE</text><path class="domain-rule" d="M191 12 H426"/><text class="domain-label" x="470" y="16">MILITARY / A DECISION UNDER PRESSURE</text><path class="domain-rule" d="M775 12 H1086"/><text class="domain-label" x="30" y="138">01 / ABILITY & AUTHORITY</text><text class="domain-label" x="470" y="138">02 / ONE SHARED FAILURE</text><text class="domain-label" x="910" y="138">03 / ESSENTIAL SERVICES</text><text class="domain-label" x="250" y="258">OTHER PATHWAYS</text><text class="domain-label" x="470" y="258">04 / THE WAY BACK</text><path class="domain-rule" d="M637 254 H1086"/>${paths}${cards}</g>`;
  if(focused)$<SVGGElement>(`[data-node="${focused}"]`)?.focus();
  $('#case-label').textContent=mode==='case'?`REGION 1 · EXAMPLE ${String(seed).padStart(3,'0')}`:'ENABLED ROUTES · EVENTS HAVE NOT BEEN SAMPLED';
  $('.legend').innerHTML=mode==='case'?'<span><i class="dot coral"></i>Failed</span><span><i class="dot" style="background:var(--amber)"></i>Strained / partial</span><span><i class="dot mint"></i>Working / protected</span><span><i class="dot grey"></i>Not reached</span>':'<span><i class="dot" style="background:var(--amber)"></i>Route enabled</span><span><i class="dot mint"></i>Protection</span><span><i class="dot grey"></i>Constrained / unresolved</span>';
}
function outcomeCard(title:string,text:string,status:Status,id?:string){return `<${id?'button':'div'} class="outcome ${id?'outcome-link':''}" data-status="${status}" ${id?`data-inspect="${id}"`:''}><i class="status-lamp ${status}"></i><strong>${title}</strong><p>${text}</p></${id?'button':'div'}>`;}
function panelHeader(name:string){return `<div class="readout-head"><h2>${name}</h2>${panel!=='outcomes'?'<button class="inspector-back" data-panel="outcomes" aria-label="Return to outcomes">× Close</button>':'<span class="inspector-key">↳</span>'}</div>`;}
function sourceLink(which:keyof typeof sources){const s=sources[which];return `<a class="source-link" href="${s.url}" target="_blank" rel="noreferrer">${s.name} ↗</a>`;}
function renderPanel(){
  const el=$('#readout');
  if(panel==='outcomes'){
    el.innerHTML=panelHeader(mode==='case'?'IN THIS CASE':'POSSIBLE ROUTES')+`<p class="kicker">${mode==='case'?'Where this leads.':'Conditions enable a route. They do not guarantee an event.'}</p>`+
      outcomeCard('Military escalation',mode==='case'?(result.escalation?'Warning acted on. Crisis escalates.':result.verified?'Independent checking breaks the chain.':'This case does not escalate.'):(result.warning&&settings.tension>=50?'Route enabled; checks and human decisions still matter.':'This particular route is constrained.'),displayNode('military').status,'military')+
      outcomeCard('Region 1 hospital',mode==='case'?(result.recoveryModel.healthcareGap>result.hospitalGap?`${result.recoveryModel.healthcareGap} hours with care below demand.`:result.hospitalGap?`${result.hospitalGap} hours without essential power${result.recoveryModel.completed?'.':' so far.'}`:'Critical services sustained.'):(result.hospitalGap?'Backup is shorter than this modelled outage.':'Backup covers this modelled incident.'),displayNode('hospital').status,'hospital')+
      outcomeCard('Nuclear exchange',mode==='case'?(result.nuclear?'Occurs after an additional human decision.':'Not reached in this example.'):'Requires further escalation and a separate strategic decision.',result.nuclear&&mode==='case'?'harm':'quiet','military')+
      `<div class="aside-divider"></div>`+outcomeCard('Civilisation collapse',result.nuclear?'Wider effects are not calculated.':result.civilisation.crossedAt!==null?(result.civilisation.recoveredAt!==null?'Threshold crossed, then services recovered.':'Sustained failure crosses this experiment’s threshold.'):'This experiment’s threshold is not met.',result.nodes.collapse.status,'collapse')+
      `<button class="small-button recovery-entry" data-panel="recovery">${result.recoveryModel.completed?'How did repairs go?':'Why are repairs still unfinished?'} <span>↗</span></button><button class="small-button" id="compare-checks">Try stronger checks <span>↗</span></button><button class="small-button" data-panel="range">Across 256 possible cases <span>↗</span></button>`;
  } else if(panel==='collapse'){
    el.innerHTML=collapsePanel();
  } else if(panel==='region'){
    el.innerHTML=regionPanel(regionContext??0);
  } else if(panel==='recovery'){
    el.innerHTML=recoveryPanel();
  } else if(panel==='story'){
    const steps=storySteps(); storyIndex=Math.min(storyIndex,steps.length-1); const step=steps[storyIndex];
    el.innerHTML=panelHeader('SHOW WHAT HAPPENED')+`<div class="story-number">${String(storyIndex+1).padStart(2,'0')}<small> / ${steps.length}</small></div><p class="story-time">${step.time}</p><h2 class="inspector-title">${step.title}</h2><p class="story-copy" aria-live="polite">${step.copy}</p><div class="story-nav"><button id="story-prev" ${storyIndex===0?'disabled':''}>← Back</button><button id="story-next" ${storyIndex===steps.length-1?'disabled':''}>Next →</button></div><div class="story-dots">${steps.map((_,i)=>`<button data-step="${i}" aria-label="Step ${i+1}" aria-current="${i===storyIndex?'step':'false'}"></button>`).join('')}</div>`;
  } else if(panel==='node'){
    const n=layout.find(n=>n.id===selected)!;const state=result.nodes[selected],display=regionContext!==null&&regionContext>=result.affectedRegions?{status:'safe' as Status,label:'Available in this region'}:displayNode(selected);
    const type=selected==='payments'?'finance':['crews','supplies'].includes(selected)?'recovery':selected==='food'?'food':selected==='emergency'?'emergency':['checks','warning','military'].includes(selected)?'military':['hospital','bio'].includes(selected)?'health':['ai','access','development','control','information'].includes(selected)?'ai':'resilience';
    el.innerHTML=panelHeader('FOLLOW THE CONNECTION')+`<span class="${state.status==='unknown'?'preview-pill':'inspector-key'}">${state.status==='unknown'?'PATHWAY PREVIEW':'SELECTED COMPONENT'}</span><h2 class="inspector-title">${n.title}</h2><div class="inspector-status"><i class="status-lamp ${display.status}"></i>${esc(display.label)}</div><p class="inspector-copy">${regionContext!==null?`<strong>Region ${regionContext+1}</strong><br>${regionContext>=result.affectedRegions?'This region uses a separate network, or the update was stopped. Its services keep working.':esc(state.reason)}`:esc(mode==='conditions'&&state.status!=='unknown'?'The highlighted route shows how this component is connected. Choose “What happens in this case” in Explore to inspect which events occurred.':state.reason)}</p><details class="model-details"><summary>How this works & sources</summary><p class="rule-label">${state.status==='unknown'?'MODEL COVERAGE':'THE RULE IN THIS MODEL'}</p><p class="rule-copy">${esc(state.rule)}</p><p class="rule-label">EVIDENCE & ASSUMPTIONS</p><p class="rule-copy">${state.status==='unknown'?'A conceptual continuation, not a simulated result.':'The source describes the general risk. The numbers and rules are choices for this experiment, not measured odds.'}</p>${sourceLink(type)}</details>${pathwayInterventions(selected)}<button class="small-button" data-panel="advanced">Inspect the settings <span>↗</span></button><button class="small-button" id="trace-selected">Show what happened <span>↗</span></button>`;
  } else if(panel==='pathways'){
    el.innerHTML=panelHeader('EXPLORE THE CAUSES')+pathwaysPanel(result);
  } else if(panel==='advanced'){
    el.innerHTML=panelHeader('INSIDE THE MACHINE')+`<button class="small-button" data-panel="pathways">Try another cause ↗</button>`+pathwayControls(rangeField,toggleField)+
      rangeField('reach','Regions exposed','The first N regions share the network and receive any introduced health or information challenge.','regions')+
      `<h3 class="recovery-controls-title">Regions & help</h3>`+
      rangeField('regionDifference','Different reserves','0 makes every region identical. Higher settings vary backup stores.','%')+
      rangeField('aidStrength','Help from working regions','Spare relief packages sent per hour, as a share of one package.','%')+
      rangeField('aidBudget','Relief stock per region','Separate surplus for helping others; domestic essentials stay protected.','packages')+
      rangeField('aidDelay','Travel time for help','A donor first stabilises for 24 hours, then help travels.','hours')+
      rangeField('responseBackup','Emergency coordination backup','How long local teams can coordinate using backup plans.','hours')+
      rangeField('foodBackup','Food backup','How long can warehouse fridges run without mains power?','hours')+
      `<h3 class="recovery-controls-title">What repairs need</h3>`+
      rangeField('repair','Repair workload','Work hours needed with a full crew and everything available.','work h')+
      rangeField('crews','Repair crews','How much of the normal repair team is available at the start?','%')+
      rangeField('repairBackup','Power for repair tools','Generator hours at repair sites. Separate from hospital backup.','hours')+
      rangeField('repairSupplies','Repair stockpile','One unit supplies one full-speed hour of repair work.','units')+
      rangeField('supplyDelivery','Independent deliveries','Supplies that can arrive without the main network or electricity.','%')+
      rangeField('foodStores','Stored food','Food available while deliveries fall short. Separate from fridge backup.','hours')+
      `<details class="model-details"><summary>Definition used for collapse</summary><p class="rule-copy">Power, healthcare, food and coordination all below half capacity, continuously:</p>`+
      rangeField('collapseRegions','Regions required','Six equal-weight regions; this is not a world population estimate.','of 6')+
      rangeField('collapseDays','Days required','An experiment definition, not a settled scientific cutoff.','days')+`</details>`+
      rangeField('decisionTime','Time to check','Time available before the military decision.','min')+
      toggleField('independent','Independent verification','People can check the warning using another network.')+
      toggleField('sharedProvider','Shared power control','Power controls use the same network as calls and messages.')+
      toggleField('aiAdvice','AI military advice','AI can warn leaders of an attack. People still control the weapons.')+
      toggleField('faultyChange','Introduce a faulty change','Test what happens if AI proposes a bad update.')+
      toggleField('humanApproval','Approve this faulty change','Only matters when permission is “Ask first”.')+
      `<p class="aside-foot"></p>`;
  } else if(panel==='compare'){
    const b=baseline!,delta=differences(b,result);
    el.innerHTML=panelHeader('BEFORE → NOW')+`<div class="pinned-badge">● Starting point pinned</div><h2 class="inspector-title">${delta.length?'See what your choices changed.':'Now change a dial.'}</h2><p class="inspector-copy">${delta.length?`${b.settings.collapseDays!==settings.collapseDays||b.settings.collapseRegions!==settings.collapseRegions?'The collapse definitions differ. A changed label alone does not mean services improved.':'Same case. The differences below come from your settings.'}`:'Your starting point stays here while you try different choices.'}</p><div class="comparison">${delta.map(d=>`<div class="${d.improved?'better':'worse'}"><span>${d.label}</span><b>${d.before} → ${d.after}</b></div>`).join('')}</div><details class="model-details"><summary>Compare every outcome</summary><div class="comparison">${[['Regions hit',b.affectedRegions,result.affectedRegions],['Hospital power gap',b.hospitalGap+'h',result.hospitalGap+'h'],['Food refrigeration gap',b.foodGap+'h',result.foodGap+'h'],['Emergency disruption',b.emergencyGap+'h',result.emergencyGap+'h'],['Network outage',b.recoveryModel.completed?b.restoreHours+'h':'30 days+',result.recoveryModel.completed?result.restoreHours+'h':'30 days+'],['Crisis escalates',b.escalation?'Yes':'No',result.escalation?'Yes':'No'],['Nuclear use',b.nuclear?'Yes':'No',result.nuclear?'Yes':'No']].map(([label,a,b])=>`<div><span>${label}</span><b>${a} → ${b}</b></div>`).join('')}</div></details><button class="small-button" id="restore-comparison">Restore the starting point ↶</button><button class="small-button" id="unpin-comparison">Finish comparison ×</button>`;
  } else {
    el.innerHTML=panelHeader('POSSIBLE CASES')+`<p class="kicker">256 cases under these settings.<br>Chosen introduced challenges · services followed for 30 days · acute military response</p>`+(range?[
      ['Crisis escalates',range.escalation],['Nuclear exchange',range.nuclear],['Region 1 hospital gap',range.health]
    ].map(([label,count])=>`<div class="hist-row"><div><span>${label}</span><span>${count} / ${range!.count}</span></div><div class="hist-track"><i style="width:${Number(count)/range!.count*100}%"></i></div></div>`).join(''):'<p class="inspector-copy">Calculating possible cases…</p>')+`<div class="scope-note">These are frequencies inside an illustrative model, not real-world risk estimates. Outcomes overlap. Hospital duration is fixed by your settings; military responses vary.</div><button class="small-button" id="new-case">Inspect another case <span>↗</span></button><p class="aside-foot">Collapse is calculated from service duration; no extinction probability is calculated.</p>`;
    if(!range)requestEnsemble();
  }
}
function rangeField(key:NumericKey,label:string,copy:string,unit:string){const c=controls[key];return `<div class="advanced-field"><label for="adv-${key}">${label}<output>${settings[key]} ${unit}</output></label><input id="adv-${key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${settings[key]}" data-setting="${key}" data-unit="${unit}"><p>${copy}</p></div>`;}
function toggleField(key:keyof Settings,label:string,copy:string){return `<div class="advanced-field"><label for="adv-${key}">${label}<input id="adv-${key}" type="checkbox" data-setting="${key}" ${settings[key]?'checked':''}></label><p>${copy}</p></div>`;}
function render(skipPanel=false){$('.scenario-line strong').textContent=result.pathways.harmfulOperation?'An agent disrupts services. Can people stop it?':result.pathways.healthIntroduced?'A health crisis tests the same connected world.':settings.researchEnabled?'New updates race against the people checking them.':result.pathways.misinformation?'A network failure meets conflicting instructions.':'A faulty AI update meets a world on edge.';$('#view-label').textContent=`${viewArea} · ${mode==='case'?'this case':'open routes'}`;$('#pin-comparison').textContent=baseline?'⇄ Comparison pinned':'⇄ Compare changes';$('#pin-comparison').classList.toggle('pinned',!!baseline);if(panel==='story')storyIndex=Math.min(storyIndex,storySteps().length-1);updateDeck();renderMap();renderImpact();if(!skipPanel)renderPanel();$('#undo-button').toggleAttribute('disabled',!history.length);document.querySelectorAll<HTMLElement>('[data-mode]').forEach(el=>{el.classList.toggle('active',el.dataset.mode===mode);el.setAttribute('aria-pressed',String(el.dataset.mode===mode));});}
function requestEnsemble(){const id=++requestId;try{if(!worker){worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});worker.onmessage=e=>{if(e.data.id!==requestId)return;range=e.data;if(panel==='range')renderPanel();};worker.onerror=()=>{if(panel==='range'){$('#readout').innerHTML=panelHeader('POSSIBLE CASES')+'<p class="inspector-copy">The ensemble worker is unavailable. Individual cases and controls still work.</p>';}};}worker.postMessage({settings,seed,id});}catch{$('#readout').innerHTML=panelHeader('POSSIBLE CASES')+'<p class="inspector-copy">Ensembles need a browser with worker support. Individual cases still work.</p>';}}

function inspect(id:string){regionContext=null;if(id==='collapse'){setPanel('collapse');return;}if(id==='repair'||id==='recovery'){setPanel('recovery');return;}if(selected===id&&panel==='node'){setPanel('outcomes');return;}if(id==='extinction'){showExtinction();return;}selected=id;panel='node';renderMap();renderPanel();}
function setPanel(next:typeof panel){regionContext=null;panel=next;if(next==='compare'&&!baseline)baseline=result;if(next!=='node')selected='';renderMap();renderPanel();}
function toast(text:string){$('#toast').textContent=text;$('#toast').classList.add('visible');window.setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
function openDialog(title:string,eyebrow:string,html:string){$('#dialog').classList.remove('continuation-dialog');$('#dialog-title').textContent=title;$('#dialog-eyebrow').textContent=eyebrow;$('#dialog-body').innerHTML=html;$<HTMLDialogElement>('#dialog').showModal();}
function showAbout(){openDialog('A machine for asking “what if?”','THE MODEL / STUDY 01',`<p>This first playable section explores how <strong>introduced AI-related challenges</strong> can interrupt services, affect a military decision, overwhelm care or prevent recovery.</p><p class="callout">Change the inputs. The consequences update immediately. Select any component to inspect its rule and the evidence behind the dependency.</p><h3>What is calculated?</h3><p>Permission gates, a shared communications/power outage, verification before a deadline, illustrative human responses, backup depletion, regional repair, finite mutual aid, emergency coordination and an adjustable sustained-collapse test. Additional introduced cases explore development queues, persistent agents, health demand, false messages, payments and transport. The same settings and case number reproduce the same result.</p><h3>What is still a preview?</h3><p>Wider political change, detailed epidemics, financial-market contagion and extinction. Their components reveal the intended whole-world structure without claiming to calculate those outcomes.</p><h3>What do the numbers mean?</h3><p>All coefficients and starting values are educational assumptions. The model is not calibrated to today's world. Sources support general mechanisms; they do not validate the model's probabilities. “What happens in this case” shows events. “Which routes are open?” shows where trouble could travel.</p>${sourceLink('ai')}${sourceLink('military')}${sourceLink('resilience')}<p>Model ${MODEL_VERSION}. Runs on your device. No AI service is making its decisions. Settings are saved in this browser; Reset restores the opening world.</p>`);}
function showExtinction(){openDialog('Could anyone survive?','BEYOND COLLAPSE',continuationPanel(result,continuation));$('#dialog').classList.add('continuation-dialog');}
function refreshContinuation(focusGate?:Gate){
  $('#undo-button').toggleAttribute('disabled',!history.length);
  const open=Array.from(document.querySelectorAll<HTMLDetailsElement>('#dialog-body details[open]')).map(el=>el.dataset.gate).filter(Boolean);
  $('#dialog-body').innerHTML=continuationPanel(result,continuation);
  for(const id of open){const el=document.querySelector<HTMLDetailsElement>(`[data-gate="${id}"]`);if(el)el.open=true;}
  if(focusGate)$<HTMLSelectElement>(`#continuation-${focusGate}`).focus();
}
$('#dialog-body').addEventListener('change',e=>{const input=e.target as HTMLSelectElement;const gate=input.dataset.continuationGate as Gate|undefined;if(!gate)return;remember();continuation[continuation.route][gate]=input.value as Assumption;persist();refreshContinuation(gate);});
function scenarioObject(){return {version:MODEL_VERSION,settings,seed,continuation};}
function loadScenario(raw:unknown){clearFeedback();const obj=raw as {version?:unknown;settings?:unknown;seed?:unknown;continuation?:unknown};if(!obj||!['0.1.0','0.2.0','0.2.1','0.3.0','0.4.0','0.5.0','0.5.1',MODEL_VERSION].includes(String(obj.version)))throw Error('This file needs a compatible model version.');if(typeof obj.seed!=='number'||!Number.isInteger(obj.seed)||obj.seed<0||obj.seed>4294967295)throw Error('Invalid case number.');const checked=validateSettings(obj.version!==MODEL_VERSION?{...DEFAULTS,...obj.settings as object}:obj.settings);const checkedContinuation=validateContinuation(obj.continuation);remember();continuation=checkedContinuation;seed=obj.seed;settings=checked;result=simulate(settings,seed);baseline=null;selected='';panel='outcomes';range=null;requestId++;persist();render();$('#change-text').textContent=obj.version===MODEL_VERSION?'Your world is restored. Change a dial or follow what happened.':'Model updated. Your controls are kept; outcomes have been recalculated.';}
function showSave(){openDialog('Keep this world.','SAVE / COMPARE / SHARE',`<p>Save your settings and case number. Reopening the same model version reproduces the result.</p><div class="export-line"><button class="primary" id="download-scenario">Download scenario</button><button class="secondary" id="copy-link">Copy scenario link</button></div><label class="import-label">Open a saved scenario<input id="import-scenario" type="file" accept="application/json,.json"></label><p>Links point to the current host. A localhost link only works on this computer; use a deployed site URL to share with others.</p>`);}

document.addEventListener('click',e=>{
  const target=e.target as Element;
  const continuationRoute=target.closest<HTMLElement>('[data-continuation-route]');if(continuationRoute){continuation.route=continuationRoute.dataset.continuationRoute as Route;persist();refreshContinuation();$<HTMLButtonElement>(`[data-continuation-route="${continuation.route}"]`).focus();return;}
  if(target.closest('#continuation-refuge')){remember();continuation[continuation.route].reach='no';persist();refreshContinuation();return;}
  if(target.closest('#continuation-reset')){remember();const route=continuation.route;continuation[route]=freshContinuation()[route];persist();refreshContinuation();return;}
  if(!target.closest('#explore-menu'))$<HTMLDetailsElement>('#explore-menu').open=false;
  const pathwayButton=target.closest<HTMLElement>('[data-pathway]');if(pathwayButton){const id=pathwayButton.dataset.pathway!;baseline=result;mode='case';change({...DEFAULTS,...pathwayPresets[id]});inspect(({research:'development',control:'control',health:'bio',information:'information',deliveries:'payments'} as Record<string,string>)[id]);return;}
  const interruptButton=target.closest<HTMLElement>('[data-interrupt]');if(interruptButton){const key=interruptButton.dataset.interrupt as keyof Settings;baseline=result;change({...settings,[key]:typeof settings[key]==='boolean'?true:100});return;}
  const regionButton=target.closest<HTMLElement>('[data-region]');if(regionButton){selected=regionButton.dataset.inspect!;regionContext=Number(regionButton.dataset.region);panel='region';renderMap();renderPanel();return;}
  const regionDetail=target.closest<HTMLElement>('[data-region-detail]');if(regionDetail){regionContext=Number(regionDetail.dataset.regionDetail);selected='';panel='region';renderPanel();renderMap();return;}
  const inspectButton=target.closest<HTMLElement>('[data-inspect]');if(inspectButton){inspect(inspectButton.dataset.inspect!);return;}
  const node=target.closest<SVGElement>('[data-node]');if(node){inspect(node.dataset.node!);return;}
  const panelButton=target.closest<HTMLElement>('[data-panel]');if(panelButton){setPanel(panelButton.dataset.panel as typeof panel);return;}
  const modeButton=target.closest<HTMLElement>('[data-mode]');if(modeButton){mode=modeButton.dataset.mode as typeof mode;$<HTMLDetailsElement>('#explore-menu').open=false;render();return;}
  const focusButton=target.closest<HTMLElement>('[data-focus]');if(focusButton){focus(focusButton.dataset.focus!);$<HTMLDetailsElement>('#explore-menu').open=false;return;}
  const stepButton=target.closest<HTMLElement>('[data-step]');if(stepButton){storyIndex=Number(stepButton.dataset.step);render();return;}
  const id=target.closest<HTMLElement>('[id]')?.id;
  if(id==='story-prev'||id==='story-next'){storyIndex=Math.max(0,Math.min(storySteps().length-1,storyIndex+(id==='story-next'?1:-1)));render();return;}
  if(id==='try-wide-failure'){baseline=result;mode='case';change({...DEFAULTS,reach:6,crews:25,repairBackup:24,foodStores:48,regionDifference:50,responseBackup:72,collapseRegions:4,collapseDays:14});panel='collapse';render();return;}
  if(id==='keep-refuges'){baseline=result;mode='case';change({...settings,reach:4,aidStrength:100,aidBudget:168});panel='collapse';render();return;}
  if(id==='protect-repairs'){baseline=result;mode='case';change({...settings,repairBackup:720,repairSupplies:168,supplyDelivery:100});panel='recovery';selected='';render();return;}
  if(id==='pin-comparison'||id==='pin-last-change'){if(!baseline)baseline=id==='pin-last-change'&&lastBefore?lastBefore:result;mode='case';setPanel('compare');render();$('#pin-last-change').hidden=true;return;}
  if(id==='unpin-comparison'){baseline=null;clearFeedback();setPanel('outcomes');render();$('#change-text').textContent='Change a dial. Watch what changes.';return;}
  if(id==='compare-checks'){baseline=result;mode='case';panel='compare';selected='';change({...settings,verification:100});}
  if(id==='restore-comparison'&&baseline){const previous=baseline;baseline=null;panel='outcomes';change(previous.settings);}
  if(id==='new-case'){clearFeedback();remember();seed=(seed+1)>>>0;baseline=null;range=null;requestId++;result=simulate(settings,seed);panel='outcomes';mode='case';persist();render();$('#change-text').textContent=`Example ${seed}: the same settings, different possible human responses. The introduced fault stays the same.`;}
  if(id==='trace-selected'||id==='trace-button'){trace();}
  if(id==='download-scenario'){const blob=new Blob([JSON.stringify(scenarioObject(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`switchboard-case-${seed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  if(id==='copy-link'){const url=new URL(location.href);url.hash='scenario='+btoa(JSON.stringify(scenarioObject()));navigator.clipboard.writeText(url.href).then(()=>toast('Scenario link copied.')).catch(()=>toast('Clipboard unavailable. Download the scenario instead.'));}
});
document.addEventListener('keydown',e=>{const el=e.target as Element;if(el.matches('[data-node]')&&['Enter',' '].includes(e.key)){e.preventDefault();inspect((el as SVGElement).dataset.node!);}if(e.key==='Escape'&&!$<HTMLDialogElement>('#dialog').open){setPanel('outcomes');$<HTMLDetailsElement>('#explore-menu').open=false;}});
$('#readout').addEventListener('input',e=>{const input=e.target as HTMLInputElement;if(!input.dataset.setting)return;const key=input.dataset.setting as keyof Settings;const before=result;remember();settings={...settings,[key]:input.type==='checkbox'?input.checked:Number(input.value)};result=simulate(settings,seed);range=null;requestId++;persist();if(input.type==='range')input.previousElementSibling!.querySelector('output')!.textContent=`${input.value} ${input.dataset.unit}`;feedback(before);render(true);});
document.addEventListener('change',async e=>{const input=e.target as HTMLInputElement;if(input.id!=='import-scenario')return;try{const f=input.files?.[0];if(!f)return;if(f.size>100000)throw Error('Scenario file is too large.');loadScenario(JSON.parse(await f.text()));$<HTMLDialogElement>('#dialog').close();toast('Scenario restored.');}catch(err){toast(err instanceof Error?err.message:'Unable to open this scenario.');}});
$('#about-button').addEventListener('click',showAbout);$('#save-button').addEventListener('click',showSave);$('#extinction-button').addEventListener('click',showExtinction);
$('#dialog-close').addEventListener('click',()=>$<HTMLDialogElement>('#dialog').close());
$('#advanced-button').addEventListener('click',()=>setPanel(panel==='advanced'?'outcomes':'advanced'));
$('#undo-button').addEventListener('click',()=>{const old=history.pop();if(!old)return;clearFeedback();settings=old.settings;seed=old.seed;continuation=old.continuation;result=simulate(settings,seed);range=null;requestId++;baseline=null;if(panel==='compare')panel='outcomes';persist();render();$('#change-text').textContent='Previous settings restored, with the same case number.';});
$('#reset-button').addEventListener('click',()=>{clearFeedback();remember();settings={...DEFAULTS};continuation=freshContinuation();seed=42;result=simulate(settings,seed);selected='';panel='outcomes';baseline=null;range=null;requestId++;persist();render();focus('world');$('#change-text').textContent='Opening world restored. Try stronger checks, then give hospitals more backup.';});

function updateCamera(){
  $('#world-svg').setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${camera.h}`);
  $('#zoom-label').textContent=`${Math.round(1140/camera.w*100)}%`;
  $('#mini-map').toggleAttribute('hidden',camera.w>=1139);
  $('.world').classList.toggle('zoomed',camera.w<1139);
  const r=$('#mini-window');for(const [k,v] of Object.entries({x:camera.x,y:camera.y,width:camera.w,height:camera.h}))r.setAttribute(k,String(v));
}
function clampCamera(){camera.x=Math.max(-60,Math.min(1200-camera.w,camera.x));camera.y=Math.max(-35,Math.min(685-camera.h,camera.y));}
function zoom(factor:number,px=.5,py=.5){const nw=Math.max(480,Math.min(1140,camera.w/factor)),nh=nw*650/1140;camera.x+=(camera.w-nw)*px;camera.y+=(camera.h-nh)*py;camera.w=nw;camera.h=nh;clampCamera();updateCamera();}
function focus(area:string){
  const cameras:Record<string,typeof camera>={world:{x:0,y:0,w:1140,h:650},military:{x:440,y:5,w:680,h:304},services:{x:435,y:135,w:680,h:304},recovery:{x:435,y:220,w:680,h:304}};
  viewArea=({world:'Whole world',military:'Military',services:'Infrastructure & health',recovery:'Recovery'} as Record<string,string>)[area];$('#view-label').textContent=`${viewArea} · ${mode==='case'?'this case':'open routes'}`;
  camera={...cameras[area]};updateCamera();document.querySelectorAll<HTMLElement>('[data-focus]').forEach(el=>{el.classList.toggle('active',el.dataset.focus===area);el.setAttribute('aria-pressed',String(el.dataset.focus===area));});$('#map-title').textContent=area==='world'?'ONE WORLD. SHARED DEPENDENCIES.':area==='military'?'MILITARY · THE SAME WORLD, CLOSER':area==='services'?'INFRASTRUCTURE & HEALTH · SHARED DEPENDENCIES':'RECOVERY · KEEPING A WAY BACK';
}
$('#zoom-in').addEventListener('click',()=>zoom(1.25));$('#zoom-out').addEventListener('click',()=>zoom(.8));$('#home-view').addEventListener('click',()=>focus('world'));
const viewport=$('#viewport');let pan:{x:number;y:number;cx:number;cy:number}|null=null;
viewport.addEventListener('pointerdown',e=>{if((e.target as Element).closest('[data-node]'))return;pan={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
viewport.addEventListener('pointermove',e=>{if(!pan)return;const rect=viewport.getBoundingClientRect(),scale=Math.min(rect.width/camera.w,rect.height/camera.h);camera.x=pan.cx-(e.clientX-pan.x)/scale;camera.y=pan.cy-(e.clientY-pan.y)/scale;clampCamera();updateCamera();});
viewport.addEventListener('pointerup',e=>{if(pan&&Math.hypot(e.clientX-pan.x,e.clientY-pan.y)<5)setPanel('outcomes');pan=null;viewport.classList.remove('dragging');});viewport.addEventListener('pointercancel',()=>{pan=null;viewport.classList.remove('dragging');});
viewport.addEventListener('wheel',e=>{e.preventDefault();const rect=viewport.getBoundingClientRect();zoom(e.deltaY<0?1.1:1/1.1,(e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height);},{passive:false});
viewport.addEventListener('keydown',e=>{if((e.target as Element).closest('[data-node]'))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home'){focus('world');return;}if(e.key==='+'||e.key==='=')zoom(1.2);else if(e.key==='-')zoom(1/1.2);else{camera.x+=(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)*camera.w*.08;camera.y+=(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)*camera.h*.12;clampCamera();updateCamera();}}});
function collapsePanel(){
  const c=result.civilisation,days=(hours:number)=>(hours/24).toFixed(1);
  const title=result.nuclear?'Wider outcome unknown':c.crossedAt!==null?(c.recoveredAt!==null?'The threshold was crossed. Recovery followed.':'Essential systems fail together, for too long.'):'The chain stops short of collapse.';
  const plot=c.frames.filter((_,i)=>i%6===0).map(f=>`${10+180*f.time/720},${90-70*f.failingRegions/6}`).join(' ');
  return panelHeader('CIVILISATION')+`<h2 class="inspector-title">${title}</h2><p class="inspector-copy">${result.nuclear?'The service model does not calculate nuclear damage. These service results cannot establish the wider outcome.':`At its worst, ${c.peakRegions} of 6 regions fail the combined test. The longest stretch across ${settings.collapseRegions} or more regions lasts ${days(c.longestHours)} days.`}</p>
    <div class="collapse-chain"><div><span>ESSENTIALS</span><b>Power + healthcare + food</b><small>Each below half capacity</small></div><div><span>RESPONSE</span><b>Local coordination also fails</b><small>Below half capacity</small></div><div><span>EXTENT × TIME</span><b>${settings.collapseRegions} of 6 regions · ${settings.collapseDays} days</b><small>Continuously, in this experiment</small></div></div>
    <svg class="repair-chart" viewBox="0 0 200 120" role="img" aria-label="Regions failing the combined test over 30 days. Peak ${c.peakRegions} regions."><path d="M10 20H190M10 90H190" stroke="#aabbcc33"/><path d="M10 ${90-70*settings.collapseRegions/6}H190" stroke="#ffd17788" stroke-dasharray="3 3"/><polyline points="${plot}" fill="none" stroke="#ff9870" stroke-width="2"/><text x="1" y="20">6</text><text x="1" y="92">0</text><text x="169" y="${87-70*settings.collapseRegions/6}">${settings.collapseRegions}+</text><text x="10" y="108">DAY 0</text><text x="159" y="108">DAY 30</text></svg>
    <div class="comparison"><div><span>Threshold first crossed</span><b>${c.crossedAt===null?'Not reached':`Day ${days(c.crossedAt)}`}</b></div><div><span>Later recovery confirmed</span><b>${c.recoveredAt===null?'—':`Day ${days(c.recoveredAt)}`}</b></div><div><span>At day 30</span><b>${({functioning:'Services working',recovered:'Recovered',disrupted:'Still disrupted',collapse:'Not recovered'} as Record<string,string>)[c.endStatus]}</b></div><div><span>Outside the network fault</span><b>${c.independentRegions} / 6</b></div><div><span>Help delivered</span><b>${c.aidReceived.toFixed(0)} packages</b></div></div>
    <button class="small-button" id="try-wide-failure">Try widespread failure ↗</button><button class="small-button" id="keep-refuges">Keep two regions independent ↗</button><button class="small-button" data-panel="advanced">Inspect assumptions ↗</button><button class="small-button" data-inspect="extinction">What would extinction also require? ↗</button>
    <details class="model-details"><summary>Why this definition?</summary><p class="rule-copy">This is a visible, adjustable experiment boundary. There is no universally established numerical definition of civilisation collapse. Six equal-weight regions stand in for a connected world; they are not countries or population estimates. Short outages and one devastated region do not automatically meet this definition.</p><p class="rule-copy">Recovery requires every region to regain the essential basket and coordination for 24 hours. An earlier crossing is kept in the record. Thirty days is the calculation limit, not proof of permanent failure. Nuclear consequences and extinction are not calculated.</p>${sourceLink('collapse')}${sourceLink('recovery')}</details>`;
}
function regionPanel(index:number){
  const c=result.civilisation,r=c.regions[index],m=r.recovery;
  return panelHeader(r.name.toUpperCase())+`<h2 class="inspector-title">${!r.exposed?(m.healthcareGap?'Network working; care under pressure.':'Its separate network keeps working.'):m.completed?`Repaired after ${m.restoredAt} hours.`:'Still disrupted at day 30.'}</h2><p class="inspector-copy">This region holds ${Math.round(r.reserveFactor*100)}% of the reference backup stores. ${r.aidSent>0?'It sends help after protecting its own essential needs.':r.aidReceived>0?'Other regions send help to its repair teams.':''}</p><div class="comparison">${[['Hospital backup',r.settings.reserves.toFixed(0)+'h'],['Tool backup',r.settings.repairBackup.toFixed(0)+'h'],['Stored food',r.settings.foodStores.toFixed(0)+'h'],['Hospital power gap',m.hospitalGap+'h'],['Care below demand',m.healthcareGap+'h'],['Food supply shortfall',m.foodShortageHours+'h'],['All essentials + response failing',r.deprivationHours+'h'],['Help sent',r.aidSent.toFixed(1)+' packages'],['Help received',r.aidReceived.toFixed(1)+' packages'],['Unused arrivals',r.aidUnused.toFixed(1)+' packages']].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div><p class="rule-copy">The board above follows Region 1. This panel reports ${r.name}'s own calculation. Power and healthcare gaps describe this outage, not deaths.</p><button class="small-button" data-panel="collapse">See the whole-world outcome ↗</button>`;
}
function recoveryPanel(){
  const rm=result.recoveryModel;
  const end=rm.observedHours||1;
  const points=rm.frames.filter((_,i)=>i%6===0||i===rm.frames.length-1).map(f=>`${10+180*f.time/end},${100-80*f.work/settings.repair}`).join(' ');
  
  return panelHeader('REGION 1 · REPAIR')+`<h2 class="inspector-title">${rm.status==='unneeded'?'The fault was stopped.':rm.completed?`Repaired after ${rm.restoredAt} hours.`:rm.status==='stalled'?'Repairs have stalled.':'Still repairing at day 30.'}</h2><p class="inspector-copy">${result.nuclear?'Original network fault only. Nuclear damage is not calculated.':rm.status==='unneeded'?'There is no repair job to do.':rm.completed?'The network works again. The damage while it was down still matters.':'Later recovery is unknown. The calculation stops at 30 days.'}</p>
    <div class="repair-progress"><strong>${Math.floor(rm.progress*100)}%</strong><span>of repair work finished</span><div><i style="width:${rm.progress*100}%"></i></div></div>
    ${result.incident?`<svg class="repair-chart" viewBox="0 0 200 125" role="img" aria-label="Repair progress over ${end} hours; ${Math.floor(rm.progress*100)} percent complete"><path d="M10 20H190M10 60H190M10 100H190" stroke="#aabbcc25"/><polyline points="${points}" fill="none" stroke="#76edcf" stroke-width="2.5"/><text x="10" y="119">START</text><text x="140" y="119">${end} HOURS</text></svg><p class="rule-copy">Required: ${settings.repair} full-speed work hours.<br>${rm.completed?`Elapsed: ${rm.restoredAt} hours.`:`Done: ${rm.final.work.toFixed(1)} work hours.`}</p>`:''}
    ${rm.milestones.map(m=>`<div class="recovery-event"><b>${m.time}h</b><span>${esc(m.description)}</span></div>`).join('')}
    ${result.incident&&!rm.completed?`<p class="inspector-copy">Main limit at day 30: <strong>${esc(rm.final.limiting)}</strong>.</p>`:''}
    <button class="small-button" data-panel="advanced">Change repair resources ↗</button>${result.incident?'<button class="small-button" id="protect-repairs">Try protected repair supplies ↗</button>':''}
    <details class="model-details"><summary>Rules, stocks & evidence</summary><p class="rule-copy">One hour at a time, crews do as much work as people, coordination, tool power and materials allow. Hospitals and food support affect how many workers can stay on the job. A longer outage can therefore make repairs slower.</p><p class="rule-copy">Repair stock: ${settings.repairSupplies} initially + ${rm.suppliesDelivered.toFixed(1)} delivered − ${rm.suppliesUsed.toFixed(1)} used = ${rm.final.parts.toFixed(1)} left. Backups for hospitals, fridges and tools are separate stocks. They are not refilled in this case.</p><p class="rule-copy">Hourly steps; 30-day limit. Numerical effects are educational assumptions. This panel describes Region 1. The civilisation panel checks all six regions. Deaths are not calculated.</p>${sourceLink('recovery')}${sourceLink('food')}</details>`;
}
function storySteps(){
  const r=result;
  const steps=[{nodes:['ai','access'],time:'THE START',title:r.pathways.harmfulOperation&&r.incident?'An agent disrupts the network.':r.incident?'AI installs a bad update.':'The network fault is blocked.',copy:r.pathways.harmfulOperation&&r.incident?'The agent has access to connected services and a stipulated harmful goal. It keeps undoing repairs until people stop it.':r.incident?'It has permission to change the live network. People lose calls and messages when the update goes wrong.':settings.researchEnabled?'The introduced fault did not pass the research, checking and deployment gates.':settings.faultyChange?'AI needs both the ability and permission to install it. Here, that gate stays shut.':'There is no bad update in this experiment.'}];
  for(const event of r.pathways.events)steps.push({nodes:[event.id.startsWith('bio')?'bio':event.id,...event.parents],time:event.time<0?'30 DAYS BEFORE':`AFTER ${event.time} HOURS`,title:({'bio-peak':'The hospital faces peak demand.','bio-response':'The extra demand eases.',development:'Research meets a checking bottleneck.',control:r.pathways.controlLost?'The stop order fails.':'People stop the agent.',bio:'More people need care at once.',information:'False messages weaken the response.'} as Record<string,string>)[event.id],copy:event.description});
  if(settings.sharedPayments||settings.sharedTransport)steps.push({nodes:['comms','payments','transport','supplies','food'],time:'AT ONCE',title:'Supplies need more than a warehouse.',copy:`Payments fall as low as ${Math.round(Math.min(...r.recoveryModel.frames.map(f=>f.payments))*100)}%; transport as low as ${Math.round(Math.min(...r.recoveryModel.frames.map(f=>f.transport))*100)}%. Deliveries can only move as fast as their weakest required service.`});
  if(r.incident){
  steps.push({nodes:['access','comms','spread'],time:'AT ONCE',title:`One fault. ${r.affectedRegions} regions.`,copy:`${r.affectedRegions} of the six regions use the same network. They all lose their connection. The others use separate systems.`});
  steps.push({nodes:['comms','power','emergency','fallback'],time:'AT ONCE',title:r.powerOutage?'The outage reaches power controls.':'Power keeps running.',copy:`${r.powerOutage?'The power system uses the failed network. Electricity is cut too.':'Its power controls are separate from this failure.'} ${r.emergencyGap?`Emergency teams have trouble taking calls and sending help. Separate radios cover ${settings.fallback}% of their normal response.`:'Separate radios keep emergency teams working.'}`});
  if(r.warning)steps.push({nodes:['comms','checks','warning','military'],time:`WITHIN ${settings.decisionTime} MINUTES`,title:r.verified?'Someone catches the false warning.':r.escalation?'Leaders act on a false warning.':'The warning does not start a conflict.',copy:r.verified?'AI wrongly warns of an attack. People check another source in time and reject it. The power outage still needs fixing.':r.escalation?'AI wrongly warns of an attack. Checks fail to stop it, and rivals already on edge respond by escalating the crisis.':`AI wrongly warns of an attack. ${settings.tension<50?'Rivals are calm enough not to escalate.':'In this case, people choose not to escalate.'}`});
  if(r.nuclear)steps.push({nodes:['military'],time:'AFTER ESCALATION',title:'A further human choice: nuclear use.',copy:'In this fictional case, leaders go on to use nuclear weapons. The service panel cannot calculate the destruction or recovery that follows.'});
  }
  const rm=r.recoveryModel;
  const milestoneNodes:Record<string,string[]>={hospital:['hospital','crews','repair'],cold:['power','food'],tools:['power','repair'],food:['food','crews','repair'],supplies:['supplies','repair'],stalled:['repair','recovery'],restored:['repair','recovery']};
  for(const m of rm.milestones)steps.push({nodes:milestoneNodes[m.kind]||['repair'],time:`AFTER ${m.time} HOURS`,title:({hospital:'Hospital trouble slows the repair crew.',cold:'Food warehouses lose refrigeration.',tools:'The repair tools lose power.',food:'Workers run short of food.',supplies:'Crews run short of supplies.',stalled:'Repair work stops.',restored:'Region 1’s network is repaired.'} as Record<string,string>)[m.kind],copy:m.description+(m.kind==='restored'&&r.nuclear?' This does not calculate recovery from nuclear weapons.':'')});
  if(!rm.completed)steps.push({nodes:['repair','recovery'],time:'AT DAY 30',title:rm.status==='stalled'?'The repair is stalled.':'The repair is not finished.',copy:`${Math.floor(rm.progress*100)}% of the work is done. ${rm.status==='stalled'?'Work has stopped with these resources.':'Crews are still making progress.'} What happens after day 30 is outside this calculation.`});
  if(r.civilisation.firstAidUsedAt!==null)steps.push({nodes:['aid','repair'],time:`AFTER ${r.civilisation.firstAidUsedAt} HOURS`,title:'Help reaches the damaged regions.',copy:'Working regions send spare crews, powered tools, food and materials. Their own essential supplies are kept at home.'});
  if(r.civilisation.crossedAt!==null&&!r.nuclear)steps.push({nodes:['governance','hospital','food','power'],time:`AFTER ${r.civilisation.crossedAt} HOURS`,title:'The collapse threshold is crossed.',copy:`At least ${settings.collapseRegions} regions have lost most power, healthcare, food support and local coordination together for ${settings.collapseDays} days. This is the definition chosen for this experiment, not extinction.`});
  if(r.civilisation.recoveredAt!==null&&!r.nuclear)steps.push({nodes:['aid','repair','recovery'],time:`AFTER ${r.civilisation.recoveredAt} HOURS`,title:'Services recover after the crisis.',copy:'All six regions regain essential support and coordination for a full day. The earlier collapse-threshold crossing remains in the record.'});
  const hour=(text:string)=>text==='30 DAYS BEFORE'?-720:text==='THE START'?-2:text==='AT ONCE'?-1:text==='AFTER ESCALATION'?settings.decisionTime/60+1:text==='AT DAY 30'?720:text.startsWith('WITHIN')?settings.decisionTime/60:Number(text.match(/[\d.]+/)?.[0]||0);
  return steps.sort((a,b)=>hour(a.time)-hour(b.time));
}
function trace(){mode='case';selected='';storyIndex=0;panel='story';focus('world');render();}
function renderImpact(){
  const count=result.affectedRegions;
  $('#impact').innerHTML=`<div class="impact-heading"><button data-inspect="spread">${count===0?'NETWORK HELD':count===1?'ONE REGION':count<6?'SEVERAL REGIONS':'ALL SIX REGIONS'} <span>${count} / 6</span> ↗</button><small>${mode==='conditions'?'Services at risk':'Outage impact'} · six fictional regions</small></div><div class="region-grid">${result.regions.map(r=>`<div class="region ${r.comms?'affected':''}"><button class="region-title" data-region-detail="${result.regions.indexOf(r)}">${r.name} ↗</button><div>${(['comms','power','hospital','food','emergency'] as const).map((key,i)=>`<button class="region-cell ${r[key]?(mode==='conditions'||key==='emergency'&&settings.fallback>0||key==='hospital'&&Math.min(...result.civilisation.regions[result.regions.indexOf(r)].recovery.frames.map(f=>f.healthcare))>=.5?'exposed':'harm'):'safe'}" data-inspect="${key}" data-region="${result.regions.indexOf(r)}" aria-label="${r.name}: ${['calls','power','hospital','cold storage','emergency response'][i]} ${r[key]?(mode==='conditions'?'at risk':'interrupted'):'available'}" data-tip="${['Calls','Power','Hospital','Cold storage','Emergency help'][i]}: ${r[key]?(mode==='conditions'?'at risk':'interrupted'):'available'}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon(['signal','bolt','cross','building','radar'][i])}</svg></button>`).join('')}</div></div>`).join('')}</div>`;
}


initDeck();
$('#mini-map').innerHTML=`<svg viewBox="0 0 1140 650"><g fill="#748299">${layout.map(n=>`<rect x="${n.x}" y="${mapY(n.y)}" width="176" height="90" rx="5"/>`).join('')}</g><rect id="mini-window" fill="#d0e3ff18" stroke="#d0e3ff" stroke-width="8"/></svg>`;
try{
  if(location.hash.startsWith('#scenario=')){loadScenario(JSON.parse(atob(location.hash.slice(10))));}
  else {const stored=localStorage.getItem('switchboard-v1');if(stored){loadScenario(JSON.parse(stored));history=[];}}
}catch{toast('Saved scenario could not be read. Opening the default world.');}
render();updateCamera();
