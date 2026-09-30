#!/usr/bin/env python3
"""Check whether an Obsidian-written directory is ready for Quarto Book output."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_IGNORED_DIR = {
    ".git",
    ".obsidian",
    ".quarto",
    "_book",
    "__pycache__",
    "asset",
    "assets",
    "image",
    "images",
    "data",
}
DEFAULT_IGNORED_FILE = {
    "README.md",
}
CHAPTER_SUFFIX = {".md", ".qmd"}
OBSIDIAN_PATTERN = re.compile(r"!\[\[[^\]]+\]\]|\[\[[^\]]+\]\]")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def normalize_relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def load_yaml_with_fallback(path: Path) -> tuple[dict, list[str]]:
    text = read_text(path)
    try:
        import yaml  # type: ignore
    except Exception:
        return parse_quarto_subset(text), []
    try:
        data = yaml.safe_load(text) or {}
    except Exception as exc:
        return parse_quarto_subset(text), [f"_quarto.yml YAML 解析失败，已改用简易解析：{exc}"]
    if not isinstance(data, dict):
        return {}, ["_quarto.yml 顶层内容不是映射结构"]
    return data, []


def parse_quarto_subset(text: str) -> dict:
    result: dict = {}
    current_section = None
    current_list = None
    for raw_line in text.splitlines():
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if not raw_line.startswith(" ") and stripped.endswith(":"):
            current_section = stripped[:-1]
            result.setdefault(current_section, {})
            current_list = None
            continue
        if current_section and raw_line.startswith("  ") and not raw_line.startswith("    "):
            if stripped.endswith(":"):
                current_list = stripped[:-1]
                section = result.setdefault(current_section, {})
                if isinstance(section, dict):
                    section.setdefault(current_list, [])
                continue
            if ":" in stripped:
                key, value = stripped.split(":", 1)
                section = result.setdefault(current_section, {})
                if isinstance(section, dict):
                    section[key.strip()] = value.strip().strip("\"'")
                current_list = None
                continue
        if current_section and current_list and stripped.startswith("- "):
            value = stripped[2:].strip().strip("\"'")
            section = result.setdefault(current_section, {})
            if isinstance(section, dict):
                target = section.setdefault(current_list, [])
                if isinstance(target, list):
                    target.append(value)
    return result


def get_book_chapter(data: dict) -> list[str]:
    book = data.get("book")
    if not isinstance(book, dict):
        return []
    chapters = book.get("chapters")
    if not isinstance(chapters, list):
        return []
    return [str(chapter).replace("\\", "/") for chapter in chapters]


def get_bibliography(data: dict) -> list[str]:
    bibliography = data.get("bibliography")
    if bibliography is None:
        return []
    if isinstance(bibliography, list):
        return [str(item).replace("\\", "/") for item in bibliography]
    return [str(bibliography).replace("\\", "/")]


def should_ignore(path: Path, root: Path, ignored_dir: set[str], ignored_file: set[str]) -> bool:
    relative = path.relative_to(root)
    parts = set(relative.parts[:-1])
    if parts.intersection(ignored_dir):
        return True
    return relative.as_posix() in ignored_file or path.name in ignored_file


def find_candidate_chapter(root: Path, ignored_dir: set[str], ignored_file: set[str]) -> list[str]:
    candidate = []
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in CHAPTER_SUFFIX:
            continue
        if should_ignore(path, root, ignored_dir, ignored_file):
            continue
        candidate.append(normalize_relative(path, root))
    return sorted(candidate, key=lambda value: (0 if value.startswith("index.") else 1, value.lower()))


def find_obsidian_syntax(root: Path, chapters: list[str]) -> list[dict]:
    issue = []
    for chapter in chapters:
        path = root / chapter
        if not path.exists() or path.suffix.lower() not in CHAPTER_SUFFIX:
            continue
        for line_number, line in enumerate(read_text(path).splitlines(), start=1):
            if OBSIDIAN_PATTERN.search(line):
                issue.append({"file": chapter, "line": line_number, "text": line.strip()[:160]})
    return issue


def run_quarto_version() -> dict:
    quarto = shutil.which("quarto")
    if not quarto:
        return {"available": False, "version": None}
    try:
        completed = subprocess.run([quarto, "--version"], check=False, capture_output=True, text=True, timeout=20)
    except Exception as exc:
        return {"available": False, "version": None, "error": str(exc)}
    return {"available": completed.returncode == 0, "version": completed.stdout.strip() or completed.stderr.strip()}


def check_book(root: Path, ignored_dir: set[str], ignored_file: set[str]) -> dict:
    result = {
        "root": str(root),
        "error": [],
        "warning": [],
        "missing_chapter_file": [],
        "unregistered_chapter": [],
        "obsidian_syntax": [],
        "chapter": [],
        "candidate": [],
        "quarto": {},
    }
    if not root.exists():
        result["error"].append(f"书稿目录不存在：{root}")
        return result
    quarto_yml = root / "_quarto.yml"
    if not quarto_yml.exists():
        result["error"].append("缺少 _quarto.yml，Quarto Book 无法识别目录配置")
        return result
    data, parse_warning = load_yaml_with_fallback(quarto_yml)
    result["warning"].extend(parse_warning)
    project = data.get("project")
    if not isinstance(project, dict) or project.get("type") != "book":
        result["error"].append("_quarto.yml 中 project.type 不是 book")
    chapter = get_book_chapter(data)
    result["chapter"] = chapter
    if not chapter:
        result["error"].append("_quarto.yml 中缺少 book.chapters 或章节列表为空")
    candidate = find_candidate_chapter(root, ignored_dir, ignored_file)
    result["candidate"] = candidate
    chapter_set = set(chapter)
    candidate_set = set(candidate)
    result["missing_chapter_file"] = [item for item in chapter if item not in candidate_set and not (root / item).exists()]
    result["unregistered_chapter"] = [item for item in candidate if item not in chapter_set]
    if chapter and not chapter[0].startswith("index."):
        result["warning"].append("book.chapters 第一项通常应为 index.qmd 或 index.md")
    for bibliography in get_bibliography(data):
        if not (root / bibliography).exists():
            result["error"].append(f"bibliography 指向的文件不存在：{bibliography}")
    result["obsidian_syntax"] = find_obsidian_syntax(root, chapter)
    if result["obsidian_syntax"]:
        result["warning"].append("已登记章节中存在 Obsidian 双链或嵌入语法，Quarto 输出可能无法正确渲染")
    result["quarto"] = run_quarto_version()
    return result


def print_human(result: dict) -> None:
    print(f"Quarto Book 检查目录：{result['root']}")
    print("")
    if result["error"]:
        print("错误：")
        for item in result["error"]:
            print(f"- {item}")
        print("")
    if result["warning"]:
        print("警告：")
        for item in result["warning"]:
            print(f"- {item}")
        print("")
    print("已登记章节：")
    for item in result["chapter"]:
        print(f"- {item}")
    print("")
    if result["missing_chapter_file"]:
        print("已登记但文件不存在：")
        for item in result["missing_chapter_file"]:
            print(f"- {item}")
        print("")
    if result["unregistered_chapter"]:
        print("可能新增但未登记到 _quarto.yml 的章节：")
        for item in result["unregistered_chapter"]:
            print(f"- {item}")
        print("")
    if result["obsidian_syntax"]:
        print("已登记章节中的 Obsidian 专属语法：")
        for item in result["obsidian_syntax"]:
            print(f"- {item['file']}:{item['line']} {item['text']}")
        print("")
    quarto = result["quarto"]
    if quarto.get("available"):
        print(f"Quarto 命令可用：{quarto.get('version')}")
    else:
        print("Quarto 命令当前不可用，无法在此终端执行渲染验证。")


def main() -> int:
    parser = argparse.ArgumentParser(description="Check Obsidian-authored Quarto book structure.")
    parser.add_argument("book_path", nargs="?", default=r"D:\BUSS\Book\mybook")
    parser.add_argument("--json", action="store_true", help="Emit JSON output.")
    parser.add_argument("--ignore-dir", action="append", default=[], help="Additional directory name to ignore.")
    parser.add_argument("--ignore-file", action="append", default=[], help="Additional relative file path or filename to ignore.")
    args = parser.parse_args()
    root = Path(args.book_path).expanduser().resolve()
    ignored_dir = set(DEFAULT_IGNORED_DIR)
    ignored_dir.update(args.ignore_dir)
    ignored_file = set(DEFAULT_IGNORED_FILE)
    ignored_file.update(item.replace("\\", "/") for item in args.ignore_file)
    result = check_book(root, ignored_dir, ignored_file)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_human(result)
    return 1 if result["error"] else 0


if __name__ == "__main__":
    sys.exit(main())
