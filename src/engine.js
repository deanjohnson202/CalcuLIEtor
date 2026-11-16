(function (root) {
  'use strict';
  const { FN, KEYS } = typeof module !== 'undefined' ? require('./puzzles.js') : root.CalcuLIEtor;
  function createState(puzzles, puzzleIndex = 0) {
    return { puzzleIndex, display: puzzles[puzzleIndex].start, status: 'playing', log: [] };
  }
  function reset(state, puzzles) {
    return state.status === 'playing'
      ? { ...state, display: puzzles[state.puzzleIndex].start, log: [...state.log, { reset: true }] }
      : state;
  }
  function pressKey(key, state, puzzles) {
    const puzzle = puzzles[state.puzzleIndex];
    if (state.status !== 'playing' || state.display === 'ERR' || !puzzle.live.includes(key) || !KEYS[key]) return state;
    const result = FN[KEYS[key]](state.display);
    const display = Number.isInteger(result) && result >= 0 && result <= 99999999 ? result : 'ERR';
    return { ...state, display, status: display === puzzle.target ? 'success' : 'playing',
      log: [...state.log, { key, before: state.display, after: display }] };
  }
  function advance(state, puzzles) {
    if (state.status !== 'success') return state;
    return state.puzzleIndex + 1 < puzzles.length
      ? createState(puzzles, state.puzzleIndex + 1) : { ...state, status: 'finished' };
  }
  const engine = { createState, reset, pressKey, advance };
  root.CalcuLIEtor = Object.assign(root.CalcuLIEtor || {}, engine);
  if (typeof module !== 'undefined') module.exports = engine;
})(globalThis);
