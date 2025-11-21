# EXPLAIN CODE WITH USER FLOW

Explain the code in the specified file(s) following this format:

## Format Requirements

1. **User-Flow Focus**: For each code block, explain:
   - **User Action**: What the user does (clicks, types, navigates, etc.)
   - **Code Response**: What happens in the code as a result
   - **Integration**: How it connects to other parts (components, services, state)

2. **Block-by-Block**: Break down by:
   - Functions/handlers (user-triggered actions)
   - State management (what data is tracked)
   - Effects/hooks (automatic behaviors)
   - Render logic (what UI is shown)

3. **Be Precise**:
   - Keep explanations concise and direct
   - Use bullet points or short paragraphs
   - Avoid unnecessary background or verbose examples
   - Focus on the specific code being explained

4. **Code References**: Use the exact format:

   ```startLine:endLine:filepath
   // code snippet
   ```

## Example Structure

**User Action:** [What user does]

**What Happens:**

- [Step 1 in code]
- [Step 2 in code]
- [Result/output]

**Integration:** [How it connects to other parts]

---

Use this format for each logical block of code, maintaining focus on the user flow perspective.
