# ZenTao Task Completion Summary

## Trigger Phrases

Use this guide when the user asks to complete a ZenTao task or uses terse commands such as:

- `task #123 done in ZenTao`
- `task #123 complete`
- Chinese phrases equivalent to "task #123 ZenTao completed"

These commands mean: find task `123`, decide whether a factual completion note can be produced from context, optionally add that note, then mark the task as completed.

If the user includes consumed time, such as `2h`, `3`, or `1.5 hours`, use that value for the required completion consumed-hours field.

## Context Discovery

Before writing a completion note, inspect available evidence in this order:

1. Current conversation details about the implemented feature.
2. Uncommitted and staged repository changes such as `git status`, `git diff`, `git diff --cached`, changed files, and test output.
3. The latest committed version when no useful uncommitted diff exists, using evidence such as `git show --stat HEAD`, `git show --name-only HEAD`, `git show HEAD`, and direct reads of files changed by `HEAD`.
4. Direct reads of modified or last-commit code files when Git shows relevant changes but the conversation does not explain the implementation.
5. Task and linked story details already visible in ZenTao.
6. User-provided implementation notes, ticket references, or acceptance criteria.

Only use facts supported by the available context. Do not infer unverified files, behavior, tests, risk, or design decisions.

## Fallback Rule

If the conversation context is not enough to identify the completed feature and implementation facts, inspect Git and the latest code modifications before giving up. Check both uncommitted changes and the latest committed `HEAD` version because code may already have been committed before the ZenTao task is completed. Use changed files and direct code inspection to create a temporary but factual implementation summary when the code clearly shows the implementation approach.

If neither conversation context nor Git/code evidence is enough to identify the completed feature and implementation facts, do not write a completion note. Complete the task directly and report clearly that no completion note was added because enough implementation context was not found.

Do not ask the user for more context unless the task ID itself is unclear or ZenTao requires a blocking field to complete the task.

## Preferred ZenTao Update Order

1. Log in or authenticate using the existing ZenTao access rules.
2. Open or read the target task and confirm it is the requested task ID.
3. Discover implementation context from chat, repository, test output, changed code, and task/story detail.
4. If chat context is thin but Git shows uncommitted, staged, or latest-commit changes, read the related files and summarize the implementation from code evidence.
5. Determine the required consumed-hours value. Use the user-provided value when present; otherwise read the task estimate and use the estimate as the default consumed time.
6. Add a completion note only when the note can be factual.
7. Mark the task as completed with the consumed-hours value.
8. Verify the completed status, consumed-hours value, and note visibility when a note was added.

## Consumed Time Rule

ZenTao requires the consumed-hours field when completing a task.

- If the user explicitly gives consumed time, use that exact value after normalizing obvious units such as `h`, `hour`, or plain numeric hours.
- If the user does not give consumed time, read the target task detail and use the task's estimated hours as the consumed-hours value.
- If the task estimate is empty, unavailable, or cannot be read from ZenTao, do not invent a value. Stop and ask the user for the consumed time because the completion form requires it.
- Report which consumed-hours value was used and whether it came from the user or the task estimate.

## Completion Note Template

Use concise Chinese text with clear line breaks. Start directly with numbered items, without a bracketed heading such as `[task completion summary]`:

```text
1. Core design: write the confirmed design and implementation approach in Chinese.
2. Key changes: list confirmed files, modules, APIs, configs, or database changes in Chinese.
3. Edge handling: describe confirmed edge cases, compatibility, security, or performance handling in Chinese.
4. Validation result: record confirmed build, test, or manual verification results in Chinese.
5. Remaining risk: write confirmed residual risk in Chinese, or state that no known risk remains.
```

Each numbered item must be on its own physical line. Never combine `1.`, `2.`, `3.`, `4.`, and `5.` into one paragraph or one long string.

## Hard Rules

- Do not fabricate a completion note from only the task ID.
- Do not skip Git and modified-code inspection merely because the conversation lacks details.
- Do not limit Git inspection to uncommitted diff; inspect the latest `HEAD` commit when the working tree has no useful task-related changes.
- Do not complete a task without filling ZenTao's required consumed-hours field.
- Do not invent consumed hours when neither the user value nor task estimate is available.
- Do not overwrite existing task description, comments, or work logs.
- Do not remove existing ZenTao content while adding a completion note.
- Do not mark a different task complete when the task ID is ambiguous.
- Do not report that a note was added unless ZenTao confirms it is visible or the API response clearly confirms creation.
