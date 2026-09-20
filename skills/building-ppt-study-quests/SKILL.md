---
name: building-ppt-study-quests
description: Use when a user provides course PPT/PDF material or confirmed course notes and requests Obsidian study notes, an importance-rating checklist, a question bank, or an offline study-quest webpage as part of a course-learning workflow. Also applies to continuing an already confirmed stage. Excludes ordinary summaries, isolated format conversion, and unrelated websites.
---

# Building PPT Study Quests

Turn supplied course evidence into study materials through confirmed stages. Retain source limits and dependencies; do not replace missing material with remembered knowledge.

## Determine the current stage

Read the supplied material and conversation for existing confirmations. Record the current input file/revision and its confirmation in the handoff. Prior confirmation remains valid for that revision. A request for the complete workflow is not confirmation of artifacts that do not yet exist.

| Stage | Read before acting | Deliver and wait for |
|---|---|---|
| 1. Course notes | [Markdown contract](references/markdown-contract.md) | Obsidian `.md`; ask whether importance annotation is wanted |
| 2. Importance (only if requested) | [Importance contract](references/importance-contract.md) | Offline rating `.html`; completed exported ratings JSON and user confirmation |
| 2.5 Quiz requirements (importance branch only) | Confirmed ratings and the conversation | Explicit answers to the quiz brief below, followed by explicit permission to start |
| 3. Study quest | [Quiz contract](references/quiz-contract.md) | Offline quiz `.html`; tested policy, learning records and backup/reset behavior |

Read [validation contract](references/validation-contract.md) before each delivery. Use the available PPT/PDF reading capability for the actual input format. Keep slide/page locations in a private extraction ledger for verification, but never place provenance or page references in the delivered Markdown note. Report unreadable pages and conflicts in the delivery message, ask for missing source or a decision, and continue only with reliably supported content.

## Build only the authorized stage

1. Create the note with the required opening definition table or explicit no-new-quantity statement. Follow the source's chapter/slide order and reuse its headings whenever they are usable. Present knowledge as short sections, hierarchical lists, comparison tables, steps or callouts instead of dense paragraphs. When the source contains headings such as `知识小结`, `小结`, `本章总结`, `内容总结` or `总结`, capture those slides first and use them as high-priority structure and coverage checks while still verifying against the surrounding source. Preserve final formulas, meanings, conditions, examples and qualifiers, but omit formula derivations unless the user explicitly requests them; this omission also applies to the opening definition table, so an intermediate relation or symbol used only inside a derivation must not be promoted into that table. Include only source-supported knowledge and keep all source names, page numbers and slide references out of the Markdown artifact. Validate and deliver it, then ask: `MD 文件已制作好，你需要制作重要性评注吗？需要的话按原流程进行；不需要的话，我会直接根据这份 MD 制作闯关答题网页。` Wait for the choice unless already explicitly given for this note revision. If revisions are requested, resolve them first. Record the choice and note revision in the handoff.
   - **需要**: retain the original note-confirmation, rating-export and quiz-brief gates in steps 2–4.
   - **不需要**: treat this choice as authorization to use the delivered note and directly create the quiz in step 4. Skip the rating page, exported ratings JSON, and mandatory quiz-brief/permission exchange. Use preferences already supplied; otherwise use the quiz contract defaults and balanced source-supported coverage. Form modules from the note and assign every module the same neutral internal weight `rating:3` for template compatibility. State that importance annotation was skipped and equal weights are technical defaults, not user ratings. Do not invent a ratings export or request `无特殊要求，可以开始` in this branch.
2. If importance annotation was requested, after note confirmation, adapt [rating template](assets/importance-checklist-template.html). Change its JSON configuration, course identity and theme. Group supported knowledge into comprehensive modules. Deliver the usable page and explain how to export ratings.
3. In the importance branch, after receiving confirmed valid ratings, stop and collect a quiz brief. Ask the user, in one compact message:
   - whether single-choice, multiple-choice or true/false questions need special treatment;
   - which knowledge points should receive more, less or no coverage;
   - whether calculations, fully reproduced PPT examples or comprehensive questions are wanted;
   - whether per-level count, the 80% pass line or level structure needs additional constraints.
   Summarize the answers and obtain explicit permission to begin. If the user has no preferences, require the explicit reply `无特殊要求，可以开始`. Ratings confirmation alone is not authorization to design or generate the quiz.
4. After either the importance-branch quiz brief is explicitly confirmed or the user chooses to skip importance annotation, adapt [quiz template](assets/quiz-template.html). Create a dedicated new-concepts level and use only single-choice, multiple-choice and true/false questions. Every level draws at least five questions and passes at 80%; a failed level cannot unlock dependents. Reproduce source-specific PPT examples through shared structured example data. Explain the design briefly, validate the policy and engine, exercise browser behavior and deliver.

Use stable semantic IDs: `course-intro`, `module-observation`, `level-compare`, `q-observation-condition`. Preserve IDs when meaning is unchanged; give materially changed questions new IDs. If notes change after confirmation, assess module mapping and obtain confirmation of the revised input; regenerate or explicitly map stale ratings before proceeding in the importance branch. In the skip branch, rebuild affected modules with equal neutral weights instead.

## Avoid known failures

| Temptation | Required response |
|---|---|
| “The user requested all three, so deliver all now.” | Complete the current artifact and stop at its confirmation gate. |
| “Skipping importance still requires a ratings export or quiz brief.” | The explicit skip choice authorizes direct quiz creation with existing preferences or defaults. |
| “The ratings are confirmed, so the quiz is authorized.” | Ask the four-part quiz brief and wait for explicit permission; even no preferences requires `无特殊要求，可以开始`. |
| “More levels means more value.” | Reduce levels/draws when source evidence is sparse; paraphrasing one fact repeatedly does not enlarge the bank. |
| “The source is sparse, so a three-question level is acceptable.” | Do not build that level. Merge supported material, request more source, or stop; every delivered level still draws at least five questions. |
| “A calculation needs a text or numeric field.” | Convert it to selecting a result/formula or judging a derivation. Only the three objective types are allowed. |
| “The prompt says ‘the PPT example’, so learners can look it up.” | Reproduce the complete necessary stem, conditions, formula, page and diagram in shared structured example data. |
| “A source-faithful note should show where every fact came from.” | Keep that mapping in the private extraction ledger and delivery report; the Markdown note contains no source name, page number or slide reference. |
| “The source order is inconvenient, so reorganize it by topic.” | Preserve the PPT/PDF sequence and its usable heading hierarchy; make local formatting clearer without rebuilding the knowledge system. |
| “Detailed derivations make the note more complete.” | Omit derivation steps by default. Retain the final source formula, symbol meanings, conditions and conclusions; include derivations only on explicit request. |
| “The summary slide is repetitive, so it can be skipped.” | Capture summary-labeled slides first and use them to check section structure and coverage against the surrounding source. |
| “A wrong-answer string array is enough.” | Reuse the complete versioned learning-record runtime. |
| “The weighted engine passed, so every level uses ratings.” | Validate each level's actual coverage and weighted slots; unequal ratings with no weighted slots fail. |
| “One configured correct answer proves reliable formula grading.” | Inventory source-equivalent forms and units; test accepted and rejected variants, including meaningful case differences. |

For example, a concept-only course with two supported relations may justify one short comparison level; it needs no invented equations or extra chapters.

Each delivery states: artifact link, evidence/uncertainty boundaries, checks actually run and remaining checks, what the user should inspect, and the exact input needed next. Do not claim browser or offline QA from source inspection alone.
