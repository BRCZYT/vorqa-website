# Enterprise Access Hardening

Goal: minimize blocking/breakage on corporate networks and security gateways.

- FortiGuard: submit unrated domain for Business classification.
- Cisco Talos: submit content categorization/reputation review if unassigned/unknown.
- Palo Alto PAN-DB: verify and request Business and Economy if needed.
- Trend Micro: verify Safe + Business; request review if Untested/incorrect.
- Broadcom/Symantec WebPulse: verify and dispute if uncategorized/incorrect.
- Remove unused runtime Tailwind CDN dependency from public entry pages.
- Keep core site functional when analytics/fonts/enhancement CDNs are blocked.
- Preserve HTTPS redirects, HSTS and existing security headers.
