---
name: wechat-draft-publisher
description: Use when a user provides a Markdown article and asks to format it with a named template, create a WeChat cover, preview it, or upload it through the configured Tencent SCF relay to a WeChat Official Account draft box.
---

# WeChat Draft Publisher

Turn a Markdown source into a reviewed WeChat draft. Preserve the source, enforce 逐篇确认, use the project's renderer and relay, and stop at the draft box.

## Required workflow

1. Read `references/workflow.md` completely.
2. Resolve the project root and run `node src/cli.js themes --json`; never hardcode the available templates.
3. Copy the supplied source into a new `artifacts/wechat-drafts/<date>-<slug>/source.md`. Create `article.md` beside it without modifying the original.
4. Preserve valid frontmatter. Fill missing fields as described in the reference. If no trustworthy HTTP(S) source exists, ask only for `primary_source`; never invent one.
5. Normalize supported article images into `images/`, validate the article, and render `preview/` with the canonical template.
6. **REQUIRED SUB-SKILL:** Use `imagegen` to create a project-bound 16:9 cover from the article and the selected template's `coverStyle`. Keep the focal subject crop-safe; require no text, logo, or watermark. Save it as `cover.png` and verify PNG/JPEG/GIF and at most 4 MiB.
7. Show the cover and open or link `preview/browser.html`. Summarize title, template, source URL, and any image warnings.
8. Ask for explicit confirmation for this exact article after preview. Initial requests, prior confirmations, and confirmation for another article do not satisfy this gate.
9. After confirmation, run `scripts/invoke-wechat-draft.ps1` with `-Confirmed`. If local encrypted relay configuration is missing, run `scripts/configure-relay.ps1` in a visible private PowerShell window and wait for the user to finish once.
10. Report the draft ID and artifact paths. Never call a publish endpoint.

## Stop conditions

- Unknown template: list the registry results and ask which one to use.
- Multiple matching drafts or an ambiguous create result: do not retry; ask the user to inspect the WeChat draft box.
- Relay authentication, configuration, validation, or diagnosis failure: stop after the first failure and give the safe category.
- Never place relay secrets, AppID/AppSecret, access tokens, signatures, request bodies, or image Base64 in chat, files, commands, or logs.

## Quick invocation

```powershell
pwsh -NoProfile -File scripts/invoke-wechat-draft.ps1 -ProjectRoot <project> -Article <article.md> -Cover <cover.png> -Assets <images> -Out <draft> -Theme <template> -Confirmed
```
