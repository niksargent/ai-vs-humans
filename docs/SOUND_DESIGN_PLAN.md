# Sound in AI vs. Humans

Implemented in `src/sound.ts`, with short clips in `assets/audio/`. The source cuts can be regenerated locally with `python scripts/prepare-sounds.py` when the original trailer recordings are present.

## Purpose

Give the machine a tactile response and make a significant change in the world feel significant. Sound follows a user's action or story step. The simulator calculates alternative versions of one month; the effects must never suggest that a disaster is unfolding in real time while the user waits.

## Header control

Add a compact speaker button in the top header beside About the model and Save or share. Show its current state visibly and accessibly: **Sound off** / **Sound on**, with `aria-pressed` and the same words in its accessible name. Keep the control present at narrower desktop widths where the About text disappears. Use a simple lit speaker indicator consistent with the other machine controls; never add a second sound control elsewhere.

Start off. Turning sound on is the user gesture that enables playback; play one very quiet confirmation click. Save the choice separately in local storage so a shared scenario does not change someone else's sound preference. Turning sound off immediately stops any playing effect. If storage or audio is unavailable, the simulator continues normally and the control stays understandable.

## Cue language

| Moment | Sound | Trigger |
| --- | --- | --- |
| A dial is released at a different value, or a safeguard is applied | Short, dry mechanical switch | Once for the completed change, never for each pointer move or recalculation. |
| The user advances Watch the story | Soft circuit tick derived from the switch | Once per deliberate step. No sound from automatic camera motion or hover. |
| A previously safe or amber major service becomes red | Short, restrained warning pulse derived from the trailer alarm | Once for the transition, after the completed change. A broader collapse or nuclear event takes priority over this cue. |
| The world crosses into civilisation collapse or nuclear use | Deeper, distinct alarm accent derived from the same source | Once for the transition. Nuclear use has the highest priority. The sound describes the current calculated world, not a running countdown. |
| A safeguard prevents that crisis or restores a red service | Short warm relay/chime derived from the trailer resolve sound | Once for the improvement, after the completed change. |

These cues play for explicit actions such as choosing a scenario, replaying a world, applying protection, and changing a dial. A newly opened page, imported scenario, reset animation, Undo, tour, automatic render, and exploration of an already calculated result stay quiet. Turning sound on does not replay alarms from the current world.

## Prepare the assets

Use `trailer/audio/switch.mp3`, `alarm.mp3`, and `resolve.mp3` as source material. Edit small, self-contained clips for the app: approximately 80–150 ms for a switch or story tick, 0.5–0.9 s for a warning, and 0.8–1.2 s for recovery. Keep a clean attack and fade the tail; audition the clips both alone and over normal computer speakers. The trailer's atmosphere, riser, and mixed soundtrack do not belong in the interaction layer.

Place only the approved, compressed clips in an app asset directory copied by the build into `dist/`. Keep the original trailer recordings under `trailer/audio/` ignored as they are now. Set conservative playback levels, leave headroom for overlapping browser audio, and avoid sudden high-frequency peaks.

## Playback rules

Put cue selection in one small sound module. It receives the previous and next calculated results plus the completed action, and chooses at most one cue. Order: nuclear, collapse, major service deterioration, meaningful recovery, then switch. Compare outcome states rather than text, DOM classes, or the colour currently visible on screen. No cue is produced when the action leaves the relevant result unchanged.

Throttle repeated warnings while someone explores adjacent settings; stop or replace a less important cue when a higher priority outcome appears. Never layer several alarms. A held dial can have visual feedback throughout the drag; its sound is committed when released. Keyboard dial changes are each deliberate actions, with a short cooldown so holding an arrow key remains comfortable.

## Acceptance check

1. The header button is discoverable, keyboard operable, visible at supported desktop widths, and correctly announces Sound off/on.
2. Sound is silent on first visit. After turning it on, the setting survives a reload but is not embedded in shared scenarios.
3. A dial drag yields one tactile cue; a real transition into a red outcome yields one warning; preventing it yields one recovery cue. Repeated renders, opening panels, and hovering are silent.
4. Rapid dial movement, held arrow keys, scenario switching, and repeated replays never stack warnings or create a continuous noise bed.
5. Turning sound off stops playback immediately. Audio failures do not affect the model or UI.
6. Test in the local browser with actual speakers/headphones, then check the deployed build includes only the intended short clips.
