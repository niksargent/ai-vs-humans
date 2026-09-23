# Model and settings review — 23 September 2026

## Verdict

Reviewed all 56 live settings, their UI bindings, gate interactions, service equations, replay consistency and ranges. A deterministic sweep made 6,417 comparisons across 23 contexts and three seeds. Every setting changed an operational result in at least one appropriate context. This establishes exercised wiring, not empirical validation or proof across every combination.

## The apparently backward testing control

Testing capacity is throughput, not accuracy. Hold updates until tested is a release rule. Zero throughput with the hold on means nothing is released. With the hold off, everything untested can be released. More testing under the hold can release more work, including mistakes missed by imperfect tests. That is a real model trade-off, not a reversed slider. The simulator does not price the benefits forgone by holding useful updates; green here means service harm avoided, not an optimal economic policy.

At 4 produced updates/day, 15% mistake assumption, 90% detection, seed 42, military advice off:

| Hold until tested | Tests/day | Released | Escaped faults | Waiting | Service result |
|---|---:|---:|---:|---:|---|
| Off | 0 | 120 | 12 | 0 | Collapse |
| Off | 1 | 119 | 11 | 0 | Collapse |
| Off | 4 | 109 | 1 | 0 | Functioning at month end |
| On | 0 | 0 | 0 | 120 | Functioning |
| On | 1 | 28 | 0 | 90 | Functioning |
| On | 4 | 109 | 1 | 0 | Functioning at month end |

Functioning at month end can include an earlier disruption. The map records damage across the month.

## Corrections made

- Renamed Test before release to **Hold updates until tested**. Live explanation reports blocked releases, untested releases and the waiting queue, next to the actual controls. The toolbar shows waiting work.
- Testing now spans **0–20/day**, matching maximum production. Existing saved throughput is migrated unchanged; the internal scale changes from 4 to 20/day. Fractional rates remain available.
- Development → permission → communications is a permanent primary path; ability → development also stays visible. These were visually subordinated despite being major model causes.
- Fixed live slider readouts reverting to raw percentages while dragged. Testing and pace keep their meaningful daily units.
- Repair supplies now refill only to the selected stockpile limit. Previously a quiet period accumulated unlimited extra parts and weakened the starting-stock setting. Conservation includes only retained deliveries.
- Regional variation now preserves total reference stocks. Previously higher variation also added resources.
- Extra care capacity now reaches 400%, sufficient to cover the largest selectable extra-care demand.

## Every setting

Ranges below are stored values except where daily units are shown. Effect counts are sensitivity samples, not probabilities or measures of importance.

### Updates and tests

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `researchSpeed` | 0–20/day | Requested production; computers and experiments can cap it. |
| `computeCapacity` | 0–100 | Production bottleneck; irrelevant when another resource is lower. |
| `experimentCapacity` | 0–100 | Production bottleneck; same minimum rule as computers. |
| `mistakeRate` | 0–100 | More potentially harmful projects, holding project draws fixed. |
| `evaluationCapacity` | 0–20/day | Tests per day. With a release hold it also controls how many updates can proceed. |
| `checkEffectiveness` | 0–100 | Fraction of tested mistakes detected; cannot catch untested work. |
| `waitForChecks` | Off / On | Holds untested updates. Passing a test still permits missed mistakes. |
| `repairAssistance` | Off / On | Raises potential repair productivity by 25%; cannot create parts or restart powerless tools. |

### Ability, permission and military decisions

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `capability` | 0–2 | Suggestion / network operation / connected-service operation; independent science assistance remains separate. |
| `authority` | 0–2 | Advice / explicit approval / automatic execution. Gates both updates and agents. |
| `humanApproval` | Off / On | Only active in the Ask first permission mode. |
| `aiAdvice` | Off / On | Enables the conditional false-attack-warning route; never grants launch authority. |
| `tension` | 0–100 | Higher assumed escalation propensity; authored cutoffs at 50 and 80. |
| `verification` | 0–100 | Warning-check success and speed; needs a usable channel and enough time. |
| `decisionTime` | 10–120 | Deadline for warning checks; more time cannot restore a missing channel. |
| `independent` | Off / On | Independent warning-check channel; separate from update testing. |

### Continuing agent

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `agentEnabled` | Off / On | Deploys an agent only with service capability and execution permission. |
| `harmfulGoal` | Off / On | Separately assumes harmful action; resistance to stopping alone is not harm. |
| `resistsStop` | Off / On | One prerequisite of loss of control. |
| `externalResources` | Off / On | One prerequisite of loss of control. |
| `independentStop` | Off / On | Isolation breaks the loss-of-control gate. |
| `stopDelay` | 0–168 | Earlier intervention helps a stoppable agent; cannot stop an uncontained one. |

