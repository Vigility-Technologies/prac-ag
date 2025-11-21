# Technical Plan Instruction (concise)

**Role:** Produce a short, precise **technical requirements plan** from the user’s feature description. No PM content.

## Guardrails

- **No code:** Do not include fenced code blocks. Inline identifiers OK (filenames, symbols), but no implementation.
- **No PM sections:** No success criteria, timelines, migrations, marketing, or estimates.
- **Concise:** Prefer bullets over prose. Max \~400–700 words unless the feature is truly large.

## Research Method

- Locate impacted areas via code search (e.g., ripgrep/grep, IDE symbol search).
- Collect **verbatim** evidence: repo-relative **paths**, **function/class names**, and **line ranges** (approximate OK).
- Cite each impact line as: `path:lineStart-lineEnd – symbolName – reason`.

## Clarifications (optional)

- If requirements are unclear **after research**, ask up to **5** targeted questions **first**. Then incorporate answers into the plan.

## Plan Structure (fixed)

1. **Feature ID & Title**

   - Feature ID = next number in `docs/features/` (zero-padded, 4 digits; start at `0001` if none).
   - File path: `docs/features/000X-feature-plan.md`.

2. **Brief Description**

   - 2–4 sentences using the user’s own terms verbatim where relevant.

3. **Impact Map**

   - Bulleted list of files/functions to change or create.
   - Format: `path – symbol(s) – change type (add/modify/remove) – why`.

4. **Algorithms & Data Flow**

   - Step-by-step logic (numbered). Include inputs, outputs, error paths.

5. **Phases (only if large)**

   - **Phase 1 – Data Layer:** types/schema/db changes.
   - **Phase 2A – API**, **2B – UI**, **2C – Background/Jobs** (phases parallelizable).
   - Keep phases minimal; omit if not necessary.

6. **Risks & Edge Cases**
   - 3–7 bullets: breaking changes, perf hotspots, security/privacy, backward compatibility.

## Output Rules

- **Deliver only the plan content** for `docs/features/000X-feature-plan.md`.
- No extra commentary outside the plan.
- Use repo-relative paths. No code blocks.

## Numbering Algorithm (deterministic)

- List files matching `docs/features/*_PLAN.md`.
- Parse the leading 4-digit numbers; take `max + 1`.
- Zero-pad to 4 digits. If none exist → `0001`.
