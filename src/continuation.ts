import type {Result} from './model.js';

export type Route='physical'|'hostile';
export type Assumption='unknown'|'yes'|'no';
export const gateIds=['power','reach','protection','recovery'] as const;
export type Gate=typeof gateIds[number];
export interface Continuation {route:Route;physical:Record<Gate,Assumption>;hostile:Record<Gate,Assumption>}
export function freshContinuation():Continuation {return {route:'physical',physical:{power:'unknown',reach:'unknown',protection:'unknown',recovery:'unknown'},hostile:{power:'unknown',reach:'unknown',protection:'unknown',recovery:'unknown'}};}
export function validateContinuation(raw:unknown):Continuation {
  if(raw===undefined)return freshContinuation();
  if(!raw||typeof raw!=='object')throw Error('Invalid beyond-collapse assumptions.');
  const r=raw as Continuation;
  if(!['physical','hostile'].includes(r.route))throw Error('Invalid continuation route.');
  const out=freshContinuation();out.route=r.route;
  for(const route of ['physical','hostile'] as const)for(const id of gateIds){
    const value=r[route]?.[id];if(!['unknown','yes','no'].includes(value))throw Error('Invalid continuation assumption.');out[route][id]=value;
  }
  return out;
}
export const gates:Record<Route,Record<Gate,{title:string;why:string;barrier:string}>>={
  physical:{
    power:{title:'Could the harm threaten human survival?',why:'Hospitals being busy is not the same as everyone dying. This route needs harm severe enough to threaten the survival of human communities, directly or through loss of essentials.',barrier:'The harm is too limited to complete this route.'},
    reach:{title:'Could it reach every surviving community?',why:'A threat that reaches many cities may still miss islands, remote settlements or protected groups. Six affected regions on the board do not establish that every person is exposed.',barrier:'Some communities remain beyond the threat’s reach.'},
    protection:{title:'Would every place of safety fail?',why:'Shelter, protected food and water, different susceptibility and practical defences could leave people alive. Assuming these all fail is a much stronger claim than widespread disruption.',barrier:'At least one community has effective protection.'},
    recovery:{title:'Would survivors lose every way to continue?',why:'People may survive the first shock and rebuild. This route also needs the remaining communities to be unable to sustain life or recover over the longer term.',barrier:'Survivors retain a way to sustain life and recover.'}
  },
  hostile:{
    power:{title:'Could it cause harm in the physical world?',why:'An agent that keeps running on computers does not automatically control food, machines or physical infrastructure. This continuation assumes the extra reach and resources needed to threaten human survival.',barrier:'Its power over the physical world remains limited.'},
    reach:{title:'Could it reach every surviving community?',why:'Control of one shared network leaves other networks and communities outside it. This route needs the ability to reach those independent communities too.',barrier:'Some communities remain outside its control.'},
    protection:{title:'Could it overcome every independent defence?',why:'People could isolate equipment, switch to local systems or deny resources. This continuation assumes those independent protections cannot preserve a surviving community.',barrier:'An independent defence keeps a community protected.'},
    recovery:{title:'Could it keep defeating attempts to recover?',why:'A stop order failing for 30 days does not establish permanent control. People may regain control later, resources may run out, or communities may rebuild elsewhere.',barrier:'Control ends, or people find a lasting way to recover.'}
  }
};
export function evaluateContinuation(result:Result,lens:Continuation){
  const route=lens.route,values=lens[route];
  const started=route==='physical'?(result.nuclear||result.pathways.healthIntroduced||result.civilisation.crossedAt!==null):result.pathways.controlLost&&result.pathways.harmfulOperation;
  const blockers=gateIds.filter(id=>values[id]==='no'),unknowns=gateIds.filter(id=>values[id]==='unknown');
  const state:'not-started'|'interrupted'|'unresolved'|'assumed'=!started?'not-started':blockers.length?'interrupted':unknowns.length?'unresolved':'assumed';
  return {started,blockers,unknowns,state,extinction:'not-resolved' as const};
}
