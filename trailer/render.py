from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np, math, subprocess, wave, json, os
from pathlib import Path
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parent
W,H,FPS=1920,1080,30
TOP,AH=138,804
FF=imageio_ffmpeg.get_ffmpeg_exe()
FONT='C:/Windows/Fonts/bahnschrift.ttf'
BOLD='C:/Windows/Fonts/seguisb.ttf'
MONO='C:/Windows/Fonts/consola.ttf'
def font(n,b=False):return ImageFont.truetype(BOLD if b else FONT,n)
def ease(v):v=max(0,min(1,v));return v*v*(3-2*v)
def txt(im,text,y,size=48,color=(232,242,248),center=True,x=110,b=False,spacing=0):
 d=ImageDraw.Draw(im);f=font(size,b)
 if spacing:
  length=sum(d.textlength(c,font=f) for c in text)+spacing*(len(text)-1)
  if center:x=(W-length)/2
  for c in text:d.text((x,y),c,font=f,fill=color);x+=d.textlength(c,font=f)+spacing
 else:
  if center:x=(W-d.textlength(text,font=f))/2
  d.text((x,y),text,font=f,fill=color)
# Preserve the real interface art, crop away browser/UI navigation for camera work.
images={p.stem:Image.open(p).convert('RGB') for p in (ROOT/'stills').glob('*.png')}
crops={'calm':(70,380,1480,890),'crisis':(70,380,1480,890),'protected':(70,380,1480,890),'shared':(245,520,1245,830),'hospital':(320,485,1340,890),'collapse':(620,370,1510,840)}
# Screenshots can contain compositor scaling during resize: the calm wide frame is detected explicitly.
for k in ['calm']:
 if images[k].getpixel((1750,500))[:3]==images[k].getpixel((1750,800))[:3]:crops[k]=(90,285,1130,690)
plates={k:images[k].crop(c).resize((2200,1000),Image.Resampling.LANCZOS) for k,c in crops.items()}
y,x=np.mgrid[0:AH,0:W];vignette=(255*np.clip(((x-W/2)/(W*.69))**2+((y-AH/2)/(AH*.82))**2,0,1)*.6).astype('uint8');V=Image.fromarray(vignette,'L')
rng=np.random.default_rng(14)
particles=[(float(rng.uniform(0,W)),float(rng.uniform(TOP,TOP+AH)),float(rng.uniform(5,18))) for _ in range(42)]
def plate(name,u,reverse=False):
 im=plates[name];z=1+.07*ease(u);cw=int(W/z);ch=int(AH/z);cx=110+(70*(1-u) if reverse else 70*u);cy=80+20*math.sin(u*2)
 out=im.crop((cx,cy,cx+cw,cy+ch)).resize((W,AH),Image.Resampling.BICUBIC)
 out=ImageEnhance.Contrast(out).enhance(1.08);out=ImageEnhance.Color(out).enhance(1.17)
 out.paste((0,0,0),(0,0,W,AH),V)
 return out
# High-resolution animated control, reconstructed from the app's metallic dial design.
def dial(value,t):
 n=560;yy,xx=np.mgrid[0:n,0:n];r=np.sqrt((xx-280)**2+(yy-280)**2);light=np.clip(.46+.22*(1-yy/n)+.08*np.cos(np.arctan2(yy-280,xx-280)*3),0,1)
 a=np.zeros((n,n,4),dtype=np.uint8);inside=r<213
 for k,m in enumerate([111,126,145]):a[:,:,k]=(light*m).astype(np.uint8)
 a[:,:,3]=inside*255;im=Image.fromarray(a,'RGBA');d=ImageDraw.Draw(im)
 d.ellipse((65,65,495,495),outline=(13,19,27,255),width=9);d.ellipse((72,72,488,488),outline=(153,172,189,100),width=3)
 for i in range(31):
  ang=math.radians(135+i*9);rr=250;d.line([(280+rr*math.cos(ang),280+rr*math.sin(ang)),(280+(rr-9)*math.cos(ang),280+(rr-9)*math.sin(ang))],fill=(110,145,172,180),width=2)
 col=(154,179,255,255);d.arc((39,39,521,521),135,405,fill=(49,67,90,255),width=7);d.arc((39,39,521,521),135,135+270*math.sqrt(value/600),fill=col,width=8)
 ang=math.radians(135+270*math.sqrt(value/600));p1=(280+116*math.cos(ang),280+116*math.sin(ang));p2=(280+186*math.cos(ang),280+186*math.sin(ang));gl=Image.new('RGBA',(n,n));ImageDraw.Draw(gl).line([p1,p2],fill=col,width=10);im=Image.alpha_composite(im,gl.filter(ImageFilter.GaussianBlur(10)));ImageDraw.Draw(im).line([p1,p2],fill=(215,229,255),width=6)
 return im
