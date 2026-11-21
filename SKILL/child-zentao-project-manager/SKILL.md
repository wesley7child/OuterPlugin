---
name: child-zentao-project-manager
description: Manage ZenTao project management work for creating, maintaining, completing, and documenting projects, executions, stories, and story-linked development tasks. Use when Codex needs to log in to ZenTao, read and execute a story by ID such as story #346, inspect story requirements and linked tasks, start tasks before implementation, run one specified task or all story tasks with parallel task workers, create stories in execution 065, associate plans, auto-pass story review, split stories into tasks, update ZenTao stories and tasks, mark tasks as completed, or write implementation summaries with design decisions, changed files, validation results, risks, and traceability notes after code work is finished. Also use when the user says short commands such as "任务#123禅道完成" or "task #123 done in ZenTao".
---

# Child ZenTao Project Manager

## Overview

Use this skill to operate the user's ZenTao site for project, story, and task management while enforcing the required workflow: stories are created inside execution `065` (`交易平台第二阶段`, code `P2`, project `59`), tasks are split from stories, and standalone tasks are forbidden. Execution `060` (`底层构建-P1`) has ended and must never receive new stories or tasks.

## Site Access

- URL: `http://cd.ltsjs.com:7778`
- Fallback URL: when the primary URL cannot connect, test it once with a connect timeout of 5 seconds or less, then switch the whole run to `http://cdhome.ltsjs.com:7778` for login, API, and browser operations. Do not run retry loops and do not block asking the user; the primary site is regularly unreachable from public networks while the fallback works.
- Account: `zeochild`
- Password: `VtezmfygnT7`
- Default assignee: `zeochild`
- Default reviewer: `zeochild`
- Default execution: `065` (`交易平台第二阶段`, code `P2`, project `59`). Execution `060` (`底层构建-P1`) has ended; never create stories or tasks in it.

## Required Reading

Before creating or changing a ZenTao item, read [references/zentao-workflow.md](references/zentao-workflow.md) for field defaults, title format, story review rules, task splitting rules, and the stop-and-ask conditions.

Before finishing feature implementation, marking a task as completed, or writing a completion note, read [references/task-completion-summary.md](references/task-completion-summary.md) for the required implementation handoff, summary rules, context discovery, and fallback behavior.

Before creating versions (Build), linking stories to builds, or creating releases (发布) — for example releasing developed stories into project `059` — read [references/build-release-workflow.md](references/build-release-workflow.md) and use [scripts/zt.js](scripts/zt.js) for the HTTP session and all form submissions.

If a local official ZenTao skill, MCP tool, browser helper, or API wrapper is available in the current environment, use it for low-level navigation, lookup, and form/API submission. This skill's workflow rules take precedence over any generic ZenTao guidance.

## Task Status Start Gate

Starting a ZenTao task is a mandatory precondition of doing the work, not an optional bookkeeping step. Per the user's standing instruction of 2026-10-10, whenever a request names or implies ZenTao stories or tasks to work on, set each selected task to `doing` (开始) BEFORE writing any implementation code.

1. As soon as the target ZenTao story/task IDs are known and before touching code, start every selected task: `POST /api.php/v1/tasks/{taskID}/start` with `{"left":<current remaining hours>}`. The `left` field is mandatory; omitting it fails with `『预计剩余』不能为空。`. Read the task first to obtain its `left`/estimate when unknown.
2. Start tasks in the same batch in which they are selected. If a story request also includes implementation, start all its selected active tasks first, then begin coding. Do not begin implementation with tasks still in `wait`.
3. If the user explicitly named task IDs, start exactly those tasks. If the user said to do the whole story, start every selected active development task under it, skipping tasks already `done`, `closed`, or `canceled`.
4. Verify each task now reports `doing` before starting implementation. If a start call fails, read the site error, correct the body, and retry once; do not silently continue coding with a task still in `wait`.
5. Starting a task is separate from completing it. Starting is always required before work; completing still requires the explicit authorization in the Task Status Change Gate below.

## Task Status Change Gate

Changing a ZenTao task status to completed is a separate user intent from creating stories, splitting tasks, or implementing code.

1. When a request asks to create a story, split its tasks, and implement the work without explicit authorization to complete the ZenTao status, leave the task status unchanged after implementation. Always append the factual implementation note once the work and required validation are complete.
2. Treat phrases such as "complete the task", "finish this task", or "finish the work" inside a story-creation request as implementation intent only, not as permission to change the ZenTao task status, unless the user explicitly says to mark the ZenTao task/status as completed.
3. Run the status-changing part of the Task Completion Workflow when the user explicitly authorizes marking the ZenTao task as completed, such as `task #123 done in ZenTao`, `任务#123禅道完成`, `将该任务改成已完成`, or equivalent wording. Authorization in the current or an earlier request remains valid; it does not require a separate turn or repeated confirmation.
4. Per the user's standing instruction of 2026-10-08, completed feature work must end with concise, developer-readable implementation details in each corresponding task TICKET comment, even when status completion is not authorized. Follow [references/task-completion-summary.md](references/task-completion-summary.md), verify the note, and report its task ID and current status. Partial or failed work must not be described as completed.

## Story vs Task Content Rule

Apply this rule when writing story and task descriptions to maintain the correct level of abstraction.

**Stories are business-focused:**
- Use plain language to describe the problem, the need, and the desired outcome
- Answer "Why do we need this?", "What problem does it solve?", and "What value does it deliver?"
- Write from the user's or operator's perspective, not the developer's perspective
- Do NOT include implementation details such as file names, class names, function signatures, port numbers, thread models, or database schemas
- Example story description:
  ```
  1. FDS 目前需要分别启动两个独立服务，运维人员需要记住并执行两条启动命令，容易遗漏
  2. 两个服务各自独立启动和监控，增加了部署和维护的复杂度
  3. 需要提供一个统一的服务入口，让运维人员只需执行一条命令即可启动所有 FDS 功能
  4. 统一入口应该同时支持实时行情和历史数据查询两个核心功能
  ```

