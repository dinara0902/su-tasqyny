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
  };

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

  // TODO: draw()             — Canvas-та ұяшықтарды салу, P(F) бойынша түс беру
  // TODO: onCellClick()      — «Су басты» / «Құрғақ» хабарламасы → Bayes.applyReports → draw()
  // TODO: onHouseClick()     — Search.aStar → маршрутты салу
  // TODO: onAssignClick()    — әр отбасы үшін A* қашықтықтары → CSP.solve → кесте
  // TODO: explainMode        — «Қалай ойлады?»: order / steps тізімдерін қадамдап көрсету

  loadMap()
    .then((map) => {
      state.map = map;
      // TODO: draw();
    })
    .catch((err) => showError(err.message));
})();
