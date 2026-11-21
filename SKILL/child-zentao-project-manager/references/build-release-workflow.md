# Build and Release Workflow Rules

## When to Use

- The user asks to create versions (版本/Build) for developed stories in an execution, or to release versions in project `059`, e.g. `针对已研发完毕的故事，在执行里创建对应项目的版本，然后在项目059里发布指定的版本`.
- 已研发完毕 maps exactly to story stage `developed`. Do not include stories with stage `released` (already published), `projected` (not started), `closed`, or `reviewing`.
- Use `scripts/zt.js` (skill base directory) for login and all web-form operations; it implements the verified session and header rules below.

## Fast Rules

- Connectivity: test the primary URL once with a connect timeout of ≤5 seconds. On failure, switch the whole run to the fallback URL `http://cdhome.ltsjs.com:7778` immediately. Do not run retry loops and do not block asking the user; both waste 10+ minutes.
- Every web request below must carry a `Referer` inside the site, or ZenTao answers 302 to `m=index&f=index&open=<base64>` deep-link protection. `scripts/zt.js` does this automatically.
- Form endpoints need `X-Requested-With: XMLHttpRequest` to return JSON `{"result":"success","message":"保存成功","locate":"..."}`; `scripts/zt.js` does this automatically.

## Verified Data Model (2026-10-13)

- Execution `65` (`交易平台第二阶段`, code `P2`) is the current active execution and belongs to project `59` (初版交易平台构建). `GET /api.php/v1/executions/65` shows `"project":59,"parent":59`. All new stories and tasks are created in `65`; it held the only `developed` stories (378/379/380) on 2026-10-11 and received builds 209/210/211 and releases 132/133/134, then stories 373/381/382 on 2026-10-15 with builds 215/216/217 and releases 138/139/140.
- Execution `60` (`底层构建-P1`) also belongs to project `59` (`"project":59,"parent":59`), but it has **ended**: every story is `released` or `closed`, no new story or task may ever be created in it, and it is used only for history lookups. (Stories 383-387 and tasks 866-873 were mistakenly created in `60` on 2026-10-12 before this rule was fixed; do not repeat that.) Always resolve the execution that currently holds the `developed` stories before building, and default to `65`.
- Product IDs: DCS=4, VOTS=16, FDS=17, DCF=18, TSDS=21, TSSS=22, VOG=23, VOH=25, VHS=26.
- Current P2 plan per product (use these for new stories in execution `65`): DCS=55 (`DCS-P2`), VOTS=56 (`VOTS-P2`), FDS=57 (`FDS-P2`), DCF=58 (`DCF-P2`), TSDS=59 (`TSDS-P2`), VOG=60 (`VOG-P2`), VOH=61 (`VOH-P2`), VHS=62 (`VHS-P2`). The P1 plans (45/43/44/46/51/53/54) belong to execution `060` history and must not be used for new stories.
- Repo per product: VOTS→`VOTS/`, VHS→`VoidiovHubService/`, VOG→`VoidiovGateway/`, DCF→`ChildDataCenterFront/`, DCS→`ChildDataCenterService/`, FDS→`ChildFutureDataStation/`.
- Build record fields: product, name, date, execution, project, stories[]. Release record: product, build, name, date, stories (comma-prefixed string like `,363,366`), status `normal`.
- Site convention (changed by the user on 2026-10-11): build and release names must be the full four-segment GIT version exactly as the implementing commit shows it, e.g. commit `B0.6.0.1-261011-…` → build and release `B0.6.0.1`. Never aggregate to three segments and never invent or drop segments. Records created before 2026-10-11 still carry the old three-segment names (`B1.4.10`, `B0.6.0`, …) — treat them as history, not as a naming precedent. VoidiovHubService commits use a lowercase `v` prefix (`v0.0.4.1`); keep the version text exactly as GIT shows it.
- Build/release `date` = the day the record is created (today, also the form default), matching existing records where date == createdDate.
- One build per product covering that product's developed stories; the build desc should carry the GIT commit evidence with `<br />` separators between items.
- One four-segment git version = one build. When a single product has several distinct four-segment versions, create one build per version and link only that version's stories — do not merge them into a single build and do not aggregate them into one name. Each such build then gets its own release record (same product, same date, different build). Verified 2026-10-10: DCS `B1.9.6`+`B1.9.7`, DCF `B0.3.15`+`B0.3.16`, VOG `B0.1.12`+`B0.1.13` were separate builds; on 2026-10-11 builds 209/210/211 were first created with the old three-segment names and then renamed in place to `B0.6.0.1`/`B1.10.0.1`/`B0.4.0.1` under the new rule.
- Release `sync=true` advances the covered stories' stage from `developed` to `released` automatically; the execution story list should afterwards contain no `developed` story (verified 2026-10-10: `{"projected":15,"released":135,"closed":7}`).

