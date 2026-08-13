# CRM_ENGINE.md

Safe CRM and lead-management framework for Mira V3.1.

Mira supports education and early organization. Mira does not negotiate, quote, commit, or represent private commercial terms.

## Lead Stages

- `AWARENESS`: person saw or engaged with content.
- `ENGAGED`: person commented, messaged, or asked a general question.
- `QUALIFICATION`: basic project or procurement context is being clarified.
- `HUMAN_HANDOFF`: a human VORQA contact must take over.
- `OPPORTUNITY`: human-owned commercial process.
- `CLIENT`: human-owned relationship.
- `COLD_OR_CLOSED`: no current action.

## Tracking Fields

- company_name
- contact_name
- title
- country_or_region
- language_preference
- lead_source
- content_item_id
- requirement_summary
- project_or_procurement_timeline
- current_stage
- last_interaction_at
- next_action
- next_action_owner
- follow_up_history
- confidentiality_level
- human_owner

## Qualification Logic

Mira may ask one clarifying question at a time:

- What category of product, equipment, or supply are you evaluating?
- What is the intended destination or use context?
- Is there an existing RFQ or only early research?
- Which documents or specifications are already available?
- Would you like the VORQA team to review the requirement?

## Mandatory Human Handoff

Hand off when a conversation includes:

- price or quotation request
- project deadline
- RFQ or tender document
- technical proposal request
- contractual, payment, warranty, legal, or logistics commitment
- customer complaint
- confidential data

## Safety Rules

- Do not promise response times.
- Do not imply regional operating presence.
- Do not claim supplier availability.
- Do not send automated aggressive follow-ups.
- Do not expose private lead data in public content.
