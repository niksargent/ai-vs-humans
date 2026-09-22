import {MONTH_DEFAULTS,validateMonth,monthChallenges,type MonthSettings,type MonthEnsemble,type MonthOutcome} from './month.js';
import {monthPanel} from './month-ui.js';
import {evidenceFor} from './evidence.js';
import {worldNodes as layout,nodeById,WORLD,connection,primaryEdges,districts,outcomeIcon} from './world-view.js';
import {freshContinuation,validateContinuation,type Continuation,type Gate,type Route,type Assumption} from './continuation.js';
import {continuationPanel} from './continuation-ui.js';
import {pathwayControls,pathwaysPanel,pathwayPresets,pathwayInterventions} from './pathway-ui.js';
import {controlColours,nodeControls,changedNodes} from './feedback.js';
import {DEFAULTS,MODEL_VERSION,controls,simulate,summariseChange,validateSettings,type Settings,type Result,type NumericKey,type Status} from './model.js';
import {icon,svgDefs,sources} from './diagram.js';

const $=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let settings={...DEFAULTS},seed=42, mode:'case'|'conditions'='case';
let result=simulate(settings,seed);
let continuation=freshContinuation();
let monthOptions={...MONTH_DEFAULTS},monthSeed=42,monthData:MonthEnsemble|null=null,monthIndex=0,monthError='',monthRequest=0;
let monthWorker:Worker|null=null;
type Panel='outcomes'|'node'|'advanced'|'range'|'story'|'recovery'|'collapse'|'region'|'pathways'|'rescue'|'beyond';
let panel:Panel='pathways',selected='';
let storyIndex=0;
let changed:string[]=[], changeColour='#86baff', feedbackTimer=0;
let viewArea='Whole world';
let regionContext:number|null=null;
let history:{settings:Settings;seed:number;continuation:Continuation;monthOptions:MonthSettings;monthSeed:number}[]=[];
let camera={x:0,y:0,w:1000,h:700};
let density:'normal'|'compact'='normal';
type Stage='world'|'chain'|'damage'|'rescue'|'beyond';
let stage:Stage='world';
const visited=new Set<Stage>(['world']);
const stageNames:Record<Stage,string>={world:'Set the world',chain:'Follow the chain',damage:'Read the damage',rescue:'Find a way back',beyond:'Beyond collapse'};
const trail:{panel:Panel;selected:string;regionContext:number|null;scroll:number;storyIndex:number;camera:typeof camera;open:string[];density:'normal'|'compact'}[]=[];
function rememberPlace(){trail.push({panel,selected,regionContext,scroll:$('#readout').scrollTop,storyIndex,camera:{...camera},density,open:Array.from(document.querySelectorAll<HTMLDetailsElement>('#readout details[open]')).map(el=>el.querySelector('summary')?.textContent||'')});}
function revealPanel(){const top=$('#readout').getBoundingClientRect().top;if(top<90)window.scrollTo({top:window.scrollY+top-96,behavior:'instant'});if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('#readout').animate([{opacity:.6,transform:'translateX(9px)'},{opacity:1,transform:'translateX(0)'}],{duration:170,easing:'ease-out'});}
function back(){const old=trail.pop();if(!old){enterStage(stage);return;}panel=old.panel;selected=old.selected;regionContext=old.regionContext;storyIndex=old.storyIndex;camera=old.camera;density=old.density;render();updateCamera();document.querySelectorAll<HTMLDetailsElement>('#readout details').forEach(el=>{el.open=old.open.includes(el.querySelector('summary')?.textContent||'');});$('#readout').scrollTop=old.scroll;revealPanel();}
function enterStage(next:Stage){stage=next;visited.add(next);trail.length=0;selected='';regionContext=null;storyIndex=0;panel=next==='world'?'pathways':next==='chain'?'story':next==='damage'?'outcomes':next==='rescue'?'rescue':'beyond';if(next==='world')focus('origins');if(next==='rescue')focus('recovery');if(next==='damage')focus('health');render();if(next==='chain')focusStory();$('#readout').scrollTop=0;guide(({world:'Choose a spark. Then use the controls to change what happens.',chain:'Follow one link at a time. The circuit travels with you.',damage:'Look at what people lose—and what keeps working. Select a readout to look closer.',rescue:'You have options. Protect a lifeline and watch the chain change.',beyond:'A catastrophe can leave people alive. Explore what would threaten the survivors.'})[next]);}
function guide(message:string){$('#change-text').textContent=message;}

