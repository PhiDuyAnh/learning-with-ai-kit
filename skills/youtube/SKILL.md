---
name: youtube
description: Find YouTube videos to learn from and turn videos into timestamped transcripts, using free captions first and Gemini, ElevenLabs, or Whisper when needed. Use when the user shares a YouTube link, asks to find videos on a topic, wants to learn from, summarize, or take notes on a video, or asks what the YouTube features can do or how to set them up.
---

# YouTube

One script, `scripts/yt.mjs` in this skill's folder. It needs Node 20+ and [`yt-dlp`](https://github.com/yt-dlp/yt-dlp#installation) on `PATH`. No npm install.

## First: check the setup

Before the first YouTube command in a session, run:

```bash
node scripts/yt.mjs doctor
```

It reports whether `yt-dlp` is installed, which transcription providers are ready, where each key comes from, and the current `transcriber` setting. It never prints key values.

- **The user asked about the YouTube features or setup** ("what can you do with YouTube?", "set up YouTube"): give the full introduction below.
- **Everything the request needs is ready:** just do the task. No introduction.
- **Something the request needs is missing:** give a short version of the introduction that covers only the gap, then offer to help.

## The introduction

Follow **plain-explain**. Four short parts, in this order:

**1. What it does.** In two or three sentences: find videos on a topic, read a video's chapters and details, and turn a video into a timestamped transcript so you can learn from it, ask questions about it, and take notes with links back to the exact moment.

**2. What needs installing.** Only `yt-dlp`, a free tool that reads YouTube. It's required for everything except Gemini transcription.

**3. Transcription options.** Show this table:

| Option | Cost | Best for | Needs |
|---|---|---|---|
| YouTube captions | Free | Most videos. Fast. | yt-dlp |
| Gemini | Paid API | Videos where the screen matters (slides, code, diagrams, formulas). It watches the video and notes what's shown. | `GEMINI_API_KEY` |
| ElevenLabs Scribe | Paid API | Videos without captions, or with poor ones (accents, technical terms). Very accurate. | `ELEVENLABS_API_KEY` + yt-dlp |
| OpenAI Whisper | Paid API | Short videos without captions (audio must be under 25 MB). | `OPENAI_API_KEY` + yt-dlp |

Say that `auto` (the default) tries free captions first and uses a paid option only when a video has none. For current prices, point to each provider's pricing page; don't quote numbers.

**4. What they have, and what you recommend.** Turn the `doctor` output into a short status ("You have: yt-dlp ✓, Gemini key ✓, ...") and one recommendation:

| Their situation | Recommend |
|---|---|
| No yt-dlp | Install it first. It's the only required step. |
| yt-dlp, no keys | They're set for most videos. Add a key only if they often hit videos without captions, or learn from screen-heavy videos. |
| Learns coding, math, or from slides | Add Gemini. |
| Watches talks, podcasts, or non-English videos | Add ElevenLabs. |
| Already has an OpenAI key, mostly short videos | Use OpenAI. Nothing new to sign up for. |
| `transcriber` isn't `auto` but should be, or vice versa | Say so, and offer to change it with the **learn** config script. |

End with an offer: "Want me to set this up?" Then wait.

## Helping with setup

Do each step only after the user agrees.

**Install yt-dlp:**

| OS | Command |
|---|---|
| macOS | `brew install yt-dlp` |
| Windows | `winget install yt-dlp` |
| Linux | `mkdir -p ~/.local/bin && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ~/.local/bin/yt-dlp && chmod a+rx ~/.local/bin/yt-dlp` |

On Linux, check that `~/.local/bin` is on `PATH` afterwards. If they'd rather install it themselves, give them the command for their OS and wait.

**Add an API key.** The user enters keys themselves. **Never ask for a key in chat, never type one, and never print one.**

1. Tell them where to get the key: Gemini at [Google AI Studio](https://aistudio.google.com/apikey), ElevenLabs at [API keys settings](https://elevenlabs.io/app/settings/api-keys), OpenAI at [API keys](https://platform.openai.com/api-keys).
2. Offer to create the key file `~/.learning-with-ai-kit/.env` with an empty line for the key they want, readable only by them:
   ```bash
   mkdir -p ~/.learning-with-ai-kit && touch ~/.learning-with-ai-kit/.env && chmod 600 ~/.learning-with-ai-kit/.env
   echo 'ELEVENLABS_API_KEY=' >> ~/.learning-with-ai-kit/.env
   ```
3. Ask them to open the file, paste the key after `=`, and save. (Setting the variable in their shell profile works too; the environment wins over the file.)

**Change the default provider:** `node ../learn/scripts/config.mjs set transcriber <auto|captions|gemini|elevenlabs|openai>` (path relative to this skill's folder).

**Finish** by running `doctor` again and showing the new status.

If `yt-dlp` is old, YouTube downloads can break. When a command fails with an extraction error, suggest updating: `yt-dlp -U` (standalone binary) or `brew upgrade yt-dlp`.

## Commands

```bash
# Find videos
node scripts/yt.mjs search "how transformers work" --max 5 --min-duration 300 --upload-date year

# Title, channel, length, chapters, and whether captions exist
node scripts/yt.mjs info "<url>"

# Transcript: free captions first, then a paid provider if needed
node scripts/yt.mjs transcribe "<url>" --out <topic folder>/sources/raw/<title>.md
```

Flags: `--provider auto|captions|gemini|elevenlabs|openai`, `--lang en`, `--json`, `--out <file>`. `transcribe` also takes a local audio file (ElevenLabs or OpenAI only).

Exit codes: `2` means a missing tool or API key, `3` means no captions. Don't silently switch to a paid provider. On either, run `doctor` and give the short introduction for the gap (see above). `YTDLP_MISSING` means yt-dlp needs installing.

## Choosing a provider

Without `--provider`, the script uses the `transcriber` config value (see **learn**). Pass `--provider` only when the user asks for a specific one, or when the video clearly suits one (see the options table) and the user agrees. `auto` tries captions, then Gemini, ElevenLabs, and OpenAI, using the first whose key is set.

## Finding videos to learn from

When searching for the user, prefer videos from recognized educators and official channels, at the right length and level for them. Use `info` on the top candidates before recommending, and present at most 3 picks with one line each on why.

## Learning from a video

1. Run `info` first: chapters make a great outline.
2. Get the transcript, save it to `sources/raw/` in the topic folder when one exists, then hand off to **deep-dive**.
3. Always point to timestamps as links (`https://youtu.be/<id>?t=<seconds>`) so the user can jump to the moment.
4. If notes are on, offer **source-notes**.
