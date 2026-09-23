import subprocess,json,re
from pathlib import Path
import imageio_ffmpeg
R=Path(__file__).resolve().parent;F=imageio_ffmpeg.get_ffmpeg_exe();out=R/'output/AI-vs-Humans-trailer-1080p.mp4'
subprocess.run([F,'-y','-v','error','-i',str(R/'output/picture.mp4'),'-i',str(R/'audio/master.wav'),'-i',str(R/'output/conditions.png'),'-filter_complex',"[0:v][2:v]overlay=0:0:enable='between(t,8,21)'[v]",'-map','[v]','-map','1:a','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','320k','-ar','48000','-t','30','-movflags','+faststart','-metadata','title=AI vs. Humans — Push the limits. Protect the world.','-metadata','artist=@niksargent',str(out)],check=True)
probe=subprocess.run([F,'-hide_banner','-i',str(out),'-af','loudnorm=I=-16:TP=-1.5:LRA=10:print_format=json','-f','null','-'],capture_output=True,text=True)
(R/'output/quality-check.txt').write_text(probe.stderr)
assert '1920x1080' in probe.stderr and '30 fps' in probe.stderr and '00:00:30.00' in probe.stderr
stats=json.loads(probe.stderr[probe.stderr.rfind('{'):probe.stderr.rfind('}')+1]);print(json.dumps({'file':str(out),'megabytes':round(out.stat().st_size/1e6,2),'duration':30,'resolution':'1920x1080','fps':30,'loudness_LUFS':stats['input_i'],'true_peak_dBTP':stats['input_tp']},indent=2))
# Extract frames from the actual encoded deliverable for final review.
for t in [2,6,10,15,19,23,27]:
 subprocess.run([F,'-y','-v','error','-ss',str(t),'-i',str(out),'-frames:v','1','-update','1',str(R/'output'/f'encoded-{t}.jpg')],check=True)
