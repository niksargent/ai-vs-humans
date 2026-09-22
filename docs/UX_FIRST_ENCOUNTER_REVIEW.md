# First encounter: can an eleven-year-old discover how AI could end civilisation?

22 September 2026 · The Switchboard, model 0.7.0 · Precursor to step 7

## Verdict

The machine contains a much better educational experience than it currently reveals. Its strongest feature is a concrete causal story. Its weakest feature is the relationship between the different things a user can explore. A newcomer can operate controls without understanding what experiment they are changing, mistake hidden wires for absent dependencies, and interpret historical damage as a current emergency.

The priority is not more controls, scenarios or decorative animation. It is a coherent journey: **see a failure, follow its consequences, change one thing, understand why the ending changed, then explore a wider range of worlds.** Keep free exploration available throughout.

Do not fix discoverability by making catastrophe artificially frequent. The range exists. The interface must help people find and understand it.

## Method and limits

This is an expert cognitive walkthrough using an imagined eleven-year-old's knowledge and expectations, not research with a real child. The imagined thoughts below are hypotheses, not participant quotations. No completion rates, attention measurements or child-comprehension claims were collected.

Brief assumed: “This game shows how AI could end civilisation.” No tutorial or prior vocabulary. I inspected the live browser, followed the eight-event opening story, changed a main dial with the keyboard, explored safeguards, human-response replays, the monthly experiment, advanced settings, the extinction exploration and About. I also loaded each of the five alternative spark presets, read its inspector and first story step, and used Undo after each to preserve the original world. I checked the layout at the existing approximately 1700 × 980 viewport and 1366 × 768. I measured dial geometry and computed animation styles, then inspected implementation where needed to explain the observations. I swept each main dial individually against the opening world and inspected monthly preset outcomes.

The existing saved world was temporarily reset and then restored with Undo. Viewport override was removed. No application code or model behaviour was changed. Reset does not create a truly fresh browser session: first-load behaviour was also checked in source, which starts on Causes but focuses the camera on services. I did not pretend this reset was a pristine first visit.

Evidence labels below: **Observed** = live browser; **Code** = implementation inspection; **Measured** = geometry or model sweep; **Hypothesis** = likely interpretation to test with people. Keyboard dial input worked; that is not a full accessibility audit. Dragging, every advanced toggle, all import/export paths, every route combination and other browsers were not exhaustively tested.

## The imagined first ten minutes

| Moment | What the machine communicates | Possible child interpretation | Researcher's finding |
|---|---|---|---|
| Arrival | “Find its breaking points. Keep it alive.” Five numbered destinations, seven dials, a large circuit, selectable sparks. | “Am I saving the world or trying to break it? Has the game started?” | The premise is enticing, but the next useful action and the already-calculated state compete. |
| First look at the map | Some illuminated components connect; many sit alone. First-load camera focuses services while the panel asks for a spark. | “Those other boxes are locked, broken, or don't do anything.” | Hidden detail has no visible promise. Spatial structure and task structure disagree. |
| Turn a dial | Immediate recomputation, a short-lived highlight and guidance below the map. Some settings do not alter the visible ending. | “Did that work? Do I have to press play?” | The interaction lacks a durable, local explanation of change or non-change. |
| Press Follow events | Eight understandable steps; the map changes focus. | “Now I get it: the hospital problem also slows repairs.” | Strong teaching sequence. However, full-world damage indicators remain, rather than presenting the time shown in the story. |
| Finish the story | Region 1 is repaired; Next is disabled. Region cells still show interruption. | “Is it fixed or not? What do I do now?” | No concluding mission or explicit distinction between damage experienced and current state. |
| Seek civilisation collapse | Main dials can prevent or worsen an outage, but the opening three-region exposure cannot cross the four-region collapse requirement. | “I turned everything up and it still won't happen.” | Necessary extra controls are buried. Failure to find them can look like failure of the premise. |
| Open the month | The damaged opening world becomes 128 quiet months because research is paused and this experiment replaces the original bad update. | “This contradicts the red lights I just saw.” | Correct model distinction, insufficiently prominent explanation. |
| Jump to Beyond collapse | Four further assumptions, no initiating event, a verdict that extinction is unresolved. | “You asked me how it happens, but now I have to choose that it happens.” | A thought experiment needs a more concrete physical story and an actionable way to reach an eligible starting situation. |

