#!/usr/bin/env python3
"""Stop フック: セッションの状態を context/session_state.md へ機械的に書き出す。
要約・判断はしない（転記のみ）。LLMや外部APIは呼ばないので、費用は発生しない。
save_state.ps1 のPython版（WSL・Macの両方で動く）。"""
import json
import re
import sys
from collections import deque
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def text_of(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return " ".join(b.get("text", "") for b in content if isinstance(b, dict) and b.get("type") == "text")
    return ""


def local_time(ts):
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone().strftime("%m-%d %H:%M")
    except Exception:
        return "??"


def main():
    data = json.loads(sys.stdin.read() or "{}")
    transcript = data.get("transcript_path")
    if not transcript or not Path(transcript).exists():
        return
    # 毎ターン走るので直近ぶんだけ読む
    with open(transcript, encoding="utf-8", errors="replace") as fh:
        lines = deque(fh, maxlen=2000)
    prompts, files = [], []
    for line in lines:
        try:
            o = json.loads(line)
        except Exception:
            continue
        if o.get("type") == "user":
            t = text_of((o.get("message") or {}).get("content")).strip()
            # tool_result や system-reminder 等の埋め込みは除外し、人の発話だけ残す
            if t and not t.startswith("<"):
                prompts.append((o.get("timestamp", ""), t))
        elif o.get("type") == "assistant":
            for b in (o.get("message") or {}).get("content") or []:
                if isinstance(b, dict) and b.get("type") == "tool_use" and b.get("name") in ("Edit", "Write", "NotebookEdit"):
                    fp = (b.get("input") or {}).get("file_path")
                    if fp:
                        files.append(fp)
    out = [
        "# セッション状態スナップショット",
        "",
        "自動生成（Stop フック）。手で書いても次のターンで上書きされる。",
        "これは発話の転記であって要約ではない。判断を含む内容は tasks.md 側に書くこと。",
        "",
        f"- 更新: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"- プロジェクト: {ROOT}",
        f"- transcript: {transcript}",
        "",
        "## 直近のユーザー発話（古い順・最大8件）",
        "",
    ]
    for ts, t in prompts[-8:]:
        t = re.sub(r"\s+", " ", t)
        if len(t) > 120:
            t = t[:120] + "…"
        out.append(f"- [{local_time(ts)}] {t}")
    out += ["", "## このセッションで編集したファイル（最大20件）", ""]
    uniq = list(dict.fromkeys(files))[-20:]
    out += [f"- {x}" for x in uniq] or ["- （なし）"]
    (ROOT / "context").mkdir(exist_ok=True)
    (ROOT / "context" / "session_state.md").write_text("\n".join(out) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logs = ROOT / "logs"
        logs.mkdir(exist_ok=True)
        with open(logs / "hook_error.log", "a", encoding="utf-8") as fh:
            fh.write(f"{datetime.now():%Y-%m-%d %H:%M:%S} save_state.py: {e}\n")
    sys.exit(0)
