(function () {
  'use strict';
  const game = globalThis.CalcuLIEtor;
  const { puzzles } = game;
  let state = game.createState(puzzles), shownLog = null;
  const [clue, display, machine, calculator, keypad, reset, restart, status, progress, tape] =
    ['clue', 'display', 'machine', 'calculator', 'keypad', 'reset', 'restart', 'status', 'progress', 'tape']
      .map(id => document.getElementById(id));

  function render() {
    const finished = state.status === 'finished';
    clue.textContent = finished ? 'You understand the machine... for now.' : puzzles[state.puzzleIndex].clue;
    display.textContent = state.display;
    machine.hidden = finished;
    calculator.classList.toggle('success', state.status === 'success');
    keypad.querySelectorAll('button').forEach(button => {
      button.disabled = state.status !== 'playing' || state.display === 'ERR' || !puzzles[state.puzzleIndex].live.includes(button.dataset.visibleKey);
    });
    reset.hidden = finished;
    reset.disabled = state.status !== 'playing';
    restart.hidden = !finished;
    status.textContent = state.status === 'success' ? 'That’s it.' : state.display === 'ERR' ? 'Press Reset to try again.' : '';
    progress.textContent = puzzles.map((_, i) => i <= state.puzzleIndex ? '●' : '○').join(' ');
    progress.setAttribute('aria-label', finished ? 'All puzzles complete' : `Puzzle ${state.puzzleIndex + 1} of ${puzzles.length}`);
    if (shownLog !== state.log) {
      if (!shownLog || state.log.length <= shownLog.length) tape.replaceChildren();
      for (const entry of state.log.slice(tape.children.length)) {
        const line = document.createElement('li');
        if (entry.reset) { line.className = 'divider'; line.setAttribute('aria-label', 'Reset'); }
        else line.textContent = `${entry.key}   ${entry.before} → ${entry.after}`;
        tape.append(line);
      }
      shownLog = state.log;
      tape.scrollTop = tape.scrollHeight;
    }
  }
  function pressKey(key) {
    const next = game.pressKey(key, state, puzzles);
    if (next === state) return;
    state = next;
    render();
    if (state.status === 'success') window.setTimeout(() => {
      state = game.advance(state, puzzles);
      render();
      if (state.status === 'finished') restart.focus();
    }, 1000);
  }
  keypad.addEventListener('click', event => {
    const button = event.target.closest('[data-visible-key]');
    if (button) pressKey(button.dataset.visibleKey);
  });
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Enter' && (event.target === reset || event.target === restart)) return;
    const key = ({ '*': '×', Enter: '=', c: 'C', C: 'C' })[event.key];
    if (key || /^[0-9+\-]$/.test(event.key)) {
      event.preventDefault();
      pressKey(key || event.key);
    }
  });
  reset.addEventListener('click', () => { state = game.reset(state, puzzles); render(); });
  restart.addEventListener('click', () => {
    state = game.createState(puzzles);
    render();
    keypad.querySelector('button:not(:disabled)').focus();
  });
  render();
})();
