# Intuitive controls follow-up — 22 September 2026

Implemented after the user's review of the step 7 repair pass.

## Protection is a visible settings change

“Protect the world” replaces “Find a way back” / “Break the chain”. Each choice previews the exact settings it changes. Already-applied choices are disabled and say “Already set · nothing to change”. Applying a choice leaves a persistent before/after readout, reports calculated effects, and offers Undo. Each changed setting links directly to its control, opening the relevant World settings group. Changes to main dials also update their positions. Advanced-only changes are explicitly identified as World settings; they do not pretend to turn unrelated dials.

Feedback does not promise a rescue. Where the principal outcomes stay unchanged it says so; a harmful agent still undoing repairs is identified. The underlying model is unchanged.

## A stable vocabulary and entry point

- **Scenario:** the configured situation; replaces “experiment” when referring to the user's experience. Physical AI research experiments remain a distinct model concept.
- **Watch the story:** the consistent action for the causal walkthrough.
- **Protect the world:** choose safeguards and see their consequences.
- **World settings:** every setting, including main dials, accessible from a permanent cog.

Set the world now starts with a selectable Current scenario card. Exact presets are recognised; modified settings and combined pathways are labelled. Loading a preset remains undoable.

## First encounter

An optional five-step Quick tour highlights the current scenario, a dial, the story, safeguards and World settings. It can be skipped, revisited, or exited without changing the model. First use offers the tour once; the toolbar always allows restarting it.

On load and Reset, dial markers and illuminated tracks sweep from their minimum positions to the configured values. This is a visual setup sequence, not a simulated sequence of changing model inputs.

## Validation

- Production build and all 89 tests pass, including protection no-ops, reach bounds, persistent-agent feedback and current-scenario recognition.
- Browser: all five tour steps and exit; exact-current and adjusted scenario presentation; already-set safeguards disabled.
- Browser: hospital backup changed from 0 to 720 hours; the receipt reported care shortfall 106 → 0 hours and network repair 106 → 89 hours. Its setting link opened the correct control at 720. Undo restored the prior settings.
- Browser: observed an intermediate startup dial angle while its accessible value retained the true setting; final build loaded without console errors.
- User's pre-test world settings restored. No deployment performed. Real child testing remains user-organised.
