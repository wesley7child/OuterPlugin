# ZenTao Task Completion Summary

## Trigger Phrases

Use this guide at the end of feature implementation linked to ZenTao tasks, and when the user asks to complete a ZenTao task with commands such as:

- `task #123 done in ZenTao`
- `task #123 complete`
- Chinese phrases equivalent to "task #123 ZenTao completed"

These explicit status commands mean: find task `123`, append a factual note when evidence is available, then mark the task as completed. Feature implementation itself requires the note under the user's standing instruction of 2026-10-08; status completion still follows the separate authorization gate in SKILL.md.

Before implementing a selected task, set it to `doing` first with `POST /api.php/v1/tasks/{taskID}/start` and `{"left":<remaining hours>}` per the Task Status Start Gate in SKILL.md. Starting is always required before code work; it does not authorize completing the task.

If the user includes consumed time, such as `2h`, `3`, or `1.5 hours`, use that value for the required completion consumed-hours field.

## Required Feature Handoff

After the assigned feature and its required integration, documentation, and validation are complete, append implementation details to every corresponding task TICKET before final feedback. Do not wait for a separate request to write these notes. Summarize only that task's functional scope: what the feature does, key entry points or contracts, important behavior and boundaries, and runtime requirements. When the task description left a functional detail or edge case unstated, use the note to supplement it. Do not use category labels such as `实现：`/`验证：`/`交付：` or `【验证】`/`【交付】`. Verify the saved text and rendered line breaks. Reuse an existing verified note for the same work to avoid duplicate comments.

If work is partial or validation failed, report the actual gap without calling it completed. Distinguish local validation from real-service or production acceptance. This handoff requirement does not authorize deployment, release, story closure, or task status changes.

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
5. If completing task status, determine the required consumed-hours value. Use the user-provided value when present; otherwise read the task estimate and use the estimate as the default consumed time. Writing an implementation note alone does not require consumed hours.
6. Append the factual implementation note unless an identical handoff is already verified. The no-context fallback applies only when completing work whose implementation evidence cannot be found, not to feature work just implemented in this conversation.
7. When status completion is authorized, mark the task as completed with the consumed-hours value. Otherwise finish after saving and verifying the implementation note, without changing status or recording consumed time.
8. Verify rendered note visibility and line breaks; if status was changed, also verify completed status, consumed hours, and zero remaining time.

## Consumed Time Rule

ZenTao requires the consumed-hours field when completing a task.

- If the user explicitly gives consumed time, use that exact value after normalizing obvious units such as `h`, `hour`, or plain numeric hours.
- If the user does not give consumed time, read the target task detail and use the task's estimated hours as the consumed-hours value.
- If the task estimate is empty, unavailable, or cannot be read from ZenTao, do not invent a value. Stop and ask the user for the consumed time because the completion form requires it.
- Report which consumed-hours value was used and whether it came from the user or the task estimate.

## Completion Note Template

Use concise Chinese text for a developer who has not read the chat. Write only the functional facts a maintainer needs: what the feature now does, the key entry point or contract, important behavior and boundaries, and any dependency or restart/configuration requirement that affects running it. Usually 2-5 numbered items with one or two short sentences each; merge related points.

Do NOT prefix items with category labels such as `实现：`, `边界：`, `验证：`, `交付：` or bracketed equivalents such as `【验证】`, `【交付】`. Start directly with the content of each item. The labels add no information and are noise for the reader.

```text
1. 统一入口脚本 FDSService.py 同时拉起实时行情与 Tick 历史服务，两条线程共享连接池与日志。
2. 任一子服务启动失败时整体退出并返回非零码，不再出现半启动状态。
3. 启动方式由两条命令改为一条，需重启服务生效。
```

The note also supplements the task description: when the task description did not fully state a functional detail, an edge case actually handled, a behavior change, or a runtime requirement, add it here so the task records the real delivered behavior. Do not restate what the task description already says in full.

Do not repeat the story background, narrate the debugging history, list every changed file, or claim that production passed based on mocks or local tests. Do not include credentials. Do not use the note to record build/test command output as a standalone item; mention a validation result only when it is a functional fact worth keeping (for example, "已在本地对账 3 个交易日 Tick 数据一致"), not as a generic quality gate. Each item must render on its own line: prepare an array of plain-text items, HTML-escape each item's literal `&`, `<`, and `>` before joining with `<br />` for this site's rich-text field. Unescaped comparison signs or dependency ranges can be stripped as HTML and lose an entire item. Verify both the API text and the rendered task page.

If a submission response is unclear or the read-back differs, inspect the saved task/actions before retrying. Repair only the note just created by this run when it was malformed; preserve pre-existing comments and avoid duplicate notes.

## Hard Rules

- Do not fabricate a completion note from only the task ID.
- Do not prefix completion-note items with category labels such as `实现：`, `边界：`, `验证：`, `交付：`, or `【验证】`, `【交付】`. Write the functional content directly; labels are noise.
- Do not turn the note into a build/test log. Keep only functional facts; mention a validation result only when it is a fact a maintainer needs.
- Do not skip Git and modified-code inspection merely because the conversation lacks details.
- Do not limit Git inspection to uncommitted diff; inspect the latest `HEAD` commit when the working tree has no useful task-related changes.
- Do not complete a task without filling ZenTao's required consumed-hours field.
- Do not invent consumed hours when neither the user value nor task estimate is available.
- Do not overwrite pre-existing task descriptions, comments, or work logs. Repairing this run's newly created malformed note is allowed after confirming its action ID.
- Do not remove existing ZenTao content while adding a completion note.
- Do not mark a different task complete when the task ID is ambiguous.
- Do not report that a note was added unless ZenTao confirms it is visible or the API response clearly confirms creation.
