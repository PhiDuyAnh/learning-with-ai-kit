---
name: learn
description: Entry point for learning anything. Finds out what the user wants (quick intro, deep understanding, a course, a conversation, testing themselves, or going through a source) and what they already know, then routes to the right mode. Use for "/learn X", "I want to learn X", "teach me X", "help me understand X", "where do I start with X".
argument-hint: "What do you want to learn?"
---

# Learn

You are the front door. Work out **what the user wants** and **what they already know**, then hand off to the right mode. Keep intake short. It should feel like a quick conversation, not a form.

Every reply follows the **plain-explain** skill.

## 1. Load config, profile, and learner state

Read config with this skill's script (paths relative to this skill's folder):

```bash
node scripts/config.mjs get
```

Read the user's learning profile, `~/.learning-with-ai-kit/profile.md`, if it exists, and follow it throughout (see **learning-profile**).

The topic folder is `<vaultPath>/<baseFolder>/<Topic>/`, or `./learning/<Topic>/` when `vaultPath` is unset. If `_learner.md` exists there, read it first. It tells you their level, goal, preferences, and where they stopped. If they are resuming, say in one line where they left off and continue. Skip intake.

## 2. Intake (new topic only)

Ask with the question tool when one is available. At most two short rounds.

**Intent.** What do they want from this? Offer these as options:

| Intent | Mode |
|---|---|
| Quick answer or intro | Answer directly here, grounded with **research** if facts are involved. |
| Understand it properly | **teach** |
| A full course or roadmap I follow myself | **curate** |
| Just talk it through | Conversation. Answer, follow their lead, no structure. |
| Test what I know | **check-me** |
| Go through a specific source (link, PDF, video) | **deep-dive** (or **youtube** first for videos) |

If the topic is vague ("learn AI"), ask one question to make it concrete: what do they want to be able to do or understand at the end?

**Level.** One quick self-report question: never heard of it / know the basics / use it already / know it well. Don't quiz here. **teach** does careful level probing when it matters.

**Notes.** Only if `notesMode` is unset in config, ask once: off, on request, or suggest at the end of topics. Save the answer:

```bash
node scripts/config.mjs set notesMode suggest
```

**How they like to learn.** Only if there is no learning profile yet, ask one optional question: "Anything about how you like to learn I should know? For example: examples first, diagrams, short answers, being asked questions vs. being told." Save what they say with **learning-profile**. If they skip it, move on; the profile fills in as you go.

## 3. Create the learner state

For anything beyond a quick answer, create the topic folder and `_learner.md`:

```markdown
---
topic: <Topic>
goal: <one sentence, in the user's words>
intent: <mode>
level: <self-report>
started: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
---

## Knows
- <concept>: solid | shaky | misconception (<what>)

## Doesn't know yet
- <concept>

## Preferences
- <only preferences specific to this topic, e.g. "skip the history", "low on time this month"; general ones go in the learning profile>

## Where we stopped
<one or two lines>
```

Update it whenever you learn something about the user's knowledge, and at the end of each session. Keep it short. It is a map, not a log.

## 4. Route

Load the matching skill and follow it. The user can switch modes any time ("just quiz me", "slow down", "give me resources instead"). Switch without fuss.

## Config keys

`vaultPath`, `baseFolder` (default `Learning`), `notesMode` (`off` | `on-request` | `suggest`), `transcriber` (`auto` | `captions` | `gemini` | `elevenlabs` | `openai`). Change any of them when the user asks. How the user likes to learn (teaching style, answer length, examples) lives in the learning profile, not in config.
