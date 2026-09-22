import {ensemble, type Settings} from './model.js';
self.onmessage=(event:MessageEvent<{settings:Settings;seed:number;id:number}>)=>{
  const {settings,seed,id}=event.data;
  self.postMessage({id,...ensemble(settings,seed)});
};
