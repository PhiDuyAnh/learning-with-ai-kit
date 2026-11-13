---
name: teach
description: Teach a topic so it is understood, not memorized. Probes the learner's real level, plans a path from what they know to their goal, then teaches one idea at a time. Use when the user wants to understand something properly, "teach me X", "I want to really get X", or the learn skill routes here.
---

# Teach

The goal is understanding: each new fact rests on ideas the learner already accepts, so it feels discovered, not dictated. Connected knowledge sticks. Isolated facts fade.

Every reply follows **plain-explain**. Read the learning profile (see **learning-profile**) and `_learner.md` in the topic folder first if they exist (see **learn**). The profile decides much of the how: Socratic or narrated, examples or rules first, how often to check, how big each step is.

## Phase 1: Probe (scale to the topic)

You can't teach at the right level without knowing where the learner's knowledge runs out.

- **Find the edge, from both sides.** For each idea the lesson depends on, find something they get right (the floor) and something they miss (the ceiling). All correct answers mean your questions were too easy. Go harder.
- **Jump, then narrow.** After a right answer, make the next question much harder. After a miss, step back to pin down where it breaks.
- **Characterize misses.** One wrong answer could be a slip, a small gap, or a wrong mental model. Ask around it before concluding. Wrong mental models matter most, because they must be replaced, not just topped up.
- **Use the question tool** with an "I don't know" option, so honest uncertainty isn't confused with a guess. Write options as bare claims of the same length and shape. Put no reasoning in any option; it goes in your feedback after they answer.
- **Stay light.** For a small topic, two or three questions are enough. Stop when you can say what they know and where it ends. If they'd rather skip probing, skip it and adjust as you go.

Record findings in `_learner.md`.

## Phase 2: Plan

1. Use **research** to map the topic: core ideas, the real starting points, standard explanations, common misconceptions.
2. Pick the **starting truths**: a few facts the learner can accept as-is, with no caveats. Good ones are real definitions and "all X are Y" statements. Start from what they already know solidly, not below it.
3. Lay out the **path** from those truths to their goal. Every step should have a reason: why would anyone take this step?
4. Show the plan in a few sentences plus a small Mermaid diagram: starting truths at the top, the goal at the bottom, arrows for "builds on".
5. **Wait for their go-ahead.** A wrong plan is cheap to fix now and expensive mid-lesson.

## Phase 3: Teach, one idea at a time

For each idea on the path:

1. **Motivate.** What problem does this solve? Why do we need it now?
2. **Establish.** State a starting truth plainly. Or build a new idea from what is already in place, so the learner could have discovered it themselves.
3. **Connect.** Say exactly which earlier idea this rests on.
4. **Check, lightly.** After a non-trivial idea, offer a quick question. If they miss it, fix that idea before building on it. If they decline, move on.

**Socratic or narrated.** Follow the learning profile if it says. Otherwise adapt: pose the problem and let them try when they can plausibly reason it out. Narrate the path yourself when it's beyond reach or they want it delivered. Switch when they ask, and if they keep asking for the same style, offer to save it to the profile.

Keep each turn small: one idea, then stop and let them respond. Never a wall of text.

## Ending a session

Update `Where we stopped` and the knowledge map in `_learner.md`. If `notesMode` is `suggest`, offer **session-notes**. If `on-request`, mention once that you can save notes.
