// Stable, named draws: changing one branch never shifts another branch's draw.
export function draw(seed:number,event:string):number {
  let hash=(seed|0)^0x811c9dc5;
  for(let i=0;i<event.length;i++){hash^=event.charCodeAt(i);hash=Math.imul(hash,16777619);}
  hash^=hash>>>16;hash=Math.imul(hash,0x7feb352d);hash^=hash>>>15;hash=Math.imul(hash,0x846ca68b);hash^=hash>>>16;
  return (hash>>>0)/4294967296;
}
