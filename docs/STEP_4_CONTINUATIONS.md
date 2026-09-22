# Step 4: what would extinction additionally require?

22 September 2026 · Model 0.6.0 · Local review build

## Review

Open the existing **Beyond collapse** button. No nodes, permanent panels or main-board controls were added. The view contains two routes: **A physical threat spreads** and **Hostile control persists**. Open a link to read its meaning and choose **Not established**, **Assume yes**, or **Assume no**.

The view starts from the current simulation, not a canned catastrophe. Expand **What your world actually shows** to see service-collapse history, the health/nuclear branch and the agent's control status. The six network regions are explicitly not a census of surviving communities.

For an active example, load **Hospitals face a surge** in Explore causes, then open Beyond collapse. This starts with a calculated health challenge but four unanswered survival questions. Assuming all four conditions still produces no extinction verdict. **What if one community stays out of reach?** breaks the selected route by changing the reach assumption to no. A defence in one route does not clear another route.

## Contract

This is an interactive conditional explanation, as permitted by MODEL_SPEC §7. It does not add demographic or extinction simulation. Each additional condition is a user assumption with an explicit unknown state; none is inferred from a high AI capability setting, six affected regions, a failed stop order or a collapse lamp.

| Route | Starting event supplied by the existing calculation | Additional conditions explored |
| --- | --- | --- |
| Physical threat | Nuclear use, introduced health threat, or service-collapse threshold crossing | Harm capable of threatening human survival; reach to every surviving community; failure of every effective place of safety; no remaining way for survivors to sustain life or recover |
| Hostile control | Both loss of operational control and the separately stipulated harmful behaviour | Consequential physical-world power; reach to every community; defeat of independent defences; continued prevention of recovery beyond the simulated window |

A starting event opens questions; it is not evidence that the additional conditions hold. In particular, unmet healthcare demand is not a calculation of lethal hazard, and nuclear consequences remain outside the service model.

The diagnostic has four possible states:

- No starting event in the current world.
- This selected route is interrupted under a stated assumption.
- One or more additional questions remain unresolved.
- All four conditions are assumed, without a numerical extinction finding.

Every state retains **Extinction is not resolved by this model**. These are selected proposed routes, not an exhaustive taxonomy or a proof that their listed conditions would be sufficient. A community outside one threat may remain vulnerable to another.

## Persistence and isolation

The separate `continuation` object stores the selected route and independent assumption sets for both routes. It is included in browser persistence, scenario files and scenario links. Older scenarios default every extra assumption to unknown. Invalid values are rejected before the scenario is applied. Resetting assumptions resets the selected route; resetting the opening world resets both. Existing Undo restores assumption snapshots as well as model settings.

Changing an assumption does not alter hourly service calculations, event sampling, collapse thresholds or the random seed. It is not a hidden risk coefficient. Turning one condition off explains why that particular proposed chain no longer closes; it does not claim extinction risk is zero.

## Evidence boundary

[International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026), especially §2.2.2, motivates separating capability, harmful behaviour, deployment conditions and uncertainty about extreme outcomes. [ICRC's nuclear-weapons FAQ](https://www.icrc.org/en/article/faq-nuclear-weapons) supports the distinction between nuclear use and its wider humanitarian consequences. Neither source validates our four-link teaching structure as a sufficient extinction model, supplies a probability, or establishes that these conditions are present. The local research report and approved model specification supply the initial conceptual scope.

## Verification and next boundary

67 tests pass: the previous 60 plus seven checks covering starting prerequisites, uncertainty after collapse/nuclear use, every independent condition, benign loss of control, separation from the service engine and between routes, persistence validation, and the unresolved-extinction label even when all conditions are assumed. Browser checks exercise a health precursor, the all-assumed state, an out-of-reach community, route separation and restoration of the user's settings. The existing dialog layout was visually inspected; the main board's footprint is unchanged. The older full headless suite was not rerun.

Step 4 is ready for review; step 5 has not begun. Step 5 remains the research/math audit. Include the recently identified research-to-deployment gap in that audit: development throughput currently controls eligibility for an introduced fault, not incident frequency. Step 6 should add explicit deployment frequency and repeated-event opportunities, preserving common-cause failures and the single-incident teaching mode. Screen-space optimisation, exploration structure and unexplained case/example terminology remain deferred user feedback.
