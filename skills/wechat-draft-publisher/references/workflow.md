# Workflow reference

## Article contract

The upload copy must begin with this frontmatter:

```yaml
---
title: Article title
summary: Concise digest
column: 公众号文章
publish_at: 2026-09-20T20:00:00+08:00
cover_prompt: Visual description with no text or logos
primary_source: https://example.com/source
---
```

Fill missing values in this order:

| Field | Rule |
|---|---|
| `title` | Existing field, first H1, then filename stem |
| `summary` | A concise factual digest derived from the body |
| `column` | Existing field, otherwise `公众号文章` |
| `publish_at` | Current Asia/Shanghai timestamp with `+08:00` |
| `cover_prompt` | Main idea plus the selected template's `coverStyle` |
| `primary_source` | Existing field, then first trustworthy non-image HTTP(S) link; otherwise ask the user |

Do not overwrite the user's original file. Preserve complete source URLs, including query strings and fragments.

## Artifact layout

```text
artifacts/wechat-drafts/<date>-<slug>/
  source.md
  article.md
  cover.png
  images/
  preview/browser.html
  preview/wechat.html
  preview/manifest.json
  draft/draft-result.json
```

For local Markdown images, copy PNG/JPEG/GIF files into `images/` and rewrite them to the project form:

```markdown
![Alt](image:filename.png "Caption | Source")
```

For a remote image, fetch only an explicit HTTP(S) image URL referenced by the article, verify its response type and size, then save it locally. Do not hotlink it in the WeChat HTML. Stop when its origin, type, or rights are unclear.

## Template and preview commands

```powershell
node src/cli.js themes --json
node src/cli.js validate <article.md>
node src/cli.js render <article.md> --out <preview> --theme <template-name>
```

The template list is authoritative. Use the canonical `id` returned by the rendered manifest. A new template is added to the project registry with an ID, Chinese name, aliases, style tokens, and `coverStyle`; the Skill workflow does not change.

## Cover contract

- Use the built-in image generation path.
- Landscape 16:9, centered crop-safe subject, clean editorial composition.
- No rendered words, brand marks, logos, UI chrome, or watermark.
- Save the selected project asset as `cover.png` without overwriting an unrelated existing file.
- Accept only PNG, JPEG, or GIF and no more than 4,194,304 bytes.

## Credentials and write gate

`configure-relay.ps1` stores the HTTPS Function URL in `%LOCALAPPDATA%\wechat-draft-publisher\relay.json` and encrypts the relay secret for the current Windows user with DPAPI in `relay-secret.dpapi`. AppID and AppSecret remain only in SCF.

The invocation helper:

1. Requires `-Confirmed` for this article.
2. Decrypts the secret only in memory.
3. Runs `wechat-diagnose --adapter relay` without the write gate.
4. Runs exactly one `draft --adapter relay --draft-enabled` with a child-only `WECHAT_DRAFT_ENABLED=1`.
5. Clears the plaintext reference and exits.

Reconfigure after rotating the relay secret:

```powershell
pwsh -NoProfile -File scripts/configure-relay.ps1
```

Remove local relay credentials:

```powershell
pwsh -NoProfile -File scripts/configure-relay.ps1 -Remove
```

## Failure handling

| Result | Action |
|---|---|
| One exact existing draft | Adopt it and report its ID |
| Multiple exact drafts | Stop for manual review |
| Ambiguous create result | Do not retry; inspect the draft box |
| `relay_auth` | Stop; reconfigure or check clock skew |
| `relay_configuration` | Run one-time configuration |
| `ip_allowlist` or `permission` | Fix cloud/WeChat configuration before retrying |
| Oversized or unsupported image | Replace or compress locally, then re-render |

The workflow ends after draft creation. The user publishes manually.
