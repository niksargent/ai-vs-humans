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

1. Start with the opening case: a faulty AI change reaches a shared communications network.
2. Select **Try stronger checks**. Escalation is interrupted; the hospital's service gap remains unchanged.
3. Turn **Hospital backup** up to cover the outage. The hospital branch changes independently.
4. Turn **Permissions** down to **Advise**. The introduced change cannot execute; both dependent routes are blocked.
5. Select any component to inspect its rule. Use focus buttons, pan, zoom and Home to explore the same world.

Dials support vertical dragging, arrow keys, Home and End. More controls exposes verification deadlines, repair time and shared dependencies. Scenario export/import preserves settings and the seed. A scenario link contains the same compact configuration. Localhost links only work on the computer running the server.

## Current scope

Implemented: one deterministic-by-seed shared-network case, permission gates, verification and decision timing, illustrative military responses, hospital backup depletion, restoration, a worker-based 256-case ensemble, provenance inspectors, whole-world/focus navigation, undo, persistence and scenario files.

Model 0.4 adds six regional repair calculations, different reserves, limited delayed help from working regions and an adjustable sustained service-collapse test. Open **Civilisation collapse** and try **Try widespread failure**, followed by **Keep two regions independent**. See [step 2 review](docs/STEP_2_CIVILISATION.md).

Model 0.5.1 adds **Explore causes**: development outrunning checks, persistent agents, a conditional health crisis, false emergency messages and payment/transport failures. These affect the same regional recovery model. Expand More controls to combine them. See [step 3 review](docs/STEP_3_PATHWAYS.md).

Model 0.6 adds an interactive **Beyond collapse** view. It connects current model facts to further physical-hazard and hostile-control conditions, keeping additional assumptions separate and initially unknown. See [step 4 review](docs/STEP_4_CONTINUATIONS.md).

Not calculated: recursive intelligence growth, detailed epidemic spread, financial-market contagion, wider political outcomes or extinction. The collapse boundary is an explicit teaching assumption, not a validated scientific threshold. This is not the complete simulator described in `BUILD_SPEC.md`.

All numerical transition rules are illustrative assumptions. No actual-world catastrophe probability is calculated. Military advice does not grant launch authority. A nuclear-use event in a fictional run is a separate stipulated human decision; its wider consequences are not computed by the network-repair fixture.

## Build and hosting

The app uses TypeScript, semantic HTML/CSS, inline SVG and a module worker. There are no runtime packages or remote AI calls. Fonts are system fonts; icons and surface treatments are local vectors/CSS.

`npm run build` creates a static `dist/` folder suitable for GitHub Pages. Assets and worker imports use relative paths. The build includes `.nojekyll`. Publish the contents of `dist/`, not the TypeScript source directory. Hosting is not yet configured or deployed.

## Verification

`npm test` builds and runs the model invariants and scenario comparisons. `scripts/browser-check.mjs` uses Playwright with installed Microsoft Edge. Supply `PLAYWRIGHT_MODULE` as the path to a Playwright `index.mjs` if it is not installed in normal Node resolution. It requires a running preview server. Browser output and screenshots go into ignored `test-results/`.

See [implementation review](docs/IMPLEMENTATION_REVIEW.md) for completed checks, limits and next work. Browser automation does not establish child comprehension or scientific validity.

## Design and model

- [Build specification](BUILD_SPEC.md)
- [Model specification](docs/MODEL_SPEC.md)
- [Research register](docs/RESEARCH_REGISTER.md)
- [Acceptance plan](docs/ACCEPTANCE.md)
- [First-section edge register](docs/SLICE_RULES.md)
