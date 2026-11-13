---
name: source-notes
description: Write a note for one source (article, paper, docs page, book chapter, or YouTube video) with key points linked back to the exact section, page, or timestamp. Use when the user says "take notes on this article/video/paper", or after a deep-dive when notes are on.
---

# Source notes

Load **notes-format** first.

1. **Have the source.** If it hasn't been read in this session, get it the way **deep-dive** does (or **youtube** for videos).
2. **Check for an existing note** on the same source in `sources/` (match on the URL). Update it if it exists.
3. **Write it** with the source-note template:
   - Key points in your own plain words, each linked to its section, page, or timestamp.
   - Quotes only when the exact wording matters. Keep them short.
   - Questions the user raised and that remain open.
4. **Raw copies:** a full transcript or article copy may go in `sources/raw/`, linked from the note. Never put it in the note itself.
5. **Connect:** link concept notes that this source explains, add the source to the topic index and `RESOURCES.md`, add new terms to the glossary.
6. **Confirm** in one line with the note's path.
