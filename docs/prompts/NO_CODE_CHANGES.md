# NCC - No Code Changes

Trigger: Any query starting with `ncc` or `ncc:`

## Core Principle

Never modify, create, or delete files. Respond with explanations and suggestions only.

## Allowed

- Explain code structure and concepts
- Suggest improvements or alternatives
- Show code examples (markdown only, not executed)
- Analyze patterns, practices, and logic

## Forbidden

- File edits, creation, or deletion
- Running commands or tools
- Any actual code modifications

## Example

User: "ncc: explain this function"  
Response:  
"I’ll explain without making any code changes..."  
→ Provide explanation, show optional example code, suggest improvements.

## Response Format

Always begin with:  
"I’ll explain/suggest/analyze without making any code changes..."
