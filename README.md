# The Switchboard

An interactive design proof and first playable section of an educational AI-risk simulator.

## Run locally

Requires Node.js 22.6 or newer (Node 25.7 used during development).

```sh
npm install
npm run build
npm run dev
```

Open **http://127.0.0.1:4173/**. The server serves `dist/`. Rebuild after source changes. Do not open the source `index.html` directly: the TypeScript modules must first be compiled and served over HTTP.

## Try it

1. **Set the world**: choose a starting situation, then turn the seven controls on the left.
2. **Follow the chain**: walk through events while the circuit follows the action.
3. **Read the damage**: open a glowing readout, inspect a region, or replay different human decisions.
4. **Find a way back**: try safeguards. Undo restores your previous settings.
5. **Beyond collapse**: explore the further conditions that could threaten survivors.

Normal view gives the circuit room to breathe. Drag or scroll to travel; Shift + scroll moves horizontally, Ctrl + scroll zooms. Compact shows the whole circuit. The inset locator and four district shortcuts help you travel. Dials support vertical dragging, arrow keys, Home and End. Open the machine reveals deeper controls; breadcrumb links and Back restore your place. Escape returns to the parent panel.

AI project pace feeds the existing research queue, bounded by compute and experiments. Start AI projects activates it. It does not yet generate repeated incidents; deployment cadence is step 6. Save/open preserves model settings, human-response replay and survival assumptions. The model version is 0.6.1; the redesigned interface is 0.7.0.

## Current scope

Implemented: one deterministic-by-seed shared-network case, permission gates, verification and decision timing, illustrative military responses, hospital backup depletion, restoration, a worker-based replay of 256 human responses, provenance inspectors, whole-world/focus navigation, undo, persistence and scenario files.

Model 0.4 adds six regional repair calculations, different reserves, limited delayed help from working regions and an adjustable sustained service-collapse test. Open **Civilisation collapse** and try **Try widespread failure**, followed by **Keep two regions independent**. See [step 2 review](docs/STEP_2_CIVILISATION.md).

Model 0.5.1 adds **Explore causes**: development outrunning checks, persistent agents, a conditional health crisis, false emergency messages and payment/transport failures. These affect the same regional recovery model. Open the machine to combine them. See [step 3 review](docs/STEP_3_PATHWAYS.md).

Model 0.6 adds an interactive **Beyond collapse** view. It connects current model facts to further physical-hazard and hostile-control conditions, keeping additional assumptions separate and initially unknown. See [step 4 review](docs/STEP_4_CONTINUATIONS.md).

Not calculated: recursive intelligence growth, detailed epidemic spread, financial-market contagion, wider political outcomes or extinction. The collapse boundary is an explicit teaching assumption, not a validated scientific threshold. This is not the complete simulator described in `BUILD_SPEC.md`.

All numerical transition rules are illustrative assumptions. No actual-world catastrophe probability is calculated. Military advice does not grant launch authority. A nuclear-use event in a fictional run is a separate stipulated human decision; its wider consequences are not computed by the network-repair fixture.

## Build and hosting

The app uses TypeScript, semantic HTML/CSS, inline SVG and a module worker. There are no runtime packages or remote AI calls. Fonts are system fonts; icons and surface treatments are local vectors/CSS.

`npm run build` creates a static `dist/` folder suitable for GitHub Pages. Assets and worker imports use relative paths. The build includes `.nojekyll`. Publish the contents of `dist/`, not the TypeScript source directory. Hosting is not yet configured or deployed.

Model 0.6.1 completes the [research and mathematical audit](docs/STEP_5_AUDIT.md), with source scope available inside component explanations. Run `npm run audit` to reproduce the small sensitivity study.

## Verification

`npm test` builds and runs the model invariants and scenario comparisons. `scripts/browser-check.mjs` uses Playwright with installed Microsoft Edge. Supply `PLAYWRIGHT_MODULE` as the path to a Playwright `index.mjs` if it is not installed in normal Node resolution. It requires a running preview server. Browser output and screenshots go into ignored `test-results/`.

See [implementation review](docs/IMPLEMENTATION_REVIEW.md) for completed checks, limits and next work. Browser automation does not establish child comprehension or scientific validity.

## Design and model

- [Delivery plan and remaining steps](docs/PLAN.md)
- [Experience redesign review](docs/EXPERIENCE_REDESIGN.md)
- [Build specification](BUILD_SPEC.md)
- [Model specification](docs/MODEL_SPEC.md)
- [Research register](docs/RESEARCH_REGISTER.md)
- [Acceptance plan](docs/ACCEPTANCE.md)
- [First-section edge register](docs/SLICE_RULES.md)

Model 0.7.0 adds **Read the damage → Can the world keep up for a month?**: resource-limited releases, shared faults, cumulative repair work, finite supplies, and 128 reproducible monthly replays. Select outcomes to inspect their timelines. Deliberate stress worlds make different endings discoverable without inserting them into the random sample. See [step 6 review](docs/STEP_6_REPEATED_EVENTS.md).

The [step 7 UX repair pass](docs/STEP_7_UX_REPAIR_REVIEW.md) addresses the approved first-encounter review: visible motion, living atlas backdrop, stable connections, centred dials, explicit experiment scope, truthful stories and laptop feedback. Real-user validation and hosting remain pending.
