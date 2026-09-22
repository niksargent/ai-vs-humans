# Model specification

Version 0.1 · Proposed modelling contract; no equations below are empirically calibrated unless a later parameter record explicitly establishes that.

## 1. What the model is

A reproducible, stochastic educational model with explicit causal assumptions. Stochastic means different sampled events can produce different outcomes. Reproducible means fixed model version, settings, initial state and seed reproduce a case. Neither property establishes real-world predictive accuracy.

The machine explains conditional mechanisms and compares assumptions. It does not compute a scientifically established global extinction probability. All displayed percentages must specify what was sampled and over which horizon.

There are two distinct experiments:

- **Introduced incident:** the user selects a communications failure, outbreak or another initiating event. Outputs are conditional on that incident. There is no need to invent its arrival probability.
- **Sampled incidents:** incidents arrive through explicitly parameterised processes. Rates are scenario assumptions unless sourced. The results include no incident within the horizon.

Start teaching with introduced incidents, because this isolates the propagation and recovery mechanisms. Both experiments use the same state and transition system.

## 2. Pathway inventory

These are candidate causal structures requiring edge-level review. They do not assert that complete chains have happened or that all links are equally supported. S1–S5 provide starting evidence, not numerical calibration.

| ID | AI-specific contribution and initiating conditions | Intermediate mechanisms | Interruption / recovery | Downstream outcome |
|---|---|---|---|---|
| P1 Military escalation | AI-generated or mediated warning/advice, or delegated military action, during a crisis | Unreliable information; verification fails or arrives too late; escalation; separately modelled strategic use | Independent information; protected deliberation; communication; retained human authority | Conflict, possible nuclear exchange; further consequence assumptions required for widespread collapse |
| P2 Infrastructure cascade | AI-assisted cyber misuse or faulty autonomous control with usable access | Service interruption; dependency failures; shared-provider failures; repair resources impaired | Segmentation; least privilege; independent operators; reserves and restoration | Sustained power, communications, water, logistics or payment loss |
| P3 Health crisis | AI scientific assistance to a malicious actor, with independent physical-world barriers, or AI-mediated response disruption | Introduced health threat; delayed detection; demand exceeds capacity; supply disruption | Screening; surveillance; health capacity; trusted information; supply alternatives | Severe health crisis, potentially compounded service failure |
| P4 Persistent loss of control | Capable agent, harmful behaviour assumption and enabling deployment environment | Failed oversight; persistence; ineffective revocation; consequential resource access | Isolation; independent infrastructure; effective correction/revocation; physical constraints | Loss of operational human control; harm only through additional explicit channels |
| P5 Development outpaces checking | AI-assisted research with compute/experiment/deployment authority | Faster development; evaluation backlog; deployment before checks finish | Deployment gates; evaluation capacity; real-world experimentation bottlenecks | Increased exposure in P1–P4, not an independent catastrophe event |
| P6 Information and governance erosion | AI-assisted manipulation or concentrated delegation under susceptible institutions | Lower information reliability; impaired coordination; dependence; weakened corrective action | Plural institutions; trustworthy channels; independent decisions | Response/recovery degradation or loss of agency; not synonymous with extinction |
| P7 Dependence and common failure | Widespread use of related AI systems with inadequate alternatives | One shared failure affects multiple services; shutdown is costly; reserves deplete | Diverse failure domains; manual fallback; substitute supplies; restoration capacity | Compound collapse when sustained service and governance criteria are met |

Do not make every AI contribution harmful by construction. Where supported by a stated mechanism, AI can assist verification, defence, diagnosis or repair. Compare that effect separately from access and correlated-dependence effects. No unsupported claim that increasing capability always raises or always lowers total risk.

For health and military pathways, the model stays at societal mechanism and resilience level. It requires no operational attack designs, specific real-world targets or biological production details to answer the educational question.

## 3. State and rule records

Each state variable has an ID, type, unit, bounds, interpretation, default provenance, update rule and display mapping. Each transition has:

- Named trigger and required conditions, with explicit all/any logic.
- Enabling and inhibiting influences kept distinct from hard prerequisites.
- A transition rule, delay, and references to shared latent shocks if applicable.
- Evidence record: what is observed, what is an extrapolation, what is stipulated.
- Falsifying or interrupting conditions and a plain-language explanation template.
- A record of inputs used, rule version, random draw and resulting event when evaluated.

