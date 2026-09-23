from pathlib import Path
import numpy as np, subprocess, wave, json, re
import imageio_ffmpeg
R=Path(__file__).resolve().parent;F=imageio_ffmpeg.get_ffmpeg_exe();SR=48000
mix=np.zeros((SR*30,2),np.float64)
def load(name):
 raw=subprocess.check_output([F,'-v','error','-i',str(R/'audio'/name),'-f','f32le','-ar',str(SR),'-ac','2','-']);return np.frombuffer(raw,np.float32).reshape(-1,2).astype(float)
def add(a,t,gain=1,fade=.05):
 a=a.copy();n=min(int(fade*SR),len(a)//2)
 if n:a[:n]*=np.linspace(0,1,n)[:,None];a[-n:]*=np.linspace(1,0,n)[:,None]
 start=int(t*SR);end=min(len(mix),start+len(a));mix[start:end]+=a[:end-start]*gain
amb=load('atmosphere.mp3');add(amb,0,.33,1);add(amb,14,.22,1)
add(load('riser.mp3'),7,.58,.3);add(load('alarm.mp3'),14,.30,.5);add(load('resolve.mp3'),21,.66,.1)
switch=load('switch.mp3');add(switch,4,.48);add(switch,21,.45)
# Original tonal bed and precisely timed UI ticks; no third-party music.
t=np.arange(len(mix))/SR;env=np.minimum(1,t/2)*np.minimum(1,(30-t)/1.8);bed=(np.sin(2*np.pi*49*t)+.35*np.sin(2*np.pi*73.416*t)+.17*np.sin(2*np.pi*98*t))*.021*env
mix+=bed[:,None]*np.array([[.92,1.]])
rng=np.random.default_rng(8)
for start in np.linspace(4.25,7.7,19):
 tt=np.arange(int(SR*.055))/SR;v=(rng.normal(0,1,len(tt))*.15+np.sin(2*np.pi*1750*tt))*.045*np.exp(-tt*95);add(np.column_stack([v*.7,v]),start)
for start,amp in [(8,.17),(12.5,.12),(17,.22),(25.2,.13)]:
 tt=np.arange(int(SR*1.8))/SR;v=np.sin(2*np.pi*(45*tt+42*.11*(1-np.exp(-tt/.11))))*np.exp(-tt*3)*amp;add(np.column_stack([v,v]),start)
# A brief breath before the protective intervention; end cleanly.
duck=1-.78*np.exp(-((t-20.75)/.16)**2);mix*=duck[:,None];mix*=np.minimum(1,(30-t)/.7)[:,None]
peak=np.max(np.abs(mix));mix*=min(1,.92/peak)
with wave.open(str(R/'audio/mix.wav'),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
scan=subprocess.run([F,'-hide_banner','-i',str(R/'audio/mix.wav'),'-af','loudnorm=I=-16:TP=-1.5:LRA=10:print_format=json','-f','null','-'],capture_output=True,text=True)
stats=json.loads(scan.stderr[scan.stderr.rfind('{'):scan.stderr.rfind('}')+1]);(R/'output/loudness.json').write_text(json.dumps(stats,indent=2))
filt='acompressor=threshold=0.04:ratio=4:attack=15:release=220:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9'
subprocess.run([F,'-y','-v','error','-i',str(R/'audio/mix.wav'),'-af',filt,'-ar','48000',str(R/'audio/master.wav')],check=True)
print('Sound mix mastered. Source loudness:',stats['input_i'],'LUFS; true peak:',stats['input_tp'],'dBTP')
