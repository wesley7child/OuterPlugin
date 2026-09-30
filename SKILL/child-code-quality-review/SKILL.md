---
name: child-code-quality-review
description: Review newly written or modified code for enterprise-grade quality. Use when Codex needs to inspect code changes, pull requests, patches, refactors, feature implementations, bug fixes, or generated code for architecture fit, clean object-oriented design, class responsibility boundaries, method decomposition, maintainability, duplication, readability, safety, performance, testing, and whether the code is becoming messy or hard to maintain.
---

# Child Code Quality Review

## Core Purpose

Use this skill as a strict code quality gate after new code is written and before it is considered done. Focus on whether the implementation is clean, maintainable, correctly separated by responsibility, aligned with existing project architecture, and free of obvious "messy code" patterns.

## Review Workflow

1. Read the project rules first. Prefer `AGENT.md`, then `AGENTS.md`, then any repository-specific contributing or style document that is clearly relevant.
2. Inspect the changed files and nearby existing code before judging. Use fast search tools such as `rg`, existing code graph tools, or project-native navigation to find related classes, helpers, patterns, tests, and configuration.
3. Identify the behavioral intent of the change from the user request, diff, commit, issue, branch name, or surrounding code. Do not assume the implementation is correct just because it compiles.
4. Review from architecture level down to method level: module boundaries, class responsibilities, method decomposition, duplication, data flow, edge cases, security, performance, and tests.
5. Run the most relevant lightweight validation when possible, such as compile, lint, unit tests, targeted integration tests, or project-specific checks. If validation cannot run, state the reason and residual risk.
6. Report findings first, ordered by severity. Prefer concrete file and line references over general advice.

## Architecture And Responsibility Checks

- Check whether each class has one clear responsibility and whether new methods belong in that class.
- Flag business logic that leaks into controllers, UI components, DTOs, persistence classes, configuration classes, or utility classes without a strong existing pattern.
- Flag data access, remote calls, file IO, configuration parsing, validation, formatting, and orchestration when they are mixed into one class or method without a clean boundary.
- Check whether existing service, repository, factory, mapper, validator, handler, strategy, or helper abstractions should be reused instead of adding a parallel implementation.
- Check whether new code follows the repository's dependency direction and module ownership. Flag circular dependencies, cross-layer shortcuts, and direct calls that bypass established abstractions.
- Treat a "god class", "god method", or all-purpose helper as a serious maintainability issue, especially when the change adds more unrelated behavior to it.

## Object-Oriented Design Checks

- Verify names are descriptive, singular for custom class, file, method, and variable names when the project convention requires it, and consistent with existing domain language.
- Check encapsulation: mutable state, internal collections, domain invariants, and lifecycle details should not be exposed unless the existing API contract requires it.
- Prefer composition, small collaborators, and project-native extension points over deep inheritance or duplicated condition trees.
- Flag static utility growth when the behavior belongs to a domain object, service, strategy, mapper, or framework feature.
- Flag abstractions that do not reduce complexity, do not match a stable variation point, or hide simple logic behind unnecessary layers.

## Method Quality Checks

- Check whether each method performs one coherent task and can be understood without mentally executing many unrelated phases.
- Flag long methods, deeply nested branches, repeated condition blocks, mixed validation and side effects, and unclear variable lifetimes.
- Check whether repeated logic should be extracted into a shared method, existing helper, validator, mapper, or configuration constant.
- Flag too many parameters, ambiguous booleans, mutable output parameters, hidden global state, and unclear return semantics.
- Check whether error handling is local and meaningful: exceptions, fallback values, retries, logs, and user-facing messages should match the failure mode.
- Respect existing comments. Do not recommend deleting comments unless they are demonstrably wrong or harmful; prefer updating or adding clarifying comments.

## Configuration, Constants, And Hardcoding

- Flag service addresses, timeouts, retry counts, feature switches, credentials, file paths, business thresholds, and environment-dependent values when they are hardcoded in business code.
- Verify stable API paths and repeated string constants are centralized in the repository's existing path, route, constant, or configuration structure.
- Check whether magic numbers and magic strings are either named constants or intentionally local and obvious.
- Review whether configuration defaults, validation, and failure behavior are documented or enforced by existing configuration mechanisms.

## Correctness, Edge Case, And Data Checks

- Look beyond the happy path. Check null values, empty collections, duplicate input, invalid format, missing permissions, partial failure, timeout, retry, pagination, concurrency, and idempotency where relevant.
- Verify transaction boundaries, ordering guarantees, cache invalidation, and consistency with persistent data.
- Check whether input validation occurs at the correct boundary and whether internal methods still protect important invariants.
- Flag silent failure, swallowed exceptions, misleading success responses, and logs that make production diagnosis difficult.

## Security And Performance Checks

- Check for injection risk, authorization bypass, insecure direct object references, sensitive data in logs, unsafe file access, insecure deserialization, and leaking tokens or secrets.
- Check for repeated database queries, remote calls inside loops, unbounded memory growth, full scans, unnecessary synchronization, blocking calls in async paths, and avoidable repeated parsing.
- Prefer efficient project-native APIs, batching, pagination, streaming, indexes, caching, and short-circuiting when they match the use case.
- If performance and security trade off, never silently accept the tradeoff. State the risk and recommend the safer design unless the project explicitly chooses otherwise.

## Test And Verification Checks

- Verify whether tests cover main behavior, boundary behavior, failure behavior, and regression-prone interactions.
- Flag missing tests when the change touches shared utilities, core business flows, cross-module contracts, security-sensitive code, or data persistence.
- Prefer targeted tests that prove the changed behavior over broad snapshot or superficial compile-only checks.
- Report the exact validation command run and whether it passed. If no command was run, explain why.

## Severity Guide

- `P0`: Broken build, data loss, security vulnerability, severe production crash, or change cannot safely ship.
- `P1`: Serious correctness, architecture, responsibility, or maintainability issue likely to cause bugs or expensive future work.
- `P2`: Moderate issue such as duplication, unclear method split, missing edge case, missing targeted test, or local design smell.
- `P3`: Minor readability, naming, comment, formatting, or small consistency issue.

## Required Output

Start with findings, not a long summary. If there are no findings, say clearly that no blocking quality issues were found and mention any remaining test or validation gap.

Use this structure:

```markdown
**结论**
通过 / 需修改 / 高风险不建议合入

**问题**
- [P1] 文件路径:行号 - 问题标题
  说明问题为什么成立、会造成什么风险、建议如何修改。

**验证**
已运行或无法运行的验证命令，以及结果。

**补充**
仅放必要的开放问题、假设或低风险建议。
```

Keep the response concise. Do not rewrite large code blocks unless the user asks for an implementation fix. When recommending a refactor, name the target class, method, or abstraction and explain the smallest useful change.
