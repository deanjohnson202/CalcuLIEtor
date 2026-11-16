# CalcuLIEtor

Make the display answer each clue by experimenting with the live keys. The machine keeps the same secrets throughout all eight puzzles; only the available keys change. There is no time or press limit.

Every functional key tells a half-truth: its label is evidence, but not a complete instruction. Digit keys use their own number; symbol keys take a skewed reading of their symbol. Learn each rule and reuse it in later puzzles. The 4, 6, and 8 keys are never live.

Open `index.html` directly in your browser. No dependencies, server, installation, or build is needed.

Click keys or use digits, `+`, `-`, `*` (×), Enter (=), and `c`/`C`. Grey keys do nothing. Each live press changes the display immediately, and the paper tape records the key and its before/after values, even when unchanged. Scroll to revisit any press in the current puzzle.

The separate Reset restores the puzzle's starting display and adds a divider to the tape. If the display reads ERR, use Reset to recover. Correct answers lock input for one second, then start the next puzzle with a fresh tape. After the final puzzle, choose Play again.

Run `node --test` for engine checks, shortest-solution lengths, and fixed-seed random-play hit fractions. The engine has no DOM access; classic scripts work from `file://` and expose CommonJS exports for tests.
