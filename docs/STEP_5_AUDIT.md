# Step 5 — research and mathematical grounding

22 September 2026 · model 0.6.1 · ready for review

## Verdict

Keep the model small. Its strongest educational claim is **a chain of conditions can turn an AI mistake or misuse into a failure of services, and different safeguards break different links**. It does not need a larger catalogue of equations to teach that well.

The causal mechanisms have research support; the exact rates, thresholds and response curves are teaching assumptions. This audit checks coherence and explanatory value, not prediction accuracy. No new permanent UI or controls were added. Evidence and assumptions are inside the existing “How this works & sources” disclosure.

## Corrections made

1. **A check needs a working channel.** Previously, enough decision time allowed successful verification even with no independent channel and zero fallback. That route is now blocked until a channel exists. More time cannot repair a broken radio.
2. **No invisible health damage.** Previously, a zero extra-demand health wave could still remove up to 40% of workers. Workforce loss now scales with the wave's extra demand and is zero when extra demand is zero.
3. **Food means more than refrigeration.** The food node and regional lamps now include depleted stores and delivery shortfalls. Working fridges cannot hide missing food.
4. **Emergency lamps use actual response.** A working network no longer hides complete loss of trusted instructions. Partial response remains amber; zero response is red.
5. **Failing lifelines are not labelled reassuringly.** The civilisation inspector now reports continuing disruption even when the selected collapse definition is not met. A horizon-truncated refrigeration loss no longer implies that power has returned.
6. **Evidence has a defined scope.** Every module has a mechanism, explicit modelling assumption and source. The overview's recovery-to-civilisation link is now included in the declared dependency list. Saved 0.6.0 settings migrate to 0.6.1 and recalculate; assumptions and human-response replay are retained.

## Research decisions

Sources were checked against the supplied report rather than inheriting its embedded citation tokens. These are mechanism references, not parameter calibration.

