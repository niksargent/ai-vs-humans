# Module scenario review

26 deliberately chosen worlds exercise every board module. These are regression examples, not a calibration of real-world odds. Seed 42 is held fixed so changing safeguards is a fair comparison.

## Colour meanings

Service lamps: green means full service throughout the observed month; amber means partial or brief disruption; red means at least 24 continuous hours below half capacity. Food also turns amber if refrigeration fails while stored food still protects people. Readouts describe Region 1; spread and civilisation describe all six regions.

Capability, permissions, checks, supplies and recovery are mechanism lamps: amber means exposure, limited capacity or unfinished work; red means harmful use, failed protection or stalled recovery. Their inspectable rules explain the distinction. Nuclear aftermath remains unknown, never falsely green.

## Every module can reach every colour

| Module | Green world | Amber world | Red world |
|---|---|---|---|
| Can people stop it? | No release permission | Stopped agent | Unstoppable agent |
| Trusted information | No release permission | False messages, some trusted voices | False messages overwhelm response |
| Payments | No release permission | Half capacity fallback | Payments and transport fail |
| Transport | No release permission | Half capacity fallback | Payments and transport fail |
| AI development | No release permission | Test queue | Food stores protect people |
| Emergency coordination | No release permission | Independent systems | Food stores protect people |
| Warning checks | No release permission | Rivals do not escalate | Nuclear brink |
| Military warning | No release permission | Rivals do not escalate | Nuclear brink |
| Crisis escalation | No release permission | Rivals do not escalate | Nuclear brink |
| AI abilities | Advice only | No release permission | Food stores protect people |
| Permission to act | No release permission | Advice only | Food stores protect people |
| Communications | No release permission | Small fault, fast repairs | Food stores protect people |
| Power systems | No release permission | Small fault, fast repairs | Food stores protect people |
| Hospital services | No release permission | Moderate care surge | Food stores protect people |
| AI-assisted health threat | No release permission | Moderate care surge | Severe care surge |
| Independent backups | Independent systems | No release permission | Payments and transport fail |
| Restore the network | No release permission | Food stores protect people | Payments and transport fail |
| Services restored | No release permission | Food stores protect people | Payments and transport fail |
| Shared across regions | No release permission | Food stores protect people | Global breakdown |
| Food warehouses | No release permission | Food stores protect people | Repeated faults, military advice off |
| Emergency response | No release permission | Small fault, fast repairs | Food stores protect people |
| Repair crews | No release permission | Food stores protect people | Repeated faults, military advice off |
| Repair supplies | No release permission | Stores run dry | Payments and transport fail |
| Help from other regions | No release permission | Food stores protect people | No crews or deliveries |
| Civilisation | No release permission | Food stores protect people | Repeated faults, military advice off |

## Outcome checks

| World | Faulty updates released | Regions hit | Collapse reached | Nuclear use |
|---|---:|---:|---|---|
| No release permission | 0 | 0 | No | No |
| Food stores protect people | 11 | 5 | No | No |
| Advice only | 0 | 0 | No | No |
| No new projects | 0 | 0 | No | No |
| Repeated faults, military advice off | 11 | 5 | Yes | No |
| Perfect testing | 0 | 0 | No | No |
| Test queue | 0 | 0 | No | No |
| Small fault, fast repairs | 1 | 5 | No | No |
| Half capacity fallback | 11 | 5 | Yes | No |
| Independent systems | 11 | 5 | No | No |
| Payments and transport fail | 11 | 5 | Yes | No |
| No crews or deliveries | 11 | 5 | Yes | No |
| Thin crews | 11 | 5 | Yes | No |
| Stores run dry | 11 | 5 | Yes | No |
| Stopped agent | 0 | 5 | Yes | No |
| Unstoppable agent | 0 | 5 | Yes | No |
| Moderate care surge | 0 | 0 | No | No |
| Severe care surge | 0 | 0 | No | No |
| False messages, some trusted voices | 11 | 5 | Yes | No |
| False messages overwhelm response | 11 | 5 | Yes | No |
| Warning checked | 11 | 5 | Yes | No |
| Rivals do not escalate | 11 | 5 | Yes | No |
| Nuclear brink | 2 | 5 | Unknown | Yes |
| Global breakdown | 11 | 6 | Yes | No |
| Local breakdown | 11 | 1 | No | No |
| Relief gets through | 1 | 1 | No | No |

## Scope and limitations

The full settings and expected lamps are stored in `tests/fixtures/module-scenarios.json`. Tests cover every module in all three colours, exact scenario outcomes, partial versus sustained service loss, and protection counterfactuals. These authored examples prove reachability and consistency; they do not prove every possible settings combination realistic. The 24-hour service severity rule is a transparent presentation convention, not an empirically estimated harm threshold.

Nuclear brink settings: AI advice enabled, tension 100, warning verification 0, project pace 600/month requested, mistake rate 100%; available computers/experiments still cap actual production. Seed 42 produces nuclear use. It requires the warning, escalation and further nuclear-decision gates; a red military lamp alone does not mean nuclear destruction.

## Browser and workflow verification
Protect the world was falling through to the old random-range renderer; restored its safeguard panel. Applied hospital protection, verified its before/after receipt, undid it, replayed random events without leaving safeguards, and undid the replay. Verified the populated 128-replay explorer has no settings sliders and a clear route back to World settings. User settings were restored. No browser console errors were recorded. Build and all 216 tests pass.

Regional strip lamps now use the same service severity rule as the main board. Selecting a regional lamp opens that region's actual report rather than showing Region 1's explanation for another region.