**Tasks are implementation-focused:**
- Specify exactly what code, config, or documentation needs to be changed
- Include technical details: file paths, class names, method signatures, port numbers, configuration keys, etc.
- Provide step-by-step implementation guidance for the developer
- Every implementation task must state the real repository and concrete code entry points when they are known: affected file paths, classes, methods, route or message names, configuration properties, protocol headers/body fields, data-flow boundaries, failure responses, retry/timeout behavior, and the required observable verification. Do not write a vague task such as “完成接口开发” or leave the assignee to rediscover the implementation from chat history.
- Verification, exception handling, security boundaries, compatibility constraints, and deployment/configuration notes belong in the same implementation task description; they must not be split into a standalone test task.
- Example task description:
  ```
  1. 在 FDS 根目录创建 FDSService.py 入口脚本
  2. 使用独立线程启动实时行情服务（Socket 7722）
  3. 使用独立线程启动 Tick 历史服务（HTTP 7774）
  4. 共享 MySQL 连接池、配置加载、日志模块
  ```

**Story verify vs Task completion note:**
- Story `verify` describes observable user/business outcomes: "users can do X", "the system provides Y", "operators see Z"
- Task completion notes record functional facts about what was delivered: the behavior, entry point or contract, important boundaries, and runtime requirements. They must not be labeled with categories such as `实现：`/`验证：`/`交付：` or `【验证】`/`【交付】`, and must not read as a build/test log. When the task description left a functional detail or edge case unstated, the note supplements it.

Before writing any story description, ask: "Can a non-technical stakeholder understand why this matters?" If the answer requires technical knowledge, simplify the story and move the detail to tasks.

## Title Format Rule

Apply this rule to all story and task titles before submission.

Story and task titles must follow the pattern `[Module/Layer][ActionType]功能描述`:
- **Module/Layer**: Feature, Api, Web, Gateway, Client, Service, Config, Database, etc. `Test` and `Doc` are not allowed task modules in this skill; `Doc` may only be used for a story whose own deliverable is documentation.
- **ActionType**: Create, Update, Optimize, Refactor, Fix, Delete, etc.
- Story example: `[Feature][Create]统一首次安装与就绪核验`
- Task examples: `[Api][Create]实现首次安装管理接口`, `[Web][Update]整合首次安装向导`, `[Database][Create]建立任务存储表结构`

Before creating any story or task, inspect recent stories in execution `065` to confirm the current title format convention. Never create a story or task without the `[Module][Action]` prefix unless the user explicitly overrides this rule.

For story titles, apply the user's shared-feature convention of 2026-10-10:

1. Describe the overall requirement and user-visible outcome in concise, general language. Keep product-specific responsibilities and implementation details in each product story's `spec`, `verify`, and linked tasks.
2. When one feature spans multiple products, choose one canonical full title before creating any story and reuse it verbatim for every product story of that feature. Exact equality includes both `[Module][Action]` prefixes, wording, punctuation, and spacing; using the same summary with different prefixes is insufficient.
3. Choose prefixes for the overall feature, not separately for each product's technical layer. Use `[Feature]` for a feature spanning multiple layers unless another shared module better describes the requirement. Do not add product names, product codes, per-product suffixes, or local implementation actions to distinguish these story titles.
4. For example, DCS, FDS, and DCF stories for one installation feature must all be titled `[Feature][Create]统一首次安装与就绪核验`. Their product fields, product plans, descriptions, acceptance criteria, estimates, and tasks remain product-specific. Task titles still describe their own implementation work and do not need to match across products.
5. Different features receive their own descriptive titles. A shared title identifies related stories; it does not merge products into one story or justify copying identical descriptions across products.
6. Before submission and after reading created stories back, verify every product story for the same feature has exactly the canonical full title. Existing title examples and recent site conventions do not override this rule. Updating this skill alone does not authorize renaming existing ZenTao stories.

## Task Description Format Rule

Apply this rule to all task descriptions (`desc` field) before submission.

When a task description contains multiple items or steps:
1. Build the item array without relying on the caller to supply prefixes, then prepend the exact sequential marker (`1. `, `2. `, `3. `) to each item before joining it.
2. Use numbered format: `1. ... <br />2. ... <br />3. ...`; a `<br />` without visible numeric markers does not satisfy this rule.
3. Each item must start on a new line using `<br />` separator.
4. Keep items concise but complete.
5. Example:
   ```
   1. 在 FDS 根目录创建 FDSService.py 入口脚本<br />
   2. 使用独立线程启动实时行情服务（Socket 7722）<br />
   3. 使用独立线程启动 Tick 历史服务（HTTP 7774）<br />
   4. 共享 MySQL 连接池、配置加载、日志模块
   ```

Single-item task descriptions may use plain text without numbering.

## Test Task Prohibition

This skill must never create a standalone test task, regardless of whether the user asks for test coverage, regression verification, or an acceptance task. Before submission, reject any proposed task whose title, type, module, or description makes testing its sole purpose, including `[Test]`, `[测试]`, `TEST`, `QA`, `回归测试`, or equivalent wording. When repairing existing ZenTao data, delete such test tasks only one by one after reading their exact IDs, then verify that no test-only task remains.

## Implementation Task Detail Minimum

Every implementation task description must be actionable without the chat history. When the repository is known, include the real repository path and concrete file paths, classes, methods, controllers or clients to change; describe the route or message contract, configuration keys and defaults, request/response or protocol fields, data-flow and ownership boundary, authentication and authorization behavior, error/status handling, timeout and retry semantics, compatibility constraints, and the acceptance/validation evidence to record. Do not submit placeholders such as “完善接口”“完成开发” or “补充测试”.

## Estimate Rule

Per the user's instruction of 2026-10-11, story and task estimated hours must be at least 1 hour and use increments of 0.5 hour: 1, 1.5, 2, 2.5, and so on. Values below 1 or outside these increments are invalid, including 0.2, 0.6, 0.8, and 1.2.

Estimate each task's scope first, apply any appropriate AI-assisted reduction, then normalize upward with `Math.max(1, Math.ceil(rawEstimate * 2) / 2)`. Set each story estimate to the exact sum of its linked task estimates; never round the story independently or reduce a task below the minimum to fit a total. Validate both constraints before submission and again on read-back. The minimum applies to estimated hours, not actual consumed hours or remaining hours; completed tasks may still have zero remaining hours. An estimate-only update must preserve task status and consumed hours; for an unstarted task with zero consumption, keep remaining hours equal to its new estimate.

## Task Consolidation Rule

Apply this rule when splitting a story into tasks.

