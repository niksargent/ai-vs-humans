# Step 6 — Can the world keep up?

Complete for user review. Model 0.7.0. Step 7 has not started.

## Experience

Open **Read the damage → Can the world keep up for a month?**, or open the AI development component. The main circuit remains the single-incident teaching view. The monthly experiment runs immediately in a worker; there is no waiting for simulated days to pass.

Change idea production, checking capacity, the release limit and whether releases must wait for checks. Fault assumptions live in a disclosure. Six selectable outcome readouts reveal individual run timelines: no disruption, weathered shocks, still recovering, rebuilt after collapse, civilisation in crisis, and nuclear catastrophe. Amber shows regions with unfinished repair; red shows simultaneous lifeline failure. Fault marks and an event list connect releases to consequences. A separate histogram shows first collapse timing, with no-collapse and unresolved nuclear outcomes explicitly counted.

“Explore very different worlds” loads deliberate teaching situations: strong checks, repair overload, nuclear stakes, independent refuges and rebuilding. These change the controls openly; they do not insert rare outcomes into the sample. All six endings are reachable in automated scenario tests. Zero sampled occurrences is not labelled impossible. Undo restores the previous world and experiment settings. Save/import includes experiment assumptions and seed.

## Mathematical contract

- Horizon: 30 days, 720 hourly recovery steps; 128 independent-seed replays by default. These are repetitions of the same assumptions, not different forecasts or models.
- Daily candidate production: `4 × min(idea pace, compute capacity, experiment capacity) / 100`, only when research is enabled and capability permits it. Fractional candidate-equivalents accumulate.
- Checking moves at most `4 × checking capacity / 100` candidate-equivalents per day from waiting to checked. A release consumes one whole candidate. Checked candidates go first; unchecked releases require the user to remove the waiting gate. Permission to execute is also required.
- Release limit is separately adjustable from 0 to 4 per day. Slots are evenly placed inside each day. No candidates means no releases; a high release limit cannot manufacture work.
- Each release receives one event-addressed fault draw. The checked/unchecked fault chances are explicit illustrative inputs (defaults 1%/10%), with checked risk constrained not to exceed unchecked risk. Checks reduce assumed risk; they do not guarantee perfection.
- A faulty shared version is one common cause across the exposed regions, not six independent chances. Human verification/escalation/nuclear decisions use the existing conditional warning rules, with separate event-addressed draws.
- Every fault adds one standard repair job to the outstanding target. Work, depleted backup stocks, repair supplies and finite aid budgets carry forward. Repair jobs may arrive after an earlier recovery. Stock use follows disrupted hours; a late incident does not consume generator reserves before it starts. Generator fuel is not replenished by restoration in this simplified experiment.
- Existing selected agent, health and misinformation challenges remain fixed background stresses. The main circuit's stipulated initial bad update is not automatically injected into the monthly experiment. A selected continuing harmful agent can still start disruption at hour zero.
- Recovery classification can move from collapse to rebuilt and back into collapse after a later shock. First crossing and final state are separate quantities.
- Nuclear use stops the release schedule and truncates the visible service trace. Care-loss totals after that event are unknown. The experiment does not count a seemingly healthy repair calculation as survival after nuclear use.
- Mutually exclusive outcome buckets sum to the sample count. First-crossing bins plus no crossing plus unresolved nuclear cases also partition the sample. Timings are conditional on the displayed horizon.

## Scope and evidence

The mechanism/source distinctions from [step 5](STEP_5_AUDIT.md) still apply. Release fault rates, cadence bounds and additive repair jobs are teaching assumptions, not empirically fitted AI incident rates. Repeated faults might overlap in reality; counting each as a full new repair job can overstate repair demand. The experiment neither estimates annual catastrophe probability nor models every source of uncertainty. It does not simulate recursive intelligence growth, nuclear aftermath, detailed epidemics, or extinction. The existing Beyond collapse exploration remains the place to inspect additional conditions for extinction.

Broad educational coverage comes from reachable assumptions and deliberate exploration, not distorted frequencies. Strong safeguards can produce quiet or manageable months; severe assumptions can produce collapse or catastrophe. Recovery is a real computed outcome, not a scripted happy ending.

## Verification

86 automated tests pass, including the 76 pre-existing model tests. New tests cover candidate conservation, permission and supply gates, separate cadence, 0%/100% fault boundaries, shared causes, late shocks, cumulative repair and finite aid, collapse/recovery/relapse, reproducibility, complete outcome/count partitions, reachability of all six endings, nuclear truncation and settings validation.

Browser checks cover worker results, outcome selection, keyboard fault adjustment with focus/disclosures preserved, reversible scenario changes, nuclear timeline/event cut-off, and rebuilding selection. The dialog uses the existing modal close/Escape behaviour; explanations stay on demand. Final cross-browser/accessibility and child-comprehension validation remain in step 7.
