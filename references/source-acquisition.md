# Source Acquisition

YouTube動画のメタデータ・字幕の取得手順とフォールバック。

## メタデータ取得

`yt-dlp` で動画情報をJSONで取得し、Pythonで読む（`--print` はWindowsでエンコーディングが壊れることがある）。

```bash
# JSON出力
yt-dlp -j "<URL>" > /tmp/yt_meta.json

# Python経由で読み取り
python3 -c "
import json
with open('/tmp/yt_meta.json', encoding='utf-8') as f:
    d = json.load(f)
for k in ['title','channel','duration_string','upload_date','description']:
    print(f'{k}: {d.get(k,\"N/A\")}')"
```

> [!NOTE]
> Windows環境では `python3` が無く `py` で起動するケースが多い。また文字化け回避のため `PYTHONUTF8=1` を付与する。
>
> ```bash
> PYTHONUTF8=1 yt-dlp -j "<URL>" > /tmp/yt_meta.json
> PYTHONUTF8=1 py -c "..."
> ```
>
> macOS/Linuxは `python3` を使う。`python` がPython 2を指す環境ではフォールバックしない。

## 字幕ダウンロード

```bash
# 日本語自動字幕
yt-dlp --write-auto-sub --sub-lang ja --sub-format vtt --skip-download \
  -o "/tmp/ref_%(id)s" "<URL>"
```

字幕ファイルは `/tmp/ref_<ID>.ja.vtt` に保存される。

### フォールバック

|ケース|対応|
|-|-|
|日本語字幕なし|`--sub-lang en` で英語自動字幕を試す|
|英語字幕もなし|メタデータ（タイトル・説明文）のみで分析可能な範囲を報告し、ユーザーに判断を仰ぐ|
|`yt-dlp` 未導入|README の System Dependencies を参照|

## 字幕クリーンアップ

同梱の `scripts/clean-vtt.py` でVTTをプレーンテキスト化する。

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/clean-vtt.py /tmp/ref_<ID>.ja.vtt /tmp/ref_<ID>.txt
```

Windowsでは:

```bash
PYTHONUTF8=1 py "%CLAUDE_PLUGIN_ROOT%/scripts/clean-vtt.py" /tmp/ref_<ID>.ja.vtt /tmp/ref_<ID>.txt
```

クリーンアップ内容:

- `WEBVTT`/`Kind:`/`Language:`/`NOTE` ヘッダー除去
- タイムスタンプ行（`00:00:00.000 --> ...`）除去
- インラインタイムスタンプタグ `<00:00:00.000>` と `<c>` タグ除去
- 位置指定 `align:start position:0%` 除去
- 重複行除去（自動字幕は同じ文が複数回出る）
- 短い行を直前の行に連結（文の途中で切れているため）

## 自動字幕の誤認識補正

自動生成字幕は固有名詞・専門用語を頻繁に誤認識する（例: 「テレトワールドリティクス」→「テレ東ワールドポリティクス」）。
動画の説明文・コンテキストから推定して補正すること。補正箇所が多い場合はその旨をレポートに記載する。

## 一時ファイルのクリーンアップ

分析完了後、以下を削除する。レポートが成果物であり、中間ファイルは残さない。

- `ref_<ID>.ja.vtt` — VTTファイル
- `ref_<ID>.txt` — クリーンアップ済みテキスト
- `yt_meta.json` — メタデータ
