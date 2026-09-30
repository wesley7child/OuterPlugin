---
name: child-quarto-book-sync
description: Review and synchronize the user's Obsidian-written Quarto book project at D:\BUSS\Book\mybook, or another provided Quarto book path. Use when Codex is asked to review, audit, sync, fix, or prepare the trading book for Quarto output; verify newly added .md/.qmd chapters are registered in _quarto.yml, listed chapter files exist, Obsidian-only syntax is not left in publishable chapters, bibliography/config files are valid, and Quarto render/check commands are considered before release.
---

# Child Quarto Book Sync

## Overview

Keep the user's Obsidian writing workflow compatible with Quarto Book output. Default to `D:\BUSS\Book\mybook` when no path is provided.

## Workflow

1. Read the project rule file first if `AGENT.md` or `AGENTS.md` exists in the target book directory.
2. Inspect `_quarto.yml`, existing `.md` and `.qmd` files, and the current book directory structure before proposing or making changes.
3. Run `scripts/check_quarto_book.py` against the target path to find missing chapter registrations, missing files, Obsidian-only syntax, and basic Quarto config issues.
4. In review mode, report findings first with file paths and concrete fixes. Do not edit files unless the user asked to sync or fix.
5. In sync/fix mode, update `_quarto.yml` so publishable chapters are listed in the intended order, using existing style and comments where possible.
6. After edits, run the checker again and, when Quarto is available, run a lightweight Quarto validation such as `quarto check` or `quarto render` if the user expects a release-ready result.

## Book Rules

- Treat `_quarto.yml` as the source of truth for the Quarto book table of contents.
- Treat Obsidian as the editing surface only; do not rely on Obsidian-only syntax in publishable chapters.
- Register new publishable `.md` and `.qmd` files under `book.chapters` in `_quarto.yml`.
- Keep `index.qmd` or `index.md` first when present.
- Keep `references.qmd` or `references.md` near the end when present.
- Ensure every listed chapter path exists, and every likely chapter file is either listed or intentionally ignored.
- Prefer standard Markdown links and images over `[[Wiki links]]` and `![[Obsidian embeds]]` in chapters intended for Quarto output.
- Do not rewrite the user's prose during synchronization unless the user explicitly asks for content editing.

## Checker

Run:

```powershell
python "C:\Users\CHILD\.codex\skills\child-quarto-book-sync\scripts\check_quarto_book.py" "D:\BUSS\Book\mybook"
```

Useful options:

- `--json`: emit machine-readable results.
- `--ignore-dir <name>`: ignore an additional directory such as `note`.
- `--ignore-file <path>`: ignore an intentional draft file.

## Review Output

When the user asks for review, lead with problems in this order:

1. Missing or invalid `_quarto.yml`.
2. Listed chapters that do not exist.
3. New likely chapter files not listed in `book.chapters`.
4. Obsidian-only syntax in publishable chapters.
5. Missing bibliography files or suspicious output configuration.
6. Render/check command failures or unverified validation.

Keep the final answer concise and in Chinese unless the user asks otherwise.

## Sync Guidance

When adding a missing chapter to `_quarto.yml`, preserve the current YAML style. Add new root-level chapter files after the nearest existing content chapter and before `summary.qmd` or `references.qmd` when those files exist. If ordering is ambiguous, ask once or place the chapter after the latest existing non-reference chapter and state that assumption.
