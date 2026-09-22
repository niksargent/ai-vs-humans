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
export const worldNodes=[...previous,{id:'collapse',title:'Civilisation',icon:'building',kicker:'OUR SHARED FUTURE'}].map(n=>({...n,x:positions[n.id][0],y:positions[n.id][1]}));
export const nodeById=Object.fromEntries(worldNodes.map(n=>[n.id,n]));
export const primaryEdges=[['ai','access'],['access','comms'],['comms','power'],['power','hospital'],['power','food'],['comms','warning'],['checks','warning'],['warning','military'],['supplies','repair'],['repair','recovery'],['recovery','collapse']];
export function connection(from:string,to:string){
  const a=nodeById[from],b=nodeById[to];if(!a||!b)return '';
  if(a.x===b.x){const down=b.y>a.y,x=a.x+105,sy=a.y+(down?112:0),ty=b.y+(down?0:112);return `M${x} ${sy} C${x+65} ${sy+(down?65:-65)},${x+65} ${ty+(down?-65:65)},${x} ${ty}`;}
  const right=b.x>a.x,sx=a.x+(right?210:0),sy=a.y+56,tx=b.x+(right?0:210),ty=b.y+56;
  const bend=Math.max(65,Math.abs(tx-sx)*.5);return `M${sx} ${sy} C${sx+(right?bend:-bend)} ${sy},${tx+(right?-bend:bend)} ${ty},${tx} ${ty}`;
}
export const districts=[{name:'THE SPARK',sub:'Ideas & permissions',x:45},{name:'SHARED SYSTEMS',sub:'One failure can travel',x:665},{name:'LIVES & ESSENTIALS',sub:'What people depend on',x:1285},{name:'THE WAY BACK',sub:'Repair, recover, survive',x:1905}];
export function outcomeIcon(id:string){return icon(id==='military'?'radar':id==='hospital'?'cross':id==='collapse'?'building':id==='nuclear'?'radiation':'leaf');}
