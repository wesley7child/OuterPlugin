---
name: child-git-version-submit
description: 快速完成项目版本递增和规范化中文提交，默认只提交不推送。用户要求提交、提交代码、推送或发布当前改动时使用；明确说“现在是整体适配”时同步 VOIDIOV 版本匹配与历史记录；仅当用户明确说“推送/push/发布”时才推送；默认不运行测试、构建、启动或代码审查。
---

# Git Version Submit

用于重复性的本地项目版本提交。**默认只提交、不推送**；只有用户明确说“推送 / push / 发布 / 提交并推送”时才执行推送。目标是只完成版本号、提交标题和 Git 提交，不做与提交无关的代码检查或调试。

**核心原则：项目登记表里已固定的事实，直接查表使用，不重新发现。** 分支、版本源文件、字段名、格式前缀都已登记；每次只需要读 `git status`、`git log -1`、改版本、提交。禁止为了确认已在表里的信息去遍历项目、翻 git 历史、读 README 或搜索版本字符串。

用户只要求修改本技能或登记当前版本时，执行该请求，不因引用技能而自动升版、提交或推送。“现在是整体适配”触发下方专项流程，允许直接读取八个项目已登记的版本源文件和公共版本表。

## 固定流程

按以下顺序执行，避免重复搜索：

1. 读取当前项目根目录的 `AGENT.md`；不存在时读取 `AGENTS.md`。只读取规则，不遍历项目文件。
2. 执行 `git status --short --branch`，确认当前分支是项目规定的提交分支（见下方项目登记表）。分支不符时停止并报告；不要创建或切换分支。
3. 以最近一次提交标题中的版本号作为基线，默认只递增末位 `D`。只读取最近一条提交即可：`git log -1 --format=%s`。
4. 按项目登记表直接更新版本源文件，不搜索整个项目、不读 git 历史、不 grep 版本字符串。
5. 生成标题：`版本号-yyMMdd-概述内容`。概述优先使用用户提供的内容；未提供时根据 `git status --short` 的文件名和最近一次提交标题快速归纳，禁止为了命名标题展开代码审查。
6. 暂存并提交当前改动。用户说“提交当前代码”或“提交全部改动”时，使用 `git add -A`；若只指定文件，则只暂存指定文件。不要提交明显的临时文件、日志、构建产物或密钥文件。
7. **推送只看用户原话**：用户明确说了“推送 / push / 发布 / 提交并推送”时，执行 `git push origin <当前分支>`；只是说“提交 / commit / 提交一下”时，提交完成后即结束，**不推送、不询问是否推送**。不确定时一律不推送，并在简报中注明“未推送”。
8. 若用户明确说“现在是整体适配”，完成下方版本匹配记录流程；最后报告版本、提交标题、提交哈希及适配批次。执行了推送时再报告推送结果，失败时报告 Git 原始错误。

## 版本规则

默认格式为 `B<A>.<B>.<C>.<D>`，保留 `B` 前缀：

- 默认升级：`D + 1`，例如 `B0.0.3.6` -> `B0.0.3.7`。
- 用户要求 C 级升级：`C + 1`，`D = 1`，例如 `B0.0.3.7` -> `B0.0.4.1`。
- 用户要求 B 级升级：`B + 1`，`C = 0`，`D = 1`。
- 用户要求 A 级升级：`A + 1`，`B = 0`，`C = 0`，`D = 1`。

版本文件修改必须与提交标题使用同一个新版本。前端 `package.json` 与 `package-lock.json` 必须同步修改。版本格式明显不同且没有项目规则说明时停止，不擅自转换为语义化版本。

**前缀以项目登记表为准，不擅自统一**：已有 `v` 前缀的项目（VHS）继续用 `v`，其余用 `B`。**段数统一为 `A.B.C.D` 四段式**（TSDS 已于 260925 由三段补齐为四段）。

## 版本参数清理原则

每个项目只保留**一个**权威版本声明，即构建/工具链实际使用、或页面展示需要的那一处。判断标准：

- **保留**：构建工具链读取的（Maven `<version>`、npm `package.json` `version`、MSBuild `Directory.Build.props`）、界面或接口对外展示的（DCS 的 `/api/v1/backend/version` 经 `BuildProperties` 读 pom 版本、TSDS README 的当前版本行）、以及被协议消费的清单字段。
- **删除**：定义了但全项目无引用的重复版本常量（如 DCF `src/config/index.js` 的 `SYS_VERSION`/`SYS_DEV_VERSION`、CFDS 的 `SYS_DEV_VERSION`）、各处的 `devversion` 字段（`package.json` 的 `devversion` 与 pom 里注释掉的 `<!--<devversion>…</devversion>-->`）。

已按此原则清理完毕（260925），**当前状态下无需再清理**；以后新增版本参数时按同一标准判断。删除版本参数属于代码改动，按 AGENTS.md 应跑一次最小编译验证（见下方“验证命令”）。