## Findings to address

P1 = threatens the central learning goal or creates a materially wrong interpretation. P2 = materially impedes exploration or readability. P3 = polish. These are expert priorities, not measured user prevalence.

### P1: meaning, causality and trust

**F01 — Four different experiments lack a clear shared structure.** Observed/Code. The circuit explores one stipulated incident, Human choices varies human responses 256 times, the month samples releases 128 times, and Beyond collapse explores extra assumptions. Their different entry points, counts and formats obscure what stays fixed and what changes. Recommendation: persistent, compact experiment identity and an explicit transition at entry, using concrete language: “One bad update”, “Different human decisions”, “A month of new updates”, “Could anyone survive?” Keep deeper sampling details on demand. Acceptance: a newcomer can explain what changes when moving between these views without consulting About.

**F02 — The circuit conceals real connections without signalling that they exist.** Observed/Code. The overview renders 11 primary edges. Additional parent links appear only when relevant components are selected. Components such as payments and transport look isolated even though the model uses them. Selection changes the visible topology; it can look as though clicking creates a dependency. Recommendation: stable district-to-district structure with visible connection sockets/bundles and a clear selected-component expansion. Preserve enough of the surrounding skeleton to retain place. Do not restore a full hairball. Acceptance: users recognise a dormant route, a hidden detail and a blocked route as different things; selection never appears to alter the world's rules.

**F03 — Time and status are mixed.** Observed/Code. The opening story ends with Region 1 repaired after 130 hours, while the regional rail still reports calls/power/hospital interrupted. That rail describes disruption experienced during the run, not a live snapshot. “LIVE CONSEQUENCES”, present-tense red lights and a story with timestamps imply otherwise. Recommendation: choose and consistently expose either “damage during this run” or the state at a selected story time. Use explicit “Recovered after…” endings. Acceptance: a child can answer whether the hospital is still out now, was out earlier, or might fail later.

**F04 — The opening controls cannot deliver the promised destination on their own.** Measured/Code. None of the seven main dials, swept one at a time from the opening world at seed 42, reaches civilisation collapse. Exposure remains three regions; the default collapse rule needs four. Tension at 100 also does not produce nuclear use in this fixed replay. Recommendation: when relevant, offer a causal next experiment: “Three regions are hit. Could the others keep them alive?” leading to shared reach and help. Show alternate human decisions as another possible ending, not a hidden randomisation trick. Acceptance: a player can deliberately discover a credible collapse route and explain its prerequisites, without guessing where controls are hidden.

**F05 — The monthly experiment can appear to erase the catastrophe.** Observed. From the opening world, the month shows 128/128 No disruption, with projects paused, while the main circuit showed serious damage. The month substitutes newly sampled release faults for the original stipulated update; that crucial distinction is buried in About this experiment. Recommendation: an entry state such as “No new updates are running. Start projects to explore repeated failures”, plus a concise statement that this is a new experiment. Acceptance: no one interprets opening the month as repairing the main-world damage.

**F06 — The extinction layer asks abstract questions before giving a concrete continuation.** Observed/Code. “Not established”, “Assume yes” and “This route has no starting event” are logically careful but do not deliver a compelling explanation to someone expecting a game. The physical route groups very different hazards under generic survival conditions. Recommendation: illustrate high-level consequences and survivor safeguards for the selected starting event; show what is computed versus what the user is exploring through visual structure. If no starting event exists, offer a clearly labelled relevant world to explore, without silently changing settings. Keep the distinction between collapse and extinction. Acceptance: the user can explain one conditional path beyond collapse and identify a way it could fail; they do not mistake assumed conditions for a prediction.

**F07 — About is behind the implementation.** Observed/Code. It still opens with “This first playable section” and never explains the monthly release experiment. It describes extinction among previews without explaining the implemented conditional exploration. It refers to wider political components in a way that overstates the visible structure. Recommendation: rewrite around what this build actually calculates, explores conditionally and leaves outside scope. One authoritative explanation of model boundaries, with small local cues only when needed to prevent a specific misunderstanding. Acceptance: About, inspectors, save/version information and the actual screens describe the same product.

