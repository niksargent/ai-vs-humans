import {draw} from './random.js';
export interface RegionalSpread {exposed:boolean[]; reasons:string[]; routes:('origin'|'shared'|'dependency'|'held')[]; count:number; aidAccess:number;}
/** A sampled dependency network, fixed for a replay. Connectedness is a score, not measured odds. */
export function regionalSpread(connectedness:number,seed=42):RegionalSpread {
  const p=connectedness/100,exposed=[true,false,false,false,false,false];
  const reasons=['The faulty update starts here.',...Array(5).fill('Its links keep this failure out.')];
  const routes:RegionalSpread['routes']=['origin','held','held','held','held','held'];
  // A shared rollout decision correlates failures, rather than six independent accidents.
  const rollout=draw(seed,'regional:rollout');
  for(let i=1;i<6;i++)if(p>rollout&&p>draw(seed,`regional:provider:${i}`)){
    exposed[i]=true;routes[i]='shared';reasons[i]='It receives the same faulty AI update as Region 1.';
  }
  // Directed cross-region service dependencies; iterate to a fixed point, including loops.
  const links=[[0,1],[1,2],[2,3],[0,3],[3,4],[4,5],[5,1]];
  for(let pass=0;pass<6;pass++)for(const [from,to] of links){
    if(exposed[from]&&!exposed[to]&&p>draw(seed,`regional:link:${from}:${to}`)){
      exposed[to]=true;routes[to]='dependency';reasons[to]=`It relies on services in Region ${from+1}, so that failure reaches here too.`;
    }
  }
  // Some independent routes remain even in a loosely connected world. Donor health and stocks still gate aid.
  return {exposed,reasons,routes,count:exposed.filter(Boolean).length,aidAccess:.25+.75*p};
}
