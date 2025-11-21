# Add to Linear

When this prompt is attached with filled information below, create a Linear issue automatically. If any line is missing, ask the user for that input before proceeding.

## Instructions

1. Extract the information from the template sections below
2. If a field contains 'D', use the default value specified
3. If a field is completely missing (no text at all), ask the user for that input
4. Create the Linear issue using Linear MCP tools
5. Confirm creation with issue details

## Template

**Issue:**

```text
Issue will come here
```

**Project:**

```text
Project will come here
```

**Priority:**

```text
Priority will come here or if I type 'D', default Priority will be used, which is 'No priority'
```

- Default: No priority (0) when 'D' is provided
- Options: Urgent (1), High (2), Normal (3), Low (4), No priority (0)

**Status:**

```text
Status will come here or if I type 'D', default Status will be used which is 'Todo'
```

- Default: Todo when 'D' is provided
- Must resolve to actual status ID/name for the team

**Label:**

```text
Label will come here or if I type 'D', default Label will be used which is 'Feature'
```

- Default: Feature when 'D' is provided
- Create label if it doesn't exist, then apply it

## Processing Rules

- **Issue**: Required - if missing, ask user
- **Project**: Optional - if missing, proceed without project
- **Priority**: If 'D' or empty → use "No priority" (0)
- **Status**: If 'D' or empty → use "Todo" (resolve to team's Todo status)
- **Label**: If 'D' or empty → use "Feature" (create if needed)
- **Team**: Required by Linear - if not specified, use first available team or ask user
