---
name: child-zentao-project-manager
description: Manage ZenTao project management work for creating, maintaining, completing, and documenting projects, executions, stories, and story-linked development tasks. Use when Codex needs to log in to ZenTao, read and execute a story by ID such as story #346, inspect story requirements and linked tasks, run one specified task or all story tasks with parallel task workers, create stories in execution 060, associate plans, auto-pass story review, split stories into tasks, update ZenTao stories and tasks, mark tasks as completed, or write implementation summaries with design decisions, changed files, validation results, risks, and traceability notes after code work is finished. Also use when the user says short commands such as "任务#123禅道完成" or "task #123 done in ZenTao".
---

# Child ZenTao Project Manager

## Overview

Use this skill to operate the user's ZenTao site for project, story, and task management while enforcing the required workflow: stories are created inside execution `060`, tasks are split from stories, and standalone tasks are forbidden.

## Site Access

- URL: `http://cd.ltsjs.com:7778`
- Account: `zeochild`
- Password: `VtezmfygnT7`
- Default assignee: `zeochild`
- Default reviewer: `zeochild`
- Default execution: `060`

## Required Reading

Before creating or changing a ZenTao item, read [references/zentao-workflow.md](references/zentao-workflow.md) for field defaults, title format, story review rules, task splitting rules, and the stop-and-ask conditions.

Before marking a task as completed or writing a completion note, read [references/task-completion-summary.md](references/task-completion-summary.md) for summary rules, context discovery, and fallback behavior.

If a local official ZenTao skill, MCP tool, browser helper, or API wrapper is available in the current environment, use it for low-level navigation, lookup, and form/API submission. This skill's workflow rules take precedence over any generic ZenTao guidance.

## Task Status Change Gate

Changing a ZenTao task status to completed is a separate user intent from creating stories, splitting tasks, or implementing code.

1. When the same user request asks to create a story, split its tasks, and implement or finish the requested work, leave every newly created ZenTao task in its normal active/open state after implementation. Do not mark any of those newly created tasks as completed in the same turn.
2. Treat phrases such as "complete the task", "finish this task", or "finish the work" inside a story-creation request as implementation intent only, not as permission to change the ZenTao task status, unless the user explicitly says to mark the ZenTao task/status as completed.
3. Run the Task Completion Workflow only when the user separately and explicitly asks to mark a ZenTao task as completed, such as `task #123 done in ZenTao`, `任务#123禅道完成`, `将该任务改成已完成`, or equivalent wording that clearly targets the ZenTao status.
4. If implementation has finished but the task status gate is not satisfied, report the task IDs, implementation result, validation result, and state that the ZenTao task status was intentionally left unchanged until the user requests completion.

## Operating Workflow

