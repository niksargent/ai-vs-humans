# Feedback implementation and first-encounter check — 23 September 2026

## 1. “Inspect the highlighted mechanism”

Replaced the vague instruction with an adjacent action that names and opens the relevant component. For advanced controls without a direct node, it opens the actual changed setting. A directly controlled node receives a white inset border even when its result does not change. The highlight persists until a subsequent change or clearing action.

## 2. Scenario selection

The presets often keep the same eight main dial values and change advanced switches. This was real model behaviour presented opaquely, not a failure to update the dials.

Loading a scenario now shows its purpose, exact before/after changes, and whether main dials changed. Every changed setting links to its control. Additional changes can be expanded; the receipt can be dismissed or undone. The UI does not fake dial movement when their values are unchanged.

Browser checks: loading Updates outrun checks from the user's custom world showed five changed dials and nine other changes. Switching from that preset to One bad update showed unchanged dials and the two changed switches. The testing switch link opened the correct control. Undo restored the user's world.

## 3. Selection versus danger

An inset white rectangle marks selected/changed nodes. The red, amber or green outer housing remains intact and animated. Browser computed styles confirmed white inset stroke and red outer stroke together; visual inspection confirmed both remain legible.

## 4. AI projects — decision pending discussion

**Behaviour deliberately unchanged at the user's request to understand it first.** With projects off, the incident can be an assumed faulty update. With projects on, the incident instead comes from unchecked releases in the preceding research queue. “Test before release” can remove that initiating fault. The existing AI-project toggle therefore changes the source of the incident; it does not simply add more projects to the same ongoing disaster.

Recommendation for discussion: distinguish the starting incident from future project activity, so starting projects cannot silently erase an incident. Alternatively, make the source-of-incident choice explicit. This is a model/interaction decision, not a tooltip fix; it remains in the backlog pending the user's response. The research preset's new receipt explicitly explains its unchecked-update mechanism.

## 5. Beyond collapse becomes a canvas experience

The separate dialog/dropdown exercise is replaced by **The Last Refuges**, a chapter on the main canvas. Four persistent defences form a visible map. Clicking a defence opens one concrete question in the right readout. Two specific choices change the defence lamp, immediate consequence, community illustration and overall survival story. Next names the next question; any defence remains directly selectable. Return to the live world is always available.

A route without its required starting event offers an appropriate scenario to load and explains replacement/Undo. If another route already matches the current world, a direct action follows that event instead. Inactive defence cards are not presented as clickable controls.

All defences failing yields “No refuge remains in your story” and explains that the choices sketch a possible route to extinction, without proving these events would occur or kill everyone. Preserving a community shows the concrete alternative. Technical scope lives in an on-demand explanation.

The survival choices remain distinct from calculated services. They do not secretly alter dials, manufacture mortality estimates or certify that four assumed conditions are sufficient for extinction.

## 6. Mission-control bridge

Two persistent readouts link to the relevant exploration: **World condition** shows the calculated service outcome (or nuclear event with unknown aftermath); **Could anyone survive?** shows the user's survival story. Segments communicate condition/defence choices, not a probability of extinction. Both have explicit scope labels.

## First-encounter acceptance check

This is an agent walkthrough, not a real child test. Verified in the browser:

- “What changed?” — exact scenario changes, direct control links and working Undo.
- “Where do I click?” — named mission-control action; white inner border remains visible beside the danger colour.
- “Where am I?” — active Beyond collapse phase, stable four-defence canvas and explicit return to the live world.
- “What did my choice do?” — protecting a community changed the canvas and survival verdict while the calculated civilisation crisis stayed unchanged.
- “What next?” — direct canvas selection opens the matching question; Next names and opens the following defence.
- “Nothing has happened yet” — the harmful-agent starter loads an actual qualifying event; Undo restores the old world and choices.
- Keyboard-accessible defence cards and choices; no browser console errors in the checked flows.

All 96 tests pass, including inactive-route actionability, separation of story choices from model results, and unchanged-dial scenario receipts. Main physics and extinction-condition logic are unchanged. User-organised testing continues; hosting remains pending.

## Follow-up: screen space and obvious canvas actions

The two status instruments and Mission control now share one horizontal strip (67 pixels tall in the checked desktop viewport). Status instruments are passive; the journey rail owns navigation. Repeated permanent scope text is available through instrument tooltips, and the redundant Watch the story button in the strip is hidden.

Each refuge card now carries its two explicit outcome buttons. A user can start a qualifying scenario, make choices and see the settlement outcome entirely on the canvas. Selecting a title still opens supporting explanation. The right readout no longer duplicates those choice buttons. Mission control states the consequence of the chosen ending, and keyboard focus returns to the chosen canvas control after rendering.

Browser verification: loaded a collapse scenario using the canvas action, chose “Somewhere stays safe” directly on the second card, observed its selected state and “A way to survive remains”, and confirmed the consequence appeared in Mission control. All three strip sections share the same top coordinate and 65-pixel interior height. Restored the user's world and choices through Undo. All 96 tests pass; no console errors in the checked flow.
