# Offline quiz and learning records contract

## Design from evidence

Use the note revision authorized by the selected branch in SKILL.md. In the importance branch, also require the validated confirmed importance export. If the user skips importance annotation, build 1–10 comprehensive modules with stable IDs, names and knowledgePoints from the note and set all internal ratings to 3; no rating export or separate quiz brief is required. Clearly identify equal weights as technical defaults rather than user importance judgments. Base the number and organization of levels on course length, concept density, dependencies and ratings. State why the chosen levels/draws fit. Bank size should normally be at least twice the draw count; when evidence cannot support this, reduce counts/levels and state the remaining limitation. Near-duplicate paraphrases do not count as new evidence coverage.

Every question needs a stable ID, level ID, module ID, knowledge points, source location, prompt, deterministic answer and explanation. Never imply the distributed demonstration bank is course evidence. Convert calculations and formula writing into selecting a result/formula or judging a supplied derivation.

## Template configuration

Replace `study-config` JSON, escaping `<` as `\u003c`. Keep source text plain and render it with safe DOM APIs such as `textContent`, `createElement` and `setAttribute`; never inject course text with `innerHTML`. Config contains `schemaVersion:1`, `courseId`, `courseTitle`, `noteRevision`, `bankRevision`, optional `theme`, `modules` (the exact confirmed export modules with integer ratings in the importance branch; source-derived modules with uniform `rating:3` in the skip branch), optional shared `examples`, `levels` and `questions`.

Each level: `{id,name,description,kind,prerequisites:[],drawCount,passRatio:0.8}`. Prerequisites name existing levels and form a directed acyclic graph. Require `drawCount >= 5`, enough questions to satisfy it, and `passRatio:0.8`; do not use `passCount` to weaken or bypass the ratio. A round passes only when `correct / actualDrawCount >= 0.8`. Only passed levels enter `completed`, so a score below 80% never unlocks dependents.

Exactly one dedicated level uses `kind:"concepts"`. It concentrates questions on concepts, symbols, functions and physical/mathematical meanings first introduced or explicitly defined by the confirmed source. Other levels use `kind:"practice"`. Place the concepts level before dependent application levels unless the source gives a stronger dependency reason.

Common question fields: `{id,levelId,moduleId,knowledgePoints:[],source,prompt,type,answer,explanation}`. Answer formats:

| type | Additional fields | answer |
|---|---|---|
| `single` / `boolean` | `choices:[{id,text}]`; boolean has two | Choice ID string |
| `multiple` | Same choices | Nonempty array of unique choice IDs; exact-set grading |

No other type is allowed: prohibit text, numeric input, formula input, ordering and matching. Multiple-choice option IDs stay stable when shuffled. Display `多选题 · 全部选对才得分` beside every multiple-question title. Grade by exact set equality: missing, extra or wrong choices all score zero.

## Shared PPT examples and figures

Questions that depend on a source-specific PPT example, figure or waveform use `sourceKind:"ppt-example"` and `exampleId`. They reference one entry in top-level `examples`; repeated questions reuse the same entry rather than duplicating its contents.

Each example is `{id,page,source,stem,conditions,formulas,figure}`:

- `page` is a positive PPT/PDF page number and `source` names it visibly, such as `PPT 第 12 页`.
- `stem` is the complete original problem statement needed for independent answering.
- `conditions` is a nonempty array of all given conditions; `formulas` contains every necessary supplied formula, or a deliberate `无需附加公式` marker when none is needed.
- `figure` is structured offline data with a supported `kind` and complete axes, coordinates, labels and key points needed by the prompt. Use `kind:"none"` only when the original example genuinely has no dependent visual.

Render the example block before the question using safe DOM and inline SVG/HTML/CSS. Do not use network images, data fetched at runtime, or uncontrolled `innerHTML`. A human source review must confirm that the page number, text and geometry reproduce the source; the validator checks structural completeness and reuse, not visual truth.

## Cover visualization