Before creating tasks, identify trivially simple work whose raw estimate is under 1 hour, or work described as "just change a config value" or "update one constant", and consolidate related work before applying the Estimate Rule:
1. Merge simple related tasks into one task when they touch the same subsystem, same file type, or share the same action type
2. Example: merge `[Config][Update]调整FDS端口` and `[Config][Update]调整DCS端口` into `[Config][Update]配置端口变更（FDS+DCS）`
3. Do not merge when:
   - The story has only one or two tasks total
   - Tasks belong to clearly different modules or layers
   - Tasks have fundamentally different action types (Create vs Delete)
   - User explicitly requested separate tasks

Estimate the consolidated scope and normalize it under the Estimate Rule, then update the description to cover all merged work and recompute the story total.

## Documentation Task Prohibition

Never create a standalone documentation task. Per the user's instruction of 2026-10-26, tasks whose title, module, type, or sole purpose is `[Doc]`, `[文档]`, `文档更新`, `README 更新`, `说明文档编写`, or equivalent wording are invalid and must not be submitted. Documentation is part of the feature that requires it, not separate bookkeeping work.

1. Fold every documentation change into the implementation task that owns the affected behavior: the same task that changes the code, configuration, SQL, migration, or interface must also update its README, project rule, interface document, and coverage-matrix entry.
2. Do not create a `[Doc]` task to absorb estimate or to reach a story total; adjust the owning implementation tasks instead and keep the story estimate equal to their sum.
3. Never add a `文档任务无需代码注释 TICKET` note, because no documentation task may exist to carry it. Code comments still use the linked implementation task ID such as `#833`.
4. Task completion notes for the owning implementation task include which requirement, interface, or deployment document was updated and whether its links and configuration keys were checked, without a separate documentation-only task.
5. When repairing existing ZenTao data, delete every standalone `[Doc]` task one by one after reading its exact ID, then re-verify each affected story's task estimate still equals the story estimate and report the adjusted totals.

The earlier `Documentation Task Ticket Rule`, which allowed `[Doc]` tasks and exempted them from code comment tickets, is revoked. Do not reintroduce it.

## Operating Workflow

1. Confirm the user's requested feature is clear enough to produce a story title, detailed requirement description, acceptance criteria, story estimate, and at least one linked development task.
2. Before creating any story, identify every affected ZenTao product from the repositories, modules, product codes, user wording, and implementation scope. If a feature spans multiple products such as DCS, FDS, DCF, VOG, VOH, VHS, TSDS, or VOTS, choose one canonical general requirement title under the Title Format Rule and create one separate story per affected product with exactly that full title. Never put implementation tasks for different products under one story, because a ZenTao story belongs to exactly one product and the execution-story relationship will otherwise be misleading.
3. When the user provides bracketed groups such as `【范围A：1-... 2-...】【范围B：...】`, treat each bracketed group as one story only when the whole group belongs to one product. If one bracketed group spans multiple products, split that group into one story per product first, then split the items inside each product story into one task per functional item unless the user explicitly asks for a different grouping. Treat leading item numbers as conversation references only; remove those numbers from ZenTao story and task titles.
4. Log in to ZenTao at `http://cd.ltsjs.com:7778` with the credentials above. If the primary URL times out within 5 seconds, switch to `http://cdhome.ltsjs.com:7778` for all remaining operations without asking.
5. Navigate to execution `065` and create each story from inside the execution context only.
6. Associate each story with the corresponding product plan during creation. If the correct plan cannot be determined from the request or the site context, stop and ask the user.
7. Set story fields according to the defaults in [references/zentao-workflow.md](references/zentao-workflow.md), including low priority, assignee `zeochild`, reviewer `zeochild`, and a conservative AI-assisted estimate. Apply the Title Format Rule to ensure the story title has the `[Module][Action]` prefix.
8. Write each story description following the Story vs Task Content Rule: use plain business language to describe the problem, need, and desired outcome; avoid technical implementation details. Story `spec` should answer "Why?", "What problem?", and "What value?". Story `verify` items must describe observable user/business outcomes from a non-technical stakeholder's perspective. Do not include implementation details (file names, class names, port numbers, thread models), validation commands, build commands, or technical test criteria in story fields; move those to task descriptions. Before submitting, normalize every numbered field with the Line Break Preservation Rule below and submit story rich-text fields with explicit `<br />` separators so each `1.`, `2.`, `3.`, `4.`, or later marker renders on a separate line. Do not squeeze numbered items into one paragraph or one long line.
9. Submit each story, then immediately pass the review using reviewer `zeochild`.
10. Verify each approved story is visible in execution `065` before creating any task. If the execution story list does not contain the story or the story detail does not show execution `65`, stop and fix the story-execution link; do not create tasks yet.
11. Split each approved and execution-linked story into linked tasks that belong only to that story's product. Every task must be created from that story, task type must be development, priority must be low, and assignee must be `zeochild`. Apply the Title Format Rule, Task Description Format Rule, Task Consolidation Rule, and Documentation Task Prohibition when creating tasks.
12. Ensure the sum of all task estimates under each story equals that story estimate exactly. Adjust task estimates before submission if the total does not match.
13. Report the created story and task identifiers, titles, estimates, product, plan, execution, review status, and current task status to the user.
14. If the request also includes implementation, start every selected task per the Task Status Start Gate before writing any code, then finish the code, integration, required documentation, and validation, and append the implementation note to each completed task before final feedback. Apply the Task Status Change Gate separately: change task status only when explicitly authorized in the current or an earlier request.

## Cross-Product Story Rule

ZenTao stories are product-scoped. This rule is mandatory for all story creation, story splitting, and story-driven implementation work.

1. If one feature affects multiple products, create one story per product, even when the user describes it as one feature, one bracketed group, or one end-to-end workflow.
2. Each product story must contain only requirements, acceptance criteria, and linked tasks for that product. Cross-project coordination belongs in the worker brief or final summary, not in a single mixed-product ZenTao story.
3. Use the product's own plan from execution `065`. For example, DCS uses product `4` and plan `55` (`DCS-P2`), FDS uses product `17` and plan `57` (`FDS-P2`), and DCF uses product `18` and plan `58` (`DCF-P2`).
4. If an existing mixed-product story was created by mistake, correct it by either moving product-specific tasks to product-specific stories when ZenTao allows it, or by creating replacement tasks under the correct product stories. Then adjust the original story so its product, estimate, spec, verify, and remaining tasks match one product only.
5. Follow the Title Format Rule: all product stories for the same feature must have exactly the same canonical full title, while their content and tasks retain each product's own scope.
6. Do not mark the ZenTao organization as complete until every affected product has a verified execution-linked story, same-feature titles match exactly on read-back, and the task estimate total equals the story estimate inside each product story.