let worker:Worker|null=null, requestId=0;
let range:{count:number;escalation:number;nuclear:number;health:number}|null=null;
const deckInfo:{key:NumericKey;title:string;question:string;node:string}[]=[
  {key:'capability',title:'AI ABILITIES',question:'What can it operate?',node:'ai'},
  {key:'authority',title:'PERMISSIONS',question:'Can it act without asking?',node:'access'},
  {key:'tension',title:'WORLD TENSION',question:'How close are rivals to conflict?',node:'military'},
  {key:'verification',title:'HUMAN CHECKS',question:'Can we challenge a warning?',node:'checks'},
  {key:'fallback',title:'INDEPENDENCE',question:'Can we operate without it?',node:'fallback'},
  {key:'reserves',title:'HOSPITAL BACKUP',question:'How long can services hold?',node:'hospital'},
  {key:'researchSpeed',title:'AI PROJECT PACE',question:'How fast do ideas arrive?',node:'development'}
];
deckInfo.splice(1,0,deckInfo.pop()!);
function description(key:NumericKey):{value:string;unit:string;note:string} {
  switch(key){
    case 'capability':return {value:['Suggest','Configure','Coordinate'][settings.capability],unit:['proposals only','one network','connected services'][settings.capability],note:['Can suggest a change. Cannot execute it.','Can change how calls and messages are routed.','Can run phone networks and power controls.'][settings.capability]};
    case 'authority':return {value:['Advise','Ask first','Act'][settings.authority],unit:['no execution','approval required','without asking'][settings.authority],note:['It can suggest an update, but cannot install it.','A person must approve the proposed change.','It can install an update while people use the system.'][settings.authority]};
    case 'tension':return {value:settings.tension<50?'Low':settings.tension<80?'High':'Severe',unit:`${settings.tension} / 100`,note:'Rivals on edge are more likely to believe an attack warning.'};
    case 'verification':return {value:settings.verification<40?'Weak':settings.verification<75?'Stronger':'Robust',unit:`${settings.verification} / 100 · strength`,note:!result.verificationAvailable?'The checking team needs a working channel. Open the machine to give it independent verification.':`Needs ${result.verificationMinutes} min. Decisions allow ${settings.decisionTime} min.`};
    case 'fallback':return {value:`${settings.fallback}%`,unit:'independent capacity',note:'Separate ways to coordinate repairs shorten the outage.'};
    case 'reserves':return {value:`${settings.reserves}h`,unit:'of essential power',note:'Generators keep essential hospital equipment running.'};
    case 'researchSpeed':return {value:`${(4*settings.researchSpeed/100).toFixed(1)}/day`,unit:settings.researchEnabled?'candidate ideas':'projects paused',note:settings.researchEnabled?`${Math.floor(result.pathways.research.made+1e-9)} ideas · ${Math.floor(result.pathways.research.checked+1e-9)} checked in 30 days.`:'Open AI projects to start the research queue.'};
    default:return {value:String(settings[key]),unit:'',note:''};
  }
}
function initDeck(){
  $('#controls').innerHTML=deckInfo.map((d,i)=>`<article class="control-bank" data-bank="${d.key}"><div class="bank-top"><h2 class="bank-title">${d.title}</h2><span class="bank-number">0${i+1}</span></div><button class="bank-inspect" data-inspect="${d.node}" aria-label="Explain ${d.title.toLowerCase()}" title="What does this mean?">↗</button><p class="bank-question">${d.question}</p><div class="dial-row"><div class="dial-wrap"><button class="dial" data-key="${d.key}" role="slider" aria-label="${d.title.toLowerCase()}" aria-valuemin="${controls[d.key].min}" aria-valuemax="${controls[d.key].max}" aria-valuenow="${settings[d.key]}" title="Drag up or down. Arrow keys adjust."></button></div><div class="dial-value"></div></div><p class="control-note"></p>${d.key==='researchSpeed'?'<button class="pace-power" id="research-power">Start AI projects</button>':''}</article>`).join('');
  document.querySelectorAll<HTMLButtonElement>('.dial').forEach(dial=>{
    const key=dial.dataset.key as NumericKey,c=controls[key];
    let startY=0,startValue=0,drag=false,recorded=false,dialBefore=result;
    dial.addEventListener('pointerdown',e=>{dialBefore=result;startY=e.clientY;startValue=settings[key];drag=true;recorded=false;dial.setPointerCapture(e.pointerId);dial.focus();e.preventDefault();});
    dial.addEventListener('pointermove',e=>{if(!drag)return;const next=Math.max(c.min,Math.min(c.max,Math.round((startValue+(startY-e.clientY)*(c.max-c.min)/150)/c.step)*c.step));if(next!==settings[key]){if(!recorded){remember();recorded=true;}change({...settings,[key]:next},false,dialBefore);}});
    dial.addEventListener('pointerup',()=>drag=false);dial.addEventListener('pointercancel',()=>drag=false);
    dial.addEventListener('keydown',e=>{if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','Home','End'].includes(e.key))e.preventDefault();let next=settings[key];if(['ArrowUp','ArrowRight'].includes(e.key))next+=c.step;if(['ArrowDown','ArrowLeft'].includes(e.key))next-=c.step;if(e.key==='Home')next=c.min;if(e.key==='End')next=c.max;if(next!==settings[key]){e.preventDefault();change({...settings,[key]:Math.max(c.min,Math.min(c.max,next))});}});
  });
}
function updateDeck(){const power=document.querySelector('#research-power');if(power)power.textContent=settings.researchEnabled?'Pause AI projects':'Start AI projects';for(const d of deckInfo){const bank=$(`[data-bank="${d.key}"]`),desc=description(d.key),c=controls[d.key];const dial=bank.querySelector<HTMLElement>('.dial')!;bank.querySelector<HTMLElement>('.dial-wrap')!.style.setProperty('--fill',`${270*(settings[d.key]-c.min)/(c.max-c.min)}deg`);dial.style.setProperty('--angle',`${-135+270*(settings[d.key]-c.min)/(c.max-c.min)}deg`);dial.setAttribute('aria-valuenow',String(settings[d.key]));dial.setAttribute('aria-valuetext',`${desc.value}, ${desc.unit}`);bank.querySelector('.dial-value')!.innerHTML=`${desc.value}<small>${desc.unit}</small>`;bank.querySelector('.control-note')!.textContent=desc.note;dial.setAttribute('title',desc.note+' Drag up or down; arrow keys adjust.');}}
function remember(){history.push({settings:{...settings},seed,continuation:validateContinuation(continuation),monthOptions:{...monthOptions},monthSeed});if(history.length>80)history.shift();}
function persist(){try{localStorage.setItem('switchboard-v1',JSON.stringify(scenarioObject()));}catch{/* Browsing can continue without storage. */}}
function feedback(before:Result){
  changed=changedNodes(before,result);
  const key=(Object.keys(settings) as (keyof Settings)[]).find(k=>settings[k]!==before.settings[k]);
  if(key==='researchSpeed'||key==='researchEnabled')guide(settings.researchEnabled?`AI projects running: ${Math.floor(result.pathways.research.made+1e-9)} ideas, ${Math.floor(result.pathways.research.checked+1e-9)} checked, ${Math.floor(result.pathways.research.unchecked+1e-9)} released unchecked. Computers, experiments and checks set the pace.`:'AI projects paused. Other threats and defences are still active.');
  else if(before.civilisation.crossedAt!==null&&result.civilisation.crossedAt===null)guide('You broke the collapse chain. Now check which services still need help.');
  else if(before.hospitalGap>result.hospitalGap)guide(`More breathing room for hospitals: ${result.hospitalGap?`${result.hospitalGap} hours without power.`:'their essential equipment stays powered.'}`);
  else if(before.escalation&&!result.escalation)guide('The false warning no longer starts a conflict. Now protect the services on the other branch.');
  else guide(summariseChange(before,result));
  clearTimeout(feedbackTimer);feedbackTimer=window.setTimeout(()=>{changed=[];renderMap();},1400);
}
function clearFeedback(){changed=[];clearTimeout(feedbackTimer);}
function change(next:Settings,record=true,origin?:Result){if(record)remember();const before=origin||result;settings=validateSettings(next);result=simulate(settings,seed);range=null;requestId++;feedback(before);persist();render();}


function displayNode(id:string):{status:Status;label:string}{
  const n=result.nodes[id];if(id==='collapse')return {...n,label:result.nuclear?'Aftermath unknown':result.civilisation.endStatus==='collapse'?'The world is coming apart':result.civilisation.recoveredAt!==null?'Back from the brink':result.civilisation.endStatus==='disrupted'?'Still fighting to recover':'The world holds together'};if(mode==='case'||n.status==='unknown')return n;
  const possible=result.incident;
  switch(id){
    case 'comms':return {status:possible?'exposed':'safe',label:possible?'Faulty change can execute':'Execution route blocked'};
    case 'checks':if(!result.verificationAvailable)return {status:'exposed',label:'No working check channel'};return {status:result.verificationMinutes<=settings.decisionTime?'safe':'exposed',label:result.verificationMinutes<=settings.decisionTime?'A timely check is possible':'Check misses the deadline'};
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
function renderMap(){
  $('#world-svg').classList.toggle('compact-circuit',density==='compact');
  const step=panel==='story'?storySteps()[storyIndex]:null;
  const linked=step?new Set(step.nodes):selected&&selected!=='nuclear'?new Set([selected,...(result.nodes[selected]?.parents||[]),...Object.keys(result.nodes).filter(id=>result.nodes[id].parents.includes(selected))]):null;
  const edges=new Map(primaryEdges.map(([a,b])=>[a+'-'+b,[a,b]]));
  if(linked)for(const id of linked)for(const parent of result.nodes[id]?.parents||[])if(linked.has(parent)&&nodeById[parent]&&nodeById[id])edges.set(parent+'-'+id,[parent,id]);
  const paths=[...edges.values()].map(([from,to])=>{const active=result.nodes[from]?.status,related=!linked||linked.has(from)&&linked.has(to);return `<path class="circuit-track" d="${connection(from,to)}"/><path class="circuit-wire ${active} ${related?'':'distant'}" d="${connection(from,to)}"/>`;}).join('');
  const cards=layout.map(n=>{const state=displayNode(n.id),colour=controlColours[nodeControls[n.id]]||'#d7e6f4';return `<g class="machine-node ${state.status} ${selected===n.id||step?.nodes.includes(n.id)?'selected':''} ${linked&&!linked.has(n.id)?'distant':''} ${changed.includes(n.id)?'changed':''}" data-node="${n.id}" transform="translate(${n.x} ${n.y})" tabindex="0" role="button" aria-label="${n.title}: ${esc(state.label)}. Select to explore."><rect class="socket" width="210" height="112" rx="13"/><rect class="glass" x="5" y="5" width="200" height="102" rx="10"/><path class="glass-edge" d="M18 6 H192"/><circle class="port" cx="0" cy="56" r="3"/><circle class="port" cx="210" cy="56" r="3"/><g class="module-icon" transform="translate(16 14) scale(.72)">${icon(n.icon)}</g><circle class="lamp-bezel" cx="187" cy="23" r="9"/><circle class="module-led" cx="187" cy="23" r="5.5"/><text class="module-title" fill="${colour}" x="16" y="58">${density==='compact'?({development:'AI projects',access:'Permission',comms:'Comms',power:'Power',checks:'Checks',warning:'Warning',military:'Conflict',hospital:'Hospital',governance:'Coordination',bio:'Health threat',fallback:'Backups',repair:'Repair',recovery:'Recovery',spread:'Regions',food:'Food',emergency:'Response',crews:'Crews',supplies:'Supplies',aid:'Outside help',control:'Stop control',information:'Information',payments:'Payments',transport:'Transport',collapse:'Civilisation',ai:'AI ability'} as Record<string,string>)[n.id]||n.title:n.title}</text>${wrap(state.label,28).map((line,i)=>`<text class="module-sub" x="16" y="${80+i*16}">${esc(line)}</text>`).join('')}</g>`;}).join('');
  $('#world-svg').innerHTML=svgDefs+`<g class="district-engraving">${districts.map((d,i)=>`<text x="${d.x}" y="40">0${i+1} / ${d.name}</text><text class="district-sub" x="${d.x}" y="64">${d.sub}</text>`).join('')}</g>`+paths+cards;
  $('#system-state').textContent=result.nuclear?'CRITICAL ALERT':result.civilisation.endStatus==='collapse'?'WORLD IN CRISIS':result.incident||result.pathways.healthIntroduced?'WORLD UNDER PRESSURE':'WORLD HOLDING';
  $('#main').dataset.alert=result.nuclear||result.civilisation.endStatus==='collapse'?'critical':result.incident?'warning':'safe';
}
function outcomeCard(title:string,text:string,status:Status,id?:string){return `<button class="instrument-readout ${status}" data-inspect="${id||'collapse'}"><span class="outcome-symbol"><svg viewBox="0 0 24 24">${outcomeIcon(id||'collapse')}</svg></span><span><strong>${title}</strong><small>${text}</small></span><i class="signal-led ${status}"></i></button>`;}
function placeName(p:Panel,id:string,region:number|null){return p==='node'?(nodeById[id]?.title||'Nuclear weapons'):p==='region'?`Region ${(region??0)+1}`:({pathways:'Causes',advanced:'All controls',story:'Events',outcomes:'World status',rescue:'Safeguards',beyond:'Survival',range:'Human choices',recovery:'Repairs',collapse:'Civilisation'} as Record<string,string>)[p];}
function panelHeader(name:string){const parents=trail.map((entry,i)=>`<button data-trail-index="${i}">${placeName(entry.panel,entry.selected,entry.regionContext)}</button><span> › </span>`).join('');return `<div class="readout-head"><nav class="breadcrumbs" aria-label="Your location"><button data-stage="${stage}">${stageNames[stage]}</button><span> / </span>${parents}<span>${placeName(panel,selected,regionContext)||name}</span></nav>${trail.length?'<button class="back-control" id="panel-back">← Back</button>':''}</div>`;}
function evidenceNote(id:string){const e=evidenceFor(id);return e?`<p class="rule-label">WHY THIS LINK MAKES SENSE</p><p class="rule-copy">${esc(e.mechanism)}</p><p class="rule-label">WHAT WE ASSUME</p><p class="rule-copy">${esc(e.assumption)}</p>${sourceLink(e.source)}`:'';}
function sourceLink(which:keyof typeof sources){const s=sources[which];return `<a class="source-link" href="${s.url}" target="_blank" rel="noreferrer">${s.name} ↗</a>`;}
function renderPanel(){
  const el=$('#readout');
  if(panel==='outcomes'){
    const c=result.civilisation;
    el.innerHTML=panelHeader('World status')+`<div class="readout-name"><span class="etched-label">LIVE CONSEQUENCES</span><h2>What is at stake.</h2></div>`+
      outcomeCard('Military crisis',result.escalation?'A false warning pushes rivals into conflict.':'The warning does not start a conflict.',result.escalation?'harm':'safe','military')+
      outcomeCard('Hospital lifeline',result.recoveryModel.healthcareGap?`${result.recoveryModel.healthcareGap} hours when care cannot keep up.`:'Essential care holds. People can get help.',result.nodes.hospital.status,'hospital')+
      outcomeCard('Nuclear weapons',result.nuclear?'Leaders choose to use nuclear weapons.':'This escalation is avoided.',result.nuclear?'harm':'quiet','nuclear')+
      outcomeCard('Civilisation',result.nuclear?'A nuclear catastrophe. What follows is unknown.':c.endStatus==='collapse'?'The lifelines fail. Recovery is still out of reach.':c.recoveredAt!==null?'Brought back from the brink. Services recover.':c.endStatus==='disrupted'?'Still standing. Still fighting to recover.':'The world holds together.',result.nodes.collapse.status,'collapse')+
      `<button class="primary-action" data-stage="rescue">Find a way back <span>→</span></button><button class="small-button" id="open-month">Can the world keep up for a month? ↗</button><button class="small-button" data-panel="range">Could people choose differently? ↗</button>`;
  } else if(panel==='collapse'){
    el.innerHTML=collapsePanel();
  } else if(panel==='beyond'){
    el.innerHTML=panelHeader('Survival')+`<h2 class="inspector-title">After the worst, could we survive?</h2><p class="inspector-copy">A broken world can still have a future. Follow the extra links between catastrophe and the loss of every surviving community.</p><button class="primary-action" data-inspect="extinction">Explore the last lines of defence →</button><button class="small-button" data-stage="rescue">Back to saving this world ←</button>`;
  } else if(panel==='rescue'){
    el.innerHTML=rescuePanel();
  } else if(panel==='region'){
    el.innerHTML=regionPanel(regionContext??0);
  } else if(panel==='recovery'){
    el.innerHTML=recoveryPanel();
  } else if(panel==='story'){
    const steps=storySteps(); storyIndex=Math.min(storyIndex,steps.length-1); const step=steps[storyIndex];
    el.innerHTML=panelHeader('SHOW WHAT HAPPENED')+`<div class="story-number">${String(storyIndex+1).padStart(2,'0')}<small> / ${steps.length}</small></div><p class="story-time">${step.time}</p><h2 class="inspector-title">${step.title}</h2><p class="story-copy" aria-live="polite">${step.copy}</p><div class="story-nav"><button id="story-prev" ${storyIndex===0?'disabled':''}>← Back</button><button id="story-next" ${storyIndex===steps.length-1?'disabled':''}>Next →</button></div><div class="story-dots">${steps.map((_,i)=>`<button data-step="${i}" aria-label="Step ${i+1}" aria-current="${i===storyIndex?'step':'false'}"></button>`).join('')}</div>`;
  } else if(panel==='node'){
    const n=nodeById[selected]||{title:'Nuclear weapons',kicker:'A HUMAN DECISION'};const state=selected==='nuclear'?{...result.nodes.military,status:result.nuclear?'harm' as Status:'quiet' as Status,label:result.nuclear?'Nuclear weapons are used':'Nuclear use is avoided',reason:result.nuclear?'The false warning escalates into conflict. Leaders make a further decision to use nuclear weapons. It is a catastrophe beyond the original network failure.':'The escalation does not reach nuclear weapons in this run. Keeping checks independent and giving leaders time to verify a warning can break the route.',rule:'This requires escalation, high tension and a separate seeded human strategic-use decision. Nuclear damage is not calculated.'}:result.nodes[selected],display=regionContext!==null&&regionContext>=result.affectedRegions?{status:'safe' as Status,label:'Available in this region'}:selected==='nuclear'?state:displayNode(selected);
    el.innerHTML=panelHeader('FOLLOW THE CONNECTION')+`<span class="etched-label">${n.kicker}</span><h2 class="inspector-title">${n.title}</h2><div class="inspector-status"><i class="status-lamp ${display.status}"></i>${esc(display.label)}</div><p class="inspector-copy">${regionContext!==null?`<strong>Region ${regionContext+1}</strong><br>${regionContext>=result.affectedRegions?'This region uses a separate network, or the update was stopped. Its services keep working.':esc(state.reason)}`:esc(mode==='conditions'&&state.status!=='unknown'?'The highlighted route shows how this component is connected. Choose “What happens in this case” in Explore to inspect which events occurred.':state.reason)}</p><details class="model-details"><summary>How this works & sources</summary><p class="rule-label">${state.status==='unknown'?'MODEL COVERAGE':'THE RULE IN THIS MODEL'}</p><p class="rule-copy">${esc(state.rule)}</p>${evidenceNote(selected)}</details>${pathwayInterventions(selected)}${selected==='development'?'<button class="primary-action" id="open-month">Run a month of releases →</button>':''}<button class="small-button" data-panel="advanced">Inspect the settings <span>↗</span></button><button class="small-button" id="trace-selected">Show what happened <span>↗</span></button>`;
  } else if(panel==='pathways'){
    el.innerHTML=panelHeader('EXPLORE THE CAUSES')+pathwaysPanel(result);
  } else if(panel==='advanced'){
    el.innerHTML=panelHeader('Inside the machine')+`<button class="small-button" data-panel="pathways">Try another cause ↗</button>`+pathwayControls(rangeField,toggleField)+`<details class="model-details"><summary>Regions, reserves & repairs</summary>`+
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
      `</details>`;
  } else {
    el.innerHTML=panelHeader('Human choices')+`<h2 class="inspector-title">Same world.<br>Different decisions.</h2><p class="inspector-copy">People do not always react the same way to a warning. Keep your controls fixed and replay 256 possible human responses.</p>`+(range?[
      ['Conflict escalates',range.escalation],['Nuclear weapons used',range.nuclear],['Hospital power fails',range.health]
    ].map(([label,count])=>`<div class="hist-row"><div><span>${label}</span><span>${count} of ${range!.count}</span></div><div class="hist-track"><i style="width:${Number(count)/range!.count*100}%"></i></div></div>`).join(''):'<p class="inspector-copy">Replaying human decisions…</p>')+`<p class="rule-copy">Only people’s decisions change. Services and reserves follow your settings, so their outcome repeats.</p><button class="primary-action" id="new-case">Try another human response ↻</button><details class="model-details"><summary>How the replay works</summary><p>The same settings and replay number reproduce the same decisions. Current replay: ${seed}. The 256 outcomes are generated by this model, not measured real-world odds.</p></details>`;
    if(!range)requestEnsemble();
  }
}

function rangeField(key:NumericKey,label:string,copy:string,unit:string){const c=controls[key];return `<div class="advanced-field"><label for="adv-${key}">${label}<output>${settings[key]} ${unit}</output></label><input id="adv-${key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${settings[key]}" data-setting="${key}" data-unit="${unit}"><p>${copy}</p></div>`;}
function toggleField(key:keyof Settings,label:string,copy:string){return `<div class="advanced-field"><label for="adv-${key}">${label}<input id="adv-${key}" type="checkbox" data-setting="${key}" ${settings[key]?'checked':''}></label><p>${copy}</p></div>`;}
function render(skipPanel=false){$('.scenario-line strong').textContent=result.pathways.harmfulOperation?'An agent will not let go. Can you stop it?':result.pathways.healthIntroduced?'Hospitals face a surge. Keep care alive.':settings.researchEnabled?'Ideas accelerate. Can the checks keep up?':result.pathways.misinformation?'Conflicting instructions. A world under pressure.':'One bad update. A world of consequences.';if(panel==='story')storyIndex=Math.min(storyIndex,storySteps().length-1);updateDeck();renderMap();renderImpact();if(!skipPanel)renderPanel();$('#undo-button').toggleAttribute('disabled',!history.length);document.querySelectorAll<HTMLElement>('[data-stage]').forEach(el=>{el.classList.toggle('active',el.dataset.stage===stage);el.classList.toggle('visited',visited.has(el.dataset.stage as Stage));if(el.dataset.stage===stage)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});}
function requestEnsemble(){const id=++requestId;try{if(!worker){worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});worker.onmessage=e=>{if(e.data.id!==requestId)return;range=e.data;if(panel==='range')renderPanel();};worker.onerror=()=>{if(panel==='range'){$('#readout').innerHTML=panelHeader('Human choices')+'<p class="inspector-copy">The replay could not start. Your current world and its controls still work.</p>';}};}worker.postMessage({settings,seed,id});}catch{$('#readout').innerHTML=panelHeader('Human choices')+'<p class="inspector-copy">This browser cannot run the replay. Your current world still works.</p>';}}

function inspect(id:string){if(id==='extinction'){showExtinction();return;}if(selected===id&&panel==='node'){back();return;}rememberPlace();regionContext=null;selected=id;panel=id==='collapse'?'collapse':id==='repair'||id==='recovery'?'recovery':'node';renderMap();renderPanel();$('#readout').scrollTop=0;focusNode(id);revealPanel();}
function setPanel(next:Panel){rememberPlace();regionContext=null;panel=next;if(next!=='node')selected='';renderMap();renderPanel();$('#readout').scrollTop=0;revealPanel();}
function toast(text:string){$('#toast').textContent=text;$('#toast').classList.add('visible');window.setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
function openDialog(title:string,eyebrow:string,html:string){$('#dialog').classList.remove('continuation-dialog','month-dialog');$('#dialog-title').textContent=title;$('#dialog-eyebrow').textContent=eyebrow;$('#dialog-body').innerHTML=html;$<HTMLDialogElement>('#dialog').showModal();}
function showAbout(){openDialog('A machine for asking “what if?”','THE MODEL / STUDY 01',`<p>This first playable section explores how <strong>introduced AI-related challenges</strong> can interrupt services, affect a military decision, overwhelm care or prevent recovery.</p><p class="callout">Change the inputs. The consequences update immediately. Select any component to inspect its rule and the evidence behind the dependency.</p><h3>What is calculated?</h3><p>Permission gates, a shared communications/power outage, verification before a deadline, illustrative human responses, backup depletion, regional repair, finite mutual aid, emergency coordination and an adjustable sustained-collapse test. Additional introduced cases explore development queues, persistent agents, health demand, false messages, payments and transport. The same settings and human-response replay reproduce the same result.</p><h3>What is still a preview?</h3><p>Wider political change, detailed epidemics, financial-market contagion and extinction. Their components reveal the intended whole-world structure without claiming to calculate those outcomes.</p><h3>What do the numbers mean?</h3><p>All coefficients and starting values are educational assumptions. The model is not calibrated to today's world. Sources support general mechanisms; they do not validate the model's probabilities. The circuit shows the current result; Follow the chain explains it one event at a time.</p>${sourceLink('ai')}${sourceLink('military')}${sourceLink('resilience')}<p>Model ${MODEL_VERSION}. Runs on your device. No AI service is making its decisions. Settings are saved in this browser; Reset restores the opening world.</p>`);}

function renderMonth(){
 if(!$('#dialog').classList.contains('month-dialog'))return;
 const open=Array.from(document.querySelectorAll<HTMLDetailsElement>('#dialog-body details[open]')).map(d=>d.querySelector('summary')?.textContent);
 const top=$('#dialog').scrollTop,active=document.activeElement as HTMLElement,key=active?.dataset.month,setting=active?.dataset.monthSetting;
 $('#dialog-body').innerHTML=monthPanel(settings,monthOptions,monthData,monthIndex,monthError);
 document.querySelectorAll<HTMLDetailsElement>('#dialog-body details').forEach(d=>{d.open=open.includes(d.querySelector('summary')?.textContent);});
 $('#month-undo').toggleAttribute('disabled',!history.length);$('#dialog').scrollTop=top;
 if(key)document.querySelector<HTMLElement>(`[data-month="${key}"]`)?.focus({preventScroll:true});
 if(setting)document.querySelector<HTMLElement>(`[data-month-setting="${setting}"]`)?.focus({preventScroll:true});
}
function requestMonth(){
 const id=++monthRequest;monthData=null;monthIndex=0;monthError='';renderMonth();
 try{if(!monthWorker){monthWorker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});monthWorker.onmessage=e=>{if(e.data.id!==monthRequest)return;if(e.data.error)monthError=e.data.error;else monthData=e.data;renderMonth();};monthWorker.onerror=()=>{monthError='The month could not run. Try again.';monthWorker?.terminate();monthWorker=null;renderMonth();};}monthWorker.postMessage({kind:'month',id,settings,seed:monthSeed,options:monthOptions});}catch{monthError='This browser could not start the month experiment.';renderMonth();}
}
function showMonth(){openDialog('Can the world keep up?','THE NEXT 30 DAYS','');$('#dialog').classList.add('month-dialog');requestMonth();}
$('#dialog-body').addEventListener('change',e=>{
 const input=e.target as HTMLInputElement;
 if(input.dataset.month){remember();const key=input.dataset.month as keyof MonthSettings;monthOptions={...monthOptions,[key]:Number(input.value)};if(monthOptions.checkedFault>monthOptions.uncheckedFault){if(key==='checkedFault')monthOptions.uncheckedFault=monthOptions.checkedFault;else monthOptions.checkedFault=monthOptions.uncheckedFault;}persist();requestMonth();}
 if(input.dataset.monthSetting){const key=input.dataset.monthSetting as keyof Settings;change({...settings,[key]:input.type==='checkbox'?input.checked:Number(input.value)});requestMonth();}
});
$('#dialog-body').addEventListener('click',e=>{
 const target=e.target as Element,challenge=target.closest<HTMLElement>('[data-month-challenge]'),outcome=target.closest<HTMLElement>('[data-month-outcome]');
 if(challenge){const c=monthChallenges[challenge.dataset.monthChallenge!];remember();monthOptions={...c.options};change({...DEFAULTS,...c.settings},false);requestMonth();return;}
 if(outcome&&monthData){monthIndex=monthData.runs.findIndex(r=>r.outcome===outcome.dataset.monthOutcome as MonthOutcome);renderMonth();return;}
 const id=target.closest<HTMLElement>('[id]')?.id;
 if(id==='month-prev'||id==='month-next'){monthIndex=Math.max(0,Math.min((monthData?.count||1)-1,monthIndex+(id==='month-next'?1:-1)));renderMonth();}
 if(id==='month-more'){remember();monthSeed=(monthSeed+128)>>>0;persist();requestMonth();}
 if(id==='month-retry')requestMonth();
 if(id==='month-power'){change({...settings,researchEnabled:!settings.researchEnabled});requestMonth();}
 if(id==='month-undo'){$('#undo-button').click();requestMonth();}
 if(id==='month-world'){$<HTMLDialogElement>('#dialog').close();setPanel('advanced');}
});

function showExtinction(){openDialog('Could anyone survive?','BEYOND COLLAPSE',continuationPanel(result,continuation));$('#dialog').classList.add('continuation-dialog');}
function refreshContinuation(focusGate?:Gate){
  $('#undo-button').toggleAttribute('disabled',!history.length);
  const open=Array.from(document.querySelectorAll<HTMLDetailsElement>('#dialog-body details[open]')).map(el=>el.dataset.gate).filter(Boolean);
  $('#dialog-body').innerHTML=continuationPanel(result,continuation);
  for(const id of open){const el=document.querySelector<HTMLDetailsElement>(`[data-gate="${id}"]`);if(el)el.open=true;}
  if(focusGate)$<HTMLSelectElement>(`#continuation-${focusGate}`).focus();
}
$('#dialog-body').addEventListener('change',e=>{const input=e.target as HTMLSelectElement;const gate=input.dataset.continuationGate as Gate|undefined;if(!gate)return;remember();continuation[continuation.route][gate]=input.value as Assumption;persist();refreshContinuation(gate);});
function scenarioObject(){return {version:MODEL_VERSION,settings,seed,continuation,monthOptions,monthSeed};}
function loadScenario(raw:unknown){clearFeedback();const obj=raw as {version?:unknown;settings?:unknown;seed?:unknown;continuation?:unknown;monthOptions?:unknown;monthSeed?:unknown};if(!obj||!['0.1.0','0.2.0','0.2.1','0.3.0','0.4.0','0.5.0','0.5.1','0.6.0','0.6.1',MODEL_VERSION].includes(String(obj.version)))throw Error('This file needs a compatible model version.');if(typeof obj.seed!=='number'||!Number.isInteger(obj.seed)||obj.seed<0||obj.seed>4294967295)throw Error('Invalid case number.');const checked=validateSettings(obj.version!==MODEL_VERSION?{...DEFAULTS,...obj.settings as object}:obj.settings);const checkedContinuation=validateContinuation(obj.continuation);const checkedMonth=validateMonth(obj.monthOptions);if(obj.monthSeed!==undefined&&(typeof obj.monthSeed!=='number'||!Number.isInteger(obj.monthSeed)||obj.monthSeed<0||obj.monthSeed>4294967295))throw Error('Invalid month replay.');remember();monthOptions=checkedMonth;monthSeed=obj.monthSeed as number??42;continuation=checkedContinuation;seed=obj.seed;settings=checked;result=simulate(settings,seed);selected='';panel='outcomes';range=null;requestId++;persist();render();$('#change-text').textContent=obj.version===MODEL_VERSION?'Your world is restored. Change a dial or follow what happened.':'Model updated. Your controls are kept; outcomes have been recalculated.';}
function showSave(){openDialog('Keep this world.','SAVE / OPEN / SHARE',`<p>Save your settings and human-response replay. Reopening the same model version reproduces the result.</p><div class="export-line"><button class="primary" id="download-scenario">Download scenario</button><button class="secondary" id="copy-link">Copy scenario link</button></div><label class="import-label">Open a saved scenario<input id="import-scenario" type="file" accept="application/json,.json"></label><p>Links point to the current host. A localhost link only works on this computer; use a deployed site URL to share with others.</p>`);}

document.addEventListener('click',e=>{
  const target=e.target as Element;
  const stageButton=target.closest<HTMLElement>('[data-stage]');if(stageButton){enterStage(stageButton.dataset.stage as Stage);return;}
  const crumb=target.closest<HTMLElement>('[data-trail-index]');if(crumb){trail.splice(Number(crumb.dataset.trailIndex)+1);back();return;}
  if(target.closest('#open-month')){showMonth();return;}
  if(target.closest('#panel-back')){back();return;}
  if(target.closest('#research-power')){change({...settings,researchEnabled:!settings.researchEnabled});return;}
  const rescue=target.closest<HTMLElement>('[data-rescue]');if(rescue){const id=rescue.dataset.rescue!;const changes:Record<string,Partial<Settings>>={checks:{verification:100,decisionTime:120},hospital:{reserves:720},isolation:{independentStop:true},screening:{screening:true},trust:{trustedChannels:100},repair:{repairBackup:720,repairSupplies:168,supplyDelivery:100},refuges:{reach:4,aidStrength:100,aidBudget:168}};change({...settings,...changes[id]});return;}
  const densityButton=target.closest<HTMLElement>('[data-density]');if(densityButton){density=densityButton.dataset.density as typeof density;focus(density==='compact'?'world':'services');return;}

  const continuationRoute=target.closest<HTMLElement>('[data-continuation-route]');if(continuationRoute){continuation.route=continuationRoute.dataset.continuationRoute as Route;persist();refreshContinuation();$<HTMLButtonElement>(`[data-continuation-route="${continuation.route}"]`).focus();return;}
  if(target.closest('#continuation-refuge')){remember();continuation[continuation.route].reach='no';persist();refreshContinuation();return;}
  if(target.closest('#continuation-reset')){remember();const route=continuation.route;continuation[route]=freshContinuation()[route];persist();refreshContinuation();return;}

  const pathwayButton=target.closest<HTMLElement>('[data-pathway]');if(pathwayButton){const id=pathwayButton.dataset.pathway!;mode='case';change({...DEFAULTS,...pathwayPresets[id]});inspect(({outage:'comms',research:'development',control:'control',health:'bio',information:'information',deliveries:'payments'} as Record<string,string>)[id]);return;}
  const interruptButton=target.closest<HTMLElement>('[data-interrupt]');if(interruptButton){const key=interruptButton.dataset.interrupt as keyof Settings;change({...settings,[key]:typeof settings[key]==='boolean'?true:100});return;}
  const regionButton=target.closest<HTMLElement>('[data-region]');if(regionButton){rememberPlace();selected=regionButton.dataset.inspect!;regionContext=Number(regionButton.dataset.region);panel='region';renderMap();renderPanel();$('#readout').scrollTop=0;revealPanel();return;}
  const regionDetail=target.closest<HTMLElement>('[data-region-detail]');if(regionDetail){rememberPlace();regionContext=Number(regionDetail.dataset.regionDetail);selected='';panel='region';renderPanel();renderMap();$('#readout').scrollTop=0;revealPanel();return;}
  const inspectButton=target.closest<HTMLElement>('[data-inspect]');if(inspectButton){inspect(inspectButton.dataset.inspect!);return;}
  const node=target.closest<SVGElement>('[data-node]');if(node){inspect(node.dataset.node!);return;}
  const panelButton=target.closest<HTMLElement>('[data-panel]');if(panelButton){setPanel(panelButton.dataset.panel as typeof panel);return;}
  const modeButton=target.closest<HTMLElement>('[data-mode]');if(modeButton){mode=modeButton.dataset.mode as typeof mode;render();return;}
  const focusButton=target.closest<HTMLElement>('[data-focus]');if(focusButton){focus(focusButton.dataset.focus!);return;}
  const stepButton=target.closest<HTMLElement>('[data-step]');if(stepButton){storyIndex=Number(stepButton.dataset.step);render();focusStory();return;}
  const id=target.closest<HTMLElement>('[id]')?.id;
  if(id==='story-prev'||id==='story-next'){storyIndex=Math.max(0,Math.min(storySteps().length-1,storyIndex+(id==='story-next'?1:-1)));render();focusStory();return;}
  if(id==='try-wide-failure'){mode='case';change({...DEFAULTS,reach:6,crews:25,repairBackup:24,foodStores:48,regionDifference:50,responseBackup:72,collapseRegions:4,collapseDays:14});panel='collapse';render();return;}
  if(id==='keep-refuges'){mode='case';change({...settings,reach:4,aidStrength:100,aidBudget:168});panel='collapse';render();return;}
  if(id==='protect-repairs'){mode='case';change({...settings,repairBackup:720,repairSupplies:168,supplyDelivery:100});panel='recovery';selected='';render();return;}
  if(id==='new-case'){clearFeedback();remember();seed=(seed+1)>>>0;range=null;requestId++;result=simulate(settings,seed);panel='outcomes';mode='case';persist();render();$('#change-text').textContent=`People chose differently. Your world and its defences stayed the same. Open Human choices to explore the range.`;}
  if(id==='trace-selected'||id==='trace-button'){trace();}
  if(id==='download-scenario'){const blob=new Blob([JSON.stringify(scenarioObject(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`switchboard-case-${seed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  if(id==='copy-link'){const url=new URL(location.href);url.hash='scenario='+btoa(JSON.stringify(scenarioObject()));navigator.clipboard.writeText(url.href).then(()=>toast('Scenario link copied.')).catch(()=>toast('Clipboard unavailable. Download the scenario instead.'));}
});
document.addEventListener('keydown',e=>{const el=e.target as Element;if(el.matches('[data-node]')&&['Enter',' '].includes(e.key)){e.preventDefault();inspect((el as SVGElement).dataset.node!);}if(e.key==='Escape'&&!$<HTMLDialogElement>('#dialog').open){back();}});
$('#readout').addEventListener('input',e=>{const input=e.target as HTMLInputElement;if(!input.dataset.setting)return;const key=input.dataset.setting as keyof Settings;const before=result;remember();settings={...settings,[key]:input.type==='checkbox'?input.checked:Number(input.value)};result=simulate(settings,seed);range=null;requestId++;persist();if(input.type==='range')input.previousElementSibling!.querySelector('output')!.textContent=`${input.value} ${input.dataset.unit}`;feedback(before);render(true);});
document.addEventListener('change',async e=>{const input=e.target as HTMLInputElement;if(input.id!=='import-scenario')return;try{const f=input.files?.[0];if(!f)return;if(f.size>100000)throw Error('Scenario file is too large.');loadScenario(JSON.parse(await f.text()));$<HTMLDialogElement>('#dialog').close();toast('Scenario restored.');}catch(err){toast(err instanceof Error?err.message:'Unable to open this scenario.');}});
$('#about-button').addEventListener('click',showAbout);$('#save-button').addEventListener('click',showSave);$('#extinction-button').addEventListener('click',showExtinction);
$('#dialog-close').addEventListener('click',()=>$<HTMLDialogElement>('#dialog').close());
$('#advanced-button').addEventListener('click',()=>setPanel(panel==='advanced'?'outcomes':'advanced'));
$('#undo-button').addEventListener('click',()=>{const old=history.pop();if(!old)return;clearFeedback();settings=old.settings;seed=old.seed;continuation=old.continuation;monthOptions=old.monthOptions;monthSeed=old.monthSeed;result=simulate(settings,seed);range=null;requestId++;persist();render();$('#change-text').textContent="Your last change is undone. You are back where you were.";});
$('#reset-button').addEventListener('click',()=>{clearFeedback();remember();settings={...DEFAULTS};continuation=freshContinuation();monthOptions={...MONTH_DEFAULTS};monthSeed=42;seed=42;result=simulate(settings,seed);selected='';panel='outcomes';range=null;requestId++;persist();render();focus('world');$('#change-text').textContent='Opening world restored. Try stronger checks, then give hospitals more backup.';});

function updateCamera(){
  const viewport=$('#viewport'),ratio=viewport.clientWidth/Math.max(1,viewport.clientHeight);camera.h=camera.w/ratio;
  clampCamera();$('#world-svg').setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${camera.h}`);
  $('#zoom-label').textContent=`${Math.round(viewport.clientWidth/camera.w*100)}%`;
  $('#mini-map').hidden=density==='compact';
  const r=$('#mini-window');if(r)for(const [k,v] of Object.entries({x:camera.x,y:camera.y,width:camera.w,height:camera.h}))r.setAttribute(k,String(v));
  document.querySelectorAll<HTMLElement>('[data-density]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.density===density)));
}
function clampCamera(){if(density==='compact'){camera.x=-(camera.w-WORLD.width)/2;camera.y=-(camera.h-950)/2;return;}camera.x=Math.max(-35,Math.min(WORLD.width-camera.w+35,camera.x));camera.y=Math.max(-35,Math.min(Math.max(0,WORLD.height-camera.h)+35,camera.y));}
function zoom(factor:number,px=.5,py=.5){if(density==='compact'){focus('services');return;}density='normal';const nw=Math.max(450,Math.min(2800,camera.w/factor)),nh=nw*camera.h/camera.w;camera.x+=(camera.w-nw)*px;camera.y+=(camera.h-nh)*py;camera.w=nw;camera.h=nh;updateCamera();}
function focus(area:string){
  const centers:Record<string,[number,number]>={origins:[400,445],services:[980,470],health:[1370,480],recovery:[1880,465],military:[1070,200]};
  if(area==='world'){density='compact';const ratio=$('#viewport').clientWidth/Math.max(1,$('#viewport').clientHeight);camera.w=Math.max(WORLD.width,WORLD.height*ratio);camera.x=0;camera.y=0;}
  else {density='normal';camera.w=Math.max(720,$('#viewport').clientWidth/.84);const center=centers[area]||centers.services;camera.x=center[0]-camera.w/2;camera.y=40;}
  renderMap();viewArea=area;$('#view-label').textContent=area==='world'?'Whole circuit': 'Drag or scroll to travel · Ctrl + scroll to zoom';updateCamera();
}
function focusNode(id:string){const n=nodeById[id==='nuclear'?'military':id];if(!n||density==='compact')return;camera.x=n.x+105-camera.w/2;camera.y=n.y+56-camera.h/2;updateCamera();}
function focusStory(){const ids=storySteps()[storyIndex]?.nodes||[];focusNode(ids[Math.floor(ids.length/2)]||'comms');}
$('#zoom-in').addEventListener('click',()=>zoom(1.25));$('#zoom-out').addEventListener('click',()=>zoom(.8));$('#home-view').addEventListener('click',()=>focus('world'));
const viewport=$('#viewport');let pan:{x:number;y:number;cx:number;cy:number}|null=null;
viewport.addEventListener('pointerdown',e=>{if((e.target as Element).closest('[data-node]'))return;pan={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
viewport.addEventListener('pointermove',e=>{if(!pan)return;const scale=viewport.clientWidth/camera.w;camera.x=pan.cx-(e.clientX-pan.x)/scale;camera.y=pan.cy-(e.clientY-pan.y)/scale;updateCamera();});
viewport.addEventListener('pointerup',e=>{if(pan&&Math.hypot(e.clientX-pan.x,e.clientY-pan.y)<5&&selected)back();pan=null;viewport.classList.remove('dragging');});viewport.addEventListener('pointercancel',()=>{pan=null;viewport.classList.remove('dragging');});
viewport.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const rect=viewport.getBoundingClientRect();zoom(e.deltaY<0?1.1:1/1.1,(e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height);}else{camera.x+=(e.shiftKey?e.deltaY:e.deltaX)*camera.w/viewport.clientWidth;camera.y+=(e.shiftKey?0:e.deltaY)*camera.w/viewport.clientWidth;updateCamera();}},{passive:false});
viewport.addEventListener('keydown',e=>{if((e.target as Element).closest('[data-node]'))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home'){focus('world');return;}if(e.key==='+'||e.key==='=')zoom(1.2);else if(e.key==='-')zoom(1/1.2);else{camera.x+=(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)*camera.w*.1;camera.y+=(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)*camera.h*.1;updateCamera();}}});
$('#mini-map').addEventListener('click',e=>{const rect=$('#mini-map').getBoundingClientRect();camera.x=(e.clientX-rect.left)/rect.width*WORLD.width-camera.w/2;camera.y=(e.clientY-rect.top)/rect.height*WORLD.height-camera.h/2;updateCamera();});
$('#mini-map').addEventListener('keydown',e=>{if(e.key==='Enter'){focus('world');}});
function toggleDesk(){const closed=$('#main').classList.toggle('desk-closed');$('#desk-toggle').setAttribute('aria-expanded',String(!closed));requestAnimationFrame(()=>updateCamera());}
$('#desk-toggle').addEventListener('click',toggleDesk);$('#desk-close').addEventListener('click',toggleDesk);
new ResizeObserver(()=>updateCamera()).observe(viewport);
function rescuePanel(){return panelHeader('Your moves')+`<div class="readout-name"><span class="etched-label">THE WORLD IS NOT LOST</span><h2>Break the chain.</h2><p>One well-placed safeguard can change what happens next.</p></div>`+[
 ['checks','Buy time. Check the warning.','Give people an independent check before they act.'],['hospital','Keep the hospital lights on.','Give essential equipment 30 days of backup.'],['repair','Protect the repair crews.','Keep their tools powered and supplies coming.'],['refuges','Keep a lifeline outside the failure.','Two independent regions can send help.'],...(settings.agentEnabled?[['isolation','Take back control.','Disconnect the agent from essential systems.']]:[]),...(settings.healthChallenge?[['screening','Stop the threat before it starts.','Close the screening gate.']]:[]),...(settings.informationCampaign?[['trust','Let trusted voices get through.','Restore reliable emergency instructions.']]:[])
 ].map(([id,title,copy])=>`<button class="rescue-switch" data-rescue="${id}"><span class="switch-light"></span><span><strong>${title}</strong><small>${copy}</small></span><span>↗</span></button>`).join('')+`<button class="small-button" data-panel="recovery">Look inside the repair effort ↗</button>`;}
function collapsePanel(){
  const c=result.civilisation,days=(hours:number)=>(hours/24).toFixed(1);
  const title=result.nuclear?'Wider outcome unknown':c.crossedAt!==null?(c.recoveredAt!==null?'Back from the brink.':'The world is coming apart.'):c.endStatus==='disrupted'?'Lifelines are still failing.':'The world holds together.';
  const plot=c.frames.filter((_,i)=>i%6===0).map(f=>`${10+180*f.time/720},${90-70*f.failingRegions/6}`).join(' ');
  return panelHeader('CIVILISATION')+`<h2 class="inspector-title">${title}</h2><p class="inspector-copy">${result.nuclear?'The service model does not calculate nuclear damage. These service results cannot establish the wider outcome.':`At the worst point, ${c.peakRegions} of 6 regions lose their essential lifelines together. The longest stretch across ${settings.collapseRegions} or more regions lasts ${days(c.longestHours)} days.`}</p>
    <div class="collapse-chain"><div><span>ESSENTIALS</span><b>Power + healthcare + food</b><small>Each below half capacity</small></div><div><span>RESPONSE</span><b>Local coordination also fails</b><small>Below half capacity</small></div><div><span>EXTENT × TIME</span><b>${settings.collapseRegions} of 6 regions · ${settings.collapseDays} days</b><small>Without a break</small></div></div>
    <svg class="repair-chart" viewBox="0 0 200 120" role="img" aria-label="Regions failing the combined test over 30 days. Peak ${c.peakRegions} regions."><path d="M10 20H190M10 90H190" stroke="#aabbcc33"/><path d="M10 ${90-70*settings.collapseRegions/6}H190" stroke="#ffd17788" stroke-dasharray="3 3"/><polyline points="${plot}" fill="none" stroke="#ff9870" stroke-width="2"/><text x="1" y="20">6</text><text x="1" y="92">0</text><text x="169" y="${87-70*settings.collapseRegions/6}">${settings.collapseRegions}+</text><text x="10" y="108">DAY 0</text><text x="159" y="108">DAY 30</text></svg>
    <div class="comparison"><div><span>Collapse begins</span><b>${c.crossedAt===null?'Avoided':`Day ${days(c.crossedAt)}`}</b></div><div><span>Back on its feet</span><b>${c.recoveredAt===null?'—':`Day ${days(c.recoveredAt)}`}</b></div><div><span>At day 30</span><b>${({functioning:'Services working',recovered:'Recovered',disrupted:'Still disrupted',collapse:'Still in crisis'} as Record<string,string>)[c.endStatus]}</b></div><div><span>Outside the network fault</span><b>${c.independentRegions} / 6</b></div><div><span>Help delivered</span><b>${c.aidReceived.toFixed(0)} packages</b></div></div>
    <button class="small-button" id="try-wide-failure">Try widespread failure ↗</button><button class="small-button" id="keep-refuges">Keep two regions independent ↗</button><button class="small-button" data-panel="advanced">Inspect assumptions ↗</button><button class="small-button" data-inspect="extinction">What would extinction also require? ↗</button>
    <details class="model-details"><summary>Why this definition?</summary><p class="rule-copy">This is a visible, adjustable experiment boundary. There is no universally established numerical definition of civilisation collapse. Six equal-weight regions stand in for a connected world; they are not countries or population estimates. Short outages and one devastated region do not automatically meet this definition.</p><p class="rule-copy">Recovery requires every region to regain the essential basket and coordination for 24 hours. An earlier crossing is kept in the record. Thirty days is the calculation limit, not proof of permanent failure. Nuclear consequences and extinction are not calculated.</p>${evidenceNote('collapse')}</details>`;
}
function regionPanel(index:number){
  const c=result.civilisation,r=c.regions[index],m=r.recovery;
  return panelHeader(r.name.toUpperCase())+`<h2 class="inspector-title">${!r.exposed?(m.healthcareGap?'Network working; care under pressure.':'Its separate network keeps working.'):m.completed?`Repaired after ${m.restoredAt} hours.`:'Still disrupted at day 30.'}</h2><p class="inspector-copy">This region holds ${Math.round(r.reserveFactor*100)}% of the reference backup stores. ${r.aidSent>0?'It sends help after protecting its own essential needs.':r.aidReceived>0?'Other regions send help to its repair teams.':''}</p><div class="comparison">${[['Hospital backup',r.settings.reserves.toFixed(0)+'h'],['Tool backup',r.settings.repairBackup.toFixed(0)+'h'],['Stored food',r.settings.foodStores.toFixed(0)+'h'],['Hospital power gap',m.hospitalGap+'h'],['Care below demand',m.healthcareGap+'h'],['Food supply shortfall',m.foodShortageHours+'h'],['All essentials + response failing',r.deprivationHours+'h'],['Help sent',r.aidSent.toFixed(1)+' packages'],['Help received',r.aidReceived.toFixed(1)+' packages'],['Unused arrivals',r.aidUnused.toFixed(1)+' packages']].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div><button class="small-button" data-panel="collapse">See the whole-world outcome ↗</button>`;
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
    <details class="model-details"><summary>Rules, stocks & evidence</summary><p class="rule-copy">One hour at a time, crews do as much work as people, coordination, tool power and materials allow. Hospitals and food support affect how many workers can stay on the job. A longer outage can therefore make repairs slower.</p><p class="rule-copy">Repair stock: ${settings.repairSupplies} initially + ${rm.suppliesDelivered.toFixed(1)} delivered − ${rm.suppliesUsed.toFixed(1)} used = ${rm.final.parts.toFixed(1)} left. Backups for hospitals, fridges and tools are separate stocks. They are not refilled in this case.</p><p class="rule-copy">Hourly steps; 30-day limit. Numerical effects are educational assumptions. This panel describes Region 1. The civilisation panel checks all six regions. Deaths are not calculated.</p>${evidenceNote('recovery')}</details>`;
}
function storySteps(){
  const r=result;
  const steps=[{nodes:['ai','access'],time:'THE START',title:r.pathways.harmfulOperation&&r.incident?'An agent disrupts the network.':r.incident?'AI installs a bad update.':'The network fault is blocked.',copy:r.pathways.harmfulOperation&&r.incident?'The agent has access to connected services and a harmful goal. It keeps undoing repairs until people stop it.':r.incident?'It has permission to change the live network. People lose calls and messages when the update goes wrong.':settings.researchEnabled?'Checks or release rules stopped the bad update before it reached the network.':settings.faultyChange?'AI needs both the ability and permission to install it. Here, that gate stays shut.':'No bad update is running.'}];
  for(const event of r.pathways.events)steps.push({nodes:[event.id.startsWith('bio')?'bio':event.id,...event.parents],time:event.time<0?'30 DAYS BEFORE':`AFTER ${event.time} HOURS`,title:({'bio-peak':'The hospital faces peak demand.','bio-response':'The extra demand eases.',development:'Research meets a checking bottleneck.',control:r.pathways.controlLost?'The stop order fails.':'People stop the agent.',bio:'More people need care at once.',information:'False messages weaken the response.'} as Record<string,string>)[event.id],copy:event.description});
  if(settings.sharedPayments||settings.sharedTransport)steps.push({nodes:['comms','payments','transport','supplies','food'],time:'AT ONCE',title:'Supplies need more than a warehouse.',copy:`Payments fall as low as ${Math.round(Math.min(...r.recoveryModel.frames.map(f=>f.payments))*100)}%; transport as low as ${Math.round(Math.min(...r.recoveryModel.frames.map(f=>f.transport))*100)}%. Deliveries can only move as fast as their weakest required service.`});
  if(r.incident){
  steps.push({nodes:['access','comms','spread'],time:'AT ONCE',title:`One fault. ${r.affectedRegions} regions.`,copy:`${r.affectedRegions} of the six regions use the same network. They all lose their connection. The others use separate systems.`});
  steps.push({nodes:['comms','power','emergency','fallback'],time:'AT ONCE',title:r.powerOutage?'The outage reaches power controls.':'Power keeps running.',copy:`${r.powerOutage?'The power system uses the failed network. Electricity is cut too.':'Its power controls are separate from this failure.'} ${r.emergencyGap?`Emergency teams have trouble taking calls and sending help. Separate radios cover ${settings.fallback}% of their normal response.`:'Separate radios keep emergency teams working.'}`});
  if(r.warning)steps.push({nodes:['comms','checks','warning','military'],time:`WITHIN ${settings.decisionTime} MINUTES`,title:r.verified?'Someone catches the false warning.':r.escalation?'Leaders act on a false warning.':'The warning does not start a conflict.',copy:r.verified?'AI wrongly warns of an attack. People check another source in time and reject it. The power outage still needs fixing.':r.escalation?'AI wrongly warns of an attack. Checks fail to stop it, and rivals already on edge respond by escalating the crisis.':`AI wrongly warns of an attack. ${settings.tension<50?'Rivals are calm enough not to escalate.':'In this case, people choose not to escalate.'}`});
  if(r.nuclear)steps.push({nodes:['military'],time:'AFTER ESCALATION',title:'A further human choice: nuclear use.',copy:'Leaders go on to use nuclear weapons. The service panel cannot calculate the destruction or recovery that follows.'});
  }
  const rm=r.recoveryModel;
  const milestoneNodes:Record<string,string[]>={hospital:['hospital','crews','repair'],cold:['power','food'],tools:['power','repair'],food:['food','crews','repair'],supplies:['supplies','repair'],stalled:['repair','recovery'],restored:['repair','recovery']};
  for(const m of rm.milestones)steps.push({nodes:milestoneNodes[m.kind]||['repair'],time:`AFTER ${m.time} HOURS`,title:({hospital:'Hospital trouble slows the repair crew.',cold:'Food warehouses lose refrigeration.',tools:'The repair tools lose power.',food:'Workers run short of food.',supplies:'Crews run short of supplies.',stalled:'Repair work stops.',restored:'Region 1’s network is repaired.'} as Record<string,string>)[m.kind],copy:m.description+(m.kind==='restored'&&r.nuclear?' This does not calculate recovery from nuclear weapons.':'')});
  if(!rm.completed)steps.push({nodes:['repair','recovery'],time:'AT DAY 30',title:rm.status==='stalled'?'The repair is stalled.':'The repair is not finished.',copy:`${Math.floor(rm.progress*100)}% of the work is done. ${rm.status==='stalled'?'Work has stopped with these resources.':'Crews are still making progress.'} What happens after day 30 is outside this calculation.`});
  if(r.civilisation.firstAidUsedAt!==null)steps.push({nodes:['aid','repair'],time:`AFTER ${r.civilisation.firstAidUsedAt} HOURS`,title:'Help reaches the damaged regions.',copy:'Working regions send spare crews, powered tools, food and materials. Their own essential supplies are kept at home.'});
  if(r.civilisation.crossedAt!==null&&!r.nuclear)steps.push({nodes:['governance','hospital','food','power'],time:`AFTER ${r.civilisation.crossedAt} HOURS`,title:'The world is coming apart.',copy:`At least ${settings.collapseRegions} regions have lost most power, healthcare, food support and local coordination together for ${settings.collapseDays} days. People are losing the essentials they need, together, for too long.`});
  if(r.civilisation.recoveredAt!==null&&!r.nuclear)steps.push({nodes:['aid','repair','recovery'],time:`AFTER ${r.civilisation.recoveredAt} HOURS`,title:'Services recover after the crisis.',copy:'All six regions regain essential support and coordination for a full day. They have come through a collapse and started to rebuild.'});
  const hour=(text:string)=>text==='30 DAYS BEFORE'?-720:text==='THE START'?-2:text==='AT ONCE'?-1:text==='AFTER ESCALATION'?settings.decisionTime/60+1:text==='AT DAY 30'?720:text.startsWith('WITHIN')?settings.decisionTime/60:Number(text.match(/[\d.]+/)?.[0]||0);
  return steps.sort((a,b)=>hour(a.time)-hour(b.time));
}
function trace(){rememberPlace();mode='case';selected='';storyIndex=0;panel='story';render();focusStory();}
function renderImpact(){
  const count=result.affectedRegions;
  $('#impact').innerHTML=`<div class="impact-heading"><span class="etched-label">THE SIX REGIONS</span><span class="region-key"><i class="dot mint"></i> Holding <i class="dot coral"></i> Hit <i class="dot" style="background:#ffce69"></i> Strained</span><button data-inspect="spread">${count===0?'NETWORK HELD':count===1?'ONE REGION':count<6?'SEVERAL REGIONS':'ALL SIX REGIONS'} <span>${count} / 6</span> ↗</button></div><div class="region-grid">${result.regions.map(r=>`<div class="region ${r.comms?'affected':''}"><button class="region-title" data-region-detail="${result.regions.indexOf(r)}">${r.name} ↗</button><div>${(['comms','power','hospital','food','emergency'] as const).map((key,i)=>`<button class="region-cell ${r[key]?(mode==='conditions'||key==='emergency'&&Math.min(...result.civilisation.regions[result.regions.indexOf(r)].recovery.frames.map(f=>f.emergency))>0||key==='hospital'&&Math.min(...result.civilisation.regions[result.regions.indexOf(r)].recovery.frames.map(f=>f.healthcare))>=.5?'exposed':'harm'):'safe'}" data-inspect="${key}" data-region="${result.regions.indexOf(r)}" aria-label="${r.name}: ${['calls','power','hospital','food supply','emergency response'][i]} ${r[key]?(mode==='conditions'?'at risk':'interrupted'):'available'}" data-tip="${['Calls','Power','Hospital','Food','Emergency help'][i]}: ${r[key]?(mode==='conditions'?'at risk':'interrupted'):'available'}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon(['signal','bolt','cross','building','radar'][i])}</svg></button>`).join('')}</div></div>`).join('')}</div>`;
}


initDeck();
$('#mini-map').innerHTML=`<svg viewBox="0 0 ${WORLD.width} ${WORLD.height}"><g fill="#73899e">${layout.map(n=>`<rect x="${n.x}" y="${n.y}" width="210" height="112" rx="12"/>`).join('')}</g><rect id="mini-window" fill="#d0e3ff22" stroke="#b7d5f9" stroke-width="10"/></svg>`;
try{
  if(location.hash.startsWith('#scenario=')){loadScenario(JSON.parse(atob(location.hash.slice(10))));}
  else {const stored=localStorage.getItem('switchboard-v1');if(stored){loadScenario(JSON.parse(stored));history=[];}}
}catch{toast('Saved scenario could not be read. Opening the default world.');}
panel='pathways';render();focus('services');
