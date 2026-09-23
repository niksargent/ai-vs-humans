# AI vs. Humans

An interactive educational simulator exploring how AI mistakes, misuse and loss of control can affect a connected world—and how safeguards can help.

**Play:** https://niksargent.github.io/ai-vs-humans/

## Run locally

Use Node.js 24 or newer.

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4173/. The server serves `dist/`; rebuild after source changes.

## Explore

1. **Set the world**: choose a scenario or change its controls.
2. **Watch the story**: follow causes and consequences.
3. **Read the damage**: inspect services and regions.
4. **Protect the world**: change safeguards and compare the result. Undo restores your previous world.
5. **Beyond collapse**: explore what could threaten survivors.

**Replay this world** changes random events while keeping settings fixed. **Explore possible outcomes** compares 128 replays. The model illustrates possible mechanisms; it does not forecast real-world probabilities.

## Tests

```sh
npm test
```

The suite includes 26 scenario worlds and green/amber/red coverage for all 25 board modules. See [scenario review](docs/MODULE_SCENARIO_REVIEW.md). Browser testing and automated tests do not establish scientific validity or child comprehension.

## Publishing

GitHub Actions runs the tests and deploys only `dist/` to GitHub Pages after a push to `master`. A failed build or test blocks deployment. You can also run **Deploy GitHub Pages** manually from the repository's Actions tab.

The app runs entirely in the visitor's browser. No API keys or server are needed. Scenario settings are stored locally in that browser; share links include the chosen scenario.

## Design and model

- [Plan](docs/PLAN.md)
- [Model specification](docs/MODEL_SPEC.md)
- [Research register](docs/RESEARCH_REGISTER.md)
- [Model and settings review](docs/MODEL_SETTINGS_REVIEW.md)
- [Build specification](BUILD_SPEC.md)