## Story-Driven Development Workflow

Use this workflow when the user provides a ZenTao story ID such as `story #346`, `故事#346`, `需求#346`, `执行#346`, or a standalone `#346` in a context that clearly means a story. If the wording clearly says task, treat the ID as a task ID and use the task workflow instead. If `#123` is ambiguous between story and task, inspect the user's wording and available ZenTao item type; ask only when the item type cannot be verified safely.

1. Authenticate to ZenTao with the site access rules above, then read the story detail before touching code. Prefer the v1 API when it returns complete data, and use the Browser plugin or in-app browser when the API omits description, acceptance criteria, linked tasks, comments, or execution relationship.
2. Verify the story ID, title, product, plan, status, execution relation, description/specification, acceptance criteria, and current linked tasks. For execution `065`, cross-check `GET /api.php/v1/executions/65/tasks?limit=500` and filter tasks whose `story` equals the target story ID when a direct story-task route is unavailable.
3. Build a main-thread brief before implementation: story goal, acceptance criteria, current task list, selected task scope, known constraints, affected repositories/modules, dependencies between tasks, validation expectations, and any blocking ambiguity found in ZenTao. Also build an explicit task-to-code map that assigns each selected ZenTao task ID to its expected implementation scope, likely files/modules, and required code-comment ticket prefix.
4. If the user explicitly names one or more task IDs, execute only those tasks after verifying every selected task is linked to the target story. If any named task is not linked to the story, stop and report the mismatch instead of silently working on it.
5. If the user does not name a task, or says to complete all tasks in the story, select every active linked development task under the story. Skip tasks already completed, closed, or canceled unless the user explicitly asks to rework them, and report skipped tasks in the final summary.
6. If the story has no linked task, do not invent implementation tasks inside code workflow. Stop and ask whether to split the story into ZenTao tasks first, or use the story creation/splitting workflow if the user explicitly asks for that.
7. Before worker dispatch or local implementation, inspect the repository rules and relevant project files enough to identify shared contracts, likely edit areas, ordering constraints, and comment-ticket requirements. When tasks touch the same files, APIs, database migrations, routes, configuration, or generated SDKs, the main thread must define the contract first and decide whether parallel execution is safe. For code comments, use the linked task ID such as `#787`, not the story ID such as `#346`; the story ID is only requirement context and final-summary traceability.
7a. If the selected story is discovered to contain tasks for more than one product, stop implementation long enough to split or repair the ZenTao structure using the Cross-Product Story Rule. Do not dispatch workers from a mixed-product story unless the user explicitly asks to leave ZenTao inconsistent for a temporary reason.
7b. Before any worker dispatch or local implementation, start every selected task with `POST /api.php/v1/tasks/{taskID}/start` and `{"left":<current remaining hours>}` per the Task Status Start Gate, and verify each reports `doing`. This step is mandatory and must happen before code is written; a task still in `wait` must not enter implementation.
8. For two or more selected active tasks, use available multi-agent/sub-agent tooling to dispatch one worker per task whenever the tasks can run independently. Search for the available multi-agent tool when it is not already exposed. Do not simulate parallelism by asking one worker to implement multiple independent ZenTao tasks.
9. Give each worker a self-contained brief containing the story ID, story title, story description, acceptance criteria, the exact task ID/title/description/estimate, relevant repository path, project rule reminder, allowed scope, dependency contract, validation command expectation, and a requirement to preserve unrelated user changes. The brief must explicitly say that any newly added or substantially modified code comment/docstring for that task must start with the exact task ID, for example `#787`, and must not use the story ID as the code-comment ticket.
10. Require each worker to implement only its assigned task, reuse existing project patterns, apply the assigned task ID to task-owned code comments/docstrings, run the narrowest meaningful validation it can, and return changed files, key implementation facts, validation results, blockers, and residual risks. Workers must not mark ZenTao tasks complete directly unless the main thread explicitly delegates that final step.
11. The main thread must review worker outputs, inspect the resulting diffs, reconcile overlapping edits, run aggregate validation across the combined change set, and verify that the implementation satisfies the story acceptance criteria rather than only each task description.
12. After implementation, integration, required documentation, and validation are complete, append a concise factual implementation note to each corresponding task using [references/task-completion-summary.md](references/task-completion-summary.md). Write functional facts only, without category labels such as `实现：`/`验证：`/`交付：`, and use the note to supplement any functional detail or edge case the task description did not state. Complete the task status when explicitly authorized; otherwise leave status unchanged. Do not mark a task complete when its implementation, validation, or integration failed.
13. Final user feedback must summarize the story requirement, selected tasks, worker allocation, completed implementation, changed files/modules, validation commands and results, which tasks were set to `doing` before work started, whether ZenTao task status was changed or intentionally left unchanged by the Task Status Change Gate, skipped or blocked tasks, and any remaining risk. If multiple workers were used, make clear which worker handled which task.

## Task Completion Workflow

Use this workflow when the user asks to finish a ZenTao task, including terse commands such as `任务#123禅道完成`.

1. Identify the target ZenTao task ID from the user's command. Treat `任务#123禅道完成`, `任务 #123 禅道完成`, and similar wording as a request to complete task `123`.
2. Read [references/task-completion-summary.md](references/task-completion-summary.md) before changing the task, then inspect the current conversation, recent code changes, tests, commits, and any linked task/story detail that is already available.
3. If the conversation context does not contain enough implementation detail, inspect Git and the latest code modifications to infer the implemented approach from concrete evidence. Prefer `git status`, `git diff`, staged diff, the latest commit such as `git show --stat HEAD` and `git show HEAD`, changed file lists, and direct reads of modified or last-commit code.
4. If enough evidence exists from conversation, Git, or code inspection, append the concise implementation note defined in [references/task-completion-summary.md](references/task-completion-summary.md). If the same completed work already has a verified note, reuse it rather than adding a duplicate.
5. If neither conversation context nor Git/code evidence contains enough information to write a factual implementation note, do not add a fabricated note. Mark the task completed directly and tell the user that no completion note was added because the implementation context could not be found.
6. Determine the required consumed-hours field before completing the task. If the user provided consumed time, use the user's value. If the user did not provide consumed time, read the task estimate and use that estimate as the default consumed time.
7. Prefer appending a new task comment, work log, or completion note. Do not overwrite existing task description content. If ZenTao only supports task description editing in the available path, append a clearly titled completion section and preserve all original text.
8. Mark the task as completed after the factual note or evidence fallback and consumed-hours value are handled. Verify completed status, consumed time, remaining time, and rendered note visibility before reporting success.

