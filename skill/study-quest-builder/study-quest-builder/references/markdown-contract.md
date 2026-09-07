# Obsidian note contract

Read the entire supplied course source; track slide/page ranges while extracting. Preserve meaningful formulas, conditions, definitions, examples and distinctions between magnitudes and directed relations. Do not concatenate separate equalities when they describe different quantities. Do not infer unreadable diagrams, complete missing equations from memory, or add external course knowledge.

Output order:

1. Course title.
2. New-definition table below, before introductory prose; if none, write exactly `本课无新增定义量`.
3. Course body in original logical order, first numbered section `## 一、…` (then 二、三…). Unnumbered title/table heading is allowed.
4. Source locations, unresolved readings/conflicts and clearly separated editorial notes where necessary.

The definition table has these exact three columns:

| 定义量名称、符号 | 物理意义 | 包含该新定义量的本课公式 |
|---|---|---|
| Definition and `$symbol$` | Meaning in this course | `$formula$` |

For non-physics courses, “物理意义” means the course-specific meaning of a symbol, indicator or newly defined term. Include genuinely defined terms only; do not convert every mentioned concept into a fabricated quantity. If a definition has no source formula, write `课件未给出公式`. The no-new-quantity statement is appropriate when the course introduces no such definitions.

Standalone math uses delimiters on their own lines:

```markdown
$$
E = mc^2
$$
```

Table cells use `$…$`; never place `$$` blocks in a table. Escape literal table pipes (`\|`), including mathematical absolute-value bars, or use `\lvert` and `\rvert`. Keep each table row on one source line. Use real newlines, not literal `\n` sequences. Balance inline math on each non-block line and block delimiters across the file.

Remove vector decorations on letters by default (`\vec{B}` → `B`, `\vec B` → `B`). Preserve a direction/operator when removing it would change the question, explicitly explain it, and record any intentionally retained `\vec` using `<!-- retained-vector: source location and reason -->`. Do not confuse vector decoration with cross products or implication arrows.

Inspect in Obsidian when available, otherwise state the actual Markdown renderer used and the Obsidian-specific preview limitation. Check the first table, a dense math section and all OCR-repaired sections. The user confirms this artifact before rating generation.