### Health

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `healthChallenge` | Off / On | Enables the selected threat, requiring science, intent, access and failed screening. |
| `scienceAssistance` | Off / On | Separate scientific capability prerequisite. |
| `maliciousActor` | Off / On | Harmful intent prerequisite. |
| `physicalAccess` | Off / On | Practical execution prerequisite. |
| `screening` | Off / On | Effective screening blocks the selected health threat. |
| `healthDemand` | 0–400 | Increases the abstract extra-care pulse and worker illness. |
| `healthSurge` | 0–400 | Additional care capacity; now ranges high enough to cover the maximum demand pulse. |
| `healthResponseDelay` | 24–552 | Later response extends care pressure and workforce loss. |

### Information

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `informationCampaign` | Off / On | Enables false instructions when AI has operational capability. |
| `informationReach` | 0–100 | Larger campaign reduces trusted coordination, bounded by independent channels. |
| `trustedChannels` | 0–100 | Protects coordination; cannot repair a separate power fault. |
| `informationHours` | 24–720 | Duration of the selected coordination penalty. |

### Payments and transport

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `sharedPayments` | Off / On | Makes payment support depend on the broken network/power. |
| `sharedTransport` | Off / On | Makes dispatch depend on the broken network/power. |
| `paymentFallback` | 0–100 | Protects payments; transport can still be the delivery bottleneck. |
| `transportFallback` | 0–100 | Protects dispatch; payments can still be the delivery bottleneck. |

### Infrastructure, stocks and repair

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `sharedProvider` | Off / On | Allows a shared communications failure to interrupt power controls. |
| `fallback` | 0–100 | Independent communications and tool capacity, plus fallback warning checks. |
| `reserves` | 0–720 | Hospital generator hours; consumed across all outages. |
| `foodBackup` | 0–720 | Refrigeration generator hours; distinct from stored food. |
| `repair` | 12–168 | Repair work added by each escaped fault; higher means harder repairs. |
| `crews` | 0–100 | Available workforce; actual productivity also needs health, food, coordination and tools. |
| `repairBackup` | 0–720 | Generator hours for repair tools. |
| `repairSupplies` | 0–168 | Initial material stock and storage limit; now capped during quiet periods. |
| `supplyDelivery` | 0–100 | Independent delivery capacity; payments/transport can further constrain it. |
| `foodStores` | 0–720 | Stored food consumed when incoming food cannot meet demand. |

### Regions, relief and collapse

| Setting | Range | What it changes / why it can appear inactive |
|---|---|---|
| `connectedness` | 0–100 | Shared rollout and dependency footprint, plus aid access. Spreading failure and carrying help are opposing effects. |
| `regionDifference` | 0–100 | Redistributes the same total reference stores; now no accidental increase in total resources. |
| `aidStrength` | 0–100 | Dispatch rate from healthy donors; finite budgets and travel still constrain arrivals. |
| `aidDelay` | 12–168 | Travel time; late help may arrive after the critical window. |
| `aidBudget` | 0–168 | Donors’ separate finite relief stock. |
| `responseBackup` | 0–720 | Independent local emergency coordination endurance. |
| `collapseRegions` | 2–6 | Definition threshold, not a physical defence. |
| `collapseDays` | 1–28 | Definition threshold, not faster repair or extra supplies. |

## Limits retained deliberately

- Six equal-weight regions and a fixed dependency footprint per replay. Connectedness is not a population percentage; geography and travel of the initial failure are simplified. Health/information use this same footprint.
- Updates cause the same abstract repair challenge. Error rate and detection are assumptions; this does not predict a particular deployed AI system. No recursive self-improvement or endogenous error-rate change is claimed.
- More defensive input need not change a saturated or already-protected outcome. Serial bottlenecks, absent threats and deadlines explain many flat controls. Fixed project draws reduce noise but do not guarantee every individual replay worsens monotonically as production rises.
- Nuclear use censors the release history. Service totals after that point are not nuclear aftermath; the UI marks the overall result unknown. Comparing ordinary damage totals across a censored nuclear case and a full surviving month is not a valid ranking of safety.
- Service collapse requires sustained simultaneous loss of power, care, food and coordination. A health surge alone cannot meet that particular definition; it affects care/workforce and can worsen compound failures. The independent health-to-extinction route remains a qualitative continuation.
- Beyond-collapse choices are explicit assumptions, not numerical estimates of extinction. Each of the four gates on each route was checked by the continuation test suite.
- Stocks and helper capacities are teaching scales. Generator stores and food reserves are not replenished in this month model; material stockpiles refill. No cost/benefit or innovation reward is modelled.

## Validation

107 automated tests pass. New regression tests cover zero testing under both release policies, full production/full testing, missed errors after testing, monotone detection at fixed tested projects, permission queues, late-fault stock caps, conserved regional stocks, maximum care capacity, permanent development wires and stoppable/unstoppable agents. The existing tests retain all six month outcomes and shared board/month results.

Browser check: the user’s saved world had 120 updates, 17 mistakes, 2 caught and 15 escaped. Zero tests plus the hold showed 120 waiting and zero escaped; switching the hold off showed 17 escaped. Live daily units and policy explanations updated correctly. Undo restored the original world.

Reproduce with `npm test` and `node scripts/audit-settings.mjs` after building. Full measurements: [SETTINGS_AUDIT.json](SETTINGS_AUDIT.json).