## Verified Fast Path

Use this path first. It was verified against this ZenTao 17.6 site and avoids the known false-success API routes.

1. Get a token with `POST /api.php/v1/tokens` using the configured account and password. Use the returned token in the `Token` header for v1 API calls.
2. Resolve the target product and plan before creating the story. If multiple products are affected, create separate stories per product using the Cross-Product Story Rule. Use each product's P2 plan: DCS uses product `4` (`ChildDataCenterService`, code `DCS`) and plan `55` (`DCS-P2`); VOTS uses product `16` (`VOTS`, code `VOTS`) and plan `56` (`VOTS-P2`); FDS uses product `17` (`ChildFutureDataStation`, code `FDS`) and plan `57` (`FDS-P2`); DCF uses product `18` (`ChildDataCenterFront`, code `DCF`) and plan `58` (`DCF-P2`); TSDS uses product `21` (`TradeStationDynamicService`, code `TSDS`) and plan `59` (`TSDS-P2`); VOG uses product `23` (`VoidiovGateway`, code `VOG`) and plan `60` (`VOG-P2`); VOH uses product `25` (`VoidiovHub`, code `VOH`) and plan `61` (`VOH-P2`) only when the user explicitly asks for VOH work; VHS uses product `26` (`VoidiovHubService`, code `VHS`) and plan `62` (`VHS-P2`). The P1 plans (`45`, `43`, `44`, `46`, `51`, `53`, `54`) belong to execution `060` history and must not be used for new stories.
3. Create the story with `POST /api.php/v1/stories`. Include at least `product`, `plan`, `title`, low `pri`, `assignedTo:"zeochild"`, `category`, `source`, conservative `estimate`, `spec`, `verify`, and `keywords`. Apply the Line Break Preservation Rule before building the JSON body; for this ZenTao site, story `spec` and `verify` must be sent with explicit `<br />` separators, not plain newline-only text. This API creates the story in the product and plan only; it does not reliably link the story to execution `065` even if `project`, `execution`, or `executionID` are supplied.
4. Before reviewing, make sure reviewer `zeochild` and assignee `zeochild` are set. If the created story has no reviewer, call `PUT /api.php/v1/stories/{storyID}` with `{"reviewer":["zeochild"]}`. If the story has no assignee, call `POST /api.php/v1/stories/{storyID}/assign` with `{"assignedTo":"zeochild"}` and verify the assignee afterward.
5. Pass review only after the reviewer is set: `POST /api.php/v1/stories/{storyID}/review` with `{"result":"pass","version":1}`. Verify the story becomes `active`. If review is called before reviewer setup, this ZenTao instance can close the story and record `reviewrejected`.
6. Link the active story into execution `065` through the real execution UI, not by guessing redirected page POSTs:
   - Use the Browser plugin / in-app browser.
   - Log in through `index.php?m=user&f=login`.
   - Open `http://cd.ltsjs.com:7778/index.php?m=execution&f=linkStory&objectID=65`.
   - In iframe `#appIframe-execution`, find `input[type="checkbox"][value="{storyID}"]`, check it, then click the exact `保存` button.
   - If Browser control is unavailable, use the verified HTTP session fallback in `references/zentao-workflow.md`; it logs in with ZenTao's AJAX MD5 flow, opens `linkStory&onlybody=yes`, posts `stories[]` and `products[{storyID}]`, then verifies by API.
   - Verify with `GET /api.php/v1/executions/65/stories?limit=500` that the story is present, and with `GET /api.php/v1/stories/{storyID}` that `executions` contains `65` and actions include `linked2execution`.
7. Create the linked development task with `POST /api.php/v1/executions/65/tasks`. Include `story`, `name` (with `[Module][Action]` prefix following the Title Format Rule), `type:"devel"`, `assignedTo:"zeochild"`, low `pri`, conservative `estimate`, `estStarted`, `deadline:"0000-00-00"`, and `desc` (with numbered format following the Task Description Format Rule). The `deadline` field is mandatory on this site; always include `deadline:"0000-00-00"` when no specific deadline is required, or the API will fail with `『截止日期』不能为空。`. Apply the Line Break Preservation Rule before building the JSON body; for this ZenTao site, task `desc` must be sent with explicit `<br />` separators between numbered items. On this site, low priority has been verified as `pri:1`; do not use `pri:3` unless the user explicitly asks for high priority. Use Node REPL or direct UTF-8 Node execution for Chinese request bodies; avoid PowerShell pipes that can corrupt Chinese into `?`.
8. Final verification must check all of these before reporting success: execution `65` story list contains the story, story detail contains execution `65`, story assignee is `zeochild`, execution `65` task list contains the task, task `story` equals the story ID, task assignee is `zeochild`, task priority is low, and total task estimates equal the story estimate.
9. When the request also includes implementation, start every selected task before coding: `POST /api.php/v1/tasks/{taskID}/start` with `{"left":<remaining hours>}`, then confirm `status` is `doing` via `GET /api.php/v1/tasks/{taskID}`. See the Task Status Start Gate and Task Start section in [references/zentao-workflow.md](references/zentao-workflow.md).

## Build and Release Fast Path

Use this path when the user asks to create versions (版本/Build) for developed stories in an execution or to release versions in project `059`, such as `针对已研发完毕的故事，在执行里创建对应项目的版本，然后在项目059里发布指定的版本`. 已研发完毕 maps exactly to story stage `developed`.

