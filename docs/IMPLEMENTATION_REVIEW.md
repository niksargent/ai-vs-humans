# First playable section: implementation review

21 September 2026 · Local preview, not deployed.

## Experience redesign / interface 0.7.0

22 September 2026. Five persistent exploration destinations, nested return navigation, spacious circuit, left control desk, seven dials, regional rail and glowing consequence instruments. Comparison and pinning removed. Model remains 0.6.0. All 69 tests pass. See [redesign review](EXPERIENCE_REDESIGN.md) and [remaining numbered plan](PLAN.md). Step 5 has not begun.

## Step 4 / model 0.6.0

Complete for review: the existing Beyond collapse dialog now connects current model facts to two inspectable continuations. Extra assumptions remain separate, begin unknown, persist with the scenario and can show where a surviving community interrupts a route. No extinction probability or death count is claimed. No main-board footprint was added. See [step 4 review](STEP_4_CONTINUATIONS.md). All 67 tests pass. Step 5 has not begun.

## Step 3 / model 0.5.1

Complete for review: development/evaluation queues, conditional persistent loss of operational control, health-demand stress, information-response degradation, payments and transport bottlenecks. All feed the shared model. Explore causes opens five starting cases with interruption controls. Optional AI repair advice provides a bounded beneficial effect. See [step 3 review](STEP_3_PATHWAYS.md) for rules, evidence limits and verification. All 60 tests pass; in-app checks covered five examples, interventions and the health walkthrough. Step 4 has not begun.

## Step 2 / model 0.4.0

Complete for review: six independently calculated regions, different reserves, finite delayed mutual aid, and an adjustable sustained service-collapse test with recovery history. See [step 2 review](STEP_2_CIVILISATION.md) for assumptions, examples and verification. All 49 model tests pass. Browser checks verified widespread failure, aid from two independent regions and region-specific inspectors. Step 3 has not begun. The older sections below are historical verification records.

## Step 1 / model 0.3.0

The repair-duration shortcut has been replaced by an hourly stock-and-work model. Repair crews, separate backup supplies, deliveries, food support and infrastructure dependencies can slow or stop repairs. Completion is distinct from still-progressing or stalled work at the 30-day horizon. The recovery inspector and walkthrough use the recorded calculation. See [the step 1 review](STEP_1_RECOVERY.md) for equations, examples, evidence bounds and verification. There are 35 passing tests. Step 2 has not begun.

## Model 0.2 update

17 components now include food warehouses, emergency response and shared regional reach. Six fictional regions show which services experience interruption. “More controls” adds network reach and food backup. “Show what happened” gives a case-specific, user-paced walkthrough with board highlights. Click the same component, empty map background or Escape to clear selection. Rules and sources are expandable; region icons explain themselves on hover or keyboard focus. Colours and signal glow are stronger on neutral graphite.

All 21 model tests pass. Current in-app browser checks verified story navigation, food backup, reach changes from three to six regions, undo, separate-region explanations, same-node/background/Escape deselection and no browser errors. Layout inspected at the normal desktop viewport and 1280 × 720; the larger board requires vertical scrolling on short laptop screens. The older automated browser report below describes the previous version and has not been rerun for this update. See [regional rules](REGIONAL_CASCADE.md) for assumptions and migration.

## Previous 0.1 verification record

## Delivered

- Continuous whole-world surface with 14 inspectable components, stable geography, pan/zoom, focus shortcuts and overview locator.
- A working shared-communications case linking AI capability/permission, military verification, power, hospital backup and restoration.
- Six tactile dials, seven additional scenario settings, explanatory inspectors, rules and source links.
- Conditions and individual-case views, paired comparison, worker-based 256-case frequencies and explicit conditioning/uncertainty labels.
- Keyboard adjustment, reduced motion, undo, local persistence, scenario files and compact scenario links.
- An extinction lens distinguishing additional requirements from calculated results.
- Static TypeScript build with no runtime packages, external fonts, AI calls or credentials.

## Visual revision

The initial green housing/display was replaced following user feedback. Surfaces are neutral graphite, text is clearer, and coral/amber/mint are concentrated in signals. Lamps have sharp illuminated centres, visible bezels and controlled bloom. A zero-height SVG-filter issue that hid straight active connections was corrected. The map's vertical spacing was compressed without scaling text disproportionately, improving the overview on laptops. The minimap no longer sits over component labels.

The user's running in-app preview was refreshed while retaining their saved settings.

## Completed verification

16 model tests passed. They cover repeatability, permission gates, explicit approval, common-cause recording, independent power, timely/late verification, dependent verification channels, reserve boundaries, restoration, removal of AI advice, additional strategic-use decisions, event-specific random streams, ensemble variation, input validation and absent incidents.

13 browser journeys passed in headless Microsoft Edge 153.0.4234.48 on Windows. They cover initial outcomes; stronger-check comparison; undo; keyboard permission changes; pointer dial dragging; component explanation/source access; shared-provider changes; focus/keyboard zoom; conditions semantics; worker ensembles; the extinction dialog; export/import/persistence; desktop layout and reduced motion. No captured page or console errors.

Visual captures were inspected at 1440 × 900 and 1280 × 720, with additional layout capture at 1920 × 1080. No horizontal page overflow or clipped map legend. The smallest layout allows vertical page scrolling; the control deck ends around 713 px. The right-hand inspector/outcome column scrolls independently when necessary. Focused views enlarge components without changing settings.

On the measured Intel Core i7-1255U, the lightweight case calculation averaged about 0.017 ms over 100 calls; a 256-case calculation took about 4.1 ms in one browser measurement. These are engine timings, not guarantees of end-to-end interaction latency or animation frame rate.

Generated browser reports and screenshots are in ignored `test-results/`. The reproducible browser script is `scripts/browser-check.mjs`.

## Limits and remaining work

This completes the first playable-section/design-proof implementation, not the full simulator. AI development, biological misuse and wider governance are explicitly labelled previews. Global collapse, demographics and extinction are not calculated. The local outage model must not be described as a global catastrophe forecast.

Transition probabilities and numerical coefficients remain illustrative. Primary sources support general mechanisms, not these numerical values. See SLICE_RULES.md for each implemented connection.

Not completed: real user comprehension testing, specialist model review, Firefox/Safari certification, assistive-technology testing, a measured animation-performance audit, full pathway implementation, deployment and project-prefix testing on the actual hosting destination.

Next substantive work: user review of the playable interaction, followed by evidence-backed expansion of the causal register and the remaining domains. The full acceptance criteria remain those in BUILD_SPEC.md and ACCEPTANCE.md.
