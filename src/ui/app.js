/**
 * Интерфейс: карта, маршрут және Байес хабарламалары.
 * Дизайн / CSP: Шұғыла. Маршрут: Марат. Байес: Динара.
 */
(function () {
  'use strict';

  const state = {
    map: null,
    reports: [],
    reliability: 0.8,
    probs: null,
    steps: [],
    route: null,
    assignment: null,
    routeView: null,
    selectedCell: null,
    selectedHouse: null,
  };

  const canvas = document.getElementById('map');
  const ctx = canvas.getContext('2d');
  const reliabilityInput = document.getElementById('reliability');
  const floodedButton = document.getElementById('report-flooded');
  const dryButton = document.getElementById('report-dry');
  const resetButton = document.getElementById('reset-reports');

  const CELL_COLORS = {
    '#': '#9aa5b1',
    '.': '#f7f9fc',
    '~': '#4a90d9',
    '=': '#b07d4f',
    H: '#ffd166',
    S: '#2a9d8f',
  };

  function showError(message) {
    const box = document.getElementById('error');
    box.textContent = message;
    box.hidden = false;
  }

  function clearError() {
    const box = document.getElementById('error');
    box.textContent = '';
    box.hidden = true;
  }

  function percent(p) {
    return `${(p * 100).toFixed(2)}%`;
  }

  async function loadMap() {
    const res = await fetch('data/village.json');
    if (!res.ok) {
      throw new Error('Картаны жүктеу мүмкін болмады');
    }
    return res.json();
  }

  function cellSize() {
    return canvas.width / state.map.width;
  }

  // ─── Картаны салу ─────────────────────────────────────
  function draw() {
    if (!state.map) return;

    const size = cellSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < state.map.height; y++) {
      for (let x = 0; x < state.map.width; x++) {
        const ch = state.map.grid[y][x];
        const p = state.probs.get(`${x},${y}`) ?? 0;

        ctx.fillStyle = CELL_COLORS[ch] || '#fff';

        if (ch === '.' || ch === '=') {
          ctx.fillStyle = `hsl(210, 75%, ${96 - 65 * p}%)`;
        }

        ctx.fillRect(x * size, y * size, size, size);
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * size, y * size, size, size);

        if (ch === 'H' || ch === 'S' || ch === '=') {
          ctx.fillStyle = ch === '=' && p > 0.5
            ? '#fff'
            : '#1b2433';
          ctx.font = `bold ${Math.floor(size * 0.45)}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const label = ch === 'H' ? '⌂' : ch;
          ctx.fillText(
            label,
            x * size + size / 2,
            y * size + size / 2
          );
        }

        // Жабық ұяшықты қызыл жақтаумен белгілеу.
        if (
          state.probs.has(`${x},${y}`) &&
          p > Search.DEFAULTS.threshold
        ) {
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3;
          ctx.strokeRect(
            x * size + 2,
            y * size + 2,
            size - 4,
            size - 4
          );
        }
      }
    }

    // Мараттың маршрут қабатын сақтау.
    RouteUI.drawOverlay(ctx, state.routeView, size);

    if (state.selectedCell) {
      const { x, y } = state.selectedCell;
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        x * size + 2,
        y * size + 2,
        size - 4,
        size - 4
      );
    }

    ctx.lineWidth = 1;
  }

  function cellFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(
      ((event.clientX - rect.left) / rect.width) * state.map.width
    );
    const y = Math.floor(
      ((event.clientY - rect.top) / rect.height) * state.map.height
    );

    if (
      x < 0 || y < 0 ||
      x >= state.map.width || y >= state.map.height
    ) {
      return null;
    }

    return { x, y };
  }

  // ─── Байес панелі ─────────────────────────────────────
  function renderBayesPanel() {
    const selected = document.getElementById('selected-cell');
    const cell = state.selectedCell;

    if (cell) {
      const p = state.probs.get(`${cell.x},${cell.y}`);
      const closed = p > Search.DEFAULTS.threshold;

      selected.textContent =
        `Ұяшық (${cell.x}, ${cell.y}): P = ${percent(p)}. ` +
        (closed ? 'Жол жабық.' : 'Өтуге болады.');
    } else {
      selected.textContent =
        'Картадан жолды немесе көпірді таңдаңыз.';
    }

    floodedButton.disabled = !cell;
    dryButton.disabled = !cell;
    resetButton.disabled = state.reports.length === 0;

    document.getElementById('report-count').textContent =
      `Хабар саны: ${state.reports.length}`;

    const explain = document.getElementById('bayes-explain');
    explain.replaceChildren();

    if (state.steps.length === 0) {
      explain.textContent = 'Әзірге хабарлама жоқ.';
      return;
    }

    const list = document.createElement('ol');

    for (const step of state.steps) {
      const item = document.createElement('li');
      const label = step.says === 'flooded'
        ? 'Су басты'
        : 'Құрғақ';

      item.textContent =
        `(${step.x}, ${step.y}) — «${label}»: ` +
        `${percent(step.before)} → ${percent(step.after)} ` +
        `(r = ${state.reliability}).`;

      list.appendChild(item);
    }

    explain.appendChild(list);
  }

  // ─── Маршрут панелі ───────────────────────────────────
  function refreshRoute() {
    state.routeView = state.selectedHouse
      ? RouteUI.compute(
          state.map,
          state.selectedHouse,
          state.probs
        )
      : null;

    state.route = state.routeView
      ? state.routeView.astar
      : null;

    RouteUI.renderPanel(
      document.getElementById('route-panel'),
      state.routeView
    );

    RouteUI.renderExplain(
      document.getElementById('explain-panel'),
      state.routeView,
      draw
    );

    draw();
  }

  function readReliability() {
    const value = reliabilityInput.value.trim();
    const r = Number(value);

    if (
      value === '' ||
      !Number.isFinite(r) ||
      r < 0 ||
      r > 1
    ) {
      throw new Error(
        'Сенімділік 0 мен 1 аралығында болуы керек'
      );
    }

    return r;
  }

  function applyReportState(reports, r) {
    // Есептеу қате болса, бұрынғы күй сақталады.
    const result = Bayes.applyReports(state.map, reports, r);

    state.reports = reports;
    state.reliability = r;
    state.probs = result.probs;
    state.steps = result.steps;
    state.assignment = null;

    renderBayesPanel();
    refreshRoute();
  }

  function submitReport(says) {
    if (!state.map || !state.selectedCell) return;

    try {
      clearError();

      const { x, y } = state.selectedCell;
      const reports = [
        ...state.reports,
        { x, y, says },
      ];

      applyReportState(reports, readReliability());
    } catch (err) {
      showError(err.message);
    }
  }

  // ─── Оқиғалар ─────────────────────────────────────────
  canvas.addEventListener('click', (event) => {
    if (!state.map) return;

    try {
      clearError();

      const cell = cellFromEvent(event);
      if (!cell) return;

      const ch = MapUtil.cellAt(state.map, cell.x, cell.y);

      if (!['.', '=', 'H', 'S'].includes(ch)) {
        state.selectedCell = null;
        renderBayesPanel();
        draw();
        return;
      }

      state.selectedCell = cell;

      if (ch === 'H') {
        state.selectedHouse = cell;
        refreshRoute();
      } else {
        draw();
      }

      renderBayesPanel();
    } catch (err) {
      showError(err.message);
    }
  });

  floodedButton.addEventListener('click', () => {
    submitReport('flooded');
  });

  dryButton.addEventListener('click', () => {
    submitReport('dry');
  });

  reliabilityInput.addEventListener('change', () => {
    if (!state.map) return;

    try {
      clearError();
      applyReportState(state.reports, readReliability());
    } catch (err) {
      reliabilityInput.value = String(state.reliability);
      showError(err.message);
    }
  });

  resetButton.addEventListener('click', () => {
    if (!state.map) return;

    try {
      clearError();
      applyReportState([], readReliability());
    } catch (err) {
      showError(err.message);
    }
  });

  // TODO (Шұғыла): CSP бөлу батырмасы, кесте және түсіндірме.

  loadMap()
    .then((map) => {
      state.map = map;
      applyReportState([], state.reliability);
    })
    .catch((err) => showError(err.message));
})();