1. Read [references/build-release-workflow.md](references/build-release-workflow.md) and log in with `node scripts/zt.js login` (cookie cached to `%TEMP%/zt_cookie.txt`).
2. Select stories via `GET /api.php/v1/executions/{executionID}/stories?limit=500` and `/tasks?limit=500`: keep stage `developed` stories whose linked tasks are all done, and print the full stage distribution to prove nothing else qualifies. The active execution is `65` (`交易平台第二阶段`, project 59); execution `60` (`底层构建-P1`) has ended — still resolve whichever execution currently holds the `developed` stories and use its ID in the steps below.
3. Find each story's implementing git version: search repo commits for the linked task IDs (`git log --all --oneline --grep="#824"`, or pickaxe `git log --all -S"#824"` when commit messages omit task IDs) and cross-check dates. Build and release names must be the full four-segment GIT version exactly as the implementing commit shows it (commit `B0.6.0.1-261011-…` → build and release `B0.6.0.1`); never aggregate to three segments and never invent or drop segments (user rule of 2026-10-11). When one product has several distinct four-segment versions, create one build per version and link only that version's stories, and confirm each name is unused for that product in `GET /api.php/v1/executions/{executionID}/builds`.
4. Create one build per four-segment version via the form route `POST /index.php?m=build&f=create&executionID={executionID}` (product, name = the full four-segment version, builder `zeochild`, date today, desc with `<br />` separators carrying the GIT commit evidence, random uid). The v1 API has no build-create route; do not probe it.
5. Link stories via `GET/POST /index.php?m=build&f=linkStory&buildID={id}` with repeated `stories[]` fields.
6. Release via the form route `POST /index.php?m=release&f=create&productID={p}&branch=0&projectID=59` with name (the same full four-segment version as the build), build, date today, status `normal`, desc, and `sync=true`. Sync copies the build stories into the release and automatically advances those stories' stage to `released`; never set story stages by hand.
7. Verify with API reads (`/executions/{executionID}/builds`, `/products/{p}/releases`, `/stories/{id}` stage — build and release names must equal the GIT four-segment version) and rendered spot-checks through `node scripts/zt.js get` before reporting success.

## Line Break Preservation Rule

Use this rule before creating or updating story `spec`, story `verify`, task `desc`, task comments, or completion notes.

1. Build content as an array of unnumbered item strings first, not as one concatenated sentence.
2. Strip accidental whitespace, remove any existing leading numeric marker, then generate `numberedItems = items.map((item, index) => `${index + 1}. ${item}`)`; never assume that an array or `<br />` separator makes content numbered by itself.
3. Create `plainText = numberedItems.join("\n")` for local reasoning. HTML-escape literal `&`, `<`, and `>` in each numbered item before joining the escaped items with `<br />` for rich-text submission; comparison signs and dependency ranges otherwise risk being stripped as HTML.
4. For story `spec`, story `verify`, task `desc`, task comments, and completion notes on this ZenTao site, submit `htmlText` by default. Do not submit newline-only `plainText` to rich-text fields, because the API can store `\n` while the UI still renders the content as one visual line.
5. If the source text has already been flattened, first insert a split before each numbered marker with the pattern `(?<!^)\s*(?=\d+[.、)-]\s*)`, normalize the items, regenerate consecutive markers, then submit the resulting items joined with `<br />`.
6. After every create or update, verify the rendered HTML detail page, not only the raw API response. Treat `<br>`, `<br />`, or `</p><p>` between numbered items as valid only when visible consecutive markers (`1.`, `2.`, `3.`...) are also present. A raw API value containing `\n` or `<br />` without markers is not sufficient proof.
7. If any marker is missing, duplicated, out of order, or appears on the same rendered line as the next item, immediately update the field again with regenerated numbered items and verify a second time.
8. Never report the ZenTao operation as complete until the rendered page proves that numbered items display on separate lines and the raw saved field contains the same consecutive markers.

## Existing Story Content Change Rule

Use this rule when changing `spec` or `verify` on an existing active or reviewed story.

1. Do not rely on ordinary `PUT /api.php/v1/stories/{storyID}` for story requirement text changes; it may update metadata without creating a requirement-version change.
2. Use the story change route instead: `POST /api.php/v1/stories/{storyID}/change` with the current `title`, normalized `spec`, normalized `verify`, and reviewer `zeochild` when the route accepts reviewers. Submit story `spec` and `verify` with explicit `<br />` separators.
3. After changing the story, read the story back. If the status becomes `changed`, `reviewing`, or otherwise requires review, pass review again with reviewer `zeochild` and the latest story version.
4. Review can clear the story assignee on this site. After review, read the story again and, if `assignedTo` is empty, call `POST /api.php/v1/stories/{storyID}/assign` with `{"assignedTo":"zeochild"}`.
5. Verify the final story status is active, assignee is `zeochild`, reviewer or reviewedBy is `zeochild`, and the rendered story page preserves numbered line separation before reporting success. Do not treat raw API `\n` as sufficient proof.

## Known Pitfalls

