#!/usr/bin/env python3
"""UserPromptSubmit フック: 「おはよう」や短い「続き」で、続行用ファイルを自動で読み込む。
morning.ps1 のPython版（WSL・Macの両方で動く）。"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# 先に見つかった1つだけ読む（上から順に探す）
CANDIDATES = ["context/tasks.md", "work_session.json", "CLAUDE.md"]


def main():
    try:
        data = json.loads(sys.stdin.read() or "{}")
    except Exception:
        return
    prompt = data.get("prompt") or ""
    if not ("おはよう" in prompt or ("続き" in prompt and len(prompt) <= 20)):
        return
    state = ROOT / "context" / "session_state.md"
    if state.exists():
        print("=== session_state.md（自動読み込み）===")
        print(state.read_text(encoding="utf-8"))
        print()
    for rel in CANDIDATES:
        f = ROOT / rel
        if f.exists():
            print(f"=== {f.name}（自動読み込み）===")
            print(f.read_text(encoding="utf-8"))
            break


if __name__ == "__main__":
    main()
