---
name: analyze-video
description: "Analyze a YouTube reference video's rhetoric and structure (hooks, pacing, hedging, credibility, retention, memorable phrases) and produce a Markdown report. Trigger on: \"analyze this video\", \"what makes this work\", \"extract techniques from\", \"study this YouTube video\". Compare two references via --compare. For studying *external* videos — for reviewing your *own* content, use review-content."
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task
argument-hint: <youtube-url> [--compare <ref>] [--quick]
---

# analyze-video

Studies a YouTube video's structure and rhetorical techniques and produces a reusable analysis report.

## Workflow

1. **Parse arguments**
   - Required: YouTube URL
   - Optional `--compare <ref>`: another YouTube URL **or** path to a local narration text file
   - Optional `--quick`: reduce depth (this skill does **not** score — there is no scale to skip). Output only the Structure Map + Micro-Structure + a one-line technique note per axis
2. **Fetch metadata + subtitles** via `yt-dlp` → [source-acquisition](references/source-acquisition.md)
3. **Clean subtitles** with the bundled `scripts/clean-vtt.py` → [source-acquisition](references/source-acquisition.md)
4. **Read the full narration** (no partial reads — long videos must be read in full). Correct obvious mis-recognitions from context
5. **Macro structure** — split the video into time-coded blocks (intro / body / transitions / conclusion) with role labels
6. **Micro structure** — identify recurring paragraph-level patterns (claim→evidence→example, question→exploration→answer, transition phrases, premise stacking)
7. **Technique analysis (descriptive, UNSCORED)** → [analysis-axes](references/analysis-axes.md)
   1. (hook) Hook & engagement opening
   2. (pacing) Information density — **DENSITY only**
   3. (hedging) Hedging & risk-management language — *highest-value, exhaustive*
   4. (credibility) Credibility construction
   5. (retention) Re-engagement beats — **RE-ENGAGEMENT only**
   6. (phrasing) Memorable phrases
   7. (structure) Macro architecture / throughline
   8. (contrast) what-is vs what-could-be oscillation
   9. (closing) How the video lands the ending
   10. *(optional, application)* Application to your own content — only if `Self-Reference` is set
8. **Comparison (when `--compare` is given)**
   - URL: run steps 2–7 against the comparison video, then build axis-by-axis comparison table
   - Local text path: read the narration text directly and compare on the available axes
9. **Confirm placement** — follow `File Placement` rules in Project Integration; otherwise ask the user
10. **Write report** with the structure below
11. **Lint** if Project Integration defines a lint command
12. **QA check** → [qa-checklist](references/qa-checklist.md)
13. **Cleanup** — delete intermediate files (VTT / TXT / metadata JSON)

## Output Rules

### Frontmatter

```yaml
---
title: <video title>
channel: <channel name>
url: <youtube url>
duration: <hh:mm:ss>
upload_date: <yyyy-mm-dd>
analyzed_date: <yyyy-mm-dd>
tags: [genre, topic, ...]
---
```

### Body Structure

```markdown
# <Video Title>

## Summary
<2–3 sentences>

## Structure Map
<chronological block diagram>

## Micro-Structure Patterns
<recurring paragraph-level patterns>

## Technique Analysis

### 1. Hook & Engagement
<quoted excerpts + analysis>

### 2. Information Density & Pacing
…

### 3. Hedging & Risk-Management Language
<exhaustive list of hedging expressions with use-case differentiation>

### 4. Credibility Construction
…

### 5. Retention (re-engagement beats)
…

### 6. Memorable Phrases
…

### 7. Structure (macro architecture / throughline)
<state the throughline in one sentence, or flag its absence; SCQA framing; signposts>

### 8. Contrast (what-is vs what-could-be)
<list every oscillation/swing>

### 9. Closing
<named close move + final line + callback>

### 10. Application to Your Own Content   <!-- only if Self-Reference is set -->
<actionable list>

## Comparison   <!-- only if --compare is given -->
<axis-by-axis, quote-anchored TECHNIQUE CONTRAST — cite the specific quoted line/timestamp from each video. This is NOT a quality ranking>

## Takeaways
<1–3 key learnings>
```

### Quoting Rules

- Always quote directly from the narration when describing a technique. Paraphrase loses the rhetorical signal
- For axis 3 (hedging), aim for *exhaustive* coverage of hedging expressions — that is the highest-value axis
- For axis 8 (contrast), list *every* what-is/what-could-be swing; for axis 7 (structure), state the throughline in one sentence or explicitly flag its absence
- This skill is **unscored** — describe techniques, never grade them; `--compare` is a quote-anchored technique contrast, not a quality ranking
- Replace abstract evaluations ("the structure is good") with specific descriptions ("the intro poses three questions and the body resolves them in order")

## Project Integration

This skill works standalone, but can be customized by editing the sections below.

### File Placement (customize per project)

Define where reports are saved. Example:

```markdown
|Source genre|Directory|
|-|-|
|Tech / explainer|knowledge/references/tech/|
|Politics / commentary|knowledge/references/politics/|
|Default|knowledge/references/|
```

If no rules are defined, the skill will ask the user where to place the report.

### Lint (customize per project)

If your project uses a Markdown linter, specify the command. The skill runs it on the saved report. Example:

```markdown
npx textlint <path>
```

If not defined, linting is skipped.

### Self-Reference (optional)

If you want the skill to extract techniques **applicable to your own content**, declare a self-reference here. The skill will then enable axis 7 ("Application to Your Own Content") and use this reference for comparison.

```markdown
- Type: youtube-channel | local-text | local-script
- Path / URL: <e.g., projects/my-channel/scripts/>
- Description: <short context, e.g., "13-min Japanese tech-explainer videos">
```

If not declared, axis 7 is omitted from the report.

### Cross-Skill Integration

This skill can hand off results to other skills in your project:

- **Content review**: when reviewing your *own* video against the analyzed reference, hand off to a content-review skill
- **Slide creation**: when the analyzed techniques should become a presentation, hand off to a slide-creation skill

These integrations depend on which skills are installed. No specific skill names are assumed.

## Dependencies

- `yt-dlp` — YouTube metadata + subtitle fetching
- `python3` (or `py` on Windows) — runs the bundled `scripts/clean-vtt.py`

> [!NOTE]
> Windows users: prefix Python invocations with `PYTHONUTF8=1` to avoid encoding errors when handling Japanese subtitles. See [source-acquisition](references/source-acquisition.md).
