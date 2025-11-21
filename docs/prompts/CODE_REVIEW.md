# Code Review Instruction

## Scope

Review the implementation against the attached feature plan. Identify defects, misalignments, and refactor opportunities. Keep the review technical—no PM content.

## Inputs

- **Plan:** `docs/features/000X-feature-plan.md` (attached).
- **Codebase:** current working tree.

## Method

1. Map plan ➜ code: check each file/function listed in the plan’s Impact Map.
2. Diff review: inspect changes in those areas, then scan related modules.
3. Validate data contracts end-to-end (watch snake_case vs camelCase, `{data:{}}` pitfalls).
4. Style/consistency: ensure code matches existing repo conventions.
5. Complexity triggers:
   - File > 400 LOC → flag.
   - Function > 50 LOC or cyclomatic > 10 → flag.
6. Flag over-engineering: unnecessary abstractions, duplicate layers, premature generalization.

## Findings Format

Each issue must include:

- **Severity:** `BLOCKER` | `MAJOR` | `MINOR` | `NIT`
- **Location:** `path:lineStart-lineEnd – symbol`
- **Issue:** 1–2 sentences.
- **Evidence:** short excerpt or paraphrase.
- **Fix:** concise recommendation (tiny patch snippet allowed).

Example:

- `MAJOR – src/api/user.ts:88-120 – updateUser()`  
  **Issue:** Expects `snake_case` but UI sends `camelCase`.  
  **Evidence:** Payload built in `UserForm.tsx` lines 54–67.  
  **Fix:** Normalize keys in API layer with `camelToSnake()` before POST.

## Verification Checklist

- ✅ All Impact Map items implemented or justified.
- ✅ Data alignment correct across layers.
- ✅ Style consistent with repo.
- ✅ No oversized files/functions.
- ✅ No dead/duplicate code.
- ✅ Tests updated/added.

## Output

- Write review to `docs/features/000X-feature-review.md`.
  - If `<ID>` unknown: use highest existing plan ID.
  - If no plans: use `0001-feature-review.md`.
- Keep review ≤600 words, bullet-style.

## Optional Commands

- `git diff --stat`, `git show <commit>` for evidence.
- Grep/symbol search to find references.
- Run linters/tests but do not auto-fix.
