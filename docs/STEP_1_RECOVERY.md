# Step 1 review: sustained failure and recovery

Model 0.3.0. Step 1 is implemented; steps 2–7 remain awaiting their ordered work and review. No collapse classifier, demographic losses, new military mechanism or extinction probability has been added.

## What changed

The former repair-duration formula is gone. Each affected region has an identical local repair job. An hourly calculation accumulates real work, limited by available crews, coordination, tool power and consumable supplies. The network and its connected power control recover only when that work is finished. Independent regions remain unaffected; mutual aid between regions is a later step.

Five explicit stocks are maintained: hospital-generator hours, refrigeration-generator hours, repair-site generator hours, stored food in full-demand hours, and repair materials/fuel in work units. They are separate resources: a hospital hour is not also spent powering a repair tool. Generator stocks are rated elapsed operating hours, consumed while mains power is absent. They are not replenished in this experiment. Repair supplies arrive through a separate delivery flow and are consumed only by work actually performed. Stored food supplies the part of demand not met by incoming deliveries.

Health and food disruption reduce working crew capacity. Failed communications make coordination harder. When repair-site generators expire, only independently powered tools remain. Those effects can turn a short job into a long interruption or halt it entirely.

## Equations and assumptions

All percentages below are scenario choices or authored teaching coefficients, not empirical estimates. Each representative affected region uses the same settings and initial conditions. The workforce multipliers represent ability to remain on the repair job, not deaths or medical diagnoses.

At the start of an hour, calculate support from the stocks left at the end of the previous hour:

- `communications = independent capacity` while the network is down, otherwise 1.
- `power = 0` if connected power control failed and the job is unfinished; otherwise 1.
- Hospital and refrigeration support are 1 while power or their own backup is available, otherwise 0.
- Tool-power support is 1 while mains or repair-site backup is available, otherwise independent capacity.
- `deliveries = independent delivery share + (1 − independent delivery share) × min(power, communications)`.
- `food delivery = deliveries × (0.5 + 0.5 × refrigeration support)`. Refrigeration loss reduces supported food delivery; it does not destroy all stored food. Stored food covers the remaining fraction until empty. After depletion, food support equals the delivery fraction.
- `emergency support = communications`.
- `crew capacity = initial staffing × (0.6 + 0.4 × hospital support) × (0.5 + 0.5 × food support) × (0.8 + 0.2 × emergency support)`.
- `coordination = 0.5 + 0.5 × communications`.
- Potential work/hour is `crew capacity × coordination × tool-power support`.
- Actual work is limited by remaining workload and repair supplies available during the hour. Incoming supplies can be used in that hour. One unit supplies one full-speed hour of work.
- `repair stock next = repair stock + delivered supplies − actual work`.
- `food store next = max(0, food store − unmet delivery fraction × elapsed time)`.

All stores and work are nonnegative; work never exceeds the required workload. No transition samples a second common outage. Acute military decisions retain their existing minute-scale calculation and event-addressed randomness.

Default workload is 72 full-speed work hours; initial staffing 100%; tool backup 168 hours; repair supplies 96 work units; independent deliveries 30%; stored food 168 full-demand hours. These are not claims about typical infrastructure. Hospital and refrigeration backups retain the saved/user settings; their ranges now reach 720 hours so users can explore whether protection lasts through the horizon.

## Time and completion semantics

The model runs immediately, using one-hour internal steps up to 720 hours (30 days). Completion is registered at the end of the first step containing enough work. Thus completion timing has up to one-hour discretisation rather than false sub-hour precision. Halving and quartering the step preserve tested qualitative results, with recovery times within two hours of the hourly calculation across representative cases.

Results distinguish:

- **No repair needed:** the faulty change never executes.
- **Repaired:** required work has actually been completed.
- **Still progressing:** work is unfinished at day 30 but the last calculated rate is positive.
- **Stalled:** work is unfinished and the last rate is zero under the current resources.

`restoredAt` is null for unfinished runs. Duration fields count interruption observed within the window and do not assert repair at hour 720. The board, walkthrough and recovery panel explicitly retain this distinction. Neither unfinished nor stalled means permanently unrecoverable. Nuclear damage remains outside this recovery calculation.

## What to inspect

Click **Restore the network**, **Services restored**, or **How did repairs go?** The recovery panel shows completed work, its trajectory and timestamped resource failures. These come from the engine’s recorded hourly state, not a separate narration formula. More controls exposes the repair inputs. “Try protected repair supplies” changes tool backup, repair stock and independent deliveries and retains the prior result for comparison; it does not claim to be optimal.

For the opening settings:

| Experiment | Result |
|---|---|
| Original default controls and new default repair resources | Repairs finish at hour 610; hospital backup runs out at 24h, tool backup at 168h, stored food at 207h |
| Same case, tool backup 720h, repair stock 168, independent deliveries 100% | Repairs finish at hour 223 |
| Same case, hospital backup 720h | Repairs finish at hour 143; protecting hospitals also preserves repair capacity |
| No tool backup and no independent capacity | No work; stalled at day 30 |
| Initial crew staffing 5%, independence 100% | Work continues but is unfinished at day 30 |

These are outcomes of the documented assumptions, not forecasts.

## Evidence boundary

[FEMA’s infrastructure dependency resource](https://www.fema.gov/emergency-managers/practitioners/recovery-resilience-resource-library/infrastructure-dependency) supports examining recovery through interdependencies. [FEMA’s Supply Chain Resilience Guide](https://www.fema.gov/sites/default/files/2020-07/supply-chain-resilience-guide.pdf) describes facilities, people, transport and communication as interacting supply-chain components. [FEMA’s interdependency training](https://emilms.fema.gov/is_0860c/groups/143.html) highlights fuel, temporary power, communications and restoration coordination. These sources support including these mechanisms. They do not calibrate this model’s multipliers, default stocks, recovery times or workforce effects.

## Validation

35 automated tests pass: all pre-existing permission, shared-failure and military checks plus recovery conservation, separate stocks, delayed stalls, independent-power protection, empty-stock delivery, no crews, horizon censoring, step-size sensitivity and representative monotonicity checks. Tests for the old independent hospital/repair arithmetic were revised because the newly intended feedback makes hospital protection improve repair speed.

Browser verification checked upgraded saved controls, the default recovery trace, the protected-resource comparison and restoration, a zero-crew stall, and a walkthrough ending with incomplete work rather than a fabricated repair event. The page’s finer UI mechanics were deliberately left outside this step.

Older 0.1/0.2 saves are upgraded with new resource defaults; their existing controls and seed are retained, and the UI states that results were recalculated. They are not represented as exact replay of the old recovery model. New saves carry 0.3.0.
