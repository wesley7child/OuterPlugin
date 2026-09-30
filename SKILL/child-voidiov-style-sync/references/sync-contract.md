# Child VOIDIOV Style Sync Contract

Use this reference when `$child-voidiov-style-sync` needs precise sync behavior for DCF, VOH, and VOTS.

## Shared Styler Source

- `D:\CODE\VOIDIOV\voidiov-ui-system.md`: unified human-readable style contract for DCF Web, VOTS .NET, and future VOIDIOV visual rules.

If this file moves or a newer styler source appears, verify the current canonical source before editing.

## Project Entry Points

Known current entry points:

- DCF: `D:\CODE\VOIDIOV\ChildDataCenterFront\src\assets\main.css` plus Vue SFC component styles.
- VOH: `D:\CODE\VOIDIOV\VoidiovHub\src\app\style\index.css`, `src\shared\ui`, and Vue SFC component styles.
- VOTS: WPF style and resource dictionaries under `D:\CODE\VOIDIOV\VOTS` and related resource projects; verify actual XAML/resource location with targeted search before editing.

Always re-check paths in the live workspace because project structure may change.

## Direction Rules

### Project to Styler

Automatically sync a project style change into the shared styler when it changes a reusable design rule:

- Color value or semantic color role.
- Border, radius, shadow, opacity, focus ring, hover state, active state, disabled state, or selection state.
- Button, input, table, tag, menu, dialog, popover, chart, list, dock, or panel appearance.
- Global CSS variable, theme override, XAML brush, resource dictionary value, Element Plus override, DevExpress theme value, or shared component style.

Do not sync purely local layout values such as one page's grid width, a one-off margin, or content-specific media sizing unless they establish a reusable convention.

### Styler to Project

Apply shared styler values into DCF, VOH, or VOTS only when the user explicitly asks for it. Accepted wording includes:

- "同步到 DCF/VOH/VOTS"
- "把样式器应用到项目"
- "让项目跟样式器对齐"
- "按样式器修复这个项目"
- "roll out/apply/adopt the styler"

If the user only asks to update the styler, do not alter project files.

## Conflict Rules

Pause and ask the user when a style change would redefine shared meaning or affect another frontend project.

Conflict examples:

- Existing `style.color.accent.default` is orange, but a project wants to redefine it as blue.
- A project adds a new "primary button" meaning that conflicts with the shared primary button token.
- VOH needs a marketing visual treatment that would make DCF admin screens less restrained if promoted globally.
- VOTS needs a desktop-specific resource implementation that cannot map 1:1 to Vue CSS tokens.
- A token value change would alter DCF, VOH, and VOTS after future sync.

When reporting the conflict, include:

- Requested project and file area.
- Existing styler token or rule.
- Proposed new value or rule.
- Likely affected project(s).
- Recommended options: update styler globally, keep project-local exception, or adapt to existing token.

## Project Notes

### DCF

DCF is an admin/data-center frontend. Prefer square, restrained, dark admin UI, Element Plus reuse, no decorative shadow, no marketing hero treatment, and shared token reuse.

### VOH

VOH is a user-facing product entry frontend. It may need more product-site composition, but buttons and foundational styles still need to align with VOIDIOV shared rules unless explicitly treated as a local exception.

### VOTS

VOTS is a .NET 8 WPF desktop trading terminal. Theme changes should consider resource dictionary reuse, DevExpress and SciChart styling, rendering performance, thread-safe UI updates, and desktop readability.
