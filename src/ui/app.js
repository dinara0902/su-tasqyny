/**
 * Интерфейс: картаны салу, батырмалар, «Қалай ойлады?» режимі.
 * Жауапты: Нұрдаулет Шұғыла (дизайн), бәрі бірге (модульдерді қосу).
 * Сипаттама: docs/SPEC.md, 6-бөлім.
 *
 * Алгоритмдер браузерде мына атаулармен қолжетімді:
 *   window.MapUtil, window.Bayes, window.Search, window.CSP
 *
 * Ескерту: картаны fetch арқылы оқу үшін сайтты `npm start` арқылы ашыңыз.
 * index.html-ді файл ретінде тікелей ашса, fetch жұмыс істемейді.
 */
(function () {
  'use strict';

  const state = {
    map: null,          // data/village.json
    reports: [],        // [{x, y, says}]
    reliability: 0.8,   // хабар сенімділігі r
    probs: null,        // Байес нәтижесі: "x,y" → P(F)
    route: null,        // A* нәтижесі
    assignment: null,   // CSP нәтижесі
    routeView: null,    // RouteUI.compute нәтижесі: таңдалған үйдің маршруты (Марат)
  };

  const canvas = document.getElementById('map');
  const ctx = canvas.getContext('2d');

  /** Қатені экранға шығару. Сайт ешқашан қатып қалмауы керек. */
  function showError(message) {
    const box = document.getElementById('error');
    box.textContent = message;
    box.hidden = false;
  }

  async function loadMap() {
    const res = await fetch('data/village.json');
    if (!res.ok) throw new Error('Картаны жүктеу мүмкін болмады');
    return res.json();
  }

  // ─── Картаны салу ───────────────────────────────────────────────
  // Базалық нұсқа: Шұғыла дизайнын жасағанда осы функцияны жақсартады.
  // Маңызды: соңындағы RouteUI.drawOverlay(...) жолын қалдыру керек — ол маршрутты салады.
  const CELL_COLORS = { '#': '#9aa5b1', '.': '#f7f9fc', '~': '#4a90d9', '=': '#b07d4f', H: '#ffd166', S: '#2a9d8f' };

  function cellSize() {
    return canvas.width / state.map.width;
  }

  function draw() {
    if (!state.map) return;
    const size = cellSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < state.map.height; y++) {
      for (let x = 0; x < state.map.width; x++) {
        const ch = state.map.grid[y][x];
        ctx.fillStyle = CELL_COLORS[ch] || '#fff';
        ctx.fillRect(x * size, y * size, size, size);
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.strokeRect(x * size, y * size, size, size);
        if (ch === 'S' || ch === 'H') {
          ctx.fillStyle = '#1b2433';
          ctx.font = `bold ${Math.floor(size * 0.45)}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch === 'S' ? 'S' : '⌂', x * size + size / 2, y * size + size / 2);
        }
      }
    }
    // Маршрут пен «Қалай ойлады?» (Марат, src/ui/route.js)
    RouteUI.drawOverlay(ctx, state.routeView, size);
  }

  /** Тышқан немесе саусақ басқан ұяшық: {x, y} немесе null. */
  function cellFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * state.map.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * state.map.height);
    if (x < 0 || y < 0 || x >= state.map.width || y >= state.map.height) return null;
    return { x, y };
  }

  // ─── Маршрут (Марат) ────────────────────────────────────────────
  /** Үйді басқанда: A* маршрутын есептеп, картада және панельдерде көрсету. */
  function onHouseClick(cell) {
    state.routeView = RouteUI.compute(state.map, cell, state.probs);
    state.route = state.routeView.astar;
    draw();
    RouteUI.renderPanel(document.getElementById('route-panel'), state.routeView);
    RouteUI.renderExplain(document.getElementById('explain-panel'), state.routeView, draw);
  }

  canvas.addEventListener('click', (event) => {
    if (!state.map) return;
    try {
      const cell = cellFromEvent(event);
      if (!cell) return;
      const ch = MapUtil.cellAt(state.map, cell.x, cell.y);
      if (ch === 'H') onHouseClick(cell);
      // TODO (Динара): жол ұяшығын басқанда — «Су басты» / «Құрғақ» хабарламасы → Bayes.applyReports → draw()
    } catch (err) {
      showError(err.message);
    }
  });

  // TODO (Шұғыла): onAssignClick() — әр отбасы үшін A* қашықтықтары → CSP.solve → кесте
  // TODO (Шұғыла): explain-panel-ге CSP қадамдары («CSP қалай ойлады?»)

  loadMap()
    .then((map) => {
      state.map = map;
      draw();
      RouteUI.renderPanel(document.getElementById('route-panel'), null);
      RouteUI.renderExplain(document.getElementById('explain-panel'), null, draw);
    })
    .catch((err) => showError(err.message));
})();
