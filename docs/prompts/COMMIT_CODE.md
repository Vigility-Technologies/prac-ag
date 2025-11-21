# Commit Workflow with Task References

## Trigger

When this file is attached and the user writes **"Commit code"** (or similar: "rcp", "commit", "push ready", "stage and commit"), follow the steps below.

## Workflow

1. **Review status**

   - If staged files exist → review and commit **only** those.
   - If no staged files → stage all changes (`git add -A`) before review.

2. **Review changes**

   - Summarize files changed, main functions/modules affected, potential risks.

3. **Commit message**

   - Use **Conventional Commits** style + task reference `000X-T<n>`.
   - Categories:
     - **fix:** Bug Fixes
     - **build:** Build System
     - **ci:** CI/CD
     - **deps:** Dependencies
     - **docs:** Documentation
     - **feat:** Features
     - **refactor:** Improvements
     - **chore:** Maintenance
     - **perf:** Performance
     - **security:** Security
     - **style:** Style
     - **test:** Testing
   - Message length scales with complexity:
     - Trivial → one-line summary (≤72 chars).
     - Moderate → summary + short body.
     - Complex → summary + detailed body with bullets.
   - Example:

     ```text
     feat(api): add audio upload endpoint (#000X-T2)

     - Accepts MP3/WAV, stores in S3
     - Triggers transcription service
     - Returns job ID for polling
     ```

4. **Commit & push**
   - Run commit with drafted message.
   - Push with `git push`.

## Output

- Show plan of what’s staged.
- Display final commit message.
- Show the exact commands executed.
