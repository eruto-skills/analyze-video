# analyze-video

A Claude Code skill that analyzes a YouTube reference video's structure and rhetorical techniques, then produces a reusable Markdown report. Useful for content creators, communication researchers, and anyone who wants to learn *why* a particular video works.

## Features

- **Full-narration analysis** — reads the entire transcript, no partial sampling
- **6 + 1 analysis axes** — hook, pacing, hedging, credibility, retention, memorable phrases, plus an optional self-application axis
- **Hedging-language extraction** — exhaustive listing of risk-management expressions, especially valuable for sensitive-topic videos
- **Comparison mode** — `--compare` against another YouTube URL or a local narration text file
- **Self-Reference (optional)** — declare your own channel/scripts and the skill extracts techniques applicable to your work
- **Bundled `clean-vtt.py`** — auto-generated subtitles cleaned to readable plain text

## Installation

### Via marketplace (recommended)

```
/plugin marketplace add eruto-skills/marketplace
/plugin install analyze-video@eruto-skills
```

### Manual

```bash
git clone https://github.com/eruto-skills/analyze-video.git
cp -r analyze-video /path/to/your-project/.claude/skills/analyze-video
```

### System Dependencies

|Tool|Purpose|Install|
|-|-|-|
|`yt-dlp`|YouTube metadata + subtitle extraction|[github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)|
|`python3` (or `py` on Windows)|Runs bundled `scripts/clean-vtt.py`|[python.org](https://www.python.org/)|

> [!NOTE]
> Windows users: set `PYTHONUTF8=1` when handling Japanese subtitles to avoid encoding errors. macOS/Linux uses `python3` directly.

## Usage

### Slash command

```
/analyze-video https://www.youtube.com/watch?v=xxxxx
/analyze-video https://www.youtube.com/watch?v=xxxxx --compare https://www.youtube.com/watch?v=yyyyy
/analyze-video https://www.youtube.com/watch?v=xxxxx --quick
```

### Natural language triggers

- "Analyze this video for me"
- "What makes this video work?"
- "Extract techniques from this YouTube video"
- "I want to copy this style"

## Project Integration

Customize the skill by editing the **Project Integration** section in `SKILL.md`:

- **File Placement** — where reports are saved
- **Lint** — Markdown linter command run after report generation
- **Self-Reference** — declare your own channel/scripts to enable axis 7 (application-to-self)
- **Cross-Skill Integration** — hand off to content-review or slide skills

## File Structure

```
analyze-video/
├── README.md
├── LICENSE
├── SKILL.md                     # Main skill definition
├── .claude-plugin/
│   └── plugin.json
├── scripts/
│   └── clean-vtt.py             # Auto-generated subtitle cleaner
└── references/
    ├── source-acquisition.md    # yt-dlp commands & subtitle cleaning
    ├── analysis-axes.md         # 6+1 axes detail
    └── qa-checklist.md          # Pre-output verification
```

## License

MIT License. See [LICENSE](LICENSE).

## Support

If this skill is useful to you, consider supporting development:

- [GitHub Sponsors](https://github.com/sponsors/erutobusiness)
- [Ko-fi](https://ko-fi.com/eruto)
