# VORQA Mira V3

Mira V3 is a safe, low-maintenance social-media content and automation operating system for VORQA Global Supply.

It is not an auto-publishing bot. It is a controlled workflow for turning verified VORQA sources into reviewed multilingual social content.

## Current Positioning

VORQA GLOBAL SUPPLY  
INDUSTRIAL PROCUREMENT & PROJECT SOLUTIONS

Main message: From Requirement to Delivery

VORQA is an international industrial procurement and project-supply coordination partner based in Turkiye.

## Workflow

1. Verified VORQA sources
2. Topic generation
3. Fact validation
4. Master content
5. LinkedIn adaptation
6. Instagram adaptation
7. Facebook adaptation
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
- `calendar/social_calendar.json`: planned publishing queue.
- `assets/templates/`: reusable visual/content templates.
- `assets/generated/`: generated visual briefs or approved generated assets.
- `automation/`: local scripts for content generation, validation, platform adaptation, and future Buffer integration.
- `analytics/performance.json`: lightweight performance tracking.

Existing root-level Mira image files are preserved for backward compatibility with existing site paths.

## Automation

All scripts are local-first and safe by default.

```powershell
python vorqa-mira/automation/generate_content.py --topic "RFQ checklist for industrial buyers"
python vorqa-mira/automation/validate_facts.py vorqa-mira/content/drafts/example.json
python vorqa-mira/automation/adapt_platforms.py vorqa-mira/content/drafts/example.json
python vorqa-mira/automation/publish_buffer.py --dry-run
```

`publish_buffer.py` does not publish unless a future implementation explicitly adds authenticated API behavior and the content is already `APPROVED` or `SCHEDULED`.

## Approval Gate

No content should move to `approved/`, `SCHEDULED`, or `PUBLISHED` without human review. Do not store secrets in this repository.
