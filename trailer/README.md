# Trailer deliverables

- `output/AI-vs-Humans-trailer-1080p.mp4`: 30-second social master, 1920×1080, 30 fps, H.264/AAC, cinematic letterbox.
- `output/storyboard.jpg`: visual edit overview.
- `output/frame-27.5.jpg`: title-frame thumbnail.
- `audio/master.wav`: mastered stereo soundtrack.

Sound effects generated with ElevenLabs: atmosphere, riser, warning, switch and restoration. Original synthesized bass and interface ticks mixed locally. No API keys are stored here. The key has sound-generation permission; subscription/account lookup is not permitted.

Actual application captures are used for the circuit imagery, with camera motion and light accents added in post. The large dial is a vector-style reconstruction of the app's control, animated from 30 to 600 requested updates/month. The crisis also increases connectedness and reduces backup, stated on screen. Stronger testing catches the 63 mistakes in the protected replay; this is a recalculation under different safeguards, not a real-time reversal of damage.

Re-render:
```
python trailer/render.py
python trailer/mix.py
python trailer/finish.py
```
Requires Pillow, numpy and imageio-ffmpeg. Keep generated media local; not part of the app deployment.

Suggested post:
One AI error. A connected world. How far can the damage spread—and where can we stop it?

I built AI vs. Humans so you can explore the connections yourself. Turn the dials, push the limits, then try to keep the world together.

Play: https://niksargent.github.io/ai-vs-humans/
