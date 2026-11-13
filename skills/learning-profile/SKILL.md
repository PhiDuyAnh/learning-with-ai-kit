---
name: learning-profile
description: The user's learning profile, a markdown file recording how they like to learn and how they want answers, so every learning-with-ai-kit skill adapts to them. Use when the user states a lasting preference ("always give examples", "shorter answers", "I learn best with visuals"), asks to see or change their profile ("what do you know about how I learn?", "forget that preference"), or when another skill needs to record a preference.
---

# Learning profile

One file, `~/.learning-with-ai-kit/profile.md`, holds how this user likes to learn. Every learning-with-ai-kit skill reads it before teaching or answering and adapts to it. It's plain markdown, so the user can open and edit it any time.

## Format

```markdown
---
updated: YYYY-MM-DD
---

# Learning profile

## About me
- <background that changes how to explain: field, experience, languages> (said YYYY-MM-DD)

## How I learn best
- <e.g. concrete example before the general rule> (said YYYY-MM-DD)
- <e.g. narrated explanations; Socratic questions only when I ask> (confirmed YYYY-MM-DD)

## How I want answers
- <length, tone, formatting, language, math notation>

## Avoid
- <things that don't work for them>
```

Each line is one preference, short, with where it came from: `said` (the user stated it) or `confirmed` (you noticed it and they agreed). Keep the whole file under about 40 lines. It's a profile, not a log.

Topic-specific preferences ("for this Rust course, skip the theory") go in that topic's `_learner.md` under `## Preferences`, not here. Everything else goes here.

## Reading it

Read the profile at the start of any learning-with-ai-kit task when it exists. Apply it in this order, with earlier entries winning:

1. What the user asks in the current message.
2. `## Preferences` in the topic's `_learner.md`.
3. This profile.
4. The skill's own defaults.

Two things never bend: accuracy (verify, cite) and making sure the user can follow (a term they don't know still gets explained). A preference changes *how* you do these, never *whether*. "Shorter answers" means fewer words, not undefined jargon.

## Recording preferences

**The user says it.** Apply it right away. Then:
- If it's clearly lasting ("always", "in general", "I prefer", "I'm a visual learner"), save it and confirm in one line: "Saved to your learning profile: examples before the general rule."
- If it's clearly one-off ("shorter this time"), just apply it. Don't save.
- If you can't tell, apply it and ask: "Want me to remember that for next time?"

**You notice a pattern.** For example, they keep asking for examples, always skip the quiz, or ask you to slow down. After it happens two or three times, propose it once: "You often ask for an example first. Should I always lead with one?" Save only on a yes, as `confirmed`.

**When writing:**
- Replace a line that conflicts with the new preference. Don't keep both.
- Merge near-duplicates into one line.
- Bump `updated`.
- Create the file and the `~/.learning-with-ai-kit/` folder if they don't exist.
- Never record sensitive personal details (health, finances, relationships) even if mentioned. Record only what changes how to teach.

## Showing and changing it

- "Show my learning profile": show the file's contents as is.
- "Forget X" / "That's wrong": remove or fix the line and confirm.
- "Reset my profile": confirm first, then clear everything below the title.