## Verified Sequence

1. Session: `node scripts/zt.js login`. API token via `POST /api.php/v1/tokens` for read verification.
2. Select stories: `GET /api.php/v1/executions/{executionID}/stories?limit=500` and `GET /api.php/v1/executions/{executionID}/tasks?limit=500` (execution `65` is the active one; `60` has ended). Keep stories with stage `developed` whose linked tasks are all done/closed/cancel. Print the full stage distribution (e.g. `{"developed":3,"projected":12}`) to prove nothing else qualifies.
3. Map stories to products/repos; list each story's task IDs from the tasks payload.
4. Git evidence per product repo: `git log --all --oneline --grep="#824\|#825"` for task IDs; recent commits may omit task IDs, then grep feature keywords from story/task titles (e.g. 登录会话/在线会话/令牌/认证) and cross-check commit dates. Record every implementing commit and its four-segment version.
5. Build naming: use the implementing commit's full four-segment version as the build name (e.g. `B0.6.0.1`) and confirm the name is unused for that product in `GET /api.php/v1/executions/{executionID}/builds?limit=100`.
5a. When the developed stories still have `doing` tasks, the stories cannot reach stage `developed` and no build can be created. Finish each linked task first through the verified form route `POST /index.php?m=task&f=finish&taskID={id}` with `uid`, `currentConsumed`, `consumed`, `assignedTo`, `realStarted`, `finishedDate`, `status=done`, and `comment` (the completion note, items joined with `<br />`). The success response is an HTML page whose script redirects to `m=task&f=view&taskID={id}`; verify with `GET /api.php/v1/tasks/{id}` that `status` is `done`, `consumed` is set, and `left` is 0, then re-read the story stage to confirm `developed` before creating builds. Consumed hours default to the task estimate when the user gives no value.
6. Create each build: `node scripts/zt.js post "/index.php?m=build&f=create&executionID=65" '{"product":"23","name":"B0.0.3.1","builder":"zeochild","date":"2026-10-11","scmPath":"","filePath":"","desc":"…<br />…","uid":"<random>"}'`. The `name` is the full four-segment GIT version; the `locate` field returns the new `buildID`.
7. Link stories to each build: `GET /index.php?m=build&f=linkStory&buildID={id}` and confirm every target story is offered as a `stories[]` checkbox (ZenTao prechecks likely ones); then `node scripts/zt.js post "/index.php?m=build&f=linkStory&buildID={id}&browseType=&param=0" '{"stories[]":["363","366"]}'`.
8. Release each build: `node scripts/zt.js post "/index.php?m=release&f=create&productID={p}&branch=0&projectID=59" '{"name":"<build name>","build":"<build id>","date":"<today>","status":"normal","desc":"<same evidence>","sync":"true","marker":"0","mailto[]":""}'`. The `locate` field returns the new `releaseID`.
9. Verify before reporting success:
   - `GET /api.php/v1/executions/{executionID}/builds?limit=100`: every new build has correct product/name (the full four-segment version)/date/execution/project=59/stories.
   - `GET /api.php/v1/products/{p}/releases?limit=100`: every new release has correct build/name/date/stories/status.
   - `GET /api.php/v1/stories/{id}` for every covered story: stage advanced to `released`.
   - Rendered spot-check with `node scripts/zt.js get`: one build view page shows desc line breaks and GIT evidence; one release story tab (`&type=story`) lists the stories; the project 59 view lists the new releases.

