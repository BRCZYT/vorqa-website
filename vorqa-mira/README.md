# VORQA Mira V3.1

Mira V3.1 is a safe, AI-assisted, low-maintenance social-media content operating system for VORQA Global Supply.

It is not an auto-publishing bot. It generates and organizes drafts, validates facts, prepares platform adaptations and visual briefs, and keeps human approval mandatory.

## Current Positioning

VORQA GLOBAL SUPPLY  
INDUSTRIAL PROCUREMENT & PROJECT SOLUTIONS

Main message: From Requirement to Delivery

VORQA is an international industrial procurement and project-supply coordination partner based in Türkiye.

## Platform Status

- LinkedIn: `ACTIVE`
- Instagram: `PLANNED`
- Facebook: `PLANNED`
- YouTube: `FUTURE`
- TikTok: `NOT_PRIORITIZED`
- WhatsApp Business: `CONVERSATION_CHANNEL`

Do not state or imply that Instagram or Facebook accounts already exist.

## Workflow

1. Verified VORQA sources
2. Topic generation
3. Fact validation
4. Master content
5. LinkedIn adaptation
6. Instagram adaptation for planned account
7. Facebook adaptation for planned account
8. Visual brief
9. DRAFT
10. HUMAN APPROVAL
11. APPROVED
12. Publishing queue
13. Analytics

Statuses: `IDEA`, `DRAFT`, `NEEDS_REVIEW`, `APPROVED`, `SCHEDULED`, `PUBLISHED`, `REJECTED`.

## Directory Map

- `context/`: rules and source-of-truth documents.
- `content/ideas/`: topic seeds and unexpanded concepts.
- `content/drafts/`: generated or manually drafted content awaiting review.
- `content/approved/`: human-approved content ready for scheduling.
- `content/published/`: records of content that was actually published.
- `content/archive/`: retired content and superseded notes.
- `content/index.json`: generated static dashboard index.
- `calendar/social_calendar.json`: planned queue and platform policy.
- `assets/templates/`: reusable visual/content templates.
- `assets/generated/`: generated visual briefs or approved generated assets.
- `automation/`: local scripts.
- `analytics/performance.json`: lightweight performance tracking.
- `tests/`: dependency-light test suite.

Existing root-level Mira image files are preserved for backward compatibility with existing site paths.

## AI Generation

Generation is provider-neutral and local/backend oriented:

`mira.html -> local/backend generation endpoint or CLI bridge -> AI provider -> draft JSON -> fact validation -> platform adaptation -> content/index.json -> dashboard preview`

Environment variables:

```powershell
$env:MIRA_AI_PROVIDER="mock"      # openai | anthropic | mock | disabled
$env:MIRA_AI_MODE="MOCK"          # LIVE | MOCK | DISABLED | AUTO
$env:OPENAI_API_KEY=""
$env:ANTHROPIC_API_KEY=""
```

No API key belongs in browser HTML, localStorage, or committed files.

Examples:

```powershell
python vorqa-mira/automation/generate_content.py --topic "How to prepare an industrial RFQ" --language EN --persona MIRA
python vorqa-mira/automation/adapt_platforms.py vorqa-mira/content/drafts/example.json
python vorqa-mira/automation/build_content_index.py
python vorqa-mira/automation/validate_facts.py vorqa-mira/content/drafts/example.json
python vorqa-mira/automation/publish_buffer.py --dry-run
```

`MOCK` output is clearly marked as mock. `LIVE` requires environment credentials. `DISABLED` creates no AI output.

## Approval Gate

No content should move to `approved/`, `SCHEDULED`, or `PUBLISHED` without human review. Buffer live publishing remains disabled.

## Source Classification

- `PUBLIC`: may be used in public content with normal validation.
- `INTERNAL_SAFE`: may feed public drafts only after human approval for that use.
- `CONFIDENTIAL`: never expose publicly.
- `CLIENT_CONFIDENTIAL`: never expose publicly without explicit approval.

Never expose customer names, supplier prices, quotations, private emails, phone numbers, commercial margins, bank/payment data, or confidential RFQ documents unless explicitly approved.

## Source Persistence Rule

Generated draft JSON may persist source material only for repository-safe classes:

- `PUBLIC`: source material may be stored normally.
- `INTERNAL_SAFE`: source material may be stored only when it is explicitly intended for repository-safe use.
- `CONFIDENTIAL`: raw source material may be used transiently in memory for generation, but JSON must store only `source_class`, `source_material_stored: false`, and `source_summary: null` or a sanitized non-sensitive summary.
- `CLIENT_CONFIDENTIAL`: same as `CONFIDENTIAL`, with stricter protection for customer names, RFQ text, prices, emails, phone numbers, project-specific commercial data, supplier quotations, payment data, margins, and attachments.

`content/index.json` and the dashboard must never expose raw confidential or client-confidential source material.
