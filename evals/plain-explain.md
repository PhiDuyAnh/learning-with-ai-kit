# plain-explain evals

Run each prompt in a fresh session with the plugin installed. Grade the first reply against the rubric. The goal is a reply both a non-technical reader and an expert would call clear and correct.

## Rubric (pass/fail per item)

1. **Plain opening:** the first two sentences make sense with no background.
2. **Terms defined:** every technical term is defined at first use, or not used.
3. **Formulas explained:** every formula comes with what it calculates, what each symbol means, and a small worked example.
4. **No padding:** no history, alternatives, caveats, or "worth noting" the question didn't need.
5. **Complete:** the mechanism is actually explained (what happens and why), not just named.
6. **Right length:** a simple question gets a short answer; it ends by offering depth, not by dumping it.
7. **Correct:** facts check out against a reliable source.

## Prompts

| # | Prompt | Watch for |
|---|---|---|
| 1 | What is compound interest? | Formula explained symbol by symbol, with numbers. |
| 2 | How does a vaccine work? | Terms like antigen and antibody defined. |
| 3 | What is a neural network? | No unexplained "weights", "activation", "backprop". |
| 4 | Explain Bayes' theorem. | Formula plus a worked example; no wall of notation. |
| 5 | What is inflation and why does it happen? | Mechanism, not a list of causes. |
| 6 | What's the difference between TCP and UDP? | Short; defines "packet" and "connection". |
| 7 | What does a p-value mean? | Doesn't drift into a stats lecture. |
| 8 | How do black holes form? | Plain words for "gravity", "collapse", "event horizon". |
| 9 | What is a REST API? | Doesn't assume knowledge of HTTP. |
| 10 | What is entropy? | Picks one meaning (or asks which), doesn't cover all fields. |
| 11 | How does photosynthesis work? | Chemical equation explained, not just shown. |
| 12 | What is a derivative in calculus? | Notation $\frac{dy}{dx}$ explained with a concrete example. |

## Routing checks

| Prompt | Expected skill |
|---|---|
| I want to learn Rust properly | `learn` → `teach` |
| Give me a roadmap to learn piano theory | `learn` → `curate` |
| Quiz me on what we just covered | `check-me` |
| Go through this paper with me: <url> | `deep-dive` |
| Learn from this video <youtube url> | `youtube` → `deep-dive` |
| Note this | `note-this` |
| What did I learn about TCP last week? | `notes-check` |