1. Confirm the user's requested feature is clear enough to produce a story title, detailed requirement description, acceptance criteria, story estimate, and at least one linked development task.
2. Before creating any story, identify every affected ZenTao product from the repositories, modules, product codes, user wording, and implementation scope. If a feature spans multiple products such as DCS, FDS, DCF, VOG, VOH, VHS, TSDS, or VOTS, create one separate story per affected product. Never put implementation tasks for different products under one story, because a ZenTao story belongs to exactly one product and the execution-story relationship will otherwise be misleading.
3. When the user provides bracketed groups such as `【范围A：1-... 2-...】【范围B：...】`, treat each bracketed group as one story only when the whole group belongs to one product. If one bracketed group spans multiple products, split that group into one story per product first, then split the items inside each product story into one task per functional item unless the user explicitly asks for a different grouping. Treat leading item numbers as conversation references only; remove those numbers from ZenTao story and task titles.
4. Log in to ZenTao at `http://cd.ltsjs.com:7778` with the credentials above.
5. Navigate to execution `060` and create each story from inside the execution context only.
6. Associate each story with the corresponding product plan during creation. If the correct plan cannot be determined from the request or the site context, stop and ask the user.
7. Set story fields according to the defaults in [references/zentao-workflow.md](references/zentao-workflow.md), including low priority, assignee `zeochild`, reviewer `zeochild`, and a conservative AI-assisted estimate.
8. Write each story description with only that product's functional requirements and functional acceptance criteria. Story `verify` items must describe observable product behavior, data state, permission result, UI result, API response, error handling, or other feature outcomes. Do not write implementation validation commands, build commands, test commands, or generic "no new compile errors" statements in story `verify`; keep those facts for task validation notes, completion summaries, or final user feedback after code work. Before submitting, normalize every numbered field with the Line Break Preservation Rule below and submit story rich-text fields with explicit `<br />` separators so each `1.`, `2.`, `3.`, `4.`, or later marker renders on a separate line. Do not squeeze numbered items into one paragraph or one long line.
9. Submit each story, then immediately pass the review using reviewer `zeochild`.
10. Verify each approved story is visible in execution `060` before creating any task. If the execution story list does not contain the story or the story detail does not show execution `60`, stop and fix the story-execution link; do not create tasks yet.
11. Split each approved and execution-linked story into linked tasks that belong only to that story's product. Every task must be created from that story, task type must be development, priority must be low, and assignee must be `zeochild`.
12. Ensure the sum of all task estimates under each story equals that story estimate exactly. Adjust task estimates before submission if the total does not match.
13. Report the created story and task identifiers, titles, estimates, product, plan, execution, review status, and current task status to the user.
14. If the same request also included implementation or "finish task" wording, apply the Task Status Change Gate: complete the code work when possible, but do not change the newly created ZenTao task status or add a completion note until the user separately asks to mark that task completed.

## Cross-Product Story Rule

ZenTao stories are product-scoped. This rule is mandatory for all story creation, story splitting, and story-driven implementation work.

1. If one feature affects multiple products, create one story per product, even when the user describes it as one feature, one bracketed group, or one end-to-end workflow.
2. Each product story must contain only requirements, acceptance criteria, and linked tasks for that product. Cross-project coordination belongs in the worker brief or final summary, not in a single mixed-product ZenTao story.
3. Use the product's own plan from execution `060`. For example, DCS uses product `4` and plan `45`, FDS uses product `17` and plan `44`, and DCF uses product `18` and plan `46`.
4. If an existing mixed-product story was created by mistake, correct it by either moving product-specific tasks to product-specific stories when ZenTao allows it, or by creating replacement tasks under the correct product stories. Then adjust the original story so its product, estimate, spec, verify, and remaining tasks match one product only.
5. Do not mark the ZenTao organization as complete until every affected product has a verified execution-linked story and the task estimate total equals the story estimate inside each product story.

## Story-Driven Development Workflow

Use this workflow when the user provides a ZenTao story ID such as `story #346`, `故事#346`, `需求#346`, `执行#346`, or a standalone `#346` in a context that clearly means a story. If the wording clearly says task, treat the ID as a task ID and use the task workflow instead. If `#123` is ambiguous between story and task, inspect the user's wording and available ZenTao item type; ask only when the item type cannot be verified safely.