shots=[(0,4,'calm','01 / A CONNECTED WORLD','EVERYTHING SEEMS OKAY.'),(4,8,'dial','02 / THE PRESSURE','TURN UP THE PRESSURE.'),(8,12.5,'shared','03 / THE FIRST FAILURE','ONE ERROR. A CONNECTED WORLD.'),(12.5,17,'hospital','04 / THE CASCADE','HOW FAR DOES IT SPREAD?'),(17,21,'crisis','05 / THE BREAKING POINT','WHERE DOES IT STOP?'),(21,25.2,'protected','06 / ANOTHER ENDING','CHANGE THE CONDITIONS.'),(25.2,30,'hero','','')]
def render(t):
 a,b,name,kicker,caption=next(s for s in shots if s[0]<=t<s[1]);u=(t-a)/(b-a)
 im=Image.new('RGB',(W,H),(3,7,12));col=(129,235,205) if name in ['calm','protected','hero'] else (255,118,97)
 if name=='dial':
  bg=plate('calm',u).filter(ImageFilter.GaussianBlur(12));bg=ImageEnhance.Brightness(bg).enhance(.2);im.paste(bg,(0,TOP))
  val=round(30+570*ease(min(1,u*1.22)));im.paste(dial(val,t),(250,242),dial(val,t))
  txt(im,'AI PROJECT PACE',320,28,(161,181,222),False,950,spacing=3)
  txt(im,str(val),370,160,(237,243,255),False,945,b=True)
  txt(im,'UPDATES REQUESTED / MONTH',574,24,(159,178,198),False,952,spacing=2)
  dd=ImageDraw.Draw(im);dd.line((953,644,1590,644),fill=(64,84,105),width=2);dd.line((953,644,953+int(637*val/600),644),fill=(157,185,255),width=3)
  txt(im,'Can the checks keep up?',682,34,(195,211,225),False,950)
 else:
  bg=plate('protected' if name=='hero' else name,u, name=='hospital');
  if name=='hero':bg=bg.filter(ImageFilter.GaussianBlur(4));bg=ImageEnhance.Brightness(bg).enhance(.27)
  elif name=='calm':bg=ImageEnhance.Brightness(bg).enhance(.82)
  # Light breathes through real illuminated nodes without replacing their shapes.
  if name not in ['hero','calm']:
   arr=np.array(bg);mask=np.maximum(arr[:,:,0].astype(float)-arr[:,:,1],0) if name!='protected' else np.maximum(arr[:,:,1].astype(float)-arr[:,:,0],0)
   glow=Image.fromarray(np.uint8(np.clip(mask*1.6,0,255))).filter(ImageFilter.GaussianBlur(13))
   glow=glow.point(lambda x:int(x*(.12+.16*(.5+.5*math.sin(t*5)))))
   color=Image.new('RGB',bg.size,col);bg=Image.composite(color,bg,glow)
  im.paste(bg,(0,TOP))
 d=ImageDraw.Draw(im)
 for px,py,speed in particles:
  xx=(px+t*speed)%W;yy=py+5*math.sin(t*.3+px);d.ellipse((xx,yy,xx+1,yy+1),fill=(63,83,97))
 if name=='hero':
  txt(im,'THE FUTURE IS NOT A SPECTATOR SPORT',259,22,(142,193,194),spacing=5)
  txt(im,'AI vs. Humans',350,136,(238,246,251),b=True)
  d.line((780,532,1140,532),fill=(136,231,207),width=3)
  txt(im,'PUSH THE LIMITS. PROTECT THE WORLD.',570,34,(203,219,231),spacing=2)
  txt(im,'PLAY THE SIMULATOR',678,24,(142,235,209),spacing=4)
  txt(im,'niksargent.github.io/ai-vs-humans',733,32,(233,240,245))
  txt(im,'creator: @niksargent',835,22,(130,158,179))
 else:
  # Deliberate black letterbox typography: clean even on a small phone.
  txt(im,kicker,66,22,(142,166,183),False,100,spacing=3)
  txt(im,caption,975,43,(239,243,246),b=True,spacing=1)
  if name=='protected':
   txt(im,'STRONGER CHECKS',204,25,(164,242,215),False,105,spacing=3)
   txt(im,'63 mistakes caught. 0 escaped.',245,42,(235,250,244),False,103,b=True)
   txt(im,'Same month. New safeguards.',876,23,(171,212,201))
  if name=='crisis':
   txt(im,'CIVILISATION IN CRISIS',207,31,(255,142,121),False,102,spacing=3)
 # subtle cinematic frame and progress marks
 d=ImageDraw.Draw(im);d.line((0,TOP-1,W,TOP-1),fill=(32,45,58));d.line((0,TOP+AH,W,TOP+AH),fill=(32,45,58))
 if name!='hero':d.rectangle((W-210,74,W-100,76),fill=(36,49,61));d.rectangle((W-210,74,W-210+int(110*t/30),76),fill=col)
 # controlled dips to black between scenes, not slide-like crossfades
 fade=min(1,(t-a)/.28,(b-t)/.20) if name!='hero' else min(1,(t-a)/.5,(30-t)/.6)
 if t<1.1:fade*=ease(t/1.1)
 if fade<1:im=ImageEnhance.Brightness(im).enhance(max(0,fade))
 return im
if __name__=='__main__':
 import sys
 if '--preview' in sys.argv:
  times=[2,5.8,10,14.5,19,23,27.5];sheet=Image.new('RGB',(960,270*4),(0,0,0))
  for i,t in enumerate(times):
   fr=render(t);fr.save(ROOT/'output'/f'frame-{t}.jpg',quality=94);sheet.paste(fr.resize((480,270)),((i%2)*480,(i//2)*270))
  sheet.save(ROOT/'output/storyboard.jpg',quality=94)
 else:
  proc=subprocess.Popen([FF,'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','30','-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'output/picture.mp4')],stdin=subprocess.PIPE,stderr=open(ROOT/'output/encode.log','w'))
  for i in range(900):
   proc.stdin.write(render(i/30).tobytes())
   if i%90==0:print(f'Rendered {i}/900 frames',flush=True)
  proc.stdin.close();assert proc.wait()==0
