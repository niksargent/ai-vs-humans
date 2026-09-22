# Regional cascade — model 0.2

The shared-network case now includes food refrigeration, emergency response and six fictional regions. This is a dependency experiment, not a geographic forecast. The six regions are equal-weight units, not countries or population estimates.

## Rules

- `reach` (1–6, default 3) sets the number of regions sharing the affected network. The remaining regions have separate networks. Blocking the bad update protects all six.
- All affected regions use the same chosen service and backup settings. Reach does not multiply outage duration or alter military response draws.
- Food refrigeration interruption is `max(0, powerOutage − foodBackup)`. `foodBackup` is powered cold-storage backup in hours (0–168, default 48), not a food-safety threshold. No amount of spoilage, hunger or deaths is calculated.
- Emergency response disruption is `round(restoreHours × (1 − fallback / 100))`. Independent radios and local teams reduce disruption. This authored rule represents a period of reduced service, not the waiting time for one ambulance. At 100% independent capacity the network can fail while emergency response continues.
- The region lamps show whether a service is interrupted at any point during the original network incident, not its condition at a single instant. The walkthrough is an explanatory sequence, not a clock animation. Military and nuclear consequences are outside this service footprint.
- 0.1 saved cases retain their original controls and seed and receive the new default reach and food backup. Original military and hospital calculations remain unchanged. New exports use 0.2.

## Evidence and limits

[FEMA power outage guidance](https://www.ready.gov/sites/default/files/2024-03/ready.gov_power-outage_hazard-info-sheet.pdf) describes dependence of refrigeration, communications and medical equipment on electricity. [FEMA emergency planning](https://www.ready.gov/business/emergency-plans) explains why communicating with dispatchers matters to emergency response. These support the dependencies, not the numerical rules or default backup durations. Sources are available inside the relevant component’s expandable details.

The model still does not calculate global collapse, biological threats or extinction. The six-region display must not be presented as evidence that all humanity is affected.

## UI

“Show what happened” derives a short sequence from the live result and highlights the relevant components. Back, Next and direct step buttons require no waiting. Adjusting a dial recalculates the sequence. Same-node click, background click and Escape deselect. Background dragging continues to pan.

Signals use saturated coral, amber and mint on neutral graphite; control banks have distinct accent colours. Region icons have hover and keyboard-focus explanations. Rules and sources are tucked into a disclosure rather than occupying the whole inspector.

## Verification

21 model tests pass, including footprint isolation, food-backup boundaries, independent-power protection and complete independent emergency response. Browser checks cover the walkthrough, same-node deselection and region-specific explanations; additional manual verification is recorded in the implementation review.