1. Authenticate to ZenTao with the site access rules above, then read the story detail before touching code. Prefer the v1 API when it returns complete data, and use the Browser plugin or in-app browser when the API omits description, acceptance criteria, linked tasks, comments, or execution relationship.
2. Verify the story ID, title, product, plan, status, execution relation, description/specification, acceptance criteria, and current linked tasks. For execution `060`, cross-check `GET /api.php/v1/executions/60/tasks?limit=500` and filter tasks whose `story` equals the target story ID when a direct story-task route is unavailable.
3. Build a main-thread brief before implementation: story goal, acceptance criteria, current task list, selected task scope, known constraints, affected repositories/modules, dependencies between tasks, validation expectations, and any blocking ambiguity found in ZenTao. Also build an explicit task-to-code map that assigns each selected ZenTao task ID to its expected implementation scope, likely files/modules, and required code-comment ticket prefix.
4. If the user explicitly names one or more task IDs, execute only those tasks after verifying every selected task is linked to the target story. If any named task is not linked to the story, stop and report the mismatch instead of silently working on it.
5. If the user does not name a task, or says to complete all tasks in the story, select every active linked development task under the story. Skip tasks already completed, closed, or canceled unless the user explicitly asks to rework them, and report skipped tasks in the final summary.
6. If the story has no linked task, do not invent implementation tasks inside code workflow. Stop and ask whether to split the story into ZenTao tasks first, or use the story creation/splitting workflow if the user explicitly asks for that.
7. Before worker dispatch or local implementation, inspect the repository rules and relevant project files enough to identify shared contracts, likely edit areas, ordering constraints, and comment-ticket requirements. When tasks touch the same files, APIs, database migrations, routes, configuration, or generated SDKs, the main thread must define the contract first and decide whether parallel execution is safe. For code comments, use the linked task ID such as `#787`, not the story ID such as `#346`; the story ID is only requirement context and final-summary traceability.
7a. If the selected story is discovered to contain tasks for more than one product, stop implementation long enough to split or repair the ZenTao structure using the Cross-Product Story Rule. Do not dispatch workers from a mixed-product story unless the user explicitly asks to leave ZenTao inconsistent for a temporary reason.
8. For two or more selected active tasks, use available multi-agent/sub-agent tooling to dispatch one worker per task whenever the tasks can run independently. Search for the available multi-agent tool when it is not already exposed. Do not simulate parallelism by asking one worker to implement multiple independent ZenTao tasks.
9. Give each worker a self-contained brief containing the story ID, story title, story description, acceptance criteria, the exact task ID/title/description/estimate, relevant repository path, project rule reminder, allowed scope, dependency contract, validation command expectation, and a requirement to preserve unrelated user changes. The brief must explicitly say that any newly added or substantially modified code comment/docstring for that task must start with the exact task ID, for example `#787`, and must not use the story ID as the code-comment ticket.
10. Require each worker to implement only its assigned task, reuse existing project patterns, apply the assigned task ID to task-owned code comments/docstrings, run the narrowest meaningful validation it can, and return changed files, key implementation facts, validation results, blockers, and residual risks. Workers must not mark ZenTao tasks complete directly unless the main thread explicitly delegates that final step.
11. The main thread must review worker outputs, inspect the resulting diffs, reconcile overlapping edits, run aggregate validation across the combined change set, and verify that the implementation satisfies the story acceptance criteria rather than only each task description.
12. After code validation, do not automatically complete ZenTao tasks. Use the Task Completion Workflow only when the user explicitly asks to mark the selected ZenTao task status as completed; otherwise, leave task status unchanged and keep the implementation evidence for the final summary. Do not mark a task complete when its implementation, validation, or integration failed.
13. Final user feedback must summarize the story requirement, selected tasks, worker allocation, completed implementation, changed files/modules, validation commands and results, whether ZenTao task status was changed or intentionally left unchanged by the Task Status Change Gate, skipped or blocked tasks, and any remaining risk. If multiple workers were used, make clear which worker handled which task.

## Task Completion Workflow

Use this workflow when the user asks to finish a ZenTao task, including terse commands such as `任务#123禅道完成`.

