"""Cut the app's short interface cues from the local trailer sound effects."""

from pathlib import Path
import subprocess
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "trailer" / "audio"
DESTINATION = ROOT / "assets" / "audio"
DESTINATION.mkdir(parents=True, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# name: source, starting second, duration, finishing fade, gain, extra filter
CUES = {
    "switch": ("switch", 0.0, 0.16, 0.08, 0.22, ""),
    "warning": ("alarm", 0.0, 0.82, 0.26, 0.22, "highpass=f=170,"),
    "crisis": ("alarm", 1.94, 1.12, 0.32, 0.19, "lowpass=f=1100,"),
    "resolve": ("resolve", 0.0, 1.10, 0.34, 0.21, ""),
}

for name, (source, start, duration, fade, gain, filter_prefix) in CUES.items():
    input_file = SOURCE / f"{source}.mp3"
    if not input_file.exists():
        raise FileNotFoundError(f"Missing trailer source: {input_file}")
    output_file = DESTINATION / f"{name}.mp3"
    filters = (
        f"{filter_prefix}volume={gain},"
        f"afade=t=out:st={duration - fade}:d={fade}"
    )
    subprocess.run(
        [
            FFMPEG, "-y", "-v", "error", "-ss", str(start), "-i", str(input_file),
            "-t", str(duration), "-af", filters, "-ac", "1", "-ar", "32000",
            "-codec:a", "libmp3lame", "-b:a", "96k", str(output_file),
        ],
        check=True,
    )
    print(f"{output_file.relative_to(ROOT)}: {output_file.stat().st_size} bytes")
