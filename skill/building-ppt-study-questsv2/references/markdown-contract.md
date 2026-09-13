# Obsidian note contract

Read the entire supplied course source. Maintain a private extraction ledger that maps content to slide/page ranges for verification; this ledger is not part of the Markdown artifact. Do not infer unreadable diagrams, complete missing equations from memory, or add remembered or external course knowledge.

## Source-first extraction

1. Inventory the source's chapter titles, section headings and slide order before drafting.
2. Search for headings or prominent text containing `知识小结`, `小结`, `本章总结`, `内容总结` or `总结`. Capture those pages/slides first and use the screenshots as high-priority evidence for structure and coverage.
3. Read the surrounding source as well. A summary slide is a coverage guide, not permission to omit qualifications, conditions or examples stated elsewhere.
4. Draft in the same knowledge-system order as the source. Reuse source headings when readable; apply only minimal normalization needed for a coherent Markdown hierarchy.
5. Do not merge distant sections, move later concepts earlier or rebuild the course into a new thematic order unless the user explicitly asks for reorganization.

## Content boundary

- Include only knowledge supported by the supplied PPT/PDF or confirmed course notes.
- Preserve definitions, final formulas, symbol meanings, conditions, conclusions, examples and distinctions between magnitudes and directed relations.
- Do not concatenate separate equalities when they describe different quantities.
- If text, a diagram or an equation is unreadable or incomplete, omit the unsupported claim and report the uncertainty separately in the delivery message.
- Do not add background explanations, typical values, examples or equations from general knowledge.

## Formula policy

By default, omit formula derivations: intermediate algebra, proof steps, substituted relations used only to reach the result, and prose that narrates those steps. Keep the final formula together with its symbol meanings, applicability conditions and source-stated conclusion. Apply the same boundary to the opening definition table: do not list a symbol or relation merely because it appears in an omitted derivation; include it only when the course independently defines or uses it as retained knowledge. Include derivations only when the user explicitly requests them.

## Readable presentation

Choose the form that exposes the relationship most directly:

| Source content | Markdown form |
|---|---|
| Several independent facts under one heading | Hierarchical bullet list |
| Ordered mechanism, method or calculation | Numbered steps |
| Two or more items with repeated comparison fields | Compact table |
| Definition, condition or exception needing emphasis | Short paragraph or callout |
| Formula with conditions | Display formula followed by a brief condition list |

Keep one main idea per paragraph. Split prose that contains multiple independent definitions, conditions or conclusions; do not replace every paragraph with a table when a short sentence is clearer.

Output order:

1. Course title.
2. New-definition table below, before introductory prose; if none, write exactly `本课无新增定义量`.
3. Course body in original logical order, first numbered section `## 一、…` (then 二、三…). Unnumbered title/table heading is allowed.
4. No source appendix or provenance block. Put unresolved readings, conflicts and extraction notes in the delivery message instead of the Markdown file.

The delivered Markdown must not contain PPT/PDF filenames, page numbers, slide numbers, `来源`/`出处` sections, parenthetical `p12`-style references, or source-tracking comments. Course content may keep numbers that are themselves part of the lesson; the private extraction ledger distinguishes those from provenance.

The definition table has these exact three columns:

| 定义量名称、符号 | 物理意义 | 包含该新定义量的本课公式 |
|---|---|---|
| Definition and `$symbol$` | Meaning in this course | `$formula$` |

For non-physics courses, “物理意义” means the course-specific meaning of a symbol, indicator or newly defined term. Include genuinely defined terms only; do not convert every mentioned concept, formula operand or derivation-only symbol into a fabricated quantity. If a definition has no source formula, write `课件未给出公式`. The no-new-quantity statement is appropriate when the course introduces no such definitions.

Standalone math uses delimiters on their own lines:

```markdown
$$
E = mc^2
$$
```

Table cells use `$…$`; never place `$$` blocks in a table. Escape literal table pipes (`\|`), including mathematical absolute-value bars, or use `\lvert` and `\rvert`. Keep each table row on one source line. Use real newlines, not literal `\n` sequences. Balance inline math on each non-block line and block delimiters across the file.

Remove vector decorations on letters by default (`\vec{B}` → `B`, `\vec B` → `B`). Preserve a direction/operator when removing it would change the question, explicitly explain it, and record any intentionally retained `\vec` using `<!-- retained-vector: reason -->` without a page or slide reference. Do not confuse vector decoration with cross products or implication arrows.

Inspect in Obsidian when available, otherwise state the actual Markdown renderer used and the Obsidian-specific preview limitation. Check the first table, a dense math section, every summary-derived section and all OCR-repaired sections. Compare the final heading sequence with the private source inventory; confirm that provenance is absent, dense paragraphs were split appropriately, no unsupported knowledge was added and derivations are absent unless requested. After delivery, ask whether the user wants importance annotation as specified in SKILL.md. If yes, obtain note confirmation before rating generation. If no, proceed directly to quiz creation using this note and the skip-branch defaults; resolve any requested note corrections first.