**F08 — Identical-looking controls can represent different checking systems.** Observed/Code. HUMAN CHECKS changes military-warning verification; monthly Checking capacity changes release evaluation. Advanced Development & checks also contains repair assistance. A child can reasonably expect stronger HUMAN CHECKS to prevent faulty releases. Recommendation: distinguish “Check attack warnings” from “Test AI updates”, with matching component names and one concrete example each. Acceptance: the player can choose the correct safeguard for a bad update versus a false military warning.

### P2: orientation, interaction and exploration

**F09 — Breadcrumbs are click history, not a stable hierarchy.** Observed/Code. The session contained “World status › World status › World status”. `rememberPlace()` appends visits indiscriminately. Recommendation: stable destination > subject > detail breadcrumbs; separate Back history internally and deduplicate same-location actions. Acceptance: repeated selections do not lengthen the location label or invent parent-child relationships.

**F10 — The top destination and the active activity can disagree.** Observed/Code. Follow events opened Events while the top rail still said Set the world; guidance still said Choose a spark. The story is reachable through both Follow the chain and Follow events, while node actions say Show what happened. Recommendation: a single canonical activity identity regardless of entry point; keep the parent subject as context rather than pretending it is the activity. Acceptance: entering the same feature by any route gives the same active destination and current guidance.

**F11 — Several meanings of Back and Reset coexist.** Observed/Code. Story Back, panel Back, breadcrumb links, browser Back, world Reset, Undo and assumption Reset are different actions. Reset also switches the map to Compact while retaining the current panel/trail, so “opening world restored” does not mean opening experience restored. Recommendation: distinguish previous event, back to subject, undo change and restart world. Keep layout preference independent of model reset. Acceptance: users can predict what each control restores and return from an exploration without losing their world.

**F12 — The story ends rather than handing off to an experiment.** Observed. The final step has a disabled Next and a repaired-network statement, but no invitation to act on what was learned. Recommendation: a short outcome readout and one suggested intervention or “Try a different ending”, retaining free controls. Acceptance: the user knows what to try next and can explain why it might help.

**F13 — Multiple scroll areas hide the teacher and the feedback.** Observed. At 1366 × 768, the machine extends well below the viewport. Mission Control, regions, lower dials, map HUD or lower inspector content require scrolling; the page, desk, inspector and modal have different scroll behaviours. A first user may never see the guidance intended to explain a change. Recommendation: budget the laptop viewport around the current action and result; provide a stable feedback location beside the action, with intentional expansion for deeper content. Do not solve it by shrinking all text. Acceptance: the active control, its meaningful consequence and a way back are visible together on a typical laptop.

**F14 — Dial mechanics are not self-evident.** Observed/Code. Dials use vertical dragging rather than circular turning; instructions live mainly in a tooltip. Arrow keys work. Hover/focus reveals extra notes and can shift the control stack. Recommendation: first-interaction cue, generous hit area, stable explanation space, keyboard increments and a readable scale. Acceptance: a child can adjust the dial unaided and name what its endpoints mean.

**F15 — Dial/ring centring is defective.** Measured/Code. All seven tested dials had centres 6 px right and 6 px below their 64 px rings; knobs were 52 px. The parent already flex-centres the relatively positioned knob, then `left:6px; top:6px` shifts it again. Responsive sizes and inherited marker transform origins need a joint check. Recommendation: one centring method and marker geometry based on actual dial size. Acceptance: coincident centres at supported widths; the marker rotates around the knob centre and agrees with the arc endpoints.

**F16 — Motion is disabled in this browser for an identifiable reason.** Measured/Code. `prefers-reduced-motion: reduce` is true. Harm wires, LEDs and the guide signal compute to `animation-name:none`, duration 0s. CSS contains signal-flow and LED-breathing animations, but the reduced-motion rule suppresses them. This is not proof that animations are missing or broken everywhere. Recommendation: respect the preference; retain vivid static states, a lasting change summary and clear event progression. If adding a motion preference, default to the system and let users opt in. Test full-motion mode separately. Acceptance: both experiences communicate causality; neither depends on flickering. Do not switch off the user's accessibility preference as a fix.

