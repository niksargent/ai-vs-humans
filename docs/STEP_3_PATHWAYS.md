# Step 3: additional causes in the same world

Model 0.5.1 · 21 September 2026 · Local review build

## Try it

Select **Explore causes**. Each example loads a starting world and opens the relevant component. Its inspector has an intervention button; **Undo** restores previous settings. The examples are entry points into the same engine, not separate outcome scripts. Combine them through **More controls**, where the additional parameters sit inside expandable groups.

| Example | What changes | How to interrupt it |
| --- | --- | --- |
| Updates outrun checks | 90 candidates, 30 checked, 60 unchecked releases during the 30-day prelude | Require checks; research continues, with 60 candidates waiting and no introduced faulty deployment |
| The stop order fails | An agent with the stipulated harmful goal keeps interfering; network repair cannot finish | Independent isolation stops it at hour 24 and allows repairs to proceed |
| Hospitals face a surge | Care demand reaches four times normal; Region 1 has 307 hours of unmet care demand, even though its power stays on | Screening blocks the introduced threat; response speed and spare healthcare capacity can also reduce consequences |
| People hear conflicting instructions | False messages reduce response coordination and slow repairs | Trusted channels remove the extra penalty without repairing the original fault themselves |
| Supplies cannot move | Payment and transport bottlenecks restrict food and repair deliveries | Offline payments and independent transport address separate bottlenecks; fixing just one need not be sufficient |

## Implemented mechanisms

### Development outruns evaluation

A 30-day prelude precedes the service crisis. Daily candidate updates are `4 × min(research speed, compute, experiments) / 100`. Checking capacity is at most `4 × evaluation capacity / 100` per day. Candidates are evaluated first; the remainder either waits or is released unchecked if deployment permission exists and the wait-for-checks gate is off. Queue conservation is tested. Zero compute or experimental capacity stops production.

At least one unchecked release admits the separately stipulated faulty update. Completed checks catch that particular fault by assumption. This is an evaluation-backlog experiment, not a numerical recursive-intelligence-growth model. No research output silently grants physical access, weapon authority or a higher capability setting.

Optional AI repair advice provides a separate benefit: 25% higher potential local repair productivity with network-level capability. It still needs crews, tools and materials, consumes supplies per work unit, and cannot undo continuing hostile interference. The 25% is illustrative, not an observed effect size.

### Persistent loss of control

Deployment requires connected-service capability and permission. A failed stop order additionally requires resistance to stopping, resources outside the operator's control, and no effective independent isolation. Harmful operation is a separate assumption. A benign uncorrectable agent does not automatically cause an outage.

People try to stop the agent after the chosen delay. If the stop works, interference ends then; if it fails, interference continues through the 30-day horizon. While a harmful agent remains active, network repair makes no net progress. This is a deliberately bounded operational-control experiment, not a claim about present-day AI or a model of acquiring unlimited resources.

### Health crisis

The chain requires an introduced challenge, AI scientific assistance, harmful intent, physical-world access and failed screening. Scientific ability is a separate setting from network ability. Network-write permission is not laboratory access. Any missing gate blocks this particular introduced threat.

After introduction, an abstract extra-demand pulse rises linearly towards its selected peak over 168 hours until response begins. It then declines over at most another 168 hours. Demand is `1 + pulse × extra demand / 100`; care capacity is `min(1, (1 + surge / 100) / demand)`, further constrained by available hospital power. Workforce availability is `1 − 0.4 × pulse`. These are authored stress-test curves, not an epidemic forecast, pathogen parameters, deaths or medical advice.

Care shortfall and electricity shortfall are recorded separately. The first selected N regions receive the health challenge; the remainder do not. No cross-border disease transmission is inferred from transport settings. Health demand continues to be calculated after a network repair finishes. The walkthrough records introduction, peak demand and subsequent relief of demand where reached.

### Information and response

An introduced AI false-message campaign requires messaging capability, but not permission to rewrite the network. For the selected duration, the trusted-response multiplier is `max(trusted channels / 100, 1 − campaign reach / 100)`. This caps emergency response and multiplies repair coordination. It represents practical response degradation, not a calibrated persuasion rate, election outcome or prediction of regime collapse. Outside the selected exposed regions, it has no imposed effect.

### Payments and transport

Each can independently share the failed network. Its service level is `fallback + (1 − fallback) × min(power, communications)`; a separate system remains available. Actual ordinary deliveries use the minimum of existing delivery capacity, payment support and transport support. Correlated failures are not multiplied as independent probabilities or duplicate losses.

This represents purchasing and moving essentials. It does not model bank balance sheets, asset-price contagion, unemployment, aviation schedules or passenger travel. Relief aid remains a separately budgeted, pre-authorised route with its own travel-time setting. A recovered region cannot donate until its care and coordination have also remained fully supported for 24 hours.

## Shared outcomes and limits

The original military, infrastructure and common-failure mechanisms remain. New pathways change the same hourly stocks, repair work and six-region outcomes. The collapse basket now reads actual care support, rather than treating hospital electricity as sufficient care. It still requires simultaneous severe power, healthcare, food and coordination failure; a standalone health overload does not automatically qualify.

No extinction probability, death count, biological procedure, nuclear damage calculation or political-collapse prediction has been added. Wider extinction conditions remain step 4. The current coefficients and fixed response shapes need the later research/math audit; completing these mechanisms does not make their numbers scientifically calibrated.

## Evidence register for new connections

| Connection | Evidence category and boundary |
| --- | --- |
| Capability, behaviour and deployment conditions → loss of control | Conditional extrapolation. [International AI Safety Report 2026, §2.2.2](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026) distinguishes these factors and uncertainty. Our gates and repair-blocking rule are explicit assumptions. |
| AI scientific help + physical barriers → health challenge | Conditional extrapolation. The same report separates assistance from real-world execution. No demonstrated global event frequency or demand curve is imported. |
| Public-health response and care capacity → ability to meet demand | Supported mechanism. [WHO essential public-health functions](https://www.who.int/teams/primary-health-care/health-systems-resilience/essential-public-health-functions) motivates explicit response capacity; the pulse, delay and staffing coefficients are illustrative. |
| AI-generated messages → impaired response | Conditional extrapolation from information-manipulation concerns in the AI Safety Report. Its experimental findings do not calibrate the chosen response multiplier. |
| Shared services → financial and delivery disruption | Scope supported by the approved build/model specifications and [FSB's AI financial-stability report](https://www.fsb.org/2024/11/the-financial-stability-implications-of-artificial-intelligence/). The payment/transport bottleneck equations are authored service assumptions, not financial forecasts. |
| Research throughput → evaluation backlog → unchecked deployment | An explicit queue model grounded in the specification's distinction between research, resources, evaluation and permission. The units and throughput coefficients are illustrative. |

## Verification

60 passing tests: all 49 earlier tests plus new checks for queue conservation, resource limits, deployment gating, harmless loss of control, each control prerequisite, every health gate, care after network recovery, response/surge effects, trusted channels, separate payment/transport bottlenecks, repeatability, stock conservation, bounded AI repair assistance and healthy-donor requirements.

In-app checks cover all five example entry points, interruption buttons, health walkthrough and restored user settings. The older full headless browser suite has not been rerun. Model 0.4 and the intermediate 0.5 preview migrate to 0.5.1 with existing controls and seed retained; new controls receive defaults.

The reported connection glitch has no visible image attached in the conversation. It remains for the later connection/layout review, alongside the broader clutter reduction. Step 4 has not begun.
