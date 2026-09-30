---
name: child-voidiov-style-sync
description: Keep VOIDIOV frontend style changes synchronized with the shared styler/color token source. Use when Codex changes or reviews styles, themes, colors, UI tokens, CSS, XAML resource dictionaries, Element Plus theme overrides, Vue component styles, or shared visual rules in VOIDIOV frontend projects, especially DCF/ChildDataCenterFront, VOH/VoidiovHub, and VOTS. Also use when the user asks to sync the styler into projects, sync project styles back into the styler, resolve token conflicts, or judge whether a style change may affect other VOIDIOV frontend projects.
---

# Child VOIDIOV Style Sync

## Goal

Keep VOIDIOV frontend projects and the shared styler aligned. Treat the styler as a shared design contract, not as one project's private stylesheet.

Current scope:

- DCF: `D:\CODE\VOIDIOV\ChildDataCenterFront`
- VOH: `D:\CODE\VOIDIOV\VoidiovHub`
- VOTS: `D:\CODE\VOIDIOV\VOTS`
- Unified styler: `D:\CODE\VOIDIOV\voidiov-ui-system.md`
- .NET desktop style rules: record VOTS-specific WPF, DevExpress, and SciChart differences in the unified styler instead of creating a second Web token contract.

Before editing, verify these paths still exist and read the affected repository rule files.

## Mandatory Rules

1. Read the nearest project rule file before answering or editing. For VOIDIOV work, also read `D:\CODE\VOIDIOV\AGENTS.md` and each affected project's own `AGENTS.md` or equivalent rule file.
2. When a frontend project style changes, automatically check whether the shared styler must be updated. If the change introduces or changes a reusable color, radius, shadow, spacing, component state, theme rule, or visual convention, sync that change back into the styler in the same task unless a conflict blocks it.
3. Only sync from the shared styler into a project when the user explicitly asks for project-side sync, project adoption, token application, theme rollout, or similar wording. Do not silently push shared styler changes into DCF, VOH, or VOTS just because the styler changed.
4. If a project style change conflicts with the existing styler and changing the styler may affect another frontend project, stop before choosing a direction. Explain the conflict, list affected project(s), and ask the user whether to update the styler, keep a project-local exception, or revise the requested style.
5. Do not create duplicate local style systems when an existing shared token, global style file, resource dictionary, or component style can be reused.
6. For two or more affected VOIDIOV projects, combine this skill with `$child-develop-voidiov`: freeze the shared style contract first, then use parallel project workers where available.
7. Pure `transparent` is allowed when it means no background, no border, or pass-through to the parent surface. Unless the user explicitly requests partial opacity, do not introduce `rgba()` or alpha-bearing hex for VOIDIOV colors; prefer pre-mixed opaque `#RRGGBB` values for softened visual layers.

## Workflow

### 1. Discover Style Context

- Identify whether the task changes project styles, shared styler files, or both.
- Read the shared styler entry file only as needed:
  - `D:\CODE\VOIDIOV\voidiov-ui-system.md` for the unified human-readable style contract.
- Treat that file as the single VOIDIOV style contract for DCF Web and VOTS .NET. For VOTS/.NET work, first collect VOTS resource and DevExpress style facts, then record platform-specific differences in the unified styler.
- Read [references/sync-contract.md](references/sync-contract.md) when deciding sync direction, conflict handling, or project-specific entry points.
- Search targeted project style locations instead of scanning every file. Prefer `rg --files` and targeted `rg` for tokens, color values, CSS variables, XAML resources, and class names.

### 2. Decide Sync Direction

- Project to styler: automatic for reusable style changes made in DCF, VOH, or VOTS.
- Styler to project: only after explicit user instruction.
- Styler-only documentation/token update: allowed when the user asks to maintain the styler itself.
- Project-local exception: allowed only when the style is genuinely product-specific and does not redefine a shared token meaning.

### 3. Normalize Color Format

- Treat `voidiov-ui-system.md` as the semantic source of shared color roles. By default, visible shared Web color values should be opaque `#RRGGBB`; pure `transparent` is valid only for explicit absence of paint.
- For DCF and VOH CSS/Vue output, prefer opaque `#RRGGBB` colors for visible layers. When an older partially transparent color must be preserved visually, pre-mix it against the nearest stable background and write the resulting opaque hex value.
- Use `rgba()`, CSS `#RRGGBBAA`, or WPF `#AARRGGBB` only when the user explicitly asks for partial transparency or when a platform API cannot express the required behavior without alpha. Pure CSS `transparent` remains allowed for no-fill and no-border semantics.
- For VOTS XAML/WPF output, use ordinary `#RRGGBB` brushes for opaque colors. If explicit partial opacity is requested, convert alpha-aware values to WPF color hex in `#AARRGGBB` order and document why opacity is intentional.
- Remember that CSS 8-digit hex uses `#RRGGBBAA`, while WPF uses `#AARRGGBB`. Never copy an 8-digit hex value between Web and WPF without reordering the alpha channel.
- If a token is shared by Web and VOTS, keep the shared semantic color opaque whenever possible, then document or implement any platform-specific opacity at the boundary only after explicit user direction.

### 4. Check Conflict Before Editing

Treat these as conflicts that require user judgment before updating shared styler semantics:

- The same token name would receive a different value.
- The same visual role would be represented by two incompatible token names.
- A DCF-specific admin style would be promoted in a way that changes VOH or VOTS behavior.
- A VOH product-site style would weaken DCF/VOTS square, restrained, work-focused style rules.
- A VOTS desktop performance or resource constraint requires a different implementation from Vue frontends.
- A color, shape, shadow, focus, danger, success, warning, table, input, button, tag, menu, dialog, or chart style change may alter existing screens in another frontend.

When blocked by conflict, give the user a compact decision prompt with concrete options:

- Update shared styler and plan downstream project sync.
- Keep the change project-local and document why it is an exception.
- Adjust the requested style to reuse an existing styler token.

### 5. Implement

- Keep token names singular and descriptive.
- Prefer existing token locations and style entry files over new structure.
- Do not create or maintain a parallel JSON styler unless the user explicitly reintroduces machine-readable token generation.
- If editing human-readable styler docs, keep `voidiov-ui-system.md` aligned with actual DCF and VOTS project styles.
- If editing project code, update the smallest style surface that expresses the change: global style entry, shared component, XAML resource dictionary, or existing theme file before page-local styles.
- When applying shared colors to a project, perform the color format normalization from the previous step before editing files.
- Preserve existing comments and local conventions.

### 6. Verify

- For styler-only changes, inspect `voidiov-ui-system.md`, verify relevant references, and inspect the diff.
- For DCF or VOH style code changes, run the project's available build/type-check command when practical.
- For VOTS style/resource changes, run the smallest practical `dotnet build` target when practical.
- For user-visible UI changes, inspect the relevant screen when feasible and report any skipped visual verification.

## Completion Standard

Finish with:

- Sync direction used.
- Shared styler files changed or intentionally unchanged.
- Project style files changed.
- Conflict decision if any.
- Validation command and result, or the reason validation was skipped.