**F17 — Colours carry two meanings without enough separation.** Observed/Code. Component titles inherit control-family colours, while lights and wires represent state. An amber title can be an input family or resemble a warning; grey can mean inactive, unused or unresolved. Recommendation: keep coloured family identity restrained and use consistent shape/text/state indicators. Explain colour meaning through interaction rather than a large permanent legend. Acceptance: users distinguish “belongs to this control” from “is in danger”.

**F18 — The outcome stack visually implies the wrong chain.** Code/Observed styling. Down arrows between readout cards imply Military crisis → Hospital lifeline → Nuclear weapons → Civilisation, though those are not consecutive causal steps. Recommendation: use an outcome grouping without sequence arrows, or make the actual branching relationship explicit. Acceptance: the result panel cannot teach a causal dependency the model does not have.

**F19 — Region 1 quietly stands in for the world.** Observed/Code. The main hospital readout gives Region 1's unmet-care hours without naming Region 1. Story conclusion names it; regional and collapse views cover all six. Region numbers have little concrete meaning, and relative scale is hard to feel. Recommendation: consistently label local versus multi-region results; use simple fictional regional identities or clearly described service zones without inventing population/death estimates. Acceptance: the user knows whether “106 hours” describes one region or everyone.

**F20 — The monthly results disable the outcomes a curious child most wants to inspect.** Observed/Code. Zero-count outcome buttons are disabled. Their tooltip explains sampling, but offers no direct route to learn about that ending; the alternative worlds are in a collapsed disclosure elsewhere. Recommendation: keep counts truthful and allow “Not seen here—what would make this possible?” as an exploratory action clearly outside the sample. Acceptance: a zero never reads as impossible or as a locked reward requiring random clicking.

**F21 — Monthly controls introduce a second visual and conceptual language.** Observed. A large modal with ordinary sliders and statistical readouts replaces the instrument surface. “Idea pace”, “Research speed” and “AI project pace” refer to the same setting but show different units (% versus ideas/day). The label may show requested 4/day while compute limits actual production to 3/day. Recommendation: consistent naming, actual throughput plus visible bottleneck, and a stable route back to the same experiment after World controls. Acceptance: the player can explain why raising pace sometimes does nothing and need not rediscover the monthly screen after changing a world control.

**F22 — Helpful safeguards can promise more than they set.** Code. “Give people an independent check before they act” sets verification and decision time but does not set the independent-channel flag. In a world with no working channel this can fail its promise. Recommendation: align the action with its words or name exactly what it changes, then explain remaining blockers. Acceptance: a suggested remedy never silently leaves out the condition it claims to provide.

**F23 — Selecting and deselecting does not follow one simple rule.** Code. Re-selecting an ordinary node goes Back; repair and collapse open specialised panel types and do not use the same toggle condition. Selection also recentres the camera. Recommendation: consistent selection clearing, predictable camera movement and a visible return to the surrounding view. Acceptance: a child can inspect successive components without accumulating a trail or losing their location.

**F24 — Sparse space is not yet meaningful space.** Observed. Normal mode has room to breathe, but large gaps and disconnected modules can feel empty rather than like a connected world. Compact mode changes titles and suppresses detail, so switching changes both scale and vocabulary. Recommendation: use the same names and recognisable districts, with stable structural connections at both densities. Acceptance: users recognise the same place before and after zoom/density changes.

### Additional pathway checks: fix before polishing

**F25 — Research explanation directly contradicts its own result (P1).** Observed/Code. Loading “Updates outrun checks” shows 60 unchecked releases, then says “Checks catch the introduced faulty update in this experiment.” Its story describes those unchecked releases and continues into network failure. The sentence is unconditional in `src/model.ts`, although `researchFault` is conditional in `src/pathways.ts`. Recommendation: generate the explanation from the same actual gate result used by the model. Acceptance: unchecked release, caught fault, blocked permission and empty production each have truthful explanations and matching stories. This should be among the first repairs.

