(function () {
  'use strict';
  const game = globalThis.CalcuLIEtor;
  const { puzzles } = game;
  const SAVE_KEY = 'calculietor-save-v1';
  const [clue, display, machine, calculator, keypad, reset, restart, status, progress, tape, submit, summary] =
    ['clue', 'display', 'machine', 'calculator', 'keypad', 'reset', 'restart', 'status', 'progress', 'tape', 'submit', 'summary']
      .map(id => document.getElementById(id));
  let state = load(), shownLog = null;

  // Storage can be missing or blocked; the game must work without it.
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && puzzles[saved.puzzleIndex] && Array.isArray(saved.log) && Array.isArray(saved.stats)) {
        return game.advance(saved, puzzles); // finishes a transition interrupted by closing the page
      }
    } catch (e) { /* fall through to a new game */ }
    return game.createState(puzzles);
  }

  function render() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* not saved */ }
    const finished = state.status === 'finished';
    clue.textContent = finished ? 'You understand the machine... for now.' : puzzles[state.puzzleIndex].clue;
    display.textContent = state.display;
    machine.hidden = finished;
    calculator.classList.toggle('success', state.status === 'success');
    keypad.querySelectorAll('button').forEach(button => {
      button.disabled = state.status !== 'playing' || state.display === 'ERR' || !puzzles[state.puzzleIndex].live.includes(button.dataset.visibleKey);
    });
    reset.hidden = submit.hidden = finished;
    reset.disabled = state.status !== 'playing';
    submit.disabled = state.status !== 'playing' || state.display === 'ERR';
    restart.textContent = finished ? 'Play again' : 'Start over';
    const last = state.log[state.log.length - 1];
    status.textContent = state.status === 'success' ? 'That’s it.' : state.display === 'ERR' ? 'Press Reset to try again.'
      : last && last.correct === false ? 'That’s not it.' : '';
    progress.textContent = puzzles.map((_, i) => i <= state.puzzleIndex ? '●' : '○').join(' ');
    progress.setAttribute('aria-label', finished ? 'All puzzles complete' : `Puzzle ${state.puzzleIndex + 1} of ${puzzles.length}`);
    summary.hidden = !finished;
    if (finished) summary.replaceChildren(...state.stats.map((s, i) => {
      const line = document.createElement('li');
      line.textContent = `${puzzles[i].clue}: ${s.presses} presses (best possible ${puzzles[i].par})`
        + (s.misses ? `, ${s.misses} wrong ${s.misses === 1 ? 'answer' : 'answers'}` : '');
      return line;
    }));
    if (shownLog !== state.log) {
      if (!shownLog || state.log.length <= shownLog.length) tape.replaceChildren();
      for (const entry of state.log.slice(tape.children.length)) {
        const line = document.createElement('li');
        if (entry.reset) { line.className = 'divider'; line.setAttribute('aria-label', 'Reset'); }
        else if ('submitted' in entry) line.textContent = `submit   ${entry.submitted} ${entry.correct ? '✓' : '✗'}`;
        else line.textContent = `${entry.key}   ${entry.before} → ${entry.after}`;
        tape.append(line);
      }
      shownLog = state.log;
      tape.scrollTop = tape.scrollHeight;
    }
  }
  function pressKey(key) { update(game.pressKey(key, state, puzzles)); }
  function update(next) {
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
    if (event.key === 'Enter' && [reset, restart, submit].includes(event.target)) return;
    const key = ({ '*': '×', Enter: '=', c: 'C', C: 'C' })[event.key];
    if (key || /^[0-9+\-]$/.test(event.key)) {
      event.preventDefault();
      pressKey(key || event.key);
    }
  });
  reset.addEventListener('click', () => { state = game.reset(state, puzzles); render(); });
  submit.addEventListener('click', () => update(game.submit(state, puzzles)));
  restart.addEventListener('click', () => {
    if (state.status !== 'finished' && !window.confirm('Start over from the first puzzle? Your progress will be lost.')) return;
    state = game.createState(puzzles);
    render();
    keypad.querySelector('button:not(:disabled)').focus();
  });
  render();
})();
