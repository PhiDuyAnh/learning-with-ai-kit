# Learning with AI Kit

**Learn anything and everything with AI.**

AI makes learning anything possible. It's a tutor that knows a little about everything, never gets tired of your questions, and is there at 2 a.m. when something finally makes you curious. Quantum physics, music theory, tax law, Rust, the history of Rome: you can learn any of it at your own pace, starting from wherever you are.

But out of the box, AI agents are bad teachers. They over-explain. They bury you in jargon and formulas they never explain. They state made-up facts with full confidence. They answer every question the same way, whether you're a beginner or an expert, and forget everything about you the next day.

**Learning with AI Kit turns your AI agent into a real teacher.** It's a set of agent skills for Claude Code and other agents that adds what's missing.

## What changes

| Without it | With it |
|---|---|
| Walls of text full of unexplained terms | Plain answers. Every term and formula explained, with a worked example. Detailed, never padded. |
| Facts from the model's memory | Grounded answers, checked against real sources, with links. |
| Same answer for everyone | Finds out what you already know and what you want, then teaches from there. |
| Forgets you every session | Remembers how you like to learn and where you stopped. |
| Long videos you never finish | Turns any YouTube video into a timestamped transcript you can question, study, and take notes on. |
| Lessons that vanish with the chat | Clean notes in your Obsidian vault, linked together, if you want them. |
| Quizzes on a schedule | Check yourself whenever you want. Or never. Your call. |

## How it feels

> **You:** I want to understand how neural networks learn.
>
> **Agent:** Do you want a quick intro, to really understand it, or a roadmap of resources to study on your own? And have you seen any of it before?
>
> **You:** Really understand it. I know some Python, no math beyond high school.
>
> **Agent:** *(asks a few quick questions to find exactly where your knowledge ends, then shows a short plan with a small map of the ideas, from what you already know to your goal)* Does this plan look right?
>
> **You:** Yes. Also, always give me an example before the theory.
>
> **Agent:** Saved to your learning profile: examples before the general rule. Let's start with one idea...

One idea at a time, each built on the last, so it feels like something you figured out, not something you memorized.

## What you can do

| Say | What happens |
|---|---|
| "I want to learn X" | It asks what you're after and what you know, then picks the right mode. |
| "Explain X" | A short, clear, sourced answer. |
| "Teach me X properly" | Tutoring: finds your level, makes a plan, teaches step by step. |
| "Give me a roadmap for X" | The best books, courses, docs, and videos for your level, in order. |
| "Go through this with me" + a link or PDF | Works through one article, paper, or repo with you. |
| "Learn from this video" + a YouTube link | Transcript first, then the same deep dive, with timestamps you can click. |
| "Find good videos on X" | A few strong picks, with why each one fits you. |
| "Check me on X" | Questions matched to your level, with instant feedback. Only when you ask. |
| "Note this" | Saves the idea as a clean note in your vault. |
| "Always keep it short" | Applies it now, and remembers it from now on. |

## Quick start

### Claude Code

```bash
claude plugin marketplace add PhiDuyAnh/learning-with-ai-kit
claude plugin install learning-with-ai-kit@learning-with-ai-kit
```

Then just ask to learn something, or start with:

```
/learning-with-ai-kit:learn how the internet works
```

For notes in Obsidian, add Obsidian's official skills too:

```bash
claude plugin marketplace add obsidianmd/obsidian-skills
claude plugin install obsidian@obsidian-skills
```

### Other agents

The skills follow the open [Agent Skills spec](https://agentskills.io/specification), so they work with Codex, Gemini CLI, and other skills-compatible agents. Copy `skills/` into your agent's skills folder. Slash commands are then plain: `/learn`, `/teach`.

## Features

### Answers you can actually follow

Every answer follows one rule: include whatever you need to understand it, and cut whatever only adds length. It starts with the core idea in plain words. Every term gets defined the first time it shows up. Every formula comes with what it means and a small example with real numbers. Technical readers don't get a dumbed-down version, and everyone else doesn't hit a wall.

### Teaching that adapts to you

A learning profile (`~/.learning-with-ai-kit/profile.md`) remembers how you like to learn: examples first, diagrams, short answers, being asked questions or being told. Say a preference once and it sticks. If the agent notices a pattern, it asks before saving it. The profile is plain markdown, so you can read and edit it any time.

Each topic also keeps track of what you know, what's still shaky, and where you stopped, so the next session picks up right where you left off.

### YouTube learning

Search for videos, read their chapters, and turn any video into a timestamped transcript. Free YouTube captions are used first. When a video has none, or the screen matters, choose a provider:

| Option | Cost | Best for |
|---|---|---|
| YouTube captions | Free | Most videos |
| Gemini | Paid API | Slides, code, diagrams: it notes what's on screen |
| ElevenLabs Scribe | Paid API | No captions, accents, technical terms |
| OpenAI Whisper | Paid API | Short videos without captions |

Ask "how do I set up YouTube learning?" and the agent checks what you have, recommends an option, and helps you set it up.

### Notes in your Obsidian vault

Off by default. Turn it on and get notes on request, or an offer at the end of each topic. You get one note per idea, notes for each source and video (with links back to the exact page or timestamp), session logs, a glossary, and a topic map. Existing notes get updated instead of duplicated. You can also quiz yourself on your own notes later.

## Requirements

- Node.js 20+. The scripts use no npm packages, so there's nothing to install.
- For YouTube: [`yt-dlp`](https://github.com/yt-dlp/yt-dlp#installation). The agent offers to install it for you if it's missing.

  ```bash
  brew install yt-dlp        # macOS
  winget install yt-dlp      # Windows
  ```

  On Linux, download the standalone binary to `~/.local/bin` (see the yt-dlp install guide).
- Optional transcription keys, only for the provider you choose: `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, or `OPENAI_API_KEY`. Set them in your environment or in `~/.learning-with-ai-kit/.env` (`KEY=value` lines).

## Config

Stored in `~/.learning-with-ai-kit/config.json`. Change it by asking the agent ("save my notes to ~/Obsidian/Main") or by hand:

```bash
node skills/learn/scripts/config.mjs set vaultPath ~/Obsidian/Main
```

| Key | Default | Meaning |
|---|---|---|
| `vaultPath` | unset | Obsidian vault root. Unset means `./learning` in the current folder. |
| `baseFolder` | `Learning` | Folder inside the vault for topics. |
| `notesMode` | `off` | `off`, `on-request`, or `suggest`. |
| `transcriber` | `auto` | `auto`, `captions`, `gemini`, `elevenlabs`, or `openai`. |

## Skills

Every skill is also a slash command: `/learning-with-ai-kit:<skill>` as a Claude Code plugin, or `/<skill>` when copied in directly. You rarely need them, since the agent picks the right skill from plain requests.

| Skill | Role |
|---|---|
| `learn` | Entry point. Finds out what you want and what you know, then routes. |
| `plain-explain` | House style for every explanation. |
| `learning-profile` | Remembers and applies how you like to learn. |
| `research` | Finds and cites sources, using the `researcher` agent. |
| `teach` | Tutoring: find your level, plan, teach one idea at a time. |
| `curate` | Builds a roadmap of the best external resources. |
| `deep-dive` | Works through one source with you. |
| `check-me` | Knowledge checks, on request only. |
| `youtube` | Search, chapters, transcripts, provider setup. |
| `notes-format` | Shared note layout and templates (internal). |
| `note-this`, `session-notes`, `source-notes`, `link-notes`, `notes-check` | Note-taking. |

## Status

Early (v0.1). Feedback and ideas are welcome in the issues.

## License

MIT
