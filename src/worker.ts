import {monthEnsemble,type MonthSettings} from './month.js';
import {ensemble, type Settings} from './model.js';
self.onmessage=(event:MessageEvent<{settings:Settings;seed:number;id:number;kind?:'month';options?:MonthSettings}>)=>{
  const {settings,seed,id}=event.data;
  try{self.postMessage(event.data.kind==='month'?{id,...monthEnsemble(settings,event.data.options!,seed)}:{id,...ensemble(settings,seed)});}catch(error){self.postMessage({id,error:error instanceof Error?error.message:'Calculation failed.'});}
};
