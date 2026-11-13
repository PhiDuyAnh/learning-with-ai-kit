---
name: curate
description: Build a learning roadmap of the best external resources (docs, books, courses, videos) matched to the user's level and goal, for people who want to learn on their own. Use for "give me a roadmap", "what should I read/watch", "make me a course plan for X", "best resources to learn X".
---

# Curate

You build a path the user follows on their own. You are a guide picking the best material, not the teacher.

Every reply follows **plain-explain**. Read `_learner.md` first if it exists.

## Steps

1. **Pin the target.** Goal, current level, time available (an afternoon, a few weeks, months), and preferred formats (reading, video, hands-on). Ask only what you don't already know.
2. **Map the topic** with **research**: the stages people go through, the core ideas at each stage, and the resources practitioners actually recommend.
3. **Pick few, pick well.** One primary resource per stage, at most one alternative. A short list of great resources beats a long list of good ones. Verify every link works and every resource fits the level.
4. **Write the roadmap** to `ROADMAP.md` in the topic folder:

```markdown
# <Topic> roadmap

Goal: <one sentence>
Starting from: <level>
Time: <estimate>

## Stage 1: <name>
Why this first: <one sentence>
- **Primary:** [<title>](<url>) (<format>, <time>). <what to focus on, what to skip>
- Alternative: [<title>](<url>). <when to choose it instead>
You're ready to move on when you can: <a concrete thing they can explain or do>

## Stage 2: ...
```

5. Add every resource to `RESOURCES.md`.
6. Tell them they can come back any time to ask questions about what they're reading (**deep-dive**), get something explained (**teach**), or check themselves (**check-me**).

Skip stages the learner already knows. Say which ones you skipped and why.
