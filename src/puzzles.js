(function (root) {
  'use strict';
  const FN = Object.freeze({
    add7: x => x + 7,
    triple: x => x * 3,
    sub5: x => x - 5,
    sq: x => x * x,
    append0: x => x * 10,
    append1: x => x * 10 + 1,
    complement: x => +[...`${x}`].map(d => 9 - +d).join(''),
    dsum: x => [...`${x}`].reduce((a, d) => a + +d, 0),
    dproduct: x => [...`${x}`].reduce((a, d) => a * +d, 1),
    drop: x => Math.floor(x / 10),
    half: x => Math.floor(x / 2),
    equal: x => +`${x}`[0].repeat(`${x}`.length),
    clearLeading: x => +`${x}`.slice(1),
  });
  const KEYS = Object.freeze({ '7': 'add7', '3': 'triple', '5': 'sub5', '2': 'sq',
    '0': 'append0', '1': 'append1', '9': 'complement', '+': 'dsum', '×': 'dproduct',
    '-': 'drop', '÷': 'half', '=': 'equal', C: 'clearLeading' });
  const puzzles = Object.freeze([
    { clue: 'Hours in a day', target: 24, start: 34, live: ['7', '÷'] },
    { clue: 'A dozen', target: 12, start: 3, live: ['3', '÷'] },
    { clue: 'A century', target: 100, start: 1, live: ['2', '+', '7'] },
    { clue: 'Not Found', target: 404, start: 44, live: ['0', '5', '7'] },
    { clue: 'Emergency telephone number (US)', target: 911, start: 120, live: ['9', 'C', '3'] },
    { clue: 'Jackpot', target: 777, start: 5, live: ['1', '=', '+'] },
    { clue: 'Lucky number', target: 7, start: 2, live: ['×', '2', '5', '1'] },
    { clue: 'The Answer to Life, the Universe, and Everything', target: 42, start: 18, live: ['-', '2', '3', 'C'] }
  ].map(puzzle => Object.freeze({ ...puzzle, live: Object.freeze(puzzle.live) })));
  const data = { FN, KEYS, puzzles };
  root.CalcuLIEtor = Object.assign(root.CalcuLIEtor || {}, data);
  if (typeof module !== 'undefined') module.exports = data;
})(globalThis);