| Mechanism | Primary source and relevant section | Decision and limit |
|---|---|---|
| Capability, behaviour and deployment environment; persistent control loss | [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026), §2.2.2 | Keep separate prerequisites. Network authority alone does not establish global takeover. |
| Faster development, bottlenecks, shared failures and manipulation | [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026), §1.3, §2.2.1 and §2.1 | Keep the bounded queue, common fault and conditional campaign. Do not import a universal intelligence-growth curve. |
| AI advice, time pressure and human judgment | [ICRC military AI FAQ](https://www.icrc.org/en/article/faq-artificial-intelligence-in-military-domain), “AI Decision-Support Systems” | Keep the misleading-warning scenario and separate human escalation choices. The source supplies no war odds. |
| Cross-sector infrastructure dependence | [FEMA infrastructure course, Core Tenet 2](https://emilms.fema.gov/is_0860c/groups/103.html) | Keep common energy/communications/transport dependencies. Shared-provider switches describe a vulnerable architecture, not every real system. |
| Essential services and continuity of response | [NATO resilience requirements](https://www.nato.int/en/what-we-do/deterrence-and-defence/resilience-civil-preparedness-and-article-3), seven baseline requirements | Support the choice of lifelines. Neither the six regions nor the 50%/14-day cutoff comes from NATO. |
| Health capacity, monitoring and response | [WHO essential public health functions](https://www.who.int/teams/primary-health-care/health-systems-resilience/essential-public-health-functions), unified list | Keep surge capacity and response delay. The wave is an abstract stress test; it is not disease transmission or mortality. |
| AI and financial dependencies | [FSB assessment](https://www.fsb.org/2024/11/fsb-assesses-the-financial-stability-implications-of-artificial-intelligence/), vulnerabilities list and [report](https://www.fsb.org/uploads/P14112024.pdf) | Payment availability is a useful delivery bottleneck. Market correlation and banking contagion are separate mechanisms, deliberately not simulated. |

The FEMA primer page did not fetch directly; its indexed description and the accessible FEMA course provide the dependency reference. The UNDRR systemic-risk page was accessible as a publication landing page; it is not used as authority for any numerical boundary. No scientific casualty or extinction probabilities were inferred.

## Current causal register

The implementation's `parents` arrays describe dependencies, including delayed feedback, not an acyclic event chronology. `events` records time. The overview shows a subset, while inspectors reveal immediate dependencies.

| Modules / connections | Logic retained | What can break the link? |
|---|---|---|
| AI → permission → communications | Ability AND execution permission AND an introduced fault; research or a harmful agent can supply that fault | Advice-only access, no fault, withheld approval, successful release checks |
| Development → communications | Resource-bounded ideas → checks/queue → unchecked release; one introduced fault can pass | Checking capacity, waiting for checks, limited resources or authority |
| AI/access → control → communications/repair | Continuing agent AND access; stop resistance AND outside resources AND no isolation prevent revocation; harmful goal is separate | Isolation, revocation, intervention; a benign persistent agent causes no outage |
| Communications → checks/warning → military | The scenario introduces bad advice; working channel AND timely successful check rejects it; escalation needs surviving warning and a human choice | Independent verification, decision time, lower tension, human restraint |
| Military → nuclear use | An additional human choice; no delegated launch authority | No escalation or no strategic-use decision |
| Communications → power | Shared control architecture AND cross-service ability | Independent power control |
| Power/bio → hospital → crews | Generator stock supports power; demand/surge limits care; illness and care shortfalls reduce work | Backup power, surge, earlier response, blocked health threat |
| Communications/power → payments/transport → supplies/food | Optional shared systems; independent alternatives; deliveries limited by the weakest required service | Offline payments, separate dispatch, stocks, external help |
| Power → food; food → crews/coordination | Refrigeration changes fresh-food deliveries; stored food covers shortfalls until depleted | Cold storage backup, stored food, independent deliveries |
| Fallback → emergency/checks/repair | Independent communication and powered tools preserve a share of service | More independence; no initial fault |
| Information → emergency/crews/repair/governance | An introduced campaign reduces trusted coordination | Trusted channels or end of campaign |
| Crews/supplies/power/coordination/aid → repair → recovery | Available resources limit work each hour; stopping a hostile agent allows work to resume | Protect repair inputs, aid, beneficial AI advice |
| Spread/repaired regions → aid → repair/food/coordination | Finite surplus, a stable donor, travel delay, unfinished recipients | Independent regions provide refuge; exhausted budgets or late arrivals limit benefit |
| Power/hospital/food/governance/aid/recovery → collapse | Sustained simultaneous service and response failure across enough regions | Any protected lifeline can interrupt this particular conjunction; recovery is tracked separately |
| Catastrophe → beyond-collapse continuations | Extra severity, reach, failed protection and failed recovery are explicit unknown assumptions | A surviving, sustainable community breaks the chosen route |

## Mathematical contract

All capacity fractions are bounded between 0 and 1 unless explicitly representing extra surge. Percent controls are divided by 100 once. Work is in standard crew-hours; reserve stores are service-hours; repair supplies are units with one unit consumed per work-hour. Time is hours for the 30-day crisis, days for the preceding research queue, and minutes for warning verification.

- **Research:** candidates/day = `4 × min(speed, compute, experiment capacity)`. Check at most `4 × checking capacity` each day. `made = checked + waiting + unchecked`. These are continuous update-equivalents, not literal counted software releases. Their displayed whole-number totals tolerate floating-point rounding. The research month precedes the crisis; no repeated incident rate is implied.
- **Verification:** a usable channel is mandatory. Check minutes = `round(90 − 0.65 × strength + shared-channel delay)`. A timely check succeeds against its own seeded draw. Escalation and strategic use have separate event-addressed draws; changing hospital backup does not redraw political choices. Cutoffs of 50/80 and strategic-use probability 0.2 are authored, not observed frequencies.
- **Care:** `demand = 1 + wave × extra demand`; `care = min(power-supported hospital capacity, (1 + surge)/demand)`. Workforce fraction = `1 − min(0.4, 0.1 × (demand − 1))`. The triangular wave is retained because it exposes delay and capacity without pretending to model a pathogen.
- **Deliveries:** payment/transport availability = `fallback + (1−fallback) × min(power, communications)`. Required delivery supports combine by minimum, not by multiplying the same shared failure repeatedly.
- **Stocks:** repair supplies next = `supplies + deliveries × dt − work done`. Backups deplete only without grid power. Food stock pays the unmet part of current delivery demand. No negative stock is allowed. An hour starting with a fractional reserve receives a full hour of support: the known discretisation error is at most one step per depletion boundary, acceptable here.
- **Repair:** available crew × coordination × tool support, plus outside relief work, is capped by available materials and remaining workload. Hospital, food and emergency support change subsequent work. Optional AI advice gives a bounded 25% potential-work benefit; it cannot manufacture parts.
- **Aid:** one package explicitly bundles one crew/tool work-hour, one material unit and one food-support hour. This is a relief bundle, not one physical item consumed three times. Donors spend only a separate finite surplus. All regions advance from the same prior interval; arrivals affect the next interval. Sent = arrived + in transit; late/unused arrivals are recorded.
- **Collapse:** all three essential supports AND coordination below 0.5, in N equal-weight regions for D continuous days. Recovery needs every region above the essential/coordination boundary for 24 hours. The historical crossing is preserved. A 30-day unfinished repair is censored, not permanent failure.

The supplied report's hazard-rate/logistic proposals and proposed monthly clock are not implemented in this introduced-incident model. Multiplying capability/access/fragility scores would not yield a defensible catastrophe probability. Step 6 will add declared incident opportunities; it must not reinterpret current slider values as measured annual rates.

## Sensitivity and validation

`npm test`: 76 passing checks. Existing tests cover conservation, finite aid, dependency separation, threshold boundaries, monotonic safeguards, deterministic draws, and half-/quarter-hour repair-step comparisons. New audit tests target the corrected gaps, compound shocks, evidence coverage and overview dependency consistency.

`npm run audit` reproduces [the sensitivity results](STEP_5_SENSITIVITY.json), fixed seed 42:

- With current resource limits, research speed 75→100 leaves output at 90 update-equivalents; the bottleneck is genuine. At speed 25, all 30 are checked; at speed 50, 30 of 60 pass unchecked if release gates are off.
- In the fragile six-region configuration, the 1/7/14-day collapse choices cross at hours 104/248/416. A 28-day requirement is not met in the window, despite exactly the same 696 Region-1 care-shortfall hours. The label is definition-sensitive; harm is not erased.
- Full independence can interrupt the collapse conjunction while repairs remain unfinished. This justifies showing ongoing lifeline damage alongside the global classifier.
- The six starting situations do not all collapse: the default three affected regions are below the default four-region requirement. That is intentional, not a reason to retune the model for more dramatic results.

## Deliberate limits and next decision

Keep the current model's breadth. Do not add market balance sheets, epidemic compartments, demographics, real countries or a bigger intelligence score now. They would add more assumed numbers than explanatory value.

The largest missing **consequence** link is nuclear aftermath → food/health damage. It would help answer the user's central question, but an invented numeric winter or death model would weaken credibility. Recommend a future qualitative continuation showing possible destruction, disrupted harvests and surviving communities, with scope-dependent assumptions. Keep the existing nuclear aftermath unresolved in this step.

Water, farming, long-term displacement and institutional collapse remain outside the computed service basket. Health-only disasters cannot trigger the current power-and-food conjunction. This is a deliberately narrow service-collapse example, not proof that other collapse routes are impossible; the inspector now says so on demand.

Step 6 remains the approved next build: separate candidate production, checking, deployment cadence and incident opportunities; include no-event outcomes and shared-version common causes. Stop here for user review.
