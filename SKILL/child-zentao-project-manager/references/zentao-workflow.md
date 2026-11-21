# ZenTao Workflow Rules

## Field Defaults

- Site URL: `http://cd.ltsjs.com:7778`; if it cannot connect (connection timeout), fall back to `http://cdhome.ltsjs.com:7778` and use the fallback for every operation in that run.
- Login account: `zeochild`
- Login password: `VtezmfygnT7`
- Execution: `065` (`交易平台第二阶段`, code `P2`, project `59`). Execution `060` (`底层构建-P1`) has ended; never create stories or tasks in it.
- Story assignee: `zeochild`
- Story reviewer: `zeochild`
- Story priority: low
- Story deadline: leave blank; omit deadline or due-date fields from API submissions unless the user explicitly provides a concrete deadline.
- Story estimate: follow the [Estimate Rule](../SKILL.md#estimate-rule); set it to the exact sum of linked task estimates, with a minimum of 1 hour and increments of 0.5 hour.
- Task assignee: `zeochild`
- Task type: development
- Task priority: low. On this site low priority is `pri:1`; do not use `pri:3` unless the user explicitly asks for high priority.
- Task deadline: leave blank; omit deadline or due-date fields from API submissions unless the user explicitly provides a concrete deadline.
- Task estimate: estimate the scope conservatively, apply any appropriate AI-assisted reduction, then normalize upward under the [Estimate Rule](../SKILL.md#estimate-rule). Every task must be at least 1 hour and use 0.5-hour increments; recompute the story total from these values.
- Task start: before implementing any selected task, set it to `doing` with `POST /api.php/v1/tasks/{taskID}/start` and body `{"left":<remaining hours>}`. `left` is mandatory; omitting it fails with `『预计剩余』不能为空。`. Starting is required before code work and is separate from completing the task.

## Story Title Format

Use this title pattern for every story:

```text
[Type][Action]feature summary
```

Examples:

```text
[Feature][Create]统一首次安装与就绪核验
[Feature][Update]统一后台操作权限
[Feature][Fix]修复任务状态更新异常
```

Keep `Type` and `Action` in English. Keep the feature summary concise in Chinese unless the user explicitly asks for another language.

Follow the [Title Format Rule](../SKILL.md#title-format-rule) for general requirement wording and shared-feature title identity: choose one canonical full title for a feature and reuse it exactly across all affected products, including both prefixes. Product-specific scope belongs in each story's content and tasks. Task titles remain specific to their implementation work.

If the user's text begins with a reference number such as `1-`, `2-`, or `6-`, remove that number from the story title. The number is only a conversation pointer for understanding scope.

## Story Description Format

Write story descriptions as direct numbered content. Do not add bracketed section titles.

For story `spec`, write only the requirement content:

```text
1. ...
2. ...
3. ...
```

For story `verify`, write only the acceptance criteria:

```text
1. ...
2. ...
3. ...
```

The story `spec` must describe the intended behavior, affected scope, edge cases, and important constraints. The story `verify` must be testable and must not merely repeat the title.

Acceptance criteria in story `verify` must stay tied to the feature itself. Write criteria as observable product outcomes, such as UI display, API response, saved data, permission behavior, validation message, state transition, compatibility behavior, or edge-case handling. Do not include implementation validation commands, build commands, lint commands, test commands, or generic quality gates such as `dotnet build VOTS/VOTS.csproj -c Debug can pass without new compile errors`; those belong in task validation notes, completion summaries, or final implementation feedback. Only mention a build or CI command in story `verify` when the requested feature itself is a build, packaging, CI, or developer-tooling behavior that users must accept.

Always format story `spec` and `verify` with explicit rendered line breaks between every numbered item. Build an array of unnumbered item strings, strip any existing markers, generate `numberedItems = items.map((item, index) => `${index + 1}. ${item}`)`, then submit `numberedItems.join("<br />")` for ZenTao story rich-text fields on this site. A `<br />`-separated list without visible `1.`, `2.`, `3.` markers is invalid. Keep `numberedItems.join("\n")` only as a local plain-text form for reasoning or non-rich-text APIs. Never combine multiple numbered items into one paragraph, one HTML line, or one long string. Do not add labels such as `[functional requirements]`, `[acceptance criteria]`, or their Chinese bracketed equivalents; the ZenTao field itself already provides the context.

Before reporting success, read the rendered story detail page and verify that every consecutive numeric marker renders on its own line. Raw API values containing `\n` or `<br />` without markers are not enough, because this ZenTao site can store separators while rendering content without visible numbering. If the rendered HTML lacks both visible markers and `<br>`, `<br />`, or paragraph boundaries between numbered items, update the field again with regenerated numbered items and verify a second time.

## Bracketed Request Grouping

When the user writes requirements in bracketed groups, such as `[scope A: 1-... 2-...][scope B: ...]`, create one story for each bracketed group by default.

- The text before the colon is the story grouping and should drive the story title and scope.
- The numbered or semicolon-separated items inside the bracket are task candidates.
- Split tasks at the functional-item level, not at the implementation-micro-step level.
- Treat leading item numbers such as `1-`, `2-`, or `6-` as user conversation references only. Use them to decide which item becomes which task, but remove them from ZenTao story and task titles.
- If one bracket explicitly spans multiple products, create one story per target product inside that bracket and reuse the same canonical full feature title. Stop and ask only when the target product or plan cannot be identified safely.

## Cross-Product Story Rule

ZenTao stories belong to exactly one product. A cross-project VOIDIOV feature can be described as one user-facing feature, but it must be represented in ZenTao as one story per affected product.

1. Identify affected products before story creation by checking product codes, repository names, affected modules, API ownership, UI ownership, and user wording.
2. Create separate product stories for DCS, FDS, DCF, VOG, VOH, VHS, TSDS, VOTS, or any other affected product. For the same feature, reuse exactly the canonical full title defined by the Title Format Rule. Do not mix tasks from different products under one story.
3. Each story's `spec`, `verify`, linked tasks, estimate, and completion notes must describe only that product's scope. Mention cross-product dependencies only as context, not as implementation ownership.
4. If a mixed-product story already exists, repair it before reporting ZenTao completion: move product-specific tasks to the correct product stories when possible, or create replacement tasks under the correct stories. Then reduce the original story to its own product scope and make its task estimate total match its story estimate.
5. The final verification must confirm every affected product story is linked to execution `065`, same-feature full titles match exactly on read-back, each task belongs to the correct product story, and each story's task estimate sum equals the story estimate.

## Task Splitting Rules

Split each story into one or more tasks immediately after the story is created and approved.

Task titles should follow the same pattern as stories:

```text
[Type][Action]task summary
```

Task descriptions must explain the implementation approach in enough detail for the assignee to start work without reading the chat history. Include affected files or modules only when known from the user's context or the repository; do not invent paths. When the repository is known, name the real repository, file paths, classes, methods, route or message contract, configuration keys/defaults, protocol fields, data-flow ownership, security boundary, failure/status handling, timeout and retry semantics, compatibility constraints, and acceptance evidence.

Format task descriptions with explicit rendered line breaks between every numbered item. Build an array of unnumbered item strings, strip any existing markers, generate consecutive `1.`, `2.`, `3.` prefixes, then submit `numberedItems.join("<br />")` for ZenTao rich-text task fields on this site. A `<br />`-separated list without visible numeric markers is invalid. Keep `numberedItems.join("\n")` only as a local plain-text form for reasoning or non-rich-text APIs. Never combine multiple numbered items into one paragraph, one HTML line, or one long string. Do not add labels such as `[implementation scope]`, `[validation requirements]`, or their Chinese bracketed equivalents; start directly with the actionable numbered content.

Before reporting success, read every created or updated task in the rendered task detail page and verify that every consecutive numeric marker renders on its own line. Raw API values containing `\n` or `<br />` without markers are not enough. If the rendered HTML lacks visible markers and `<br>`, `<br />`, or paragraph boundaries between numbered items, update the field again with regenerated numbered items and verify a second time.

Do not copy user-provided leading reference numbers into task titles. If keeping the mapping is useful, write a short source-number line in the task description instead.

Use one task for simple work that can be completed as a single implementation unit. Use multiple implementation tasks when the story naturally separates into user-provided functional items, backend, frontend, database, migration, or deployment work. Never create a standalone `Test`, `测试`, `QA`, regression, or validation-only task, and never create a standalone documentation task such as `[Doc]`, `[文档]`, `README 更新`, or `说明文档编写`; required README, project rule, interface, and deployment document changes belong to the implementation task that owns the affected behavior. Put test cases, negative paths, security checks, acceptance evidence, and validation commands into the related implementation task description and completion note. The task estimate total must equal the story estimate exactly.

## Test Task Prohibition

Never create a standalone test task, regardless of whether the request mentions testing or regression. A task is invalid when its title, type, module, or sole purpose is `TEST`, `[Test]`, `[测试]`, `QA`, `回归测试`, or equivalent validation-only wording. Merge those details into the related implementation task. When repairing existing ZenTao data, delete each identified test-only task individually and read back the task list to confirm no test-only task remains.

## Documentation Task Prohibition

Never create a standalone documentation task. Per the user's instruction of 2026-10-26, a task is invalid when its title, module, type, or sole purpose is `[Doc]`, `[文档]`, `文档更新`, `README 更新`, `说明文档编写`, or equivalent documentation-only wording, even when the user asks for documentation coverage. Documentation is part of the feature that needs it.

1. Fold every documentation change into the implementation task that owns the affected code, configuration, SQL, migration, or interface; that task also updates the README, project rule, interface document, and coverage-matrix entry.
2. Never create a `[Doc]` task to absorb estimate or to make a story total match; adjust the owning implementation tasks and keep the story estimate exactly equal to their sum.
3. Never add the `注：文档任务无需代码注释 TICKET` note, because no documentation task may exist. Implementation code comments still use the linked task ID.
4. The owning implementation task's completion note states which documents were updated and whether links and configuration keys were checked.
5. When repairing existing ZenTao data, delete each standalone documentation task one by one after reading its exact ID, then recheck every affected story's task estimate total.

## Implementation Task Detail Minimum

Every implementation task description must be actionable without the chat history. When the repository is known, include the real repository path and concrete file paths, classes, methods, controllers or clients to change; describe the route or message contract, configuration keys and defaults, request/response or protocol fields, data-flow and ownership boundary, authentication and authorization behavior, error/status handling, timeout and retry semantics, compatibility constraints, and the acceptance/validation evidence to record. Do not submit placeholders such as “完善接口”“完成开发” or “补充测试”.

## Verified Creation Sequence

Use this exact sequence for routine story and task creation on the current ZenTao 17.6 site:

1. Create the story through `POST /api.php/v1/stories` with product, plan, title, low priority, assignee `zeochild`, conservative estimate, `spec`, `verify`, category, source, and keywords. Leave the story deadline blank, and do not include deadline or due-date keys unless the user explicitly provides a concrete deadline. Normalize numbered fields before creating the JSON body and submit `spec` and `verify` with explicit `<br />` separators by default.
2. If the story detail or review page does not show reviewer `zeochild`, update the story with `PUT /api.php/v1/stories/{storyID}` and body `{"reviewer":["zeochild"]}`. If the story assignee is empty, use `POST /api.php/v1/stories/{storyID}/assign` with `{"assignedTo":"zeochild"}` and verify the assignee afterward.
3. Review with `POST /api.php/v1/stories/{storyID}/review` and body `{"result":"pass","version":1}` only after reviewer setup. Confirm the story status is `active`.
4. Link the active story to execution `065` through the browser UI at `index.php?m=execution&f=linkStory&objectID=65`. The story appears inside iframe `#appIframe-execution`; check `input[type="checkbox"][value="{storyID}"]` and click the exact save button. If Browser control is unavailable, use the Headless HTTP Link Story Fallback below.
5. Verify the execution link before any task is created: `GET /api.php/v1/executions/65/stories?limit=500` must contain the story, and `GET /api.php/v1/stories/{storyID}` must show execution `65` or an equivalent execution relation.
6. Create the development task through `POST /api.php/v1/executions/65/tasks` with the `story` field set to the reviewed and execution-linked story ID. Set task assignee to `zeochild`, task priority to low (`pri:1`), omit deadline first, and set task description with explicit `<br />` separators by default. If the API rejects the create with `『截止日期』不能为空。`, resend with `deadline:"0000-00-00"` and verify the read-back deadline is blank/null.
7. Verify success with API reads: `GET /api.php/v1/executions/65/stories?limit=500`, `GET /api.php/v1/stories/{storyID}`, `GET /api.php/v1/executions/65/tasks?limit=500`, and `GET /api.php/v1/tasks/{taskID}`. Confirm the story is assigned to `zeochild`, every task is assigned to `zeochild`, every task priority is low, every newly created task remains active/open, and the total task estimate equals the story estimate.
8. When the same request also includes implementation, start every selected task before writing code: `POST /api.php/v1/tasks/{taskID}/start` with `{"left":<remaining hours>}` (read the task first when the remaining value is unknown), then verify each task reports `doing`. Do not begin implementation while a selected task is still `wait`.

Do not create tasks and do not report completion unless the execution story list contains the story. A task being in execution `065` is not enough.

## Task Start (开始任务)

Starting a task is a mandatory precondition for implementation work, independent of task completion.

- API route: `POST /api.php/v1/tasks/{taskID}/start`
- Required body: `{"left":<remaining hours>}`. The `left` field is mandatory; an omitted value is rejected with `『预计剩余』不能为空。`. Read the task detail first when the remaining hours are not already known.
- Optional body fields mirroring the web form: `assignedTo`, `realStarted`, `consumed`, `comment`.
- The task detail page also exposes the web form route `index.php?m=task&f=start&taskID={taskID}&onlybody=yes` (form fields `assignedTo`, `realStarted`, `consumed`, `left`, `status=doing`, `comment`, `uid`); use it only when the v1 API route is unavailable.
- After starting, verify the task status is `doing` with `GET /api.php/v1/tasks/{taskID}` before starting implementation.
- Starting is required before code work for every selected task; completing the task still requires explicit authorization and follows task-completion-summary.md.

## Existing Story Text Change

When changing requirement text on an existing story, use the story change route instead of ordinary story metadata update:

```text
POST /api.php/v1/stories/{storyID}/change
```

Send the current title, normalized `spec`, normalized `verify`, and reviewer `zeochild` when supported. On this ZenTao site, normalized `spec` and `verify` must use explicit `<br />` separators. Then read the rendered story page, pass review again if the status requires review, and verify that every numbered item in `spec` and `verify` is separated by rendered line breaks. If review clears the assignee, restore it with `POST /api.php/v1/stories/{storyID}/assign` and verify `assignedTo` is `zeochild`.

## Verified Product Plan Defaults

These are the current P2 plans for execution `065`. The older P1 plans (`DCS`=45, `VOTS`=43, `FDS`=44, `DCF`=46, `VOG`=51, `VOH`=53, `VHS`=54) belong to execution `060` history and must not be used for new stories.

- DCS story requests: product `4` (`ChildDataCenterService`, code `DCS`), plan `55` (`DCS-P2`).
- VOTS story requests: product `16` (`VOTS`, code `VOTS`), plan `56` (`VOTS-P2`).
- FDS story requests: product `17` (`ChildFutureDataStation`, code `FDS`), plan `57` (`FDS-P2`).
- DCF story requests: product `18` (`ChildDataCenterFront`, code `DCF`), plan `58` (`DCF-P2`).
- TSDS story requests: product `21` (`TradeStationDynamicService`, code `TSDS`), plan `59` (`TSDS-P2`).
- VOG story requests: product `23` (`VoidiovGateway`, code `VOG`), plan `60` (`VOG-P2`).
- VOH is product `25` (`VoidiovHub`, code `VOH`) and plan `61` (`VOH-P2`); use it only when the user asks to create VOH work, not when VOH is merely the style/reference target.
- VHS story requests: product `26` (`VoidiovHubService`, code `VHS`), plan `62` (`VHS-P2`).
- TSSS (product `22`, `TradeStationStaticService`) is `closed`; do not create new TSSS stories unless the user explicitly asks and the product is reopened.

## Headless HTTP Link Story Fallback

Use this fallback when Browser / in-app browser control is unavailable. It was verified on this ZenTao 17.6 site and avoids rediscovering the login, link-story, and encoding behavior.

1. Use Node REPL or direct UTF-8 Node execution for all Chinese JSON bodies. Avoid sending Chinese through PowerShell pipes or here-strings unless input/output encoding is explicitly UTF-8; otherwise ZenTao fields can become `?`. Prefer `scripts/zt.js` from the skill base directory (`login`/`get`/`post`), which implements steps 2-3 with the correct Referer, XHR, and bare-number rand handling.
2. Create a cookie jar, open `/index.php?m=user&f=login`, then request `/index.php?m=user&f=refreshRandom&t=json`.
3. Submit AJAX login to `/index.php?m=user&f=login` with `X-Requested-With: XMLHttpRequest`, `Referer: http://cd.ltsjs.com:7778/index.php?m=user&f=login`, and form fields: `account`, `password=md5(md5(rawPassword)+rand)`, `passwordStrength`, `referer=/`, `verifyRand=rand`, `keepLogin=1`, `captcha=`.
4. Open `/index.php?m=execution&f=linkStory&objectID=65&onlybody=yes` in the same cookie session and confirm the HTML contains `input name='stories[]' value='{storyID}'` plus hidden `products[{storyID}]`.
5. Post form data back to `/index.php?m=execution&f=linkStory&objectID=65&onlybody=yes` with `stories[]={storyID}` and `products[{storyID}]={productID}`.
6. Verify success with both `GET /api.php/v1/executions/65/stories?limit=500` and `GET /api.php/v1/stories/{storyID}`. The execution story list must contain the story, story `executions` must contain `65`, and actions should include `linked2execution`.

## Known API Caveats

- Story creation API does not reliably link a story into execution `065`; execution visibility must be created through the execution link-story UI and verified afterward.
- Story creation can leave the assignee empty if `assignedTo` is omitted or ignored; verify story assignee and update it to `zeochild` before completion.
- `POST /api.php/v1/executions/65/tasks` can create a task in execution `065` even when the story itself is not linked to execution `065`; this is invalid for the user's workflow and must be avoided. Never create tasks in execution `060`, which has ended.
- `POST /api.php/v1/executions/65/tasks` can create high-priority tasks if `pri` is set incorrectly. Use `pri:1` for the default low priority and verify the task priority afterward.
- Story and task deadline fields should stay blank by default. Do not infer a date from the current day, estimate, sprint, execution, or plan.
- Task create API can reject an omitted deadline with `『截止日期』不能为空。`; using `deadline:"0000-00-00"` preserves a blank/null deadline on read-back and is acceptable only after that specific error.
- Creating a story and implementing its tasks requires a factual implementation note at the end of completed work; follow task-completion-summary.md. Change task status only with explicit authorization in the current or an earlier request; do not require a separate turn or repeat an existing authorization.
- Starting a selected task before implementation is mandatory and separate from completing it. `POST /api.php/v1/tasks/{taskID}/start` needs `{"left":<remaining hours>}`; omitting `left` returns `『预计剩余』不能为空。`. A task still in `wait` must not be implemented.
- `POST /api.php/v1/tasks/{taskID}/start` can return HTTP 200 with an empty body even when the target task does not exist, so a 200 is not proof that the task started. Always read the task back with `GET /api.php/v1/tasks/{taskID}` and confirm `status` is `doing` before implementing.
- Do not put DCS/FDS/DCF or any other multi-product work under a single story. Split by product first, even if the implementation is one coordinated feature.
- User-provided numbered items are usually shorthand for the chat, not title text. Strip leading numbers from task titles and keep them only in descriptions when traceability is helpful.
- `POST /api.php/v2/stories` is not usable on this site because it hits a missing class route.
- Reviewing a story before setting reviewer `zeochild` can close the story and create a `reviewrejected` action, even if `result:"pass"` is sent.
- PowerShell JSON POST can corrupt Chinese text if UTF-8 handling is not explicit. Prefer Node `fetch` or browser form submission for Chinese ZenTao content.
- Raw execution link POST can return a normal-looking page without linking. The reliable route is Browser iframe checkbox plus the exact save button, followed by API verification.

## Stop And Ask

Ask the user before creating or changing anything when:

- The corresponding plan cannot be identified.
- The product, project, branch, module, or required ZenTao field is ambiguous and cannot be confirmed from the site.
- The requested feature is too vague to produce testable acceptance criteria.
- The requested story would require creating a task without a linked story.
- The user asks for estimates but there is not enough information to choose a conservative AI-assisted estimate.
- The site does not expose the expected execution `065`, story creation, review, or task splitting controls.
- A submission fails and the site response does not clearly indicate a safe correction.

## Completion Report

After completing ZenTao work, report:

- Story ID, title, plan, execution, estimate, assignee, reviewer, priority, and review status.
- Each task ID, title, type, assignee, priority, estimate, and current status.
- The total task estimate and whether it equals the story estimate.
- Any assumptions confirmed from the site and any unresolved issues.
- Explicitly state that execution `065` was verified to contain the story and task, and that nothing was created in the ended execution `060`. If it was not verified, do not present the work as complete.