**F26 — Stories retain the original network template when another cause is selected (P1).** Observed/Code. “Hospitals face a surge” opens with “The network fault is blocked. No bad update is running.” The child selected a health threat, not a network experiment. The agent story is better adapted; misinformation and payment stories still begin with the bad update, which is legitimate background but insufficiently introduced as a combined scenario. Recommendation: begin with the chosen cause and make necessary background conditions visible; omit irrelevant non-events. Explain the AI-to-health connection at a high level rather than jumping straight to busy hospitals. Acceptance: the first event answers “How did the thing I selected start?” for all six sparks.

**F27 — Choosing a spark replaces the world, rather than adding that cause (P2).** Code. Spark buttons load defaults plus the preset. They can undo a user's hard-won protections or other active challenges. The opening copy says “load a new starting situation”, but the card action itself has no concrete preview of what will change. Monthly worlds similarly replace settings. Recommendation: label actions as new experiments, offer a brief change preview and immediate undo, and distinguish them from toggling a cause in the current world. Acceptance: users are not surprised that hospital backup or other safeguards changed when they selected a new story.

Route-specific strengths: the agent explanation clearly links an ignored stop order to continuing damage; the information example explains false emergency instructions; the payments example uses a shop with food but no working way to pay. Preserve those concrete explanations. The health explanation still relies on “Biological misuse”, “screening” and several abstract prerequisites; it needs a similarly concrete, non-procedural story.

## Is the range interesting enough?

The engine has enough range for the next educational iteration. The main weakness is how users encounter it. [Measured sweep data](UX_RANGE_AUDIT.json) records defaults, seed, fields and all tested positions. The distinct-result counts below concern selected output summaries, not every internal state or textual label.

| Main dial, one at a time from the opening world | Positions / distinct output summaries | Implication |
|---|---:|---|
| AI abilities | 3 / 3 | Clear changes, but “ability” currently means access to a narrow set of network operations, not general intelligence. |
| Permissions | 3 / 2 | Ask first and advice-only look alike while approval is absent. Explain that prerequisite. |
| World tension | 21 / 2 | Large stretches feel inert in one fixed replay; even maximum does not cause nuclear use in seed 42. |
| Human checks | 21 / 2 | A deadline creates a sharp transition. Show progress towards the needed check time before the ending flips. |
| Independence | 21 / 21 | Good continuous feedback: opening repair time moves from 142 to 90 hours across endpoints. Make that improvement visible. |
| Hospital backup | 121 / 20 | Useful early range, long plateau after backup covers the incident. Use hour/day landmarks and “enough for this outage”. |
| AI project pace | 21 / 1 | Projects start paused. The beautiful dial initially changes no model outcome. Make the inactive state and starting action unmistakable. |

At the same seed base, 128 monthly replays produce:

| Deliberate world | Quiet | Weathered | Still recovering | Rebuilt | Collapse | Nuclear |
|---|---:|---:|---:|---:|---:|---:|
| Give checks a chance | 97 | 27 | 4 | 0 | 0 | 0 |
| Race the repair crews | 0 | 0 | 0 | 0 | 128 | 0 |
| Nuclear stakes | 0 | 0 | 2 | 0 | 0 | 126 |
| Keep a way back | 3 | 30 | 91 | 0 | 4 | 0 |
| Can a broken world rebuild? | 39 | 0 | 12 | 33 | 44 | 0 |

These are illustrative stress settings, not estimates of real-world risk. The rebuilding world is especially exploratory because several qualitatively different endings occur. The saturated race/nuclear worlds illustrate extremes well but may become boring quickly; pair each with a discoverable intervention that moves it away from saturation. Do not tune the random sample to guarantee drama. The rebuilding preset also changes the definition of collapse to one day: expose that change close to its result, so a different label is not mistaken for worse physical damage.

For additional value, expose moderate versions of severe worlds and explain plateau/bottleneck effects. Do not add more catastrophe types before making existing pathways legible. Beneficial AI repair assistance already exists but is buried; bringing that into the rescue experience would show a genuine trade-off rather than implying all AI is a hazard.

## Language changes worth making

These are example directions, not a final copy deck. Retain precision where the distinction matters.