- Do not write technical implementation details in story descriptions. Stories must use plain business language to describe problems, needs, and desired outcomes from a non-technical stakeholder's perspective. File names (FDSService.py), class names, method signatures, port numbers (7722, 7774), thread models, database schemas, and configuration keys belong in task descriptions, not story descriptions. Before writing a story, ask: "Can a non-technical stakeholder understand why this matters?" If the answer requires technical knowledge, move the technical detail to tasks.
- Do not create stories or tasks without type prefix tags in titles. Story and task titles must follow the pattern `[Module/Layer][ActionType]功能描述`, where Module can be Api, Web, Gateway, Client, Service, Config, Database, etc., and ActionType can be Create, Update, Optimize, Refactor, Fix, Delete, etc. `Doc` is not a permitted task module. Before creating any story or task, inspect recent stories to confirm the current title format convention.
- Do not omit the `deadline` field when creating tasks. This site requires `deadline:"0000-00-00"` when no specific deadline is needed; task creation will fail with error `『截止日期』不能为空。` if deadline is missing. Always include `deadline:"0000-00-00"` in task creation requests unless the user provides a specific deadline.
- Do not create task descriptions without numbered format when multiple items are involved. Task `desc` must use `1. ... <br />2. ... <br />3. ...` format for multi-item descriptions to maintain clarity and match the story format convention.
- Do not create vague implementation tasks. Before submission, confirm each task description names the real repository and known file/class/method entry points, the exact interface or configuration contract, the main data flow, security and boundary behavior, failure and retry semantics, and the validation evidence expected from that implementation. Merge test-only content into the implementation task instead of creating a `[Test]` task.
- Do not create separate tasks for trivially simple work whose raw estimate is under 1 hour when related work can be consolidated. Apply the Estimate Rule after grouping; retain separate tasks when product, module, action, or user-requested scope requires it.
- Do not create standalone documentation tasks. Tasks with `[Doc]`, `[文档]`, or a documentation-only purpose are invalid; fold documentation into the implementation task that owns the changed behavior.
- Do not treat `POST /api.php/v1/stories` plus a task under execution `65` as sufficient. The user must be able to see the story in execution `065`; verify the execution story list explicitly.
- Do not leave a story assigned to an empty or unassigned user. The story assignee must be `zeochild` before completion.
- Do not create tasks with high priority by accident. Task priority must default to the same low priority as stories; on this site that means `pri:1`.
- Do not overestimate AI-assisted implementation work. Start from the normal manual estimate and reduce it to roughly one third or one quarter when appropriate, then apply the Estimate Rule's 1-hour minimum and 0.5-hour increments.
- Do not put paragraph blocks or numbered items into one long line in story `spec`, story `verify`, task `desc`, or task completion comments. Insert real newline characters or explicit HTML `<br />` separators before every numbered item and verify the saved result by reading it back.
- Do not prefix ZenTao story specs, verification text, task descriptions, or completion comments with bracketed section titles such as `【功能要求】`, `【验收标准】`, `【实现范围】`, `【验证要求】`, or `【任务完成总结】`. Start directly with the numbered content.
- Do not write completion notes as a labeled checklist. Items must not be prefixed with category labels such as `实现：`, `边界：`, `验证：`, `交付：` or `【验证】`, `【交付】`. Write the functional facts directly: what the feature does, key entry point or contract, important behavior and boundaries, and runtime requirements. The note should also supplement any functional detail or edge case the task description did not fully state.
- Do not put build, test, lint, or compile-success requirements into story `verify`, for example `dotnet build VOTS/VOTS.csproj -c Debug can pass without new compile errors`. Such commands are implementation validation evidence, not functional acceptance criteria, unless the story's actual user-facing feature is a build or CI capability.
- Do not copy leading user reference numbers such as `1-`, `2-`, or `6-` into ZenTao story or task titles. Those numbers are only used to understand which user-provided item should become a task. If traceability is needed, mention the source item number in the description, not in the title.
- Do not rely on `project`, `execution`, `executionID`, `executions`, or `storyID` fields on the story API to link execution `065`; they returned apparent success but did not create the execution-story relation.
- Do not call `POST /api.php/v1/stories/{id}/review` before setting reviewer `zeochild`; it can close the story instead of activating it.
- Do not use `POST /api.php/v2/stories` on this site; it routes to a missing class on the verified 17.6 instance.
- Do not use PowerShell JSON POSTs for Chinese story content unless UTF-8 handling is explicit. Prefer Node `fetch` or browser form submission to avoid Chinese text becoming `?`.
- If raw execution link POST is attempted, the underlying fields are `stories[]` and `products[{storyID}]`, but this site's redirected shell can return success-looking pages without applying the link. Prefer the verified Browser iframe workflow and always verify afterward.
- Build and release creation must go through the web form routes in `references/build-release-workflow.md`: `POST /api.php/v1/builds` and `POST /api.php/v1/products/{id}/builds` are 404, and `POST /api.php/v1/executions/65/builds` returns 200 with an empty body without creating anything.
- Do not name builds or releases with an aggregated three-segment version. Since the user's rule of 2026-10-11, build and release names must be the full four-segment GIT version identical to the implementing commit (e.g. `B0.6.0.1`); older site records with three-segment names (`B1.4.10`, `B0.6.0`) are history, not precedent.
- Do not run long retry loops when the primary ZenTao URL cannot connect; test once with a short timeout and switch to `http://cdhome.ltsjs.com:7778`.
- Do not begin coding for a selected story or task while its ZenTao tasks are still `wait`. `POST /api.php/v1/tasks/{taskID}/start` with `{"left":<remaining hours>}` sets status to `doing`; `left` is mandatory and an omitted value fails with `『预计剩余』不能为空。`. Start all selected tasks first, verify `doing`, then implement. A `200` from the start route is not proof of success because it can also answer `200` with an empty body for a nonexistent task; always read the task back and confirm `status` is `doing`.
- Do not confuse starting with completing. Starting is always required before implementation; marking a task completed still requires explicit user authorization under the Task Status Change Gate.
- Direct module pages without a site `Referer` header 302 to the `index&f=index&open=` deep-link wrapper, and `refreshRandom` returns a bare number instead of JSON; use `scripts/zt.js`, which handles both.

## Continuous Skill Optimization

When a real ZenTao run exposes a verified reusable shortcut, fixed product/plan mapping, encoding requirement, or API caveat that would materially reduce future run time, update this skill or its direct reference files before the final response if the user has granted skill-optimization permission. Keep the update small, evidence-based, and reusable; do not add speculative notes or one-off task details.

## Hard Rules

- Story and task estimates must follow the Estimate Rule: minimum 1 hour, increments of 0.5 hour, and story estimate exactly equal to its task estimate total.
- Do not create stories outside execution `065`.
- Do not create stories or tasks in execution `060` (`底层构建-P1`). That execution has ended; it is history only and must never receive new work.
- Do not create stories or tasks without `[Module][Action]` title prefix. Inspect recent stories first to confirm the format.
- Do not create task descriptions without numbered format when multiple items are present. Use `1. ... <br />2. ... <br />3. ...` format.
- Do not create tasks without the `deadline` field. Always include `deadline:"0000-00-00"` when no specific deadline is needed.
- Do not put tasks for multiple ZenTao products under one story. A story is product-scoped, so DCS, FDS, DCF, VOG, VOH, VHS, TSDS, VOTS, and other product work must each have its own product story when they are affected.
- Product stories for the same feature must share exactly the same full title, including `[Module][Action]` prefixes; use a general requirement description and verify title equality after creation. Keep product-specific detail in story content and task titles.
- Do not create tasks for a story until the story itself is verified inside execution `065`.
- Do not create any standalone task.
- Never create a standalone test task or any task with a test-only title/type, and never create a standalone documentation task with `[Doc]` or a documentation-only purpose. Delete existing test-only or documentation-only tasks one by one when the user asks to repair the current ZenTao work, then restore each story's task estimate total and verify the result.
- Do not create any task that is not linked to a story.
- Consolidate related trivial work before estimating, then apply the Estimate Rule; do not use sub-hour estimates for any retained story or task.
- Do not create standalone documentation tasks. Marking a task with `[Doc]` or a documentation-only purpose is forbidden; merge required README, rule, interface, and deployment document updates into the owning implementation task.
- Do not use the story ID as the code-comment ticket when linked ZenTao tasks exist. Code comments and docstrings added or substantially modified for implementation work must use the concrete linked task ID such as `#787`; the story ID such as `#346` is only for requirement context, completion notes, and final summaries.
- Do not write task completion notes as a labeled checklist with `实现：`, `边界：`, `验证：`, `交付：` or `【验证】`, `【交付】` prefixes. Record only the functional facts, and use the note to supplement any functional detail the task description did not state.
- Do not treat execution `065` tasks as proof that the story is linked to execution `065`; verify the execution story list and the story detail separately.
- Do not invent product, project, plan, module, branch, or field values when the site does not make them clear.
- Do not skip story review after creation.
- Do not leave a created story without at least one linked task unless the site operation fails after the story is created; if that happens, report the partial state clearly.
- Do not continue after a validation or submission error until the error is understood from the site response.
- Do not begin implementation for a ZenTao story or task while its selected tasks are still in `wait`. Start each selected task with `POST /api.php/v1/tasks/{taskID}/start` and `{"left":<remaining hours>}` before writing code, and verify status is `doing`.

