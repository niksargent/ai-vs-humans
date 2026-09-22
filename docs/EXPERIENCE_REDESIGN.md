# Experience redesign — interface 0.7

22 September 2026. Model 0.6.0 is unchanged. This is the user-requested design interlude before step 5.

## Experience

Five permanent destinations form the exploration spine: set the world, follow the chain, read the damage, find a way back, and beyond collapse. The journey stays visible when the page scrolls. Child panels keep their ancestry in breadcrumbs; Back restores the previous panel, expanded controls, scroll position and circuit camera. Clicking a selected component again or pressing Escape returns to its parent.

The world has one stable geography. Normal provides large illuminated modules, curved connections and space to travel. Compact shows the same circuit with shorter titles. The four district shortcuts, map HUD and inset locator support navigation. Main connections remain visible; selecting a component reveals its immediate causal neighbours instead of lighting the entire wiring diagram.

The left control desk has seven colour-coded dials and can be stowed. Matching module titles preserve the colour vocabulary. A regional service rail replaces the bottom dial bank. Undo and Reset are together. Outcome instruments use recessed glass, circular symbols and luminous lamps. Running signals, warning pulses and the Mission Control display provide movement; reduced-motion preferences disable the animation.

Comparison and pinning have been removed. Human choices explains the fixed-settings replay of 256 possible responses and keeps the replay number inside an on-demand explanation. Rules and evidence remain accessible without occupying every screen.

## Pace control

AI project pace controls requested ideas per day in the existing research queue. The Start/Pause switch makes activation explicit. Compute, experiment and checking resources still bound output. The guide reports the ideas made, checked and released unchecked. Repeated deployments and incident frequency remain step 6, after the step 5 audit; the UI does not claim those exist now.

## Verification

- `npm test`: 69 passed, including 67 existing model checks and two circuit integrity checks.
- In-app browser: nested navigation and restoration of expanded controls; outcome inspectors including nuclear decisions; human-response worker output; changed response and Undo; rescue checks and Undo; research queue activation, pace adjustment and Undo; survival dialog and return; Compact/Normal; desk toggle; keyboard map travel; regional inspection.
- Visual inspection at laptop 1280×720, the user's normal viewport and desktop 1920×1080. No horizontal page overflow at desktop. Regions and the lower controls are intentionally reachable by scrolling.
- No browser errors observed during final checks.
- Standalone browser regression script updated for the new selectors and navigation; verification this session used the in-app browser, not that runner.

## Review boundary

Ready for the user's experience review. Child comprehension is still to be tested by the user. The model's research/mathematical audit, repeated-event distributions and final hosting work remain in [PLAN.md](PLAN.md), steps 5–7. Nothing has been deployed.
