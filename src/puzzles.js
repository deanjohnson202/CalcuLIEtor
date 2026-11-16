(function (root) {
  'use strict';
  const FN = Object.freeze({
    add3: x => x + 3,
    half: x => x >> 1,
    rev: x => +[...`${x}`].reverse().join(''),
    rep: x => x * 10 + x % 10,
    dbl: x => x * 2,
    sq: x => x * x,
    drop: x => Math.floor(x / 10),
    dsum: x => [...`${x}`].reduce((a, d) => a + +d, 0),
    collatz: x => x % 2 ? 3 * x + 1 : x / 2,
    mirror: x => +(`${x}` + [...`${x}`.slice(0, -1)].reverse().join('')),
  });
  const KEYS = Object.freeze({ '7': 'add3', '0': 'half', '3': 'rev', '1': 'rep', '5': 'dbl',
    'C': 'mirror', '=': 'collatz', '+': 'sq', '×': 'dsum', '-': 'drop' });
  const puzzles = Object.freeze([
    { clue: 'The loneliest number', target: 1, start: 0, live: ['7', '0'] },
    { clue: "A baker's dozen", target: 13, start: 28, live: ['7', '3'] },
    { clue: 'Jackpot', target: 777, start: 1, live: ['7', '1'] },
    { clue: 'Not Found', target: 404, start: 1, live: ['7', '5', 'C'] },
    { clue: 'A quarter of a century', target: 25, start: 7, live: ['=', '3'] },
    { clue: "A byte's possibilities", target: 256, start: 11, live: ['+', '×'] },
    { clue: 'Blackjack', target: 21, start: 16, live: ['5', '3', '-'] },
    { clue: 'The Answer to Life, the Universe, and Everything', target: 42, start: 7, live: ['5', '3', '+', '-'] }
  ].map(puzzle => Object.freeze({ ...puzzle, live: Object.freeze(puzzle.live) })));
  const data = { FN, KEYS, puzzles };
  root.CalcuLIEtor = Object.assign(root.CalcuLIEtor || {}, data);
  if (typeof module !== 'undefined') module.exports = data;
})(globalThis);
