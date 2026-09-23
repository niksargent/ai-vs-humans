# Dial responsiveness review

## Findings

- Both the dial pointer and colour ring applied 650 ms easing during dragging, creating visible lag even when computation was fast.
- Every pointer event ran the full model, rebuilt the SVG circuit and its animated background, rendered the readouts, and wrote local storage.
- Local Node benchmark (100 project-pace settings after 10 warmup runs): model-only median 7.88 ms, p95 18.15 ms, maximum 26.49 ms. This is not a browser frame-rate measurement and varies with hardware/load.

## Changes

- No easing while a control is directly focused/manipulated; preset/setup animations remain.
- Pointer events coalesce to at most one calculation per animation frame. The final pending value is flushed on release/cancellation/lost capture.
- One Undo entry per drag; local storage writes once on completion.
- Existing circuit nodes, links and atlas stay in the DOM. Only changed classes, labels and accessibility text are patched. This avoids rebuilding the circuit and restarting its ambient animations on every setting change. Switching to/from the survival canvas still rebuilds the relevant view.

## Verification

All 216 tests pass; model mathematics are unchanged. Browser verified 0-second direct-manipulation transitions on dial and ring, keyboard 39→40 updates/month, drag 40→210 with matching production readout, one Undo back to 40, then Undo back to the user's 39. No console errors.

The model still runs on the main thread. If low-powered devices remain sluggish, the next measured improvement would be a latest-request-only model worker, with stale-result protection. No claim of a measured FPS increase is made in this pass.
