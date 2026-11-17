# CalcuLIEtor

A browser puzzle game. The calculator is lying: figure out how it works.

Each puzzle shows a clue that implies a number. The player works out what the keys really do, gets that number onto the display, and submits it.

## Play

Open `index.html` in a browser. There is nothing to install or build.

## Current design

This section is the spec. It describes how the game behaves without saying what any key does; the key functions and puzzle solutions live in `src/puzzles.js` and `test/engine.test.js`, so avoid those files if you want to play unspoiled.

### The machine

- The display holds one whole number. Every working key is a hidden function that turns the number on the display into another number. There is no typing of digits and no pending operation.
- **Half-truths.** A key's label constrains what it does without fully telling you. A digit key always uses its own number, but the operation is hidden. A symbol key does a skewed reading of its symbol.
- **One machine.** A key means the same thing for the whole game. Puzzles never change what a key does, only which keys are awake.
- **Deterministic.** The same key on the same number always gives the same result.
- A result that is not a whole number from 0 to 99,999,999 shows `ERR`. Only Reset clears it.

### A puzzle

Each puzzle is four things: a clue, the target the clue implies, a starting number, and the short list of keys that are awake.

- Keys that are not awake are greyed out and cannot be pressed. That keeps "not part of this puzzle" distinct from "awake, but did nothing to this number", which is a real clue.
- Each puzzle introduces one or two new keys and reuses keys learned earlier.
- There is no limit on key presses. Experimenting is the game.

### Submitting

- Nothing completes on its own. The player presses **Submit** when they believe the display answers the clue.
- A correct answer moves on to the next puzzle.
- A wrong answer is marked on the tape and sends the display back to the puzzle's starting number.

### Reset

**Reset** restores the puzzle's starting number. It is separate from the keypad and always does what it says. It never changes progress or what any key does.

### The tape

A paper-tape panel records facts only: each key pressed with the number before and after, each reset, and each submission with whether it was right. It never names a function. The tape survives Reset and is cleared when the next puzzle starts.

### Progress and summary

- The current puzzle, tape and statistics are saved in the browser, so closing the page does not lose progress. **Start over** clears it.
- After the last puzzle, a summary lists the key presses used on each puzzle against the fewest possible, and the number of wrong answers.

### Keyboard

Digits, `+`, `-`, `*` (for ×), Enter (for =) and `c` (for C) press the matching key and are subject to the same hidden functions. Submit, Reset and Start over are buttons only.

## Code

| File | Role |
|---|---|
| `src/puzzles.js` | Data: the function table, key assignment and puzzle list. Spoilers. |
| `src/engine.js` | Game rules with no DOM access: press, submit, reset, advance. |
| `src/ui.js` | DOM wiring, rendering, saving. |
| `test/engine.test.js` | Rules tests, plus a solver that checks every puzzle. Spoilers. |

Adding a puzzle means adding one line to the puzzle list. Adding a key behaviour means adding one function to the table and assigning it to a key.

## Tests

```
node --test
```

The tests include a breadth-first solver run against the real engine. It checks that every puzzle is solvable, that each puzzle's recorded best matches the true shortest solution, and that each newly introduced key is necessary. It also prints how often random key-mashing lands on each target.

## History

- `archive/Plan.md` is the original design handoff. The game has moved on from it: that plan remapped digits and operators on a working calculator.
- The `arbitrary-keys` branch holds an earlier version in which key functions had no relationship to their labels.
