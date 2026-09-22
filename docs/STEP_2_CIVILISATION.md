# Step 2: from disrupted services to civilisation collapse

21 September 2026 · Model 0.4.0 · Local review build

## Review journey

Open **Civilisation collapse**, then **Try widespread failure**. Six regions lose their shared network. With fewer repair crews and shorter reserves, essential services stay down: the default collapse threshold is crossed on day 17.3. Select **Keep two regions independent**. Those two regions keep working and send finite supplies and teams; all affected networks are repaired by hour 208, before the collapse threshold is reached. Undo restores the previous settings.

This is a calculated service-collapse experiment. It does not estimate the chance of real civilisation collapse or human extinction.

## What is calculated

Six equal-weight fictional regions each run the step 1 repair model over 720 hours. The causal board follows Region 1; each region's inspector shows its own reserves, repair time, service gaps and aid. No population, geography or death count is implied.

The first `reach` regions share the failed network. Others remain operational. Reserve factors are `1 + (profile - 1) × regionDifference / 100`, with profiles `[1, .6, 1.4, .8, 1.8, 1.2]`. At the default variation of 50%, factors are `[1, .8, 1.2, .9, 1.4, 1.1]`. They scale hospital, refrigeration and repair-tool backups, initial repair materials and stored food. Workload and initial crew staffing remain equal. Region 1 is the reference throughout.

## An explicit, adjustable collapse test

A region meets the combined failure test when **power, essential hospital power and food supply are each below 50%, and emergency coordination is below 50%**. By default, at least four of six regions must meet that test simultaneously for 14 continuous days. Separate short crises do not add together. The particular regions may change, but the required number must be failing in every hour of the interval.

Emergency coordination stays available while its backup lasts (default 72 hours, scaled by regional reserves). Afterwards it is `max(communications, min(1, incoming aid)) × (.5 + .5 × food supply)`. Unaffected and repaired regions have full coordination. This represents organising practical emergency help, not political legitimacy or regime survival. Existing communications and food dependencies already affect repair crews; the diagnostic coordination measure does not add another repair penalty.

The inspector exposes both the required number of regions and duration. Changing these changes the classification, not the physical repair calculation. The numerical boundary is a teaching assumption, not an empirically established definition of civilisation collapse.

The first crossing remains recorded even if services recover. Recovery after crossing requires all six regions to regain the essential-service basket and coordination for 24 continuous hours. Unfinished work at day 30 remains unfinished; the model does not claim permanent failure beyond its horizon.

## Finite help from working regions

A region can send help after its network is repaired and has had 24 stable hours. Unaffected regions therefore start dispatching at hour 24. Each region has a separate surplus budget, default 48 packages, and can dispatch at most `aidStrength / 100` packages per hour. Its domestic essential stocks are protected.

Dispatches are divided equally among regions still awaiting repair. Travel takes `aidDelay` hours (default 48). All six regions advance synchronously; an arrival enters the following hourly interval, so the earliest useful default help is hour 73.

One package is a bundle: one crew/tool work-hour, one repair-material unit and one food-support hour. These are separate bundled resources. Help increases repair capacity and incoming materials and slows depletion of food stores. Budgets are spent once, at dispatch. Repaired recipients cannot benefit retroactively; late arrivals are recorded as unused. Shipments beyond day 30 remain in transit. Repaired regions can later become donors themselves.

## Checked examples

| Case | Result |
| --- | --- |
| Default settings, three exposed regions | Repairs at 130, 131 and 128 hours; no collapse threshold crossed. |
| Six exposed, otherwise default | Different reserves and subsequent aid produce repairs between 216 and 406 hours; no collapse threshold crossed. |
| Six exposed, crews 25%, tool backup 24h, stored food 48h | No donor available; threshold crossed at hour 416; repairs unfinished at day 30. |
| Same fragile case, two regions independent, aid strength 100%, budget 168 each | 336 packages arrive; affected regions repaired between 205 and 208 hours; no collapse threshold crossed. |
| Same independent regions but aid disabled | Four exposed regions still cross the collapse threshold. Independence helps through actual aid, not merely a changed label. |
| Six exposed, equal reserves, no aid; other defaults | Threshold crossed at hour 543; repair at 610; recovery confirmed at 634. The earlier episode remains visible. |

## Evidence and limits

[UNDRR's systemic-risk briefing](https://www.undrr.org/publication/briefing-note-systemic-risk) supports treating interconnected systems and cascading failures together. [FEMA's community lifelines](https://www.fema.gov/af/emergency-managers/practitioners/lifelines) supports examining essential services and stabilisation. Neither supplies or validates this model's collapse threshold, regional reserve profiles, repair coefficients or aid capacities. Those assumptions remain exposed for inspection and later evidence review.

Nuclear-use decisions are still a separate illustrative branch. Their physical consequences are not included in the service model; when nuclear use occurs, the overall outcome is marked unknown. Biological misuse, AI development and additional extinction conditions remain later work. Service collapse does not establish extinction.

## Verification and handoff

All 49 model tests pass, covering the earlier permission/recovery rules plus regional variation, sustained versus separated failures, the strict 50% boundary, aid delays and budget conservation, donor protection, unused late arrivals, recovery history, classifier independence from physical outcomes, prevention and nuclear scope.

In-app checks exercised widespread failure, the two-region aid intervention and individual affected/unaffected region inspectors. The older full headless browser suite was not rerun for this step. Model 0.3 settings migrate with the user's existing controls and seed preserved; new controls receive defaults and results are recalculated.

Step 2 is ready for user review. Step 3 has not begun.
