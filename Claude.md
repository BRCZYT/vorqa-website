# CLAUDE.md â€” Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** â€” never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.


## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values â€” do not invent brand colors.
- VORQA logo must never be recreated, redrawn, typed, recolored, distorted, or AI-generated. Only the canonical approved logo asset may be used: `brand_assets/vorqa_official_logo.png`.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens â€” not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base â†’ elevated â†’ floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design â€” match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
# CLAUDE.md â€” Project Rules

## CSS Architecture
- All global styles go in `master.css` only. Never create new global CSS files.
- Never use inline styles. Always use CSS classes.
- All colors, font sizes, spacing must use CSS variables defined in `tokens.css`.
- Before adding any new CSS rule, check if it already exists to avoid duplication.

## Component Rules
- Max 200 lines per component file. Split if exceeded.
- Every component must have its own CSS module file (e.g. `Button.module.css`).
- No component should import styles from another component's CSS module.

## Token System
- All design tokens live in `tokens.css`.
- Never hardcode values like `#3a3a3a`, `16px`, `1.5rem` â€” always use a token.
- If a token doesn't exist for a value, add it to `tokens.css` first.

## Website â†” Document System
- Shared layout components must be in `/shared` folder.
- Routing between website and document system must use the same router.
- Shared styles must come from `master.css` and `tokens.css` only.

## General
- Before writing any code, check existing files to avoid duplication.
- Never leave TODO comments â€” either implement it or create a GitHub issue.
- Always use existing components before creating new ones.
Create all pages in turkish english and arabic