## API Caveats

- Task completion (verified 2026-10-15 on tasks 846-849): `POST /index.php?m=task&f=finish&taskID={id}` with `uid`, `currentConsumed`, `consumed`, `assignedTo`, `realStarted`, `finishedDate`, `status=done`, `comment`. The response is an HTML redirect stub (`parent.location='/index.php?m=task&f=view&taskID={id}'`), not JSON. The finish form marks `realStarted,finishedDate,currentConsumed` as required. No per-task comment route is needed; the `comment` field carries the completion note and renders with its `<br />` separators.
- Project 59 release list route (verified 2026-10-15): `GET /index.php?m=projectrelease&f=browse&projectID=59` renders the releases (`m=project&f=release&projectID=59` returns an empty body). Use the `projectrelease` route for the rendered spot-check.
- Build creation via v1 API does not exist: `POST /api.php/v1/builds` → 404, `POST /api.php/v1/products/{id}/builds` → 404, `POST /api.php/v1/executions/65/builds` → 200 with an empty body and creates nothing. Go straight to the form route.
- Release creation: `POST /api.php/v1/projects/59/releases` validates fields (`name`, then `date`) but its success path is unverified; `POST /api.php/v1/products/{id}/releases` returns 200 empty without creating. Use the form route.
- Reliable v1 reads: `/executions/{id}/builds`, `/builds/{id}`, `/products/{id}/releases`, `/executions/{id}/stories`, `/executions/{id}/tasks`, `/stories/{id}`, `/projects/{id}`, `/products/{id}`.
- Renaming existing records (verified 2026-10-11): `GET /index.php?m=build&f=edit&buildID={id}` shows current values — the `product` select is disabled, so omit `product` from the POST; re-send `execution`, `builder`, `date`, `name`, `scmPath`, `filePath`, `desc`, and a random `uid`. `GET/POST /index.php?m=release&f=edit&releaseID={id}` works the same, but its hidden `product` input must be re-sent, along with `build`, `name`, `date`, `status: normal`, `desc`, `uid`, and `mailto[]:""`. Both return JSON `{"result":"success","locate":"…view…"}`.
- Empty-body probes on this site can return 200 without creating records, but after any probe confirm list counts and max IDs are unchanged.

## Form Quirks

- Static HTML uses single-quoted attributes; parse forms with `name=['"]…['"]` patterns.
- The release form's `build` select is empty in static HTML (ajax-filled) — just POST the build ID directly.
- Release `status` input is hidden and disabled; the server defaults it to `normal`. The hidden `sync` field defaults `false`; sending `sync=true` copies the build's stories into the release.
- Release creation with `sync=true` also automatically advances the covered stories' stage from `developed` to `released` (observed on the 2026-10-05 run). Never change story stages by hand in this flow.
- The build create form has no stories panel; stories are linked afterwards through the `linkStory` route.

## Session Facts (implemented by scripts/zt.js)

- Login: GET `/index.php?m=user&f=login` (captures cookies) → GET `/index.php?m=user&f=refreshRandom&t=json` with XHR; the body is a bare number, not JSON → password = `md5(md5(raw)+rand)` → POST login form with XHR; expect `{"result":"success","locate":"/"}`.
- Cookie jar: `zentaosid` plus `lang/device/theme`; cached at `%TEMP%/zt_cookie.txt`.
- Without a `Referer`, direct module URLs 302 to the deep-link wrapper; `scripts/zt.js` always sends `Referer: <site><path>`.

## Time-Wasters to Avoid (2026-10-05 run)

- Long retry loops on the unreachable primary URL cost ~15 minutes; one short attempt, then switch.
- Probing nonexistent API create routes cost several minutes; use the form routes above.
- Missing Referer on curl produced 302 deep-link pages that look like failures.
- Parsing `refreshRandom` as JSON broke the first login attempts; it is a bare number.
- Git Bash `/tmp` is invisible to native Node `require`; convert once with `T=$(cygpath -m "$TEMP")` on its own line, or run scripts with `node "$(cygpath -m "$TEMP")/script.js"`.
