# First playable section: causal register

**Historical record, superseded:** use the [step 5 causal register and mathematical contract](STEP_5_AUDIT.md) for current rules. In particular, restoration now accumulates constrained repair work; it no longer uses the original fallback multiplier below.

Model 0.1.0. Every number in this section is an authored educational assumption, not empirical calibration. The initial state introduces a faulty proposal rather than estimating the frequency of such proposals. A run is conditional on those settings. Regional population dynamics, global collapse and extinction are not calculated.

| Connection | Implemented rule | Evidence boundary |
|---|---|---|
| Ability → execution | Network capability must be at least Configure. Execution requires Act, or Ask first plus explicit approval. | General distinction between capability and deployment opportunity: [International AI Safety Report](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026). Discrete fixture choices are authored. |
| Execution → communications | An introduced faulty change executes only when both ability and permission allow it. A single communications event is recorded. | This supplies an incident for exploration, not an empirical AI failure rate. |
| Communications → military warning | An incident plus enabled AI military advice introduces a misleading warning. | Decision-support reliability and human judgment concerns: [ICRC](https://www.icrc.org/en/article/faq-artificial-intelligence-in-military-domain). The warning itself is stipulated in this case. |
| Verification → warning rejection | Check time is 90 − 0.65 × strength minutes, plus up to 60 minutes for a shared information channel. A timely check catches the error if its event-specific draw is below strength / 100. | Timing, response and independence matter conceptually. These constants and probabilities are illustrative; the ICRC source does not supply them. |
| Warning → escalation | A surviving warning, rivalry at least 50, and a fixed event draw below rivalry / 100 are all required. | An authored human-response rule. It is not an estimate of real state behaviour. |
| Escalation → nuclear use | Rivalry at least 80, escalation, and a separate draw below 0.2 are required. | An additional fictional human decision; no AI launch authority is implied. The 0.2 is not a real-world estimate. |
| Communications → power | The same incident affects power only with Coordinate capability and shared power control enabled. | Common dependencies and civil preparedness: [NATO](https://nato.int/en/what-we-do/deterrence-and-defence/resilience-civil-preparedness-and-article-3). It is not independently sampled again. |
| Fallback → restoration | Repair time × (1 − 0.65 × fallback fraction), rounded to hours. | Illustrative restoration relationship. Fallback never erases the occurrence of the initial event. |
| Power → hospital service gap | Maximum of zero and power-outage hours minus reserve hours. | Critical-service dependency is supported by resilience sources. This is a simple critical-load reserve model, not a complete hospital model. |
| Restoration → service recovery | Original network/power outage ends at calculated repair time. | Does not establish recovery from strategic conflict. If nuclear use occurs, the wider recovery result is unresolved. |

Sources establish general mechanisms only. The application explains this distinction in the About panel and each implemented component inspector. Health-system context also links to [WHO essential public health functions](https://www.who.int/teams/primary-health-care/health-systems-resilience/essential-public-health-functions).

## Reproducibility and comparison

Fixed seed, settings and model version reproduce each event draw. Verification, escalation and strategic use use separate event keys. Changing a branch cannot shift subsequent random draws. The ensemble varies case seeds while holding settings fixed; outcome counts overlap. Hospital duration is deterministic under a given setting.

## Remaining model work

This register intentionally documents the limited first section. It does not validate all proposed pathways in the full model specification. Future versions need empirical bounds where available, alternatives to these illustrative response functions, explicit region/state dynamics, recovery and collapse definitions, and domain review.