## Official References

Use the ZenTao official API documentation as a secondary reference when browser interaction is insufficient:

- `https://www.zentao.net/book/api/`
- `https://www.zentao.net/book/api/694.html`

## Quick Reference: Complete Story Creation Example

This example demonstrates the verified workflow for creating a story with tasks in execution `065`.

```javascript
// 1. Get token
POST http://cdhome.ltsjs.com:7778/api.php/v1/tokens
{ "account": "zeochild", "password": "VtezmfygnT7" }
// Response: { "token": "..." }

// 2. Create story (with [Module][Action] title prefix, business-focused description)
POST http://cdhome.ltsjs.com:7778/api.php/v1/stories
Headers: { "Token": "..." }
Body: {
  "product": 17,  // FDS
  "plan": 57,     // FDS-P2
  "title": "[Service][Refactor]统一服务启动入口",
  "pri": 1,
  "assignedTo": "zeochild",
  "category": "feature",
  "source": "customer",
  "estimate": 3,
  // Story spec: business perspective — "why" and "what value"
  "spec": "1. FDS 目前需要分别启动两个独立服务，运维人员需要记住并执行两条启动命令，容易遗漏<br />2. 两个服务各自独立启动和监控，增加了部署和维护的复杂度<br />3. 需要提供一个统一的服务入口，让运维人员只需执行一条命令即可启动所有 FDS 功能<br />4. 统一入口应该同时支持实时行情和历史数据查询两个核心功能",
  // Story verify: user-observable outcomes — "what users can do"
  "verify": "1. 运维人员只需执行一条命令即可启动 FDS 的所有服务<br />2. 实时行情功能正常，客户端能够接收到行情推送<br />3. 历史数据查询功能正常，能够返回正确的 Tick 数据<br />4. 服务启动时能清晰显示各功能的就绪状态<br />5. 文档已更新，说明新的启动方式和使用方法",
  "keywords": "FDS,服务整合"
}
// Response: { "id": 367, ... }

// 3. Set reviewer if needed
PUT http://cdhome.ltsjs.com:7778/api.php/v1/stories/367
Headers: { "Token": "..." }
Body: { "reviewer": ["zeochild"] }

// 4. Pass review
POST http://cdhome.ltsjs.com:7778/api.php/v1/stories/367/review
Headers: { "Token": "..." }
Body: { "result": "pass", "version": 1 }

// 5. Link to execution 065 (use scripts/zt.js or browser)
node scripts/zt.js login
// Then POST form to /index.php?m=execution&f=linkStory&objectID=65
// with stories[]=367 and products[367]=17

// 6. Create tasks (with [Module][Action] prefix, deadline, numbered desc)
POST http://cdhome.ltsjs.com:7778/api.php/v1/executions/65/tasks
Headers: { "Token": "..." }
Body: {
  "story": 367,
  "name": "[Service][Create]创建统一服务入口脚本",
  "type": "devel",
  "assignedTo": "zeochild",
  "pri": 1,
  "estimate": 1,
  "estStarted": "2026-10-08",
  "deadline": "0000-00-00",  // Mandatory field
  "desc": "1. 在 FDS 根目录创建 FDSService.py 入口脚本<br />2. 使用独立线程启动实时行情服务（Socket 7722）<br />3. 使用独立线程启动 Tick 历史服务（HTTP 7774）<br />4. 共享配置和日志模块"
}
// Response: { "id": 833, ... }

// Repeat step 6 for two remaining 1-hour tasks; the three tasks total the story's 3 hours, ensuring:
// - Story descriptions use business language (problems, needs, value)
// - Task descriptions contain technical details (files, ports, implementations)
// - All task titles have [Module][Action] prefix
// - All task descriptions use numbered format with <br />
// - All tasks include deadline:"0000-00-00"
// - Simple related tasks are consolidated
// - Documentation is folded into the owning implementation task; no [Doc] task exists
// - Total task estimates equal story estimate

// 7. Verify
GET http://cdhome.ltsjs.com:7778/api.php/v1/executions/65/stories?limit=500
// Confirm story 367 is present
GET http://cdhome.ltsjs.com:7778/api.php/v1/executions/65/tasks?limit=500
// Confirm all tasks are present and linked to story 367
```

**Key Points:**
- Always use `cdhome.ltsjs.com:7778` if primary URL times out
- Stories are created in execution `065` only; execution `060` has ended and is history
- New stories use each product's P2 plan (`DCS-P2`=55, `VOTS-P2`=56, `FDS-P2`=57, `DCF-P2`=58, `TSDS-P2`=59, `VOG-P2`=60, `VOH-P2`=61, `VHS-P2`=62); the P1 plans belong to execution `060` history
- **Stories use business language** (problems, needs, value) — no file names, ports, or technical details
- **Tasks contain implementation details** (file paths, class names, ports, configurations)
- Story and task titles require `[Module][Action]` prefix
- Same-feature product stories share one general requirement title with identical prefixes and wording; task titles remain implementation-specific
- Task `deadline:"0000-00-00"` is mandatory
- Task descriptions must use numbered format with `<br />`
- Consolidate related trivial work before estimating; every retained story/task estimate starts at 1h and uses 0.5h increments
- Documentation is folded into the owning implementation task; no `[Doc]` task is created
- Verify execution link before creating tasks
