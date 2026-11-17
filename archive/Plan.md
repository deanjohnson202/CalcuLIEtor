# Calculietor — Project Handoff

## Concept

**Calculietor** is a browser-based puzzle game built from the existing hand-coded calculator project.

The central idea:

> The calculator is lying. Figure out how it works.

The player is shown an indirect clue that implies a target number. The calculator looks familiar, but its keys do not necessarily do what their labels suggest. The player experiments freely, learns the hidden behavior of the machine, and advances once the display reaches the intended target.

The game is about **deduction and mastery of a progressively corrupted calculator**, not arithmetic speed.

---

## Core Game Loop

For each puzzle:

1. Show a clue rather than the target number directly.
2. Player infers the intended target.
3. Player experiments with the calculator.
4. Key behavior is deterministic but may differ from the visible label.
5. Player learns the hidden rules through observation.
6. When the display reaches the correct target, the puzzle completes automatically.
7. Advance to the next puzzle.
8. A reset button lets the player restore the current puzzle state at any time.

There is currently **no keystroke limit**.

Wrong inputs are not failure. Experimentation is part of the game.

---

## Fundamental Input Rule

### One-digit input

The player must not be able to solve a target by simply typing the full number.

Numeric keys therefore **do not append digits into multi-digit input**.

Pressing:

`4`, `0`, `4`

must not directly create:

`404`

Instead, each press should act on the calculator's current state.

Multi-digit results must be created by using the calculator's behaviors.

This is a permanent game rule and should be made clear through play rather than treated as a hidden corruption.

Conceptually:

```text
current_state + key_press -> new_state
```

rather than:

```text
typed_digits -> number
```

The display may contain multi-digit values even though direct input is limited to one digit at a time.

---

## Persistent Corruption

The hidden behavior of the calculator should **carry forward through the game**.

The player is gradually learning one machine.

Previously learned mappings should not be arbitrarily randomized between puzzles.

Example:

If the player learns during Stage 1 that the key labeled `7` actually represents `3`, that mapping should remain true in later stages unless the game explicitly introduces a new mechanic that changes behavior contextually.

The progression should feel like accumulating knowledge.

---

## Stage Progression

### Stage 1 — Number Chaos

The number keys are mixed up.

Example hidden mapping:

```text
visible 7 -> actual 3
visible 2 -> actual 8
visible 9 -> actual 1
```

Goal:
Teach the player that visible labels cannot be trusted.

Early puzzles should allow the number mapping to be deduced through experimentation.

---

### Stage 2 — Operator Chaos

The number mapping from Stage 1 remains in effect.

Now operators are also incorrect.

Example:

```text
+ -> ×
- -> +
× -> ÷
÷ -> -
```

Goal:
Force the player to combine remembered number mappings with newly discovered operator mappings.

Do not necessarily announce that the operators changed.

A good reveal is for the player to confidently attempt a solution using their Stage 1 knowledge and discover that something else is now wrong.

---

### Stage 3 — Control-Key Chaos

Numbers and operators remain corrupted.

Now calculator control keys acquire unexpected meanings.

Candidates include:

- `C`
- backspace
- `=`
- decimal point, if retained

Examples:

```text
C -> reverse digits
Backspace -> double current value
= -> add 1
```

These are examples only. Actual behaviors should be chosen for puzzle quality.

Goal:
Expand the player's understanding from "wrong labels" into "every button may be a function."

---

### Stage 4 — Contextual Behavior

Introduce behaviors that depend on calculator state or previous inputs.

Examples:

- A key behaves differently if pressed twice.
- A number key changes meaning after an operator.
- `=` repeats or modifies the previous operation.
- A control key acts differently depending on whether the display is odd/even.
- A key uses the previous key as part of its function.

Goal:
Make the machine feel deeper without becoming random.

Important:
All contextual behavior must remain deterministic and discoverable.

---

### Final Stage — Full Calculietor

No major new rule should be introduced.

The player must combine everything learned:

- number mappings
- operator mappings
- control-key behavior
- contextual rules

The finale should feel like mastery of the entire corrupted machine.

Suggested final clue:

> **The Answer to Life, the Universe, and Everything**

Target:

```text
42
```

The correct sequence should ideally have nothing to do with simply entering `6 × 7`.

---

## Clue-Based Targets

Do not normally display:

```text
TARGET: 404
```

Instead show a phrase or riddle that implies the target.

Examples:

| Clue | Target |
|---|---:|
| The loneliest number | 1 |
| A baker's dozen | 13 |
| Blackjack | 21 |
| Not Found | 404 |
| Jackpot | 777 |
| The mark of the beast | 666 |
| A byte's possibilities | 256 |
| The game where numbers merge | 2048 |
| The Answer to Life, the Universe, and Everything | 42 |

