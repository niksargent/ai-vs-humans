import type {Result} from './model.js';

export type SoundCue = 'switch'|'warning'|'crisis'|'resolve';
const SOUND_KEY = 'ai-vs-humans-sound';
const warningNodes = ['comms','payments','transport','power','hospital','food','emergency','governance','control','bio'] as const;
const levels:Record<SoundCue,number> = {switch:1,warning:3,crisis:4,resolve:4};
const cooldown:Record<SoundCue,number> = {switch:140,warning:1100,crisis:1400,resolve:600};
const volume:Record<SoundCue,number> = {switch:0.55,warning:0.65,crisis:0.7,resolve:0.65};

/** Select one sound for a completed change to the calculated world. */
export function cueForWorldChange(before:Result, after:Result, fallback:SoundCue|null='switch'):SoundCue|null {
  const wasCollapsed=before.civilisation.crossedAt!==null;
  const isCollapsed=after.civilisation.crossedAt!==null;
  if((!before.nuclear&&after.nuclear)||(!wasCollapsed&&isCollapsed))return 'crisis';
  if((before.nuclear&&!after.nuclear)||(wasCollapsed&&!isCollapsed))return 'resolve';
  if(warningNodes.some(id=>before.nodes[id]?.status!=='harm'&&after.nodes[id]?.status==='harm'))return 'warning';
  if(warningNodes.some(id=>before.nodes[id]?.status==='harm'&&after.nodes[id]?.status!=='harm'))return 'resolve';
  return fallback;
}

export class SoundController {
  private enabled=false;
  private current:HTMLAudioElement|null=null;
  private currentCue:SoundCue|null=null;
  private clips=new Map<SoundCue,HTMLAudioElement>();
  private lastPlayed:Partial<Record<SoundCue,number>>={};

  constructor(private button:HTMLButtonElement){
    try{this.enabled=localStorage.getItem(SOUND_KEY)==='on';}catch{/* Private browsing can continue silently. */}
    this.updateButton();
    button.addEventListener('click',()=>this.setEnabled(!this.enabled));
  }

  worldChange(before:Result,after:Result,fallback:SoundCue|null='switch'){
    const cue=cueForWorldChange(before,after,fallback);
    if(cue)this.play(cue);
  }

  storyStep(){this.play('switch',0.33);}

  private setEnabled(enabled:boolean){
    this.enabled=enabled;
    if(!enabled)this.stop();
    this.updateButton();
    try{localStorage.setItem(SOUND_KEY,enabled?'on':'off');}catch{/* This preference need not be saved. */}
    if(enabled)this.play('switch',0.27);
  }

  private updateButton(){
    const name=this.enabled?'Sound on':'Sound off';
    this.button.setAttribute('aria-pressed',String(this.enabled));
    this.button.setAttribute('aria-label',name);
    this.button.title=name;
    this.button.querySelector('.sound-label')!.textContent=name;
  }

  private stop(){
    if(this.current){this.current.pause();this.current.currentTime=0;}
    this.current=null;
    this.currentCue=null;
  }

  private play(cue:SoundCue,gain=1){
    if(!this.enabled)return;
    const now=performance.now();
    if(now-(this.lastPlayed[cue]??-Infinity)<cooldown[cue])return;
    if(this.current&&!this.current.paused&&this.currentCue&&levels[cue]<levels[this.currentCue])return;
    try{
      this.stop();
      let clip=this.clips.get(cue);
      if(!clip){clip=new Audio(new URL(`../audio/${cue}.mp3`,import.meta.url).href);clip.preload='auto';this.clips.set(cue,clip);}
      clip.volume=volume[cue]*gain;
      clip.currentTime=0;
      this.current=clip;
      this.currentCue=cue;
      this.lastPlayed[cue]=now;
      void clip.play().catch(()=>{if(this.current===clip)this.stop();});
    }catch{/* A blocked or unsupported audio device must not interrupt the model. */}
  }
}
