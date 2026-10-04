"""YouTube自動生成VTTをクリーンなプレーンテキストに変換する。

Usage:
    py scripts/clean-vtt.py <input.vtt> [output.txt]

重複行・タイムスタンプタグ・位置指定を除去し、読みやすいテキストを出力する。
出力先を省略すると標準出力に出す。
"""

import re
import sys
from pathlib import Path


def clean_vtt(vtt_text: str) -> str:
    lines = vtt_text.splitlines()
    seen = set()
    result = []

    for line in lines:
        # ヘッダー・メタ行をスキップ
        if line.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")):
            continue
        # タイムスタンプ行をスキップ
        if re.match(r"\d{2}:\d{2}:\d{2}\.\d{3}\s*-->", line):
            continue
        # 空行スキップ
        if not line.strip():
            continue

        # インラインタイムスタンプタグ <00:00:00.000><c>text</c> → text
        cleaned = re.sub(r"<\d{2}:\d{2}:\d{2}\.\d{3}>", "", line)
        cleaned = re.sub(r"</?c>", "", cleaned)
        # 位置指定 align:start position:0% を除去
        cleaned = re.sub(r"\s*align:\S+\s*position:\S+", "", cleaned)
        cleaned = cleaned.strip()

        if not cleaned:
            continue

        # 重複行を除去（自動字幕は同じテキストが3回繰り返される）
        if cleaned in seen:
            continue
        seen.add(cleaned)
        result.append(cleaned)

    # 連結: 短い行は前の行に繋げる（文の途中で切れているため）
    merged = []
    for line in result:
        if merged and not merged[-1].endswith(("。", "？", "！", ".", "?", "!")):
            merged[-1] += line
        else:
            merged.append(line)

    return "\n".join(merged)


def main():
    if len(sys.argv) < 2:
        print(f"Usage: py {sys.argv[0]} <input.vtt> [output.txt]", file=sys.stderr)
        sys.exit(1)

    vtt_path = Path(sys.argv[1])
    text = clean_vtt(vtt_path.read_text(encoding="utf-8"))

    if len(sys.argv) >= 3:
        out_path = Path(sys.argv[2])
        out_path.write_text(text, encoding="utf-8")
        print(f"Saved: {out_path}", file=sys.stderr)
    else:
        print(text)


if __name__ == "__main__":
    main()
