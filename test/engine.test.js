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
    assert.deepEqual(Object.keys(state), ['puzzleIndex', 'display', 'status', 'log', 'stats']);
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
  const wrong = engine.submit(press('3', reset), puzzles);
  assert.equal(wrong.status, 'playing');
  assert.equal(wrong.display, puzzles[1].start, 'a wrong answer sends the display back to the start');
  assert.deepEqual(wrong.log, [...reset.log, { key: '3', before: 9, after: 27 }, { submitted: 27, correct: false }]);
  const onTarget = press('3', press('÷', wrong));
  assert.equal(onTarget.display, puzzles[1].target);
  assert.equal(onTarget.status, 'playing', 'reaching the target does not complete the puzzle');
  const success = engine.submit(onTarget, puzzles);
  assert.equal(success.status, 'success');
  assert.deepEqual(success.log[success.log.length - 1], { submitted: puzzles[1].target, correct: true });
  assert.strictEqual(engine.submit(success, puzzles), success);
  for (const key of Object.keys(KEYS)) assert.strictEqual(press(key, success), success);
  assert.strictEqual(engine.reset(success, puzzles), success);
  assert.strictEqual(engine.advance(initial, puzzles), initial);
  assert.deepEqual(engine.advance(success, puzzles), engine.createState(puzzles, 2, [{ presses: 4, misses: 1 }]));
});

// Display alone determines future moves within a puzzle; tape does not affect them.
function shortestSolution(index, data = puzzles, limit = 10) {
  const initial = engine.createState(data, index);
  if (initial.display === data[index].target) return [];
  const queue = [{ state: initial, path: [] }], seen = new Set([initial.display]);
  for (let head = 0; head < queue.length; head++) {
    const { state, path } = queue[head];
    if (path.length === limit) continue;
    for (const key of data[index].live) {
      const next = press(key, state, data);
      if (next.display === data[index].target) return [...path, key];
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
    assert.ok(solution.length <= (i < 2 ? 3 : 6));
    console.log(`Puzzle ${i + 1}: shortest solution length ${solution.length}`);
    for (const key of solution) state = press(key, state);
    assert.equal(state.display, puzzles[i].target);
    state = engine.submit(state, puzzles);
    assert.equal(state.status, 'success');
    state = engine.advance(state, puzzles);
    assert.equal(solution.length, puzzles[i].par, `Puzzle ${i + 1} par must equal the shortest solution`);
    assert.deepEqual(state.stats[i], { presses: solution.length, misses: 0 });
    if (i < puzzles.length - 1) assert.deepEqual(state, engine.createState(puzzles, i + 1, state.stats));
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
        if (state.display === puzzle.target) { hits++; break; }
        if (state.display === 'ERR') break;
      }
    }
    if (i >= 2) assert.ok(hits <= (i === 7 ? 60 : 200), `Puzzle ${i + 1} mash limit`);
    console.log(`Puzzle ${i + 1}: mash hit fraction ${hits}/2000 = ${(hits / 2000).toFixed(4)}`);
  });
});

// Authoring metadata belongs in tests, never in the game data.
const newKeys = [['7', '÷'], ['3'], ['2', '+'], ['0', '5'], ['9', 'C'], ['1', '='], ['×'], ['-']];
// Puzzle numbers are one-based.
const traps = { 3: 11, 7: 10 };

test('trap answers are reachable sooner than the single accepted target', () => {
  for (const [number, trap] of Object.entries(traps)) {
    const index = Number(number) - 1;
    const puzzle = puzzles[index];
    const trapPath = shortestSolution(0, [{ ...puzzle, target: trap }]);
    const targetPath = shortestSolution(index);
    assert.ok(trapPath, `Puzzle ${number} trap must be reachable`);
    assert.ok(targetPath);
    assert.ok(trapPath.length < targetPath.length, `Puzzle ${number} trap must be shorter`);
    let state = engine.createState(puzzles, index);
    for (const key of trapPath) state = press(key, state);
    assert.equal(state.display, trap);
    assert.equal(state.status, 'playing');
    state = engine.submit(state, puzzles);
    assert.equal(state.status, 'playing');
    assert.equal(state.display, puzzle.start);
    assert.deepEqual(state.log.at(-1), { submitted: trap, correct: false });
  }
});

