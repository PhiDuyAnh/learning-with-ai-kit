---
name: link-notes
description: Keep learning notes connected and free of duplicates. Finds an existing note before a new one is created, adds links between related notes, and keeps the topic index current. Used by the other note skills; also use when the user says "organize my notes on X", "link my notes", or "clean up my notes".
---

# Link notes

Load **notes-format** first.

## Before creating a note

Search the topic folder for the idea: file names, `aliases` in frontmatter, and headings. Use a plain file search (grep). If the Obsidian app is running and the idea may live outside this topic folder, the **obsidian-cli** skill's search can cover the whole vault.

- **Same idea exists:** update that note. Merge the new content, keep it one idea, bump `updated`.
- **Close but different idea:** create the new note and link the two, saying how they differ.
- **Nothing:** create it.

## After creating or updating

- Add `## Builds on` and `## Related` links in both directions where it makes sense.
- Add the note to the topic index under the right section, and update the index's Mermaid map if a new idea joins the path.
- Turn plain mentions of existing note titles into `[[links]]`, only on first mention per note.

## Organize on request

When asked to organize a topic's notes: list duplicates, orphans (notes nothing links to), and notes that hold more than one idea. Propose merges and splits, and apply them only after the user agrees. Never delete a note without asking.