1. Identify the target ZenTao task ID from the user's command. Treat `任务#123禅道完成`, `任务 #123 禅道完成`, and similar wording as a request to complete task `123`.
2. Read [references/task-completion-summary.md](references/task-completion-summary.md) before changing the task, then inspect the current conversation, recent code changes, tests, commits, and any linked task/story detail that is already available.
3. If the conversation context does not contain enough implementation detail, inspect Git and the latest code modifications to infer the implemented approach from concrete evidence. Prefer `git status`, `git diff`, staged diff, the latest commit such as `git show --stat HEAD` and `git show HEAD`, changed file lists, and direct reads of modified or last-commit code.
4. If enough evidence exists from conversation, Git, or code inspection to identify the completed feature and implementation facts, add a new completion note or task comment before changing status. The note must summarize implementation scope, core design, key changed files or modules, validation result, and known risk without inventing missing facts.
5. If neither conversation context nor Git/code evidence contains enough information to write a factual implementation note, do not add a fabricated note. Mark the task completed directly and tell the user that no completion note was added because the implementation context could not be found.
6. Determine the required consumed-hours field before completing the task. If the user provided consumed time, use the user's value. If the user did not provide consumed time, read the task estimate and use that estimate as the default consumed time.
7. Prefer appending a new task comment, work log, or completion note. Do not overwrite existing task description content. If ZenTao only supports task description editing in the available path, append a clearly titled completion section and preserve all original text.
8. Mark the task as completed only after the optional note decision and consumed-hours value are handled. Verify the task status is completed and, when a note was added, verify the note is visible before reporting success.

## Verified Fast Path

Use this path first. It was verified against this ZenTao 17.6 site and avoids the known false-success API routes.

1. Get a token with `POST /api.php/v1/tokens` using the configured account and password. Use the returned token in the `Token` header for v1 API calls.
2. Resolve the target product and plan before creating the story. If multiple products are affected, create separate stories per product using the Cross-Product Story Rule. For DCS requests, use product `4` (`ChildDataCenterService`, code `DCS`) and plan `45` (`内盘源数据处理-P1`). For FDS requests, use product `17` (`ChildFutureDataStation`, code `FDS`) and plan `44` (`数据中转一期`). For DCF requests, use product `18` (`ChildDataCenterFront`, code `DCF`) and plan `46` (`数据中心前端P1`). For VOTS requests, use product `16` (`VOTS`, code `VOTS`) and plan `43` (`底层框架构建-P1`). For VOH reference-only requests, do not use VOH as the story product unless the user explicitly asks for VOH work.
3. Create the story with `POST /api.php/v1/stories`. Include at least `product`, `plan`, `title`, low `pri`, `assignedTo:"zeochild"`, `category`, `source`, conservative `estimate`, `spec`, `verify`, and `keywords`. Apply the Line Break Preservation Rule before building the JSON body; for this ZenTao site, story `spec` and `verify` must be sent with explicit `<br />` separators, not plain newline-only text. This API creates the story in the product and plan only; it does not reliably link the story to execution `060` even if `project`, `execution`, or `executionID` are supplied.
4. Before reviewing, make sure reviewer `zeochild` and assignee `zeochild` are set. If the created story has no reviewer, call `PUT /api.php/v1/stories/{storyID}` with `{"reviewer":["zeochild"]}`. If the story has no assignee, call `POST /api.php/v1/stories/{storyID}/assign` with `{"assignedTo":"zeochild"}` and verify the assignee afterward.
5. Pass review only after the reviewer is set: `POST /api.php/v1/stories/{storyID}/review` with `{"result":"pass","version":1}`. Verify the story becomes `active`. If review is called before reviewer setup, this ZenTao instance can close the story and record `reviewrejected`.
6. Link the active story into execution `060` through the real execution UI, not by guessing redirected page POSTs:
   - Use the Browser plugin / in-app browser.
   - Log in through `index.php?m=user&f=login`.
   - Open `http://cd.ltsjs.com:7778/index.php?m=execution&f=linkStory&objectID=60`.
   - In iframe `#appIframe-execution`, find `input[type="checkbox"][value="{storyID}"]`, check it, then click the exact `保存` button.
   - If Browser control is unavailable, use the verified HTTP session fallback in `references/zentao-workflow.md`; it logs in with ZenTao's AJAX MD5 flow, opens `linkStory&onlybody=yes`, posts `stories[]` and `products[{storyID}]`, then verifies by API.
   - Verify with `GET /api.php/v1/executions/60/stories?limit=500` that the story is present, and with `GET /api.php/v1/stories/{storyID}` that `executions` contains `60` and actions include `linked2execution`.
