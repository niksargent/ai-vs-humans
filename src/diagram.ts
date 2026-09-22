export const layout = [
  {id:'control',x:30,y:702,title:'Can people stop it?',icon:'key',kicker:'HUMAN CONTROL'},
  {id:'information',x:250,y:702,title:'Trusted information',icon:'signal',kicker:'RESPONSE'},
  {id:'payments',x:470,y:702,title:'Payments',icon:'building',kicker:'BUYING ESSENTIALS'},
  {id:'transport',x:690,y:702,title:'Transport',icon:'steps',kicker:'MOVING ESSENTIALS'},
  {id:'development',x:30,y:58,title:'AI development',icon:'chip',kicker:'CAPABILITY FEEDBACK'},
  {id:'governance',x:250,y:58,title:'Emergency coordination',icon:'building',kicker:'LOCAL RESPONSE'},
  {id:'checks',x:470,y:58,title:'Independent checks',icon:'shield',kicker:'CAN INTERRUPT'},
  {id:'warning',x:690,y:58,title:'Military warning',icon:'radar',kicker:'HUMAN DECISIONS'},
  {id:'military',x:910,y:58,title:'Crisis escalation',icon:'steps',kicker:'MILITARY'},
  {id:'ai',x:30,y:220,title:'AI abilities',icon:'chip',kicker:'WHAT IT CAN DO'},
  {id:'access',x:250,y:220,title:'Permission to act',icon:'key',kicker:'WHAT WE ALLOW'},
  {id:'comms',x:470,y:220,title:'Communications',icon:'signal',kicker:'SHARED DEPENDENCY'},
  {id:'power',x:690,y:220,title:'Power systems',icon:'bolt',kicker:'INFRASTRUCTURE'},
  {id:'hospital',x:910,y:220,title:'Hospital services',icon:'cross',kicker:'HEALTH'},
  {id:'bio',x:250,y:382,title:'Biological misuse',icon:'science',kicker:'SCIENCE + ACCESS'},
  {id:'fallback',x:470,y:382,title:'Independent backups',icon:'split',kicker:'KEEP OPTIONS OPEN'},
  {id:'repair',x:690,y:382,title:'Restore the network',icon:'repair',kicker:'RECOVERY'},
  {id:'recovery',x:910,y:382,title:'Services restored',icon:'leaf',kicker:'THE WAY BACK'},
  {id:'spread',x:470,y:542,title:'Shared across regions',icon:'split',kicker:'HOW FAR IT REACHES'},
  {id:'food',x:690,y:542,title:'Food warehouses',icon:'building',kicker:'FOOD'},
  {id:'emergency',x:910,y:542,title:'Emergency response',icon:'cross',kicker:'GETTING HELP'}
  ,{id:'crews',x:30,y:382,title:'Repair crews',icon:'repair',kicker:'PEOPLE'}
  ,{id:'supplies',x:250,y:542,title:'Repair supplies',icon:'building',kicker:'MATERIALS & FUEL'}
  ,{id:'aid',x:30,y:542,title:'Help from other regions',icon:'split',kicker:'MUTUAL AID'}
];
export const wires:{id:string;from:string;to:string;d:string;barrier?:boolean;preview?:boolean}[] = [
  {id:'control-repair',from:'control',to:'repair',d:'M206 753 H215 V680 H680 V473 H690'},
  {id:'information-governance',from:'information',to:'governance',d:'M250 753 H222 V36 H338 V58'},
  {id:'comms-payments',from:'comms',to:'payments',d:'M470 302 H450 V680 H558 V702'},
  {id:'comms-transport',from:'comms',to:'transport',d:'M646 310 H661 V686 H778 V702'},
  {id:'payments-supplies',from:'payments',to:'supplies',d:'M470 753 H435 V617 H426'},
  {id:'transport-supplies',from:'transport',to:'supplies',d:'M690 753 H673 V668 H338 V644'},
  {id:'aid-repair',from:'aid',to:'repair',d:'M206 593 H228 V670 H654 V460 H690'},
  {id:'crews-repair',from:'crews',to:'repair',d:'M206 433 H225 V526 H670 V433 H690'},
  {id:'supplies-repair',from:'supplies',to:'repair',d:'M426 593 H440 V515 H675 V450 H690'},
  {id:'power-repair',from:'power',to:'repair',d:'M778 322 V382'},
  {id:'hospital-repair',from:'hospital',to:'repair',d:'M1086 300 H1102 V362 H820 V382'},
  {id:'food-repair',from:'food',to:'repair',d:'M690 593 H675 V460 H690'},
  {id:'comms-spread',from:'comms',to:'spread',d:'M470 295 H453 V593 H470'},
  {id:'power-food',from:'power',to:'food',d:'M866 300 H888 V525 H778 V542'},
  {id:'comms-emergency',from:'comms',to:'emergency',d:'M646 313 H664 V658 H998 V644'},
  {id:'fallback-emergency',from:'fallback',to:'emergency',d:'M558 484 V514 H998 V542',barrier:true},
  {id:'development-ai',from:'development',to:'ai',d:'M118 160 V220'},
  {id:'ai-access',from:'ai',to:'access',d:'M206 271 H250'},
  {id:'access-comms',from:'access',to:'comms',d:'M426 271 H470'},
  {id:'comms-warning',from:'comms',to:'warning',d:'M558 220 V218 Q558 212 566 212 H770 Q778 212 778 204 V160'},
  {id:'checks-warning',from:'checks',to:'warning',d:'M646 109 H690',barrier:true},
  {id:'warning-military',from:'warning',to:'military',d:'M866 109 H910'},
  {id:'comms-power',from:'comms',to:'power',d:'M646 271 H690'},
  {id:'power-hospital',from:'power',to:'hospital',d:'M866 271 H910'},
  {id:'comms-repair',from:'comms',to:'repair',d:'M590 322 V362 Q590 370 598 370 H770 Q778 370 778 378 V382'},
  {id:'fallback-repair',from:'fallback',to:'repair',d:'M646 433 H690'},
  {id:'repair-recovery',from:'repair',to:'recovery',d:'M866 433 H910'},
  {id:'hospital-recovery',from:'hospital',to:'recovery',d:'M998 322 V382'},
  {id:'bio-hospital',from:'bio',to:'hospital',d:'M338 484 V504 H1120 V300 H1086'},
];
const icons:Record<string,string>={
  chip:'<rect x="4" y="4" width="16" height="16" rx="3"/><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M8 1v3m8-3v3M8 20v3m8-3v3M1 8h3m-3 8h3m16-8h3m-3 8h3"/>',
  building:'<path d="m2 8 10-6 10 6H2Zm2 3v9m5-9v9m6-9v9m5-9v9M2 22h20"/>',
  shield:'<path d="m12 2 9 4v6c0 5-4 8-9 11-5-3-9-6-9-11V6Z"/><path d="m7 12 3 3 7-7"/>',
  radar:'<path d="M12 22V10m-4 12h8M8 15a6 6 0 1 1 8 0M5 18a10 10 0 1 1 14 0"/><circle cx="12" cy="9" r="2"/>',
  steps:'<path d="M3 21V14h5v7m0 0V9h6v12m0 0V3h6v18M2 21h21"/>',
  key:'<circle cx="7" cy="8" r="5"/><path d="m11 12 10 10m-5-5 3-3m-6 0 3-3"/>',
  signal:'<path d="M12 13v9m-4 0h8M8 13a6 6 0 1 1 8 0M5 16a10 10 0 1 1 14 0"/><circle cx="12" cy="8" r="1.8"/>',
  bolt:'<path d="m13 1-9 13h7l-1 9 10-14h-7Z"/>',
  cross:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v10M7 12h10"/>',
  science:'<path d="M8 2h8M10 2v7L3 20q0 2 2 2h14q2 0 2-2L14 9V2M7 15h10"/><circle cx="11" cy="18" r=".6"/>',
  split:'<path d="M3 12h5c5 0 3-8 8-8h5m-5-3 5 3-5 3M8 12c5 0 3 8 8 8h5m-5-3 5 3-5 3"/>',
  repair:'<path d="M20 8a8 8 0 1 0 0 9M20 3v5h-5"/><path d="m9 12 3 3 5-6"/>',
  leaf:'<path d="M4 20c0-11 6-17 18-17 0 13-6 19-16 16m-4 4L16 9"/>',
};
export function icon(name:string){return icons[name]||icons.chip;}
export const svgDefs=`<defs>
  <linearGradient id="node-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#303438"/><stop offset="1" stop-color="#202428"/></linearGradient>
  <linearGradient id="node-warm" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#393133"/><stop offset="1" stop-color="#242529"/></linearGradient>
  <filter id="shadow" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".5"/></filter>
  <filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="line-glow" filterUnits="userSpaceOnUse" x="-60" y="-60" width="1260" height="650"><feGaussianBlur stdDeviation="1.5"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
export const sources = {
  finance:{name:'Financial Stability Board · AI and financial stability',url:'https://www.fsb.org/2024/11/the-financial-stability-implications-of-artificial-intelligence/'},
  collapse:{name:'UNDRR · Cascading and systemic risk',url:'https://www.undrr.org/publication/briefing-note-systemic-risk'},
  recovery:{name:'FEMA · Infrastructure and recovery dependencies',url:'https://www.fema.gov/emergency-managers/practitioners/recovery-resilience-resource-library/infrastructure-dependency'},
  food:{name:'FEMA · Power outage preparedness',url:'https://www.ready.gov/sites/default/files/2024-03/ready.gov_power-outage_hazard-info-sheet.pdf'},
  emergency:{name:'FEMA · Emergency response and communications',url:'https://www.ready.gov/business/emergency-plans'},
  military:{name:'ICRC · AI in the military domain',url:'https://www.icrc.org/en/article/faq-artificial-intelligence-in-military-domain'},
  resilience:{name:'NATO · Civil preparedness & resilience',url:'https://nato.int/en/what-we-do/deterrence-and-defence/resilience-civil-preparedness-and-article-3'},
  health:{name:'WHO · Essential public health functions',url:'https://www.who.int/teams/primary-health-care/health-systems-resilience/essential-public-health-functions'},
  ai:{name:'International AI Safety Report 2026',url:'https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026'}
};