## 项目登记表

### FluidWechat 系列（`E:\CODE\`）

| 项目目录 | 分支 | 版本源文件 | 版本字段 |
|---|---|---|---|
| `E:\CODE\FluidWechat` | main | `package.json`、`package-lock.json` | `version` |
| `E:\CODE\FluidWechatService` | main | `app/version.py` | `APP_VERSION` |

前后端同时提交时，分别在两个项目根目录执行同一流程；版本和提交标题分别使用各自最新版本，不合并为一个 Git 提交。

### VOIDIOV 系列（`D:\CODE\VOIDIOV\`）

工作区根目录本身不是 Git 仓库；以下 9 个子项目各自独立仓库（8 个业务项目 + 公共文档仓库 `VoidiovSupport`）。用户说“提交所有项目”即指这 9 个，逐个执行，每个项目一个独立提交，不合并。用 `git -C <目录>` 操作，避免反复 `cd`。用户口中的 **VOS** 指 `VoidiovSupport`。

| 项目目录 | 分支 | 版本源文件 | 版本字段 | 格式 |
|---|---|---|---|---|
| `ChildDataCenterFront` | main | `package.json`、`package-lock.json` | `version`（两处） | `B` 前缀 4 段 |
| `ChildDataCenterService` | master | `pom.xml` | `<version>` | `B` 前缀 4 段 |
| `ChildFutureDataStation` | master | `core/standard/param/ChildConfig.py` | `SYS_VERSION` | `B` 前缀 4 段 |
| `TradeStationDynamicService` | master | `pom.xml`、`README.md` | `<version>` + `- **当前版本**: ` | `B` 前缀 4 段 |
| `VOTS` | master | `Directory.Build.props` | 4 项，见下方说明 | 前 3 项无前缀，第 4 项 `B` 前缀 |
| `VoidiovGateway` | main | `pom.xml` | `<version>` | `B` 前缀 4 段 |
| `VoidiovHub` | main | `package.json`、`package-lock.json` | `version`（两处） | `B` 前缀 4 段 |
| `VoidiovHubService` | main | `pom.xml` | `<version>` | **`v` 小写前缀** 4 段 |
| `VoidiovSupport`（VOS） | main | 无版本源文件 | 版本仅记录在提交标题 | `B` 前缀 4 段 |

**注意：VOIDIOV 的 8 个业务项目里 4 个在 `main`，4 个在 `master`，这是各自仓库的既定默认分支，不是配置错误，不要试图统一；公共文档仓库 `VoidiovSupport` 也在 `main`。**

**`VoidiovSupport`（VOS）的提交方式**：它是公共文档仓库，无版本源文件，版本基线只看 `git log -1 --format=%s` 标题中的版本号。有改动时同样递增末位 `D` 并把新版本写进提交标题（如 `B0.0.2.2-260929-概述`），随本次改动一起提交；工作区干净时跳过，不产生空提交。

各项目版本源的具体改法：

- **`pom.xml`（DCS / TSDS / VOG / VHS）**：只改 `<artifactId>` 下方那一行项目 `<version>`。父 POM 的 `<version>`（spring-boot-starter-parent，第 8 行附近）**不是**项目版本，绝不修改。
- **`package.json` + `package-lock.json`（DCF / VOH）**：`package-lock.json` 的 `version` 出现两处（顶部与 `packages.""`），两处都要同步，用 `replace_all` 一次替换。
- **`ChildConfig.py`（CFDS）**：只改 `SYS_VERSION`（4 段）；`SYS_DEV_VERSION` 已删除，不要再加回。
- **`Directory.Build.props`（VOTS）**：4 项一起改——`Version`、`AssemblyVersion`、`FileVersion` 三项用无前缀 4 段（如 `1.4.11.1`），`InformationalVersion` 用 `B` 前缀（如 `B1.4.11.1`）。`IncludeSourceRevisionInInformationalVersion` 不动。
- **`README.md`（TSDS）**：`## 版本信息` 下的 `- **当前版本**: ` 需与 `pom.xml` 同步为新版本，这是唯一需要同步 README 的项目。

**已确认不需要改的地方（不要再检查）：**

- VOIDIOV 各项目的 `doc/` 目录是正式功能文档（按 `user/` `api/` `background/` `system/` 分类），属于应提交内容，不是临时文件。
- 各项目源码与文档里出现的版本号字符串（Java 测试用例、`@Schema(example=…)`、README 历史版本段、VOH `product-permission.manifest.json` 的 `version`、DCF `ProductRelease.vue` 的 placeholder）都不是项目版本声明，不跟随升版。
- 提交时出现的 `LF will be replaced by CRLF` 警告无害，直接忽略。

## VOIDIOV 整体适配记录