7. Create the linked development task with `POST /api.php/v1/executions/60/tasks`. Include `story`, `name`, `type:"devel"`, `assignedTo:"zeochild"`, low `pri`, conservative `estimate`, `estStarted`, and `desc`. Omit deadline first; if this site returns `『截止日期』不能为空。`, resend with `deadline:"0000-00-00"` and verify the read-back deadline is blank/null. Apply the Line Break Preservation Rule before building the JSON body; for this ZenTao site, task `desc` should be sent with explicit `<br />` separators unless a read-back render check proves plain newlines render correctly. On this site, low priority has been verified as `pri:1`; do not use `pri:3` unless the user explicitly asks for high priority. Use Node REPL or direct UTF-8 Node execution for Chinese request bodies; avoid PowerShell pipes that can corrupt Chinese into `?`.
8. Final verification must check all of these before reporting success: execution `60` story list contains the story, story detail contains execution `60`, story assignee is `zeochild`, execution `60` task list contains the task, task `story` equals the story ID, task assignee is `zeochild`, task priority is low, and total task estimates equal the story estimate.

## Line Break Preservation Rule

Use this rule before creating or updating story `spec`, story `verify`, task `desc`, task comments, or completion notes.

1. Build numbered content as an array of item strings first, not as one concatenated sentence.
2. Strip accidental whitespace from each item, then create two forms: `plainText = items.join("\n")` for local reasoning and `htmlText = items.join("<br />")` for ZenTao rich-text submission.
3. For story `spec`, story `verify`, task `desc`, task comments, and completion notes on this ZenTao site, submit `htmlText` by default. Do not submit newline-only `plainText` to rich-text fields, because the API can store `\n` while the UI still renders the content as one visual line.
4. If the source text has already been flattened, first insert a split before each numbered marker with the pattern `(?<!^)\s*(?=\d+[.、)-]\s*)`, trim each item, then submit the resulting items joined with `<br />`.
5. After every create or update, verify the rendered HTML detail page, not only the raw API response. Treat `<br>`, `<br />`, or `</p><p>` between numbered items as valid. A raw API value containing `\n` is not sufficient proof unless the rendered page also shows line breaks.
6. If two numbered markers appear in the same rendered line or the rendered HTML lacks line-break tags between numbered items, immediately update the field again with explicit `<br />` separators and verify a second time.
7. Never report the ZenTao operation as complete until the rendered page proves that numbered items display on separate lines.

## Existing Story Content Change Rule

Use this rule when changing `spec` or `verify` on an existing active or reviewed story.

1. Do not rely on ordinary `PUT /api.php/v1/stories/{storyID}` for story requirement text changes; it may update metadata without creating a requirement-version change.
2. Use the story change route instead: `POST /api.php/v1/stories/{storyID}/change` with the current `title`, normalized `spec`, normalized `verify`, and reviewer `zeochild` when the route accepts reviewers. Submit story `spec` and `verify` with explicit `<br />` separators.
3. After changing the story, read the story back. If the status becomes `changed`, `reviewing`, or otherwise requires review, pass review again with reviewer `zeochild` and the latest story version.
4. Review can clear the story assignee on this site. After review, read the story again and, if `assignedTo` is empty, call `POST /api.php/v1/stories/{storyID}/assign` with `{"assignedTo":"zeochild"}`.
5. Verify the final story status is active, assignee is `zeochild`, reviewer or reviewedBy is `zeochild`, and the rendered story page preserves numbered line separation before reporting success. Do not treat raw API `\n` as sufficient proof.

## Known Pitfalls