test('cumulative ladder: every introduced key is individually necessary within 12 presses', () => {
  assert.equal(puzzles.length, 8);
  const seen = new Set();
  puzzles.forEach((puzzle, i) => {
    assert.ok(i < 2 ? puzzle.live.length === 2 : puzzle.live.length >= 3 && puzzle.live.length <= 4);
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
  assert.deepEqual([...seen].sort(), Object.keys(KEYS).sort());
  for (const key of ['4', '6', '8']) assert.ok(!seen.has(key) && !KEYS[key]);
  assert.equal(puzzles[7].clue, 'The Answer to Life, the Universe, and Everything');
  assert.equal(puzzles[7].target, 42);
  assert.equal(puzzles[7].live.length, 4);
});

test('subtraction below zero triggers the existing ERR lock', () => {
  const data = [{ start: 4, target: 7, live: ['5', '7', 'C'] }];
  const state = press('5', engine.createState(data), data);
  assert.equal(state.display, 'ERR');
  assert.strictEqual(engine.submit(state, data), state);
  for (const key of data[0].live) assert.strictEqual(press(key, state, data), state);
  assert.equal(engine.reset(state, data).display, 4);
});

// Keep every shortest route eligible: display-only deduplication would discard
// routes with different key counts, which matter to the no-grind constraint.
function shortestNoGrind(index) {
  const length = shortestSolution(index).length;
  function search(state, path, counts) {
    if (path.length === length) return state.display === puzzles[index].target ? path : undefined;
    for (const key of puzzles[index].live) {
      if ((counts[key] || 0) + 1 > length / 2) continue;
      if (path.length >= 2 && path.at(-1) === key && path.at(-2) === key) continue;
      const next = press(key, state);
      if (next.display === 'ERR') continue;
      const result = search(next, [...path, key], { ...counts, [key]: (counts[key] || 0) + 1 });
      if (result) return result;
    }
  }
  return search(engine.createState(puzzles, index), [], {});
}

test('every puzzle has a shortest solution without grinding', () => {
  puzzles.forEach((puzzle, i) => {
    const path = shortestNoGrind(i);
    assert.ok(path, 'Puzzle ' + (i + 1) + ' needs a shortest no-grind solution');
    assert.equal(path.length, puzzle.par);
    if (i >= 2) assert.ok(new Set(path).size >= 3);
  });
});

test('eight distinct cultural targets, trap placement, and the false-generalisation beat', () => {
  assert.equal(puzzles.length, 8);
  assert.equal(new Set(puzzles.map(p => p.target)).size, 8);
  assert.ok(puzzles.filter(p => p.target >= 100).length >= 3);
  assert.ok(puzzles.slice(2, 7).some(p => p.clue === 'Not Found' && p.target === 404));
  assert.ok(Object.keys(traps).length >= 2);
  assert.ok(Object.keys(traps).every(n => +n >= 3 && +n <= 7), 'the first two puzzles and the finale are plain');
  assert.deepEqual(puzzles[0].live, ['7', '÷']);
  const delta = puzzles[1].target - puzzles[1].start;
  assert.ok(delta > 0 && delta <= 9 && delta % 3 === 0);
  let state = engine.createState(puzzles, 1);
  for (let i = 0; i < delta / 3; i++) state = press('3', state);
  assert.notEqual(state.display, puzzles[1].target);
  const expected = [
    ['Dalmatians', 101], ['Days of Christmas', 12], ['The Apollo that had a problem', 13],
    ['Not Found', 404], ['Blackjack', 21],
    ['Jackpot', 777], ['These go to', 11], ['The Answer to Life, the Universe, and Everything', 42]
  ];
  assert.deepEqual(puzzles.map(p => [p.clue, p.target]), expected);
});
