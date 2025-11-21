# Task Planning & Development Workflow

## Scope

- Input plan: `docs/features/000X-feature-plan.md`
- Task list: `docs/features/000X-feature-tasks.md`
- Subtasks reference: `000X-T<n>` (n starts at 1)
- Commits must include Conventional Commits + `000X-T<n>`

## Core Rule

- Soft cap: **100 diff lines** (added+modified, exclude generated/lockfiles).
- Split earlier if complexity is high. Exceed only to keep semantic unit.

## Complexity Signals

Branching, abstractions/types, cyclomatic growth, API changes, DB/external integrations, async ops, error handling, docs, tests.

## Process

1. **Pre-Task Analysis**

   - Estimate LOC + list complexity signals.
   - Propose split if >100 LOC or high complexity.
   - Get approval.

2. **Subtasks**

   - ≤100 diff lines, coherent, independently testable.
   - Max 2 in flight.
   - Ticket + commit reference `<ID>-T<n>`.

3. **Execution Loop**

   - Implement only subtask scope.
   - Run lint/tests.
   - Commit + review notes.

4. **Post-Review**
   - Reviewer checks size, coherence, tests, interfaces, risks.
   - Merge or adjust before next subtask.

## Quality Gates

- Lint ✅
- Tests ✅
- Breaking changes noted ✅
- Docs updated ✅

## Anti-Patterns

Monoliths >100 LOC, mixed concerns, skipped reviews, missing tests, premature abstractions.

## Subtask Ticket Template

```text
<ID>-T<n>: <goal>
Scope: files/modules
Estimate: ~X diff lines
Complexity Signals: …
Steps: …
Interfaces: added/changed
Tests: …
Risks: …
Rationale: ≤5 lines
```

## Definition of Done

- Matches `docs/features/000X-feature-plan.md` scope
- Tests/docs updated
- Commit pushed with `000X-T<n>`
- Review notes in `docs/features/000X-feature-tasks.md`
- Reviewer sign-off