The player must solve both:

1. What number does the clue imply?
2. How do I make the corrupted calculator produce it?

Early clues should be obvious enough to establish this convention naturally.

---

## Design Principles

### 1. Deterministic, never random

The calculator may be deceptive, but it must not be arbitrary.

Given the same state and same key press, the same result should occur.

Random behavior would turn deduction into guessing.

---

### 2. Knowledge persists

The main progression is the player's understanding of the machine.

Do not constantly invalidate what they have already learned.

---

### 3. Experimentation is allowed

No keystroke limit in the current design.

The player should be able to poke at the machine, observe what happens, reset, and try again.

Failure is simply information.

---

### 4. Reset is voluntary

Provide a reset/restart control that restores the current puzzle's initial state.

It should not erase the player's overall game progress or change hidden mappings.

---

### 5. Do not explain the hidden rules

The game should not provide a rule sheet.

The player discovers the behavior through interaction.

Basic game controls can be explained, but the corruption itself should remain implicit.

---

### 6. Keep the display numeric for the MVP

Earlier exploration considered colors, words, shapes, and other non-arithmetic display states.

Do **not** include these in the first implementation.

The conceptual weirdness can live in the clue system while the calculator display remains numeric.

This keeps the core puzzle understandable and gives room for later expansion.

---

### 7. Sound is optional

The original project is a sound calculator, but sound is no longer a required game mechanic.

Existing calculator sounds can remain as interaction feedback.

Do not make audio necessary to solve puzzles in the MVP.

---

## MVP Scope

Do not build the entire game immediately.

First prove that the core interaction is fun.

Suggested MVP:

### Puzzle set

Create approximately 5–8 puzzles.

Possible structure:

#### Stage 1
Three puzzles using one persistent scrambled number mapping.

#### Stage 2
Two or three puzzles that retain the number mapping and add scrambled operators.

#### Stage 3
One or two puzzles introducing a corrupted control key.

No contextual rules required yet.

If this works, expand into later stages.

---

## Suggested MVP Puzzle Flow

Example only:

### Puzzle 1

Clue:

> The loneliest number

Target:

```text
1
```

Purpose:
Teach that clues imply numbers and number labels are unreliable.

---

### Puzzle 2

Clue:

> A baker's dozen

Target:

```text
13
```

Purpose:
Require construction of a multi-digit result using the hidden number mapping.

---

### Puzzle 3

Clue:

> Blackjack

Target:

```text
21
```

Purpose:
Reinforce Stage 1 rules.

---

### Puzzle 4

Clue:

> A quarter of a century

Target:

```text
25
```

Introduce operator corruption.

---

### Puzzle 5

Clue:

> Not Found

Target:

```text
404
```

Require use of learned number and operator mappings.

This could be a strong milestone puzzle because the clue itself reinforces the game's "broken machine" theme.

---

## Suggested State Model

Keep the puzzle engine separate from the UI.

A possible structure:

```js
gameState = {
  stage: 1,
  puzzleIndex: 0,
  displayValue: 0,
  previousValue: null,
  previousKey: null,
  pendingOperator: null,
  history: []
}
```

Persistent corruption rules:

```js
calculatorRules = {
  digitMap: {
    0: 6,
    1: 4,
    2: 8,
    3: 0,
    4: 7,
    5: 2,
    6: 9,
    7: 3,
    8: 5,
    9: 1
  },

  operatorMap: {
    "+": "*",
    "-": "+",
    "*": "/",
    "/": "-"
  },

  controls: {
    "clear": "normal",
    "equals": "normal",
    "backspace": "normal"
  }
}
```

Puzzles:

```js
puzzles = [
  {
    stage: 1,
    clue: "The loneliest number",
    target: 1,
    startValue: 0
  },
  {
    stage: 1,
    clue: "A baker's dozen",
    target: 13,
    startValue: 0
  },
  {
    stage: 2,
    clue: "Not Found",
    target: 404,
    startValue: 0
  }
]
```

The exact data model should follow the existing project's architecture rather than forcing this shape.

---

## Input Processing Architecture

Avoid burying puzzle logic directly inside DOM click handlers.

Prefer:

```text
button clicked
    ↓
interpret visible key according to current rules
    ↓
apply hidden behavior to calculator state
    ↓
update display
    ↓
check puzzle target
    ↓
complete puzzle if matched
```

Conceptually:

```js
function pressKey(visibleKey) {
  const action = resolveHiddenAction(visibleKey, gameState, calculatorRules);
  applyAction(action, gameState);
  renderDisplay();
  checkForPuzzleCompletion();
}
```

