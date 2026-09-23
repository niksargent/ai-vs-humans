import {layout as previous,icon} from './diagram.js';
export const WORLD={width:2310,height:1070};
const positions:Record<string,[number,number]>={
 development:[45,115],ai:[45,370],access:[355,370],control:[355,740],bio:[45,740],information:[665,740],
 checks:[665,115],warning:[975,115],military:[1285,115],
 comms:[665,370],power:[975,370],hospital:[1285,370],
 payments:[665,555],transport:[975,555],food:[1285,555],
 fallback:[975,740],emergency:[1285,740],governance:[1595,740],
 crews:[1595,115],supplies:[1595,370],repair:[1905,370],
 aid:[1595,555],recovery:[1905,555],spread:[1905,740],collapse:[1905,115]
};
export const worldNodes=[...previous,{id:'collapse',title:'Civilisation',icon:'building',kicker:'OUR SHARED FUTURE'}].map(n=>({...n,title:n.id==='checks'?'Warning checks':n.id==='bio'?'AI-assisted health threat':n.title,x:positions[n.id][0],y:positions[n.id][1]}));
export const nodeById=Object.fromEntries(worldNodes.map(n=>[n.id,n]));
export const primaryEdges=[['ai','development'],['development','access'],['ai','access'],['access','comms'],['comms','power'],['power','hospital'],['power','food'],['comms','warning'],['checks','warning'],['warning','military'],['supplies','repair'],['repair','recovery'],['recovery','collapse']];
export function connection(from:string,to:string){
  const a=nodeById[from],b=nodeById[to];if(!a||!b)return '';
  if(a.x===b.x){const down=b.y>a.y,x=a.x+105,sy=a.y+(down?112:0),ty=b.y+(down?0:112);return `M${x} ${sy} C${x+65} ${sy+(down?65:-65)},${x+65} ${ty+(down?-65:65)},${x} ${ty}`;}
  const right=b.x>a.x,sx=a.x+(right?210:0),sy=a.y+56,tx=b.x+(right?0:210),ty=b.y+56;
  const bend=Math.max(65,Math.abs(tx-sx)*.5);return `M${sx} ${sy} C${sx+(right?bend:-bend)} ${sy},${tx+(right?-bend:bend)} ${ty},${tx} ${ty}`;
}
export const districts=[{name:'THE SPARK',sub:'Ideas & permissions',x:45},{name:'SHARED SYSTEMS',sub:'One failure can travel',x:665},{name:'LIVES & ESSENTIALS',sub:'What people depend on',x:1285},{name:'THE WAY BACK',sub:'Repair, recover, survive',x:1905}];
export function outcomeIcon(id:string){return icon(id==='military'?'radar':id==='hospital'?'cross':id==='collapse'?'building':id==='nuclear'?'radiation':'leaf');}

// A geographic texture, not a population map or an extra model output.
export function livingAtlas(){
 const contours=Array.from({length:8},(_,i)=>`<path d="M-80 ${180+i*95} C240 ${-70+i*120},390 ${430+i*40},760 ${210+i*98} S1300 ${60+i*125},1660 ${230+i*92} S2080 ${30+i*130},2410 ${190+i*105}"/>`).join('');
 const islands=['M140 225l120-85 180 35 60 120-95 60-20 150-130-45-80-130Z','M520 545l100-85 100 40 55 165-80 195-90-65-45-125Z','M910 165l140-30 85 90-55 130-150-35-65-80Z','M990 435l180-65 145 150-40 180-120 150-85-120-115-135Z','M1360 180l240-70 280 110 100 165-140 70-120-90-130 85-150-160Z','M1810 640l190-75 130 90-60 115-180 25-100-75Z'];
 return `<g class="living-atlas" aria-hidden="true"><g class="atlas-contours">${contours}</g>${islands.map((d,i)=>`<path class="atlas-land" d="${d}"/>`).join('')}<g class="atlas-lights">${Array.from({length:45},(_,i)=>`<circle style="animation-delay:-${i%9}s" cx="${100+(i*173)%2090}" cy="${140+(i*137)%790}" r="${i%3===0?2.5:1.3}"/>`).join('')}</g><ellipse class="atlas-orbit" cx="1155" cy="535" rx="1010" ry="380"/><path class="atlas-sweep" d="M-100 1010L900 -100"/></g>`;
}
