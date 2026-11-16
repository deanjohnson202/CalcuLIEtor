'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../src/engine.js');
const { FN, KEYS, puzzles } = require('../src/puzzles.js');
const press = (key, state, data = puzzles) => engine.pressKey(key, state, data);

test('all fixed functions, including unchanged results and leading zero reversal', () => {
  const cases = {
    add3: [[0, 3], [28, 31], [99, 102]],
    half: [[0, 0], [3, 1], [28, 14]],
    rev: [[7, 7], [40, 4], [123, 321]],
    rep: [[0, 0], [7, 77], [123, 1233]],
    dbl: [[0, 0], [7, 14], [16, 32]],
    sq: [[0, 0], [1, 1], [16, 256]],
    drop: [[7, 0], [40, 4], [123, 12]],
    dsum: [[0, 0], [7, 7], [123, 6]],
    collatz: [[0, 0], [7, 22], [22, 11]],
    mirror: [[5, 5], [40, 404], [123, 12321]]
  };
  assert.deepEqual(KEYS, { '7': 'add3', '0': 'half', '3': 'rev', '1': 'rep', '5': 'dbl',
    C: 'mirror', '=': 'collatz', '+': 'sq', '×': 'dsum', '-': 'drop' });
  for (const [name, values] of Object.entries(cases)) {
    for (const [input, expected] of values) assert.equal(FN[name](input), expected, name);
  }
});

test('non-live keys do nothing; every live press logs facts, including unchanged values', () => {
  for (let i = 0; i < puzzles.length; i++) {
    const state = engine.createState(puzzles, i);
    assert.deepEqual(Object.keys(state), ['puzzleIndex', 'display', 'status', 'log']);
    for (const key of [...'0123456789', '+', '-', '×', '÷', 'C', '=', 'Backspace']) {
      if (!puzzles[i].live.includes(key)) assert.strictEqual(press(key, state), state);
    }
    assert.deepEqual(state.log, []);
  }
  const state = press('0', engine.createState(puzzles));
  assert.deepEqual(state.log, [{ key: '0', before: 0, after: 0 }]);
  assert.deepEqual(press('7', state).log, [...state.log, { key: '7', before: 0, after: 3 }]);
});

test('range overflow locks all keys including C; Reset alone recovers', () => {
  const data = [{ start: 10000, target: -1, live: Object.keys(KEYS) }];
  const state = press('+', engine.createState(data), data);
  assert.equal(state.display, 'ERR');
  assert.deepEqual(state.log, [{ key: '+', before: 10000, after: 'ERR' }]);
  for (const key of Object.keys(KEYS)) assert.strictEqual(press(key, state, data), state);
  assert.strictEqual(engine.advance(state, data), state);
  const recovered = engine.reset(state, data);
  assert.equal(recovered.display, 10000);
  assert.deepEqual(recovered.log, [...state.log, { reset: true }]);
  assert.equal(press('7', recovered, data).display, 10003);
  const boundary = [{ start: 99999996, target: -1, live: ['7'] }];
  const valid = press('7', engine.createState(boundary), boundary);
  assert.equal(valid.display, 99999999);
  assert.equal(press('7', valid, boundary).display, 'ERR');
});

test('Reset restores start and keeps index and tape; advance clears tape', () => {
  const initial = engine.createState(puzzles, 1);
  const changed = press('7', initial);
  const reset = engine.reset(changed, puzzles);
  assert.equal(reset.puzzleIndex, 1);
  assert.equal(reset.display, 28);
  assert.deepEqual(reset.log, [...changed.log, { reset: true }]);
  const success = press('3', press('7', reset));
  assert.equal(success.status, 'success');
  for (const key of Object.keys(KEYS)) assert.strictEqual(press(key, success), success);
  assert.strictEqual(engine.reset(success, puzzles), success);
  assert.strictEqual(engine.advance(initial, puzzles), initial);
  assert.deepEqual(engine.advance(success, puzzles), engine.createState(puzzles, 2));
});

// Display alone determines future moves within a puzzle; tape does not affect them.
function shortestSolution(index) {
  const initial = engine.createState(puzzles, index);
  const queue = [{ state: initial, path: [] }], seen = new Set([initial.display]);
  for (let head = 0; head < queue.length; head++) {
    const { state, path } = queue[head];
    if (path.length === 10) continue;
    for (const key of puzzles[index].live) {
      const next = press(key, state);
      if (next.status === 'success') return [...path, key];
      if (next.display === 'ERR' || seen.has(next.display)) continue;
      seen.add(next.display);
      queue.push({ state: next, path: [...path, key] });
    }
  }
}

test('BFS shortest solutions take 2–10 presses; full game reaches finished', () => {
  let state = engine.createState(puzzles);
  for (let i = 0; i < puzzles.length; i++) {
    const solution = shortestSolution(i);
    assert.ok(solution, `Puzzle ${i + 1} must be solvable in at most 10 presses`);
    assert.ok(solution.length >= 2);
    console.log(`Puzzle ${i + 1}: shortest solution length ${solution.length}`);
    for (const key of solution) state = press(key, state);
    assert.equal(state.status, 'success');
    assert.equal(state.display, puzzles[i].target);
    state = engine.advance(state, puzzles);
    if (i < puzzles.length - 1) assert.deepEqual(state, engine.createState(puzzles, i + 1));
  }
  assert.equal(state.status, 'finished');
  assert.strictEqual(press('5', state), state);
  assert.strictEqual(engine.reset(state, puzzles), state);
  assert.strictEqual(engine.advance(state, puzzles), state);
});

test('mash metric: 2000 fixed-seed sequences of up to 8 live presses per puzzle', () => {
  let seed = 0xC0FFEE;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  puzzles.forEach((puzzle, i) => {
    let hits = 0;
    for (let trial = 0; trial < 2000; trial++) {
      let state = engine.createState(puzzles, i);
      for (let step = 0; step < 8; step++) {
        state = press(puzzle.live[Math.floor(random() * puzzle.live.length)], state);
        if (state.status === 'success') { hits++; break; }
        if (state.display === 'ERR') break;
      }
    }
    console.log(`Puzzle ${i + 1}: mash hit fraction ${hits}/2000 = ${(hits / 2000).toFixed(4)}`);
  });
});
