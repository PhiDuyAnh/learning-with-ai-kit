---
name: deep-dive
description: Work through one source the user provides (article, docs page, PDF, paper, repo, or video transcript) so they understand it fully. Use when the user shares a link or file and says "go through this", "explain this paper", "help me understand this article", or after the youtube skill fetches a transcript.
---

# Deep dive

The source is the ground truth. Teach what it says, clearly, and flag where it is wrong or out of date.

Every reply follows **plain-explain**.

## 1. Get the source

| Source | How |
|---|---|
| Web page | Fetch it. If the page is cluttered and the `defuddle` skill (obsidian-skills) is installed, use it for clean markdown. |
| PDF or local file | Read it. For long PDFs, read the outline and abstract first, then sections as needed. |
| Repo | Read the README and the structure, then the files the question needs. |
| YouTube video | Use the **youtube** skill to get the transcript first. |

If the topic folder exists, save a copy of long sources to `sources/` there, so later sessions don't fetch them again.

## 2. Orient

Give a short map in plain words: what this source is, who it's for, its main claim or purpose, and how it's organized. Then ask how they want to go through it:

- **Summary:** the key ideas, each explained, in order.
- **Walkthrough:** section by section, at their pace.
- **Questions:** they ask, you answer from the source.

## 3. Go through it

- Quote or point to the exact section, page, or timestamp for each point, so they can check it.
- Explain every term the source uses but doesn't define. The source's jargon is the main thing that blocks understanding.
- When the source assumes knowledge the learner lacks, explain that background briefly, then return to the source.
- If the source is wrong, outdated, or disputed, say so and cite where you checked (use **research**).

## 4. Finish

Offer a quick **check-me** on the source. If notes are on, offer **source-notes**.
