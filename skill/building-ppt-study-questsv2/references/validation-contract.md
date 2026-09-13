# Validation and delivery contract

Run the bundled Node validator on the artifact(s) for the current stage:

```text
node scripts/validate-artifacts.js --markdown path/to/notes.md
node scripts/validate-artifacts.js --importance path/to/ratings.html --ratings path/to/export.json
node scripts/validate-artifacts.js --quiz path/to/quiz.html
node scripts/validate-artifacts.js --self-test
node scripts/test-config-regression.cjs
node scripts/test-quiz-policy.cjs
```

For the skip-importance branch, validate the note and quiz without requiring an importance page or ratings export. Check that all module ratings equal 3 and delivery identifies them as neutral technical weights. Equal-rating levels use the existing exemption from cross-rating influence checks; all other quiz checks remain required.

Flags combine. `--ratings` requires `--importance` or `--quiz` for expected course/module mapping. `--legacy` allows inspection of older pages lacking `study-config`; it labels unsupported checks as warnings, never reports them as proven. A nonzero exit code means an error. Inspect warnings and fix applicable issues before delivery. The validator uses no network and no npm packages.

Static checks cover Markdown delimiter/table structure, first-section numbering/definition slot, HTML IDs, inline JS parseability, external-resource constructs, embedded JSON contracts, module/rating IDs and ranges, level dependencies, question answers/explanations/sources, count/threshold configuration and the quiz policy below. Engine checks exercise duplicate-free draws, rating influence, answer locking, best-score monotonicity, persistent wrong records/mastery reversal, import rejection/round-trip and reset state. These do not replace a real browser or source-to-note review.

For Markdown delivery, also perform and report a manual source-to-note review:

- Compare heading order with the PPT/PDF inventory and confirm that usable source headings were retained.
- Confirm that summary-labeled slides were captured first and used as coverage checks.
- Scan for dense multi-fact paragraphs and reshape them as hierarchical lists, steps, tables or callouts where clearer.
- Confirm that the Markdown contains no source filenames, page/slide references, provenance sections or source-tracking comments.
- Compare every retained claim, example and formula with the source; remove unsupported additions.
- Confirm that intermediate formula derivations are absent unless the user explicitly requested them, while final formulas and their conditions remain.

Quiz policy checks require one dedicated `kind:"concepts"` level, `drawCount >= 5` and `passRatio:0.8` on every level, and only `single`, `multiple` or `boolean` question types. Exercise exact-set multiple grading with correct, missing and extra selections. Confirm that every `sourceKind:"ppt-example"` question resolves to one structurally complete shared example containing a positive page number, full stem, conditions, formulas and a supported offline figure. The template must visibly contain `多选题 · 全部选对才得分` and expose a cover model whose level status and best score come from the same learning state used by the level cards.

For each delivered level with unequal represented ratings, require demonstrable residual weight influence. The validator counts actual candidates by module, subtracts mandatory coverage, and rejects zero weighted slots, fewer than two distinct residual ratings, or complete residual-bank exhaustion, even if synthetic weighted-sampling tests pass. Single-module and equal-rated levels are exempt because cross-rating influence is immaterial. A positive weighted-slot count or variation between ordinary rounds is insufficient. Compare the real `sample()` on the delivered config and a test copy with reversed ratings under identical controlled RNG inputs; verify changed inclusion and positive low-weight opportunity, and record the residual counts/ratings. Test copies must never replace the confirmed ratings. Source scarcity must be reported as an unmet requirement, not a successful exception. Recheck after adjusting the bank, draw counts or level organization; keep all counts content-driven.

For calculation or formula knowledge, verify that each item has been converted to selecting a correct result/formula or judging a displayed derivation. Check plausible distractors for sign, denominator, symbol and unit mistakes. No text, numeric or formula input is permitted.

For every PPT example reference, compare the shared example entry with its source page. Confirm that the stem is independently answerable and that all necessary conditions, formulas, axes, labels and key points are visible. Structural checks cannot establish scientific or visual fidelity, so record this source review separately.

For each HTML, open the file directly in a browser with network disabled. Capture page errors. Check desktop and narrow mobile (e.g. 1280 and 320 CSS px) and verify `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. Inspect visible text wrapping, control sizes, keyboard focus, labels, feedback and offline formulas. Trigger dynamic views before checking duplicate IDs. Use accessible controls, no mandatory dragging, 44px touch targets and visible focus.

Rating behavior: fresh/unrated state; select ratings; reload; counts match; exported JSON parses and passes validation; incomplete export is blocked; storage failures are visible.

Quiz behavior: each configured type accepts correct answers and rejects plausible incorrect ones; multiple choice uses exact-set grading; a submit locks all current inputs; repeated submission leaves score unchanged. Complete a high-scoring round then a lower one and reload; best remains high. Verify 80% passes, any lower accuracy fails, and failure does not unlock a dependent level. Confirm the cover illustration and cards display the same unlock state and best score before and after completion, import and reset. Make a mistake twice, mark mastered, answer correctly (record remains), err again (mastery resets). Exercise pending/all wrong list and review round. Reload an incomplete round and verify selected options, locked answers and order. Export/import a valid backup and reject malformed/wrong-course/version/ID/session backups without changing state. Check import confirmation, reset cancel/confirm, and preservation of built-in weights/bank.

Provide actual validation results, not inferred success. If browser QA is unavailable, report exactly which checks remain unverified. Record source omissions and provenance only in the delivery report or private ledger, never in the Markdown note. Justify low bank/draw ratios separately from program correctness. Course fidelity, source order, summary-slide coverage, useful pedagogy, OCR reliability, semantic duplicate questions and stage confirmations require human/agent review; regex cannot certify them.