Explanations must be built from these records. A highlighted path is not itself proof of causal attribution. The inspector identifies required conditions, contributing factors and alternative routes, and can run controlled comparisons.

## 4. Time and execution

Time exists inside the model; it is not the user's waiting mechanism. Calculate a selected horizon immediately and expose the sequence as an inspectable trace.

Initial proposal: a ten-year relative horizon with 1/5/10/20-year selections, prominently labelled illustrative. Strategic development may use monthly updates; acute service crises need daily updates or an event queue. This choice is provisional until step-size sensitivity tests establish adequate stability.

Do not represent a minute-scale verification deadline as a monthly numerical integration. Evaluate the acute decision locally with an event timestamp and remaining verification time. Record it in the shared event log. Every rate must have a declared unit and conversion across steps.

Within a step, calculate proposed transitions from the prior state, resolve events with documented precedence, then commit the next state. Do not let array traversal order determine whether health fails before power. Return edges affect subsequent steps or explicit later event times; never solve feedback by repeatedly propagating instantaneous red lamps until everything fails.

Use event-addressed random streams keyed by run seed, region, mechanism and step/event opportunity. A changed branch must not shift every later random draw. Paired cases preserve comparable exogenous randomness even when their internal histories diverge.

## 5. Proposed mathematical components

### Incident arrival

For a declared rate λ per year, a time interval Δt years has occurrence probability `1 − exp(−λΔt)` under a Poisson-arrival assumption. Clustering requires a separate process rather than increasing the rate without explanation. Introduced-incident mode bypasses arrival sampling and labels that conditioning.

Rates are not supplied by the research report as measured constants. Until reviewed, authoring fixtures are explicitly illustrative. Do not publish annual probabilities disguised as current-world estimates.

### Conditional transitions

Hard prerequisites define structural possibility. Conditional event probabilities may then use an explicit lookup table or bounded response function. Prefer inspectable conditional tables for discrete educational choices. Logistic functions may be used when their response shape is justified, but their coefficients remain assumptions unless supported.

An influence multiplier is not a probability. Multiplication of scores must not silently become a catastrophe probability. Display no probability when only an ordinal comparison has been established.

### Service dependencies and reserves

For region r and service i, let availability `a(r,i,t)` lie in [0,1]. Each required input j has delivered support `s(r,i,j,t)` that includes direct supply, declared substitutes and available reserve withdrawals. A candidate essential-input rule is:

`a_next = min(intrinsic_operating_capacity, essential_input_supports)`

This bottleneck rule is appropriate only for genuinely non-substitutable inputs. Alternative inputs combine through an explicitly bounded substitution rule. Do not add the same lost electricity twice because it affects both communications and a downstream hospital.

Reserve stocks update by actual replenishment minus actual consumption; unmet demand remains separately recorded. A reserve cannot be consumed twice to sustain two services. Recovery capacity depends on remaining workers, functioning logistics, communications and spare resources. Dependency and repair rules can therefore produce delayed feedback without instantaneous certainty of collapse.

### Common causes

A provider failure, regional disaster or geopolitical shock is sampled once and referenced by all exposed components. Exposure determines consequences; it is not a new independent coin flip for the same cause. Safeguards that depend on one model or data source share a failure domain. Their reliability is not multiplied as though they were independent.

### AI development

Represent research automation, compute availability, experimental throughput, evaluation throughput and deployment approval separately. Candidate improvements enter a queue; completed evaluation consumes capacity; deployment follows the chosen permission rule. Gains are bounded by the scenario's resource assumptions and diminishing returns.

Any self-improvement feedback includes delays and constraints. No automatic unbounded exponential growth, and no automatic transfer from software capability to robots, laboratories or weapons authority.

### Behaviour and agency

Keep ability to conceal, propensity to act harmfully, objective mismatch and ordinary error separate. Persistence requires resources and reach. Loss of control requires a defined inability to correct/revoke consequential operation, not simply a high autonomy value. A beneficial but uncorrectable system and a harmful controllable system are different states.

## 6. Geography and recovery

Global averages cannot support claims about the last surviving population. Use a small set of abstract regions with explicit population weights, service dependencies and different reserve/fallback configurations. Do not present them as actual countries.

Initial proposal: six abstract regions, selected for diversity of dependence and resilience rather than geographic resemblance. Validate whether conclusions are sensitive to this aggregation. A refuge or independent region must remain represented when highly connected regions fail.

