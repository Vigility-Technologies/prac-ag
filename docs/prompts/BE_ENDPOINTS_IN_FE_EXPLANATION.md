# Backend Endpoints In Frontend Explanation Prompt

When analyzing a frontend component, identify and document all backend API endpoints it uses.

## Discovery Process

1. Search for API calls in the component (fetch, axios, service functions)
2. Check imported service files and API utilities
3. Identify endpoints from route definitions if applicable

## Documentation Format

For each endpoint found:

- Use the structured ASCII tree format from `./BE_PRECISE_API.md`
- Include: HTTP method, path, input structure, validation steps, processing flow, return values
- Mark optional fields as (optional)
- Include error handling and common response codes
- List related database tables/operations

## Scope

- Document only endpoints actually called in the component code
- Include endpoints called indirectly through service functions
- Provide concise summaries following `./BE_PRECISE.md` guidelines
- Group endpoints by feature/functionality when relevant

## Output Structure

1. List of endpoints (method + path)
2. Detailed breakdown for each endpoint following BE_PRECISE_API format
3. Summary section (optional) if multiple endpoints serve a common purpose