The home view includes a course-themed signal/function illustration. Treat it as a data view, not decoration: derive every level node from the current learning record and show both unlock status and historical best accuracy. A single `coverModel(state, config)` (or equivalent pure model) feeds the visualization and level cards so they cannot disagree. Refresh it after completion, import and reset. Build SVG elements with `createElementNS` and set text through `textContent`; do not interpolate record data into `innerHTML`.

## Sampling and scoring

The engine groups each level's questions by module, assigns each question its module's 1–5 rating as a positive weight, and samples without replacement. If the draw count covers the represented modules, reserve one random question per module, then fill remaining slots by weighted sampling. If fewer slots exist, every module retains positive probability.

Check the **actual configuration of every level**, not only a synthetic sampler test. When represented modules have unequal ratings, demonstrate that weights can influence which questions are included. Compute each module's residual candidate count after coverage (subtract one per module when coverage applies). Require a positive weighted-slot count, at least two distinct ratings among modules with residual candidates, and fewer weighted slots than residual candidates. Reject a draw exhausted by coverage, a residual pool with only one rating, or a draw that exhausts the full bank. A nominal weighted slot alone is insufficient: 3/4/4/1 questions rated 5/5/5/2 with five draws leave 2/3/3/0 candidates, all rated 5, so weighting has no influence. Adding another same-rated question or increasing draws cannot repair that pool. A second genuinely different source-supported low-rated question can restore competition; otherwise reorganize/reduce levels or draws. Do not alter confirmed ratings to make validation pass.

Exercise the actual `sample()` with controlled RNG inputs and original/reversed ratings (`6-rating`, in test copies only); inspect changed selected IDs as evidence of influence plus continued low-weight opportunity. Keep original ratings in the delivered artifact. Distinct draws across rounds alone do not prove weight influence. If source evidence prevents a valid configuration, report the weighting requirement as unmet; an explanation cannot turn it into PASS. Single-module/equal-rating levels have no cross-rating influence to demonstrate and remain legitimate, as do shorter draws with weighted competition; never impose a fixed global level count.

Shuffle both sampled questions and choice order. Save the chosen IDs, choice order, selections and submitted results in the current session. Reload resumes a saved incomplete round; a new round makes a new draw. Submitted answers lock for that round, including repeated API calls. Immediately show correct/incorrect, explicit correct answer, explanation and module/source. Review rounds do not unlock levels or alter level best scores.

## Persistence and migration

Use `study-quest:v1:<courseId>`, with record fields `schemaVersion`, `kind:"study-progress"`, `courseId`, `bankRevision`, `bestScores` (0–100 per level), `completed` (level IDs), `unlocked` (IDs), `wrongBook` (question-ID map), `session` or null, and `updatedAt`. Exports additionally include `exportedAt`.

Wrong-book entries include `questionId`, `moduleId`, `knowledgePoints`, `wrongCount`, `lastWrongAnswer`, `correctAnswer`, `explanation`, `lastWrongAt`, and boolean `mastered`. Increment errors on every newly submitted wrong answer, clear `mastered` when wrong again, retain records after later correct answers. Manual mastery toggles are separate from correctness. Provide pending/all filters and a review-round entry.

On finishing a learning round, update each best score using `max(previous,batchAccuracy)` and persist completion/unlocks only when accuracy is at least 80%. Preserve an incomplete session, including locked answers, across reload. Validate all imported fields, types, identifiers, answer shapes, timestamps and session references before mutation. Preview and confirm replacement before importing. Errors leave existing data untouched.

Keep schema v1 for compatible appended banks with stable IDs. Accept earlier `bankRevision` records only if all stored IDs, current-session shapes and meaning are compatible; rehydrate correct-answer/explanation snapshots from the current bank. Unknown/removed IDs or changed question meaning require explicit migration; reject rather than silently drop records. Revision alone is not proof of compatibility. Allocate a new question ID for changed meaning.

“恢复默认” opens a secondary confirmation. Confirming clears scores, unlocks/completions, wrong counts/mastery, incomplete sessions and other local learning state for this course only. Keep the built-in bank, content and rating configuration. Cancelling changes nothing. Do not use `localStorage.clear()`.