Track service availability, continuity of basic governance, repair capability, access to essentials and recovery time. Population impacts require additional audited relationships. Until those exist, use service deprivation and health-system overload rather than invented death counts.

## 7. Outcome definitions

Pathway events can overlap: a health crisis and infrastructure failure can occur in the same run. Their histogram percentages must not be stacked as disjoint outcomes.

For a mutually exclusive end-of-horizon summary, use a documented classifier: functioning/recovered, disrupted with recovery incomplete, or civilisation-collapse criteria met. Display retained human control as a separate dimension. A system can recover from an earlier collapse; record both occurrence and end state.

Proposed educational collapse criterion, to be sensitivity-tested: sustained concurrent failure of basic governance and a defined basket of essential services across regions representing a large share of the starting population. Publish the exact service cutoff, population share and duration in the model panel. Do not freeze arbitrary thresholds as a scientific definition. Candidate fixtures may use 50% population share and 180 days, but no release classifier is approved by this document.

This unresolved classifier does not block interface construction. It does block presenting a release lamp as a validated collapse measure. Show continuous severity and duration alongside any classification so small threshold changes do not conceal the underlying situation.

Recovery means specified essential services and governance cross documented thresholds for a sustained period. Recovery outside the simulation horizon is **unknown beyond horizon**, not impossible.

### Extinction lens

The release must reveal at least two additional conceptual routes: an extreme globally reaching physical hazard, and persistent hostile control capable of defeating geographically distributed recovery. Nuclear and infrastructure chains connect to these only through explicit additional conditions, never through an automatic extinction conversion percentage.

Selecting **Beyond collapse** expands requirements: surviving populations, accessible essentials, geographic reach of the threat, persistence, independent refuges and recovery over time. Show evidence status and missing model coverage at each step.

The initial release may explain these conditional pathways without claiming to simulate extinction numerically. If demographics and survival are not modelled adequately, display **Extinction not resolved by this model**. A human-continuity proxy must use its own name and must never light a literal-extinction indicator.

## 8. Uncertainty, distributions and comparisons

Separate three layers:

1. Variation in events under fixed assumptions.
2. Uncertain parameter values within an explicitly chosen distribution.
3. Alternative structural models or disputed mechanisms.

Default frequencies describe layer 1. Layers 2 and 3 have separate views or clearly labelled bands. Do not combine alternative worldviews into a single weighted probability unless the weights are explicitly user-chosen and visible.

Show run count, horizon, incident conditioning and parameter/model version with distributions. Sampling error and assumption uncertainty are different. Zero events in a finite ensemble does not establish zero risk. Tail probabilities below useful simulation resolution must not appear as precise estimates. Timing charts include no event within horizon; recovery charts retain incomplete recovery.

An illustrative 256-run preview and larger 2,048-run refinement can be benchmarked; these are performance candidates, not statistical guarantees. Estimate precision and report sample size. Do not spend computation on misleading decimal places.

Counterfactuals change declared inputs while keeping paired exogenous samples. Report effects as model-conditional differences. Multiple interventions can interact, so avoid claiming a unique additive percentage contribution for every knob. Search suggestions are labelled **a tested improvement among the options checked**, not a proven optimal policy.

## 9. Runtime AI and JEV boundary

All core causal state transitions, arithmetic, event sampling, classification and explanatory traces are explicit local rules. The engine requires no network AI call.

JEV may be evaluated for bounded semantic classification, such as routing a user's natural-language question to an existing node/explanation. Its answer confidence is not an event probability or empirical calibration of this simulator. Missing scientific knowledge must stay missing; a learned judgment does not supply it.

If decision-model agents are later explored as fictional actors, isolate them in a clearly experimental mode. Record provider/model version, exact state, question, output and fallback. Frozen outputs permit replay of that run but do not guarantee fresh-call determinism. Compare against explicit-rule baselines. This extension is outside initial release acceptance.

## 10. Implementation readiness

Ready: state/rule contracts; reproducibility requirements; separation of graph and engine; educational view semantics; pathway inventory; evidence fields; first working section.

Still to decide through research and tests: transition tables and coefficients; collapse thresholds; region aggregation; time-step adequacy; empirical bounds; demographic modelling; any defensible tail distributions.

No one should interpret this specification as having validated those unresolved quantities.
