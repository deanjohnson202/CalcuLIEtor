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
    { clue: 'Dalmatians', target: 101, start: 195, live: ['7', '÷'], par: 2 },
    { clue: 'Days of Christmas', target: 12, start: 9, live: ['3', '÷'], par: 2 },
    { clue: 'The Apollo that had a problem', target: 13, start: 92, live: ['2', '+', '÷'], par: 5 },
    { clue: 'Not Found', target: 404, start: 44, live: ['0', '5', '7'], par: 4 },
    { clue: 'Blackjack', target: 21, start: 34, live: ['9', 'C', '3'], par: 4 },
    { clue: 'Jackpot', target: 777, start: 6, live: ['1', '=', '7'], par: 5 },
    { clue: 'These go to', target: 11, start: 24, live: ['×', '7', '9'], par: 5 },
    { clue: 'The Answer to Life, the Universe, and Everything', target: 42, start: 18, live: ['-', '2', '3', 'C'], par: 6 }
  ].map(puzzle => Object.freeze({ ...puzzle, live: Object.freeze(puzzle.live) })));
  const data = { FN, KEYS, puzzles };
  root.CalcuLIEtor = Object.assign(root.CalcuLIEtor || {}, data);
  if (typeof module !== 'undefined') module.exports = data;
})(globalThis);
