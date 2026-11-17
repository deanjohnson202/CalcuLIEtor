(function (root) {
  'use strict';
  const { FN, KEYS } = typeof module !== 'undefined' ? require('./puzzles.js') : root.CalcuLIEtor;
  // stats holds one { presses, misses } per completed puzzle, for the end summary.
  function createState(puzzles, puzzleIndex = 0, stats = []) {
    return { puzzleIndex, display: puzzles[puzzleIndex].start, status: 'playing', log: [], stats };
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
    return { ...state, display, log: [...state.log, { key, before: state.display, after: display }] };
  }
  // The player decides when the display answers the clue; nothing completes on its own.
  // A wrong answer costs the current display: the puzzle goes back to its start.
  function submit(state, puzzles) {
    if (state.status !== 'playing' || state.display === 'ERR') return state;
    const puzzle = puzzles[state.puzzleIndex];
    const correct = state.display === puzzle.target;
    return { ...state, status: correct ? 'success' : 'playing', display: correct ? state.display : puzzle.start,
      log: [...state.log, { submitted: state.display, correct }] };
  }
  function advance(state, puzzles) {
    if (state.status !== 'success') return state;
    const stats = [...state.stats, { presses: state.log.filter(e => e.key).length,
      misses: state.log.filter(e => e.correct === false).length }];
    return state.puzzleIndex + 1 < puzzles.length
      ? createState(puzzles, state.puzzleIndex + 1, stats) : { ...state, status: 'finished', stats };
  }
  const engine = { createState, reset, pressKey, submit, advance };
  root.CalcuLIEtor = Object.assign(root.CalcuLIEtor || {}, engine);
  if (typeof module !== 'undefined') module.exports = engine;
})(globalThis);
