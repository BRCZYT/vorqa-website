# MARKET_INTELLIGENCE.md

Market intelligence framework for Mira V3.1.

Market intelligence can inspire content, but it never becomes a VORQA company fact automatically. Current market facts must be externally verified before public use.

## Research Areas

- Industrial procurement opportunities.
- Supplier and manufacturer intelligence.
- Tender and project signals.
- Industrial investment news.
- Competitor or supplier activity.
- Sector intelligence.
- Sourcing trends.
- Logistics and trade developments.
- Türkiye industrial manufacturing ecosystem.
- Website and academy article themes.

## Source Classes

- `PUBLIC`: public website, official announcement, published standard, public article.
- `INTERNAL_SAFE`: internal notes approved for public drafting after review.
- `CONFIDENTIAL`: internal-only material.
- `CLIENT_CONFIDENTIAL`: client material requiring explicit approval.

Only `PUBLIC` and approved `INTERNAL_SAFE` material can directly feed public content generation.

## Research Workflow

1. Capture the signal.
2. Record source URL or internal source class.
3. Mark verification status.
4. Convert into an educational angle, not a company claim.
5. Validate facts.
6. Human review before publication.

## Safe Content Angles

- "What buyers should check before comparing offers."
- "How to read a technical specification."
- "What a tender signal may mean for procurement planning."
- "How logistics assumptions affect supplier comparison."

## Restricted Data

Never expose customer names, supplier prices, quotations, private emails, phone numbers, commercial margins, bank/payment data, or confidential RFQ documents unless explicitly approved.