| Current | Problem | Better direction |
|---|---|---|
| Candidate ideas / candidate updates / releases / versions | The production pipeline has no concrete object. | “AI suggests an update → people test it → it goes live.” |
| AI abilities: Coordinate connected services | Broad label, narrow meaning. | “Can operate phone and power systems”, with other abilities explained separately. |
| Human checks | Confused with testing new AI versions. | “Check attack warnings”. |
| Independence / independent capacity | Independent of whom or what? | “Services that can work without this AI/network”, then show radios/manual operation. |
| 100% at lowest | Mathematical qualifier without an object. | “Payments kept working throughout”. |
| Power gap · 106h | Hard to picture and ambiguous in time. | “Care fell short for 4 days, 10 hours”, specifying region and scope. |
| Shared across regions / network held | Network exposure can be mistaken for all threats. | “This network fault reached 3 of 6 regions”. |
| Not established / Assume yes | Abstract logical workflow. | A concrete question and “Explore if this happens”, retaining Unknown as a valid answer. |
| Service-collapse threshold | Appropriate in rules, poor main headline. | “Too many regions lost essential services for too long”, with exact definition on demand. |
| This escalation is avoided | Can imply a safeguard actively prevented it. | “No nuclear use in this replay”, followed by why or another possible response. |
| 128 replays / run 21 | Better than unexplained examples, still technical. | Introduce once: “Same world, 128 possible months”; then “Follow this month”. |

## Proposed repair order for step 7

1. **Make the model's meaning consistent.** Resolve experiment identity, time/state, local/global scope, checking terminology, About and safeguard promises. These are trust repairs, not cosmetic copy edits.
2. **Give the world a stable structure.** Navigation hierarchy, selection/back behaviour, persistent connection cues and a single canonical event-story entry. No new permanent label wall.
3. **Create a first successful learning loop.** A short discoverable story, one meaningful intervention, a visible changed consequence and an invitation into wider risks. Allow skipping directly into free exploration.
4. **Fix physical interaction and viewport use.** Centred dials/markers, laptop composition, stable help, persistent feedback, reduced-motion and full-motion behaviour. Animate causal transitions, not merely decorative pulsing.
5. **Improve range discovery.** Guided moderate/extreme worlds, plateau explanations, inspectable zero outcomes, beneficial AI assistance and transparent preset changes. Preserve reproducibility and honest samples.
6. **Test with actual users before final polish and hosting.** Use the tasks below, revise the largest failures, then perform the broader step-7 accessibility/browser/performance checks.

## Suggested real-user session

Start exactly with the user's proposed brief. Do not explain controls or suggest the top rail. Obtain appropriate consent/assent for any child sessions; avoid recording unnecessary personal information. Keep the experience exploratory, with no implication that the displayed catastrophe is a forecast.

First observe a short unprompted period. Ask “What do you think is happening?” and “What would you try?” without teaching the answer. Then offer these tasks, in an order that does not require a memorised tutorial:

- Find one way AI could interrupt a hospital. Tell the story back in your own words.
- Keep that hospital working. Explain what changed and what did not.
- Find a way the problem could spread beyond one region. Explain how a working region could help.
- Make a serious crisis possible, then find something that interrupts its path.
- Find another possible ending without changing the world's safeguards. Explain what varied.
- Explore repeated new updates. Explain why those results differ from the original incident.
- Explore what would also have to happen for no community to survive. Distinguish a model result from an assumption.
- Return to the previous exploration and undo your last world change.

Record the first chosen action, missed cues, backtracking, requests for help, misread colours/time/scope, dead-end clicks and the causal explanation—not just task completion. Avoid interrupting every action with think-aloud prompts. Ask for a short explanation after a sequence when that better preserves natural exploration. Use a separate adult/sceptic session to challenge mechanisms and evidence rather than expecting the child's session to validate the science.

Release gates should be observable: users can tell one causal story, choose a relevant safeguard, distinguish a single event from repeated releases, explain why an isolated-looking node still matters, navigate back, and avoid equating collapse with extinction or sample counts with real-world odds. Set numerical success criteria only when a real testing plan and sample have been agreed.

## What should stay

The physical control desk; immediate consequences; the concrete event story; six regions with finite help; distinct collapse/recovery outcomes; undo; explanations on demand; named safeguards; deterministic replays; a visible distinction between catastrophe and extinction. These are strong foundations. The next iteration should connect them into one understandable experience rather than add another layer of features.
