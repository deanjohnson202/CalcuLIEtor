'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../src/engine.js');
const { FN, KEYS, puzzles } = require('../src/puzzles.js');
const press = (key, state, data = puzzles) => engine.pressKey(key, state, data);

test('half-truth function table, dead-looking results, and leading-zero edge cases', () => {
  const cases = {
    add7: [[0, 7], [28, 35], [99, 106]],
    triple: [[0, 0], [1, 3], [12, 36]],
    sub5: [[0, -5], [5, 0], [12, 7]],
    sq: [[0, 0], [1, 1], [16, 256]],
    append0: [[0, 0], [7, 70], [123, 1230]],
    append1: [[0, 1], [7, 71], [123, 1231]],
    complement: [[0, 9], [9, 0], [27, 72], [904, 95], [999, 0]],
    dsum: [[0, 0], [7, 7], [123, 6]],
    dproduct: [[0, 0], [7, 7], [123, 6], [305, 0]],
    drop: [[0, 0], [7, 0], [40, 4], [123, 12]],
    half: [[0, 0], [3, 1], [28, 14]],
    equal: [[0, 0], [7, 7], [47, 44], [305, 333]],
    clearLeading: [[0, 0], [7, 0], [404, 4], [123, 23], [1000, 0]]
  };
  assert.deepEqual(KEYS, { '7': 'add7', '3': 'triple', '5': 'sub5', '2': 'sq',
    '0': 'append0', '1': 'append1', '9': 'complement', '+': 'dsum', '×': 'dproduct',
    '-': 'drop', '÷': 'half', '=': 'equal', C: 'clearLeading' });
  assert.deepEqual(Object.keys(FN).sort(), Object.keys(cases).sort());
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
  const data = [{ start: 0, target: -1, live: ['0', '7'] }];
  const state = press('0', engine.createState(data), data);
  assert.deepEqual(state.log, [{ key: '0', before: 0, after: 0 }]);
  assert.deepEqual(press('7', state, data).log, [...state.log, { key: '7', before: 0, after: 7 }]);
});

test('range overflow locks all keys including C; Reset alone recovers', () => {
  const data = [{ start: 10000, target: -1, live: Object.keys(KEYS) }];
  const state = press('2', engine.createState(data), data);
  assert.equal(state.display, 'ERR');
  assert.deepEqual(state.log, [{ key: '2', before: 10000, after: 'ERR' }]);
  for (const key of Object.keys(KEYS)) assert.strictEqual(press(key, state, data), state);
  assert.strictEqual(engine.advance(state, data), state);
  const recovered = engine.reset(state, data);
  assert.equal(recovered.display, 10000);
  assert.deepEqual(recovered.log, [...state.log, { reset: true }]);
  assert.equal(press('7', recovered, data).display, 10007);
  const boundary = [{ start: 99999992, target: -1, live: ['7'] }];
  const valid = press('7', engine.createState(boundary), boundary);
  assert.equal(valid.display, 99999999);
  assert.equal(press('7', valid, boundary).display, 'ERR');
});

test('Reset restores start and keeps index and tape; advance clears tape', () => {
  const initial = engine.createState(puzzles, 1);
  const changed = press('3', initial);
  assert.notEqual(changed.display, initial.display);
  const reset = engine.reset(changed, puzzles);
  assert.equal(reset.puzzleIndex, 1);
  assert.equal(reset.display, puzzles[1].start);
  assert.deepEqual(reset.log, [...changed.log, { reset: true }]);
  const success = press('3', press('÷', press('3', reset)));
  assert.equal(success.status, 'success');
  for (const key of Object.keys(KEYS)) assert.strictEqual(press(key, success), success);
  assert.strictEqual(engine.reset(success, puzzles), success);
  assert.strictEqual(engine.advance(initial, puzzles), initial);
  assert.deepEqual(engine.advance(success, puzzles), engine.createState(puzzles, 2));
});

// Display alone determines future moves within a puzzle; tape does not affect them.
function shortestSolution(index, data = puzzles, limit = 10) {
  const initial = engine.createState(data, index);
  const queue = [{ state: initial, path: [] }], seen = new Set([initial.display]);
  for (let head = 0; head < queue.length; head++) {
    const { state, path } = queue[head];
    if (path.length === limit) continue;
    for (const key of data[index].live) {
      const next = press(key, state, data);
      if (next.status === 'success') return [...path, key];
      if (next.display === 'ERR' || seen.has(next.display)) continue;
      seen.add(next.display);
      queue.push({ state: next, path: [...path, key] });
    }
  }
}

test('BFS shortest solutions meet ladder bounds; full game reaches finished', () => {
  let state = engine.createState(puzzles);
  for (let i = 0; i < puzzles.length; i++) {
    const solution = shortestSolution(i);
    assert.ok(solution, `Puzzle ${i + 1} must be solvable in at most 10 presses`);
    assert.ok(solution.length >= (i < 2 ? 2 : i === 7 ? 5 : 4));
    assert.ok(solution.length <= (i < 2 ? 3 : 7));
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
    if (i >= 2) assert.ok(hits <= (i === 7 ? 60 : 200), `Puzzle ${i + 1} mash limit`);
    console.log(`Puzzle ${i + 1}: mash hit fraction ${hits}/2000 = ${(hits / 2000).toFixed(4)}`);
  });
});

// Authoring metadata belongs in tests, never in the game data.
const newKeys = [['7', '÷'], ['3'], ['2', '+'], ['0', '5'], ['9', 'C'], ['1', '='], ['×'], ['-']];

test('cumulative ladder: every introduced key is individually necessary within 12 presses', () => {
  assert.equal(puzzles.length, 8);
  const seen = new Set();
  puzzles.forEach((puzzle, i) => {
    assert.ok(puzzle.live.length >= 2 && puzzle.live.length <= 4);
    assert.equal(new Set(puzzle.live).size, puzzle.live.length);
    assert.deepEqual(puzzle.live.filter(key => !seen.has(key)), newKeys[i]);
    assert.ok(newKeys[i].length >= 1 && newKeys[i].length <= 2);
    if (i > 0) assert.ok(puzzle.live.some(key => seen.has(key)));
    for (const key of newKeys[i]) {
      const reduced = [{ ...puzzle, live: puzzle.live.filter(k => k !== key) }];
      assert.equal(shortestSolution(0, reduced, 12), undefined, 'Puzzle ' + (i + 1) + ' requires ' + key);
    }
    puzzle.live.forEach(key => { assert.ok(KEYS[key]); seen.add(key); });
  });
  assert.ok(seen.size >= 10);
  for (const key of ['4', '6', '8']) assert.ok(!seen.has(key) && !KEYS[key]);
  assert.equal(puzzles[3].clue, 'Not Found');
  assert.equal(puzzles[3].target, 404);
  assert.equal(puzzles[7].clue, 'The Answer to Life, the Universe, and Everything');
  assert.equal(puzzles[7].target, 42);
  assert.equal(puzzles[7].live.length, 4);
});

test('subtraction below zero triggers the existing ERR lock', () => {
  const data = [{ start: 4, target: 7, live: ['5', '7', 'C'] }];
  const state = press('5', engine.createState(data), data);
  assert.equal(state.display, 'ERR');
  for (const key of data[0].live) assert.strictEqual(press(key, state, data), state);
  assert.equal(engine.reset(state, data).display, 4);
});