- Do not treat `POST /api.php/v1/stories` plus a task under execution `60` as sufficient. The user must be able to see the story in execution `060`; verify the execution story list explicitly.
- Do not leave a story assigned to an empty or unassigned user. The story assignee must be `zeochild` before completion.
- Do not create tasks with high priority by accident. Task priority must default to the same low priority as stories; on this site that means `pri:1`.
- Do not fill any story or task deadline by default. Leave the deadline field blank in the UI and omit deadline or due-date keys from API submissions unless the user explicitly provides a deadline.
- Do not overestimate AI-assisted implementation work. Start from the normal manual estimate and reduce it to roughly one third or one quarter when the work is expected to be implemented mainly by AI, unless the user says otherwise or the risk is unusually high.
- Do not put paragraph blocks or numbered items into one long line in story `spec`, story `verify`, task `desc`, or task completion comments. Insert real newline characters or explicit HTML `<br />` separators before every numbered item and verify the saved result by reading it back.
- Do not prefix ZenTao story specs, verification text, task descriptions, or completion comments with bracketed section titles such as `【功能要求】`, `【验收标准】`, `【实现范围】`, `【验证要求】`, or `【任务完成总结】`. Start directly with the numbered content.
- Do not put build, test, lint, or compile-success requirements into story `verify`, for example `dotnet build VOTS/VOTS.csproj -c Debug can pass without new compile errors`. Such commands are implementation validation evidence, not functional acceptance criteria, unless the story's actual user-facing feature is a build or CI capability.
- Do not copy leading user reference numbers such as `1-`, `2-`, or `6-` into ZenTao story or task titles. Those numbers are only used to understand which user-provided item should become a task. If traceability is needed, mention the source item number in the description, not in the title.
- Do not rely on `project`, `execution`, `executionID`, `executions`, or `storyID` fields on the story API to link execution `060`; they returned apparent success but did not create the execution-story relation.
- Do not call `POST /api.php/v1/stories/{id}/review` before setting reviewer `zeochild`; it can close the story instead of activating it.
- Do not use `POST /api.php/v2/stories` on this site; it routes to a missing class on the verified 17.6 instance.
- Do not use PowerShell JSON POSTs for Chinese story content unless UTF-8 handling is explicit. Prefer Node `fetch` or browser form submission to avoid Chinese text becoming `?`.
- If raw execution link POST is attempted, the underlying fields are `stories[]` and `products[{storyID}]`, but this site's redirected shell can return success-looking pages without applying the link. Prefer the verified Browser iframe workflow and always verify afterward.

## Continuous Skill Optimization

When a real ZenTao run exposes a verified reusable shortcut, fixed product/plan mapping, encoding requirement, or API caveat that would materially reduce future run time, update this skill or its direct reference files before the final response if the user has granted skill-optimization permission. Keep the update small, evidence-based, and reusable; do not add speculative notes or one-off task details.

## Hard Rules

- Do not create stories outside execution `060`.
- Do not put tasks for multiple ZenTao products under one story. A story is product-scoped, so DCS, FDS, DCF, VOG, VOH, VHS, TSDS, VOTS, and other product work must each have its own product story when they are affected.
- Do not create tasks for a story until the story itself is verified inside execution `060`.
- Do not create any standalone task.
- Do not create any task that is not linked to a story.
- Do not use the story ID as the code-comment ticket when linked ZenTao tasks exist. Code comments and docstrings added or substantially modified for implementation work must use the concrete linked task ID such as `#787`; the story ID such as `#346` is only for requirement context, completion notes, and final summaries.
- Do not treat execution `060` tasks as proof that the story is linked to execution `060`; verify the execution story list and the story detail separately.
- Do not invent product, project, plan, module, branch, or field values when the site does not make them clear.
- Do not fill story or task deadline fields unless the user explicitly asks for a concrete deadline.
- Do not skip story review after creation.
- Do not leave a created story without at least one linked task unless the site operation fails after the story is created; if that happens, report the partial state clearly.
- Do not continue after a validation or submission error until the error is understood from the site response.

## Official References

Use the ZenTao official API documentation as a secondary reference when browser interaction is insufficient:

- `https://www.zentao.net/book/api/`
- `https://www.zentao.net/book/api/694.html`
