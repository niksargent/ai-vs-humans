# Acceptance tests and user-testing guide

Proposed tests, not completed results. These define the release standard for the build.

## 1. First working section

One shared communications component affects military verification and hospital restoration. A scenario introduces a communications incident and separately specifies AI's role. The viewer can change permissions, independent verification and fallback communications.

Required demonstrations:

- A permission change visibly opens only relevant connections.
- Military advice does not become launch authority.
- Stronger independent verification can interrupt an escalation branch under the stated rule without repairing communications magically.
- Hospital restoration improves only when its relevant dependency or fallback changes.
- The same communications failure is recorded once, even when it affects two domains.
- A paired comparison preserves the introduced incident and exogenous samples.
- The UI's explanation names actual changed conditions from the event record.
- Power, health and military branches remain parts of one navigable world.

Passing this gate does not complete the application.

## 2. Model correctness

| Test | Expected result |
|---|---|
| Fixed inputs/version/seed replay | Identical event outcomes and classifications; documented numeric tolerance if necessary |
| Different seed | Permitted event variation, without changing parameters or rules |
| No permission for direct operation | Direct-operation route blocked; advisory and misuse pathways remain separately governed |
| No physical resources | Software capability alone cannot perform physical actions |
| No malicious actor / no harmful propensity | Relevant intentional-harm routes absent; accidental failures still possible |
| Successful effective containment | Downstream events requiring that escaped incident do not occur via that route |
| Shared provider failure | One common cause affects exposed services; no duplicated event probability |
| Dependent safeguards | Combined reliability does not assume independence |
| Reserve conservation | Stocks and withdrawals balance; no negative stock or duplicate use |
| Surviving region | Local or majority collapse does not imply literal extinction |
| Recovery after failure | Recorded event history persists while end-state classification can improve |
| Horizon ends before recovery | Report incomplete/unknown beyond horizon, not permanently impossible |
| Reordering internal component lists | No substantive result changes from iteration order |
| Smaller integration step | Differences characterised; unacceptable instability blocks release |
| Disabling uncertain edge | Only reachable consequences change unless feedback explains wider effects |
| Advanced controls collapsed | Hidden children remain active and inspectable; no reset |

Use invariants and meaningful scenario contrasts. Do not test only that the implementation repeats its own formulas. Boundary tests include very high/low settings, absent prerequisites, simultaneous shocks and mutually conflicting interventions.

## 3. Distribution integrity

- Every chart shows horizon, sampling conditions and run count.
- Event frequencies allow overlaps; end-state categories are mutually exclusive by documented definition.
- No-event and unrecovered-within-horizon outcomes remain visible.
- An introduced incident is never presented as an unconditional forecast.
- Zero observed tail events does not render a “0% real-world risk” claim.
- Assumption variation and random event variation are distinguishable.
- Selected example traces match an actual recorded run, not authored dramatization presented as calculation.
- Paired effects use matching exogenous random streams.
- Old computation results cannot overwrite newer input state.

## 4. Interface and visual quality

Check 1280 × 720, 1440 × 900, 1920 × 1080 and 2560 × 1440, plus browser zoom and ordinary display scaling. Cover current desktop Chrome/Edge, Firefox and Safari when environments are available; record untested browsers honestly.

- Key input, selected causal route and consequence remain simultaneously visible at the primary target size.
- Domain focus, pan, zoom and whole-world reset never alter simulation inputs.
- The layout remains geographically stable during updates.
- Every offscreen selected dependency has a labelled continuation.
- Outcome lamps cannot be mistaken for editable knobs.
- Labels are readable without reliance on hover or colour alone.
- Keyboard operation reaches every essential control and inspection action.
- Reduced motion preserves explanatory information.
- No stale result appears as calculated for the new setting.
- Sound is optional; no meaning relies on sound.
- Visual comparison against the approved reference covers materials, spacing, typography, restraint and legibility—not merely palette.

## 5. Proposed user sessions

The user recruits participants. Aim initially for five younger first-time users around the intended comprehension level and five sceptical adults. Small samples expose usability problems; they do not establish population-wide comprehension statistically.

Ask participants to think aloud. Do not explain the interface first. Explain only that it is an educational model of possible events, not a live warning system. Record behaviour with their agreement; avoid collecting unnecessary personal information.

Tasks:

1. Change one AI setting and explain what it now allows.
2. Predict a consequence, then inspect what changed.
3. Find why a named outcome occurred in an example.
4. Change a relevant safeguard and compare the same case.
5. Follow a dependency into another domain and return home.
6. Explain why civilisation collapse does not automatically mean extinction.
7. Identify one uncertain assumption and test its removal.
8. Explore freely for five minutes and describe what prompted the next experiment.

Provisional acceptance targets: at least four of five in each group complete tasks 1–5 without facilitator explanation; every participant can locate uncertainty and distinguish collapse from extinction after inspection; no participant mistakes an illustrative case for a prediction of today's world. Revise targets with observed difficulty, without lowering the underlying comprehension standard merely to pass.

Measure time to first meaningful change, misunderstood labels, unsuccessful navigation, causal explanation accuracy, confusion about lamps/probabilities, and voluntary experiments. A younger participant need not understand a probability equation to succeed. An adult should be able to reach it if one exists.

## 6. Scientific and release review

- Edge register complete for released pathways; every empirical claim has a verified direct source.
- Illustrative values and unsupported extrapolations visibly labelled.
- Collapse classifier and sensitivity results documented.
- Extinction lens has explicit survivor/recovery conditions and model-coverage limits.
- Model tests and user tests reported separately.
- Saved scenarios include versions, settings, horizon and seeds, with import validation.
- Published static paths, share links, worker loading and local persistence tested under the actual GitHub Pages repository prefix.
- No secrets in assets or exports; optional online features fail independently of the core.
- Performance measured on named reference hardware against the budgets in BUILD_SPEC.md.
- Known limitations and unresolved research issues accompany the release.

Completion requires the whole product contract. An attractive screenshot, a populated diagram or a passing test suite alone is insufficient.
