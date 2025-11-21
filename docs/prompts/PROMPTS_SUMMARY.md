# Prompts Summary

Overview of all prompt files and their purposes.

## ADD_TO_LINEAR.md

- **Purpose:** Create Linear issues from template
- **Key rules:** Extract info from template sections; use 'D' for defaults (Priority: No priority, Status: Todo, Label: Feature); ask for missing required fields; create issue via Linear MCP tools

## BE_PRECISE.md

- **Purpose:** General response style guide
- **Key rules:** Concise, direct responses; avoid verbose explanations; prefer bullets/one-liners; assume user understands repo context

## BE_PRECISE_API.md

- **Purpose:** Format for explaining API endpoints
- **Key rules:** Use structured ASCII diagrams (trees/flowcharts); mark optional fields; include validation, processing flow, returns, error handling; list related DB tables

## BE_ENDPOINTS_IN_FE_EXPLANATION.md

- **Purpose:** Document backend endpoints used in frontend components
- **Key rules:** Search for API calls (fetch/axios/services); document endpoints with BE_PRECISE_API format; group by feature; include only endpoints actually called

## PLAN_FEATURE.md

- **Purpose:** Create technical requirements plan from feature description
- **Key rules:** No code blocks; no PM content; cite code locations (path:lineStart-lineEnd); max ~400-700 words; structure: Feature ID, Description, Impact Map, Algorithms, Phases (if large), Risks

## PLAN_TASKS.md

- **Purpose:** Task planning and development workflow
- **Key rules:** Soft cap 100 diff lines per subtask; split on complexity signals; max 2 subtasks in flight; reference format `000X-T<n>`; quality gates: lint, tests, docs

## COMMIT_CODE.md

- **Purpose:** Commit workflow with task references
- **Key rules:** Trigger on "Commit code"; review staged files; use Conventional Commits + `000X-T<n>`; message scales with complexity; commit and push

## NO_CODE_CHANGES.md

- **Purpose:** No-code-change mode
- **Key rules:** Trigger on `ncc` or `ncc:`; explain only, no file edits; show examples in markdown; start response with "I'll explain/suggest/analyze without making any code changes..."

## CODE_EXPLANATION_NATURAL_LANGUAGE.md

- **Purpose:** Explain code in natural language
- **Key rules:** Explain block by block (function/class/logical section); cover Purpose, Inputs, Outputs, Integration; avoid jargon; keep brief; use examples/analogies for complex code

## FE_EXPLAIN_CODE_USER_FLOW.md

- **Purpose:** Explain code with user-flow perspective
- **Key rules:** Focus on user actions → code responses; break down by functions/handlers, state, effects, render logic; use code references (startLine:endLine:filepath); keep concise and direct

## CODE_REVIEW.md

- **Purpose:** Review implementation against feature plan
- **Key rules:** Map plan to code; validate data contracts; flag complexity (>400 LOC files, >50 LOC functions); format findings with severity/location/issue/evidence/fix; write to `000X-feature-review.md`
