# Importance rating contract

Apply this contract only when the user chooses importance annotation after the MD delivery. If they decline, skip this page and export workflow and follow the direct-quiz branch in SKILL.md; its equal internal weights are not completed user ratings.

Use only the confirmed note revision. Consolidate supported material into 1–10 comprehensive modules with stable semantic IDs. Each module has a name and `knowledgePoints` array listing included core concepts, formulas, conditions, pitfalls or applications. Keep these strings plain text; Unicode formulas work offline.

Adapt the template's `<script id="study-config" type="application/json">` block; escape `<` as `\u003c` when embedding JSON. Do not place user/source text in executable JavaScript or raw `innerHTML`. The shipped sample is labeled demonstration data and must be replaced before course delivery.

Configuration:

```json
{
  "schemaVersion": 1,
  "courseId": "stable-course-id",
  "courseTitle": "Course name",
  "noteRevision": "notes-r1",
  "theme": {"accent": "#156a66", "paper": "#f5f3eb"},
  "modules": [{"id": "module-context", "name": "Context and conditions", "knowledgePoints": ["Supported point"]}]
}
```

Export contract (all modules rated before export):

```json
{
  "schemaVersion": 1,
  "kind": "study-importance",
  "courseId": "stable-course-id",
  "courseTitle": "Course name",
  "noteRevision": "notes-r1",
  "exportedAt": "2026-09-06T12:00:00.000Z",
  "modules": [{"id": "module-context", "name": "Context and conditions", "rating": 4, "knowledgePoints": ["Supported point"]}]
}
```

Ratings are integers 1–5; absent ratings remain unrated, never silently default to a completed score. High = 4–5, medium = 3, low = 1–2. Show completed/total and these statistics. Save changes under `study-importance:v1:<courseId>:<noteRevision>`; display storage failures and recommend export when persistence is unavailable. The entire page remains functional without a network connection.

At stage 3, parse exported JSON as data. Reject malformed JSON, unsupported `schemaVersion`, incorrect `kind`/course/revision, duplicate/missing/unknown module IDs, changed knowledge-point mappings, invalid timestamps and noninteger/out-of-range ratings. Report which field is wrong and ask for a new export from the confirmed checklist or an explicitly reviewed mapping after note edits. Never silently invent/default ratings or silently accept another course's file.

The page instructs: finish rating, export JSON and return it for confirmation. After confirmation, the agent collects and confirms the quiz brief required by `SKILL.md`; only then may quiz creation begin. The agent independently honors both gates.