- **触发**：用户明确说“现在是整体适配”或明确要求登记整体适配时执行；普通提交不改匹配表。整体适配由用户声明，不另设测试、验收材料或重复确认门槛，也不写成自动测试通过。
- **唯一文件**：`D:\CODE\VOIDIOV\VoidiovSupport\doc\operation\项目版本兼容矩阵-project-version-compatibility.md`。由 Codex 自动读取并填写，不让用户手填；MD 只保留简短表意说明、版本匹配表、整体适配历史表，不加入教程、模板、占位或冗长流程。
- **取值**：按项目登记表读取八个项目的权威版本字段，保留 `B`/`v` 前缀和四段格式；VOTS 用 `InformationalVersion`。有提交任务时，在指定项目成功升版提交后读取最终版本，其余项目使用当前版本；只要求记录时不升版。
- **历史**：新增递增批次、当天日期及八个项目的精确版本，旧行保留。与最近一批八个版本全部相同时不重复追加；历史只记录精确版本，不改成区间。
- **匹配**：按“项目 + 精确项目版本”建行，从历史中该版本出现的每个批次，汇总同批其他项目版本。新项目版本建新行，旧版本行保留；自身填 `—`。不同项目一起升版只新增同批匹配关系，不推定新版本兼容旧批次。
- **范围**：同一项目版本匹配的另一项目版本，按四段数字排序；同前缀、同前三段且末位连续、每个值都已登记时合并为 `B0.0.1.1 ～ B0.0.1.5`，其他情况以 `、` 列出。不能只取最小/最大值吞掉未登记版本，也不能把不同历史组合推定为任意混搭；用户明确给出更宽范围时按其指示登记。
- **收口**：确认表中八个版本与最终版本源一致、历史未丢失，更新公共索引中的简短状态即可；不扩展为源码审查、编译或联调。中途提交失败时不记录计划版本为已完成的整体适配。
- **Git 边界**：`VoidiovSupport`（VOS）是独立文档仓库，已按登记表纳入 VOIDIOV 批量提交范围。触发整体适配时，在八个业务项目的指定提交完成后读取最终版本更新兼容矩阵，该矩阵改动随 `VoidiovSupport` 自己的版本递增提交一并完成（不再使用旧的 `文档-yyMMdd-` 单独提交格式）；推送仍以用户原话为准。只修改技能或只登记版本时不自动提交。公共仓库提交失败应保留文件并报告，不回滚业务提交。

## 验证命令

技能默认不跑测试/构建。仅在改动涉及代码（如删除版本参数、改配置键）需要验证时使用，且只跑最小编译：

```bash
# 前端（node_modules 已存在）
cd <项目> && npx vite build

# Java（离线；wrapper 需要联网下载 Maven，改用已缓存的 3.9.11）
MVN=/c/Users/CHILD/.m2/wrapper/dists/apache-maven-3.9.11/d6d3cbd4012d4c1d840e93277aca316c/bin/mvn
"$MVN" -q -o compile -DskipTests

# Python 语法
python -c "import ast; ast.parse(open(r'<file>',encoding='utf-8').read()); print('OK')"
```

`dist/` 与 `target/` 已被各项目 gitignore 忽略，构建后 `git add -A` 不会带入产物；构建后仍应 `git status --short` 确认只有预期文件。

## 固定命令模板

单项目：

```powershell
git status --short --branch
git log -1 --format=%s
# 按项目登记表修改版本源文件
git add -A
git commit -m "B0.0.0.1-260914-概述内容"
# 到此结束（默认不推送）；仅当用户明确要求推送时才追加：
# git push origin <当前分支>
```

VOIDIOV 批量（用户要求“提交所有项目”时）：

```powershell
# 8 个子项目逐个执行，每个一个独立提交
git -C ChildDataCenterFront status --short --branch
git -C ChildDataCenterFront log -1 --format=%s
# 改该项目的版本源文件
git -C ChildDataCenterFront add -A
git -C ChildDataCenterFront commit -m "B0.1.8.1-260925-概述内容"
```

取当天日期用 `date +%y%m%d`，不要手写或推算。

## 安全边界

- 只允许在项目规定分支提交（见项目登记表）。禁止 `git reset --hard`、`git checkout --`、`git clean` 和强制推送。
- 不删除文件，不覆盖用户未要求的改动；用户要求提交当前全部代码时，保留并提交现有非临时改动。
- **未经用户明确要求不推送**；推送失败不重试多轮，不改变远程地址，不强推；直接报告错误。
- 只有以下情况才停止并要求处理：非规定分支、版本格式无法确定、存在未解决合并冲突、提交钩子明确拒绝提交，或 Git 报告远程分支冲突。

## 输出

中文简报，包含：

- 新版本
- 提交标题
- 提交哈希
- 推送状态：默认写“未推送（未收到推送指示）”；执行了推送时报告成功或失败及原始原因

多项目批量提交时，用一个表格列出每个项目的分支、新版本、提交标题、提交哈希，正文只补充各项目差异化的改动内容，不逐项重复相同说明。