This separation will make later corruption mechanics much easier to add.

---

## Puzzle Completion

After every state-changing keypress:

```js
if (displayValue === currentPuzzle.target) {
  completePuzzle();
}
```

Suggested behavior:

1. Brief visual success state.
2. Disable accidental extra input during transition.
3. Advance to next puzzle.
4. Preserve calculator corruption mappings.
5. Initialize the next puzzle's starting state.

No explicit submit button should be necessary unless the existing UI makes one useful.

---

## Puzzle Reset

Reset should:

- restore the puzzle's starting display/state
- clear temporary expression/history state
- preserve the current puzzle
- preserve stage progress
- preserve hidden key mappings

It should **not** reshuffle the calculator.

---

## UI Direction

Reuse the existing browser calculator as much as possible.

Add only the game UI necessary around it:

```text
[ clue ]

[ calculator display ]

[ calculator keypad ]

[ Reset ]
```

Optional later additions:

- puzzle/stage indicator
- minimal transition text
- progress dots
- completion animation

Avoid turning the first version into a large game interface.

The familiar calculator appearance is important because the game depends on the player trusting familiar labels before learning that they are wrong.

---

## Important Technical Constraint

The visible labels and hidden functions must be separate.

Do not modify button labels merely to represent their true value.

For example:

```html
<button data-visible-key="7">7</button>
```

The game engine determines what `7` actually does.

The UI should continue showing `7`.

---

## Future Expansion Ideas

Not part of the MVP:

- words on the calculator display
- colors
- shapes
- symbols
- dates/times
- non-numeric state machines
- procedural puzzle generation
- keystroke optimization challenges
- daily puzzles
- speedrun mode
- sound-based clues
- multiple corruption seeds/runs
- player notebook or discovered-rule UI
- achievements
- scoring

Do not implement these until the numeric core game has been tested.

---

## Open Design Questions

These can remain unresolved during the first implementation:

1. Should number mappings be a complete permutation of 0–9, or can some keys perform transformations?
2. How many puzzles should exist per stage?
3. Should puzzle transitions announce a new stage or let the player discover that something changed?
4. Should puzzle completion happen instantly when the target appears, or after a short pause?
5. Should there be an explicit in-game Reset key separate from the corrupted calculator's own `C` button?
6. Should hidden mappings be fixed for every player or selected from authored rule sets?

Recommended MVP answers:

- use a fixed authored permutation
- 2–3 puzzles per stage
- minimally announce stage changes, if at all
- complete automatically when the target appears
- use a separate trustworthy game-level Reset control
- keep all mappings fixed and authored

---

## First Tasks for the Coding Agent

1. Inspect the existing calculator code and identify:
   - calculator state
   - numeric input handling
   - operator handling
   - clear/backspace/equal behavior
   - display rendering
   - sound hooks

2. Refactor only as much as needed so visible key input can pass through a hidden-rule layer.

3. Implement the one-digit input model:
   - digits should not append to form direct multi-digit numbers
   - multi-digit display values must be produced through calculator operations

4. Add a puzzle configuration structure containing:
   - clue
   - target
   - starting state
   - stage

5. Add persistent digit remapping.

6. Build 3 Stage 1 puzzles.

7. Add persistent operator remapping.

8. Build 2 Stage 2 puzzles.

9. Add a game-level Reset control that restores the current puzzle without changing hidden rules.

10. Add automatic target detection and puzzle progression.

11. Preserve existing sound only as ordinary key feedback if it is already cleanly implemented.

12. Keep the implementation simple enough that new corruption functions can later be registered without rewriting the calculator.

---

## Definition of Done for the First Prototype

The first prototype is successful when:

- the user opens the existing calculator page
- a clue is displayed
- visible number labels do not correspond to their actual behavior
- the player can experiment indefinitely
- pressing multiple digit keys cannot simply type a multi-digit target
- reset restores the puzzle without changing the hidden mapping
- reaching the hidden target automatically advances the puzzle
- the same number mapping remains across Stage 1 puzzles
- Stage 2 adds operator corruption without removing Stage 1 knowledge
- at least one clue-based target such as `NOT FOUND -> 404` is playable
- the puzzle logic is separated enough from the UI to support later stages

---

## Product North Star

Do not optimize for difficult arithmetic.

Optimize for the feeling:

> "I finally understand how this stupid calculator thinks."

The player should begin by seeing familiar calculator buttons and interpreting them literally.

By the end, they should see the same buttons as a set of learned hidden functions.

The final puzzle should test mastery of that accumulated mental model.

**Final target: 42.**
