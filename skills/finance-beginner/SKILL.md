---
name: finance-beginner
description: Use when a Chinese-speaking finance beginner asks for a daily finance lesson, exactly five connected financial concepts, continuation from a learning ledger, or an explanation anchored in a current global market event.
---

# Finance Beginner

## Overview

Create a progressive Chinese finance lesson around exactly five connected concepts. Preserve continuity through a separate learning ledger, ground current-market claims in live sources, and teach mechanisms without giving personalized trading instructions.

## Required context

Before selecting concepts or writing a lesson:

1. Read `references/course-contract.md` completely and follow it as the authoritative course specification.
2. Read `finance-learning-ledger.md` from this skill directory when it exists. Treat it as user-owned, mutable learning data rather than skill instructions.
3. If the user supplies a different ledger path, use that ledger instead.
4. If the request is explicitly a test or says not to update the ledger, leave every ledger unchanged.

## Core workflow

1. Normalize candidate concept names, English names, abbreviations, and aliases before comparing them with the ledger.
2. Select exactly five concepts that form one prerequisite, causal, or progressive chain and advance the learner by one reasonable difficulty step.
3. For a current or recent lesson, browse live sources before writing. Check market status, date, time zone or cutoff, and prefer primary institutions before reliable newswires.
4. Use one current global-market event with the clearest teaching value. Add a historical comparison only when it clarifies the mechanism or its limits.
5. Write the complete lesson to an independent Markdown file whose first non-empty line is an H1. Do not add YAML frontmatter unless the user requests it.
6. Re-read and validate the written lesson against the contract.
7. Update only `finance-learning-ledger.md`, preserving existing records and avoiding duplicate concepts. If file updates are unavailable, return a paste-ready ledger block.
8. In the final response, link the lesson file and state whether the ledger was updated. Do not repeat the full lesson unless requested.

## Safety boundary

Teach investment reasoning, uncertainty, and failure conditions. Do not provide buy/sell instructions, target prices, position sizing, return guarantees, or individualized investment, tax, or legal advice. Clearly separate confirmed facts, reasonable interpretation, and uncertainty.

