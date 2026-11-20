/**
 * 2-апта: Іздеу. A* және салыстыру үшін BFS.
 * Су басқан аймақтарды айналып өтетін ең қауіпсіз жолды табады.
 * Жауапты: Марат Нәрлі. Сипаттама: docs/SPEC.md, 4-бөлім.
 */
(function (root, factory) {
  // map.js-ті қосамыз: Node.js-те require арқылы, браузерде window.MapUtil арқылы
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../map.js'));
  else root.Search = factory(root.MapUtil);
})(typeof self !== 'undefined' ? self : this, function (MapUtil) {
  'use strict';

  const DEFAULTS = { penalty: 10, threshold: 0.7 };

  /** Ұяшықтың су басу ықтималдығы P(F). Байес нәтижесі жоқ болса — 0. */
  function floodProbAt(options, x, y) {
    if (!options.floodProb) return 0;
    const p = options.floodProb.get(MapUtil.key(x, y));
    return p === undefined ? 0 : p;
  }

  /** P(F) > threshold болса, ұяшық жабық деп саналады. */
  function isClosed(options, x, y) {
    return floodProbAt(options, x, y) > options.threshold;
  }

  /** Манхэттен қашықтығы. Бірнеше мақсат болса — ең кішісі. */
  function heuristic(cell, goals) {
    // TODO
    throw new Error('TODO: heuristic');
  }

  /**
   * A* іздеу.
   * @param map
   * @param {{x:number,y:number}} start
   * @param {Array<{x:number,y:number}>} goals
   * @param {{floodProb?: Map<string,number>, penalty?: number, threshold?: number}} options
   * @returns {{found:boolean, path:Array, cost:number, goal:object|null, expanded:number, order:Array}}
   */
  function aStar(map, start, goals, options = {}) {
    const opt = { ...DEFAULTS, ...options };
    // TODO: open тізімі (f ең кішісін алу), g мәндері, cameFrom
    // TODO: қадам құны = 1 + penalty * P(F); P(F) > threshold → жабық
    // TODO: order тізіміне зерттелген ұяшықтарды жазу
    throw new Error('TODO: aStar');
  }

  /**
   * BFS (кеңдік бойынша іздеу): құнды ескермей, қадам саны бойынша ең қысқа жол.
   * Негізі — дәрістегі Python коды («BFS: complete code»), біздің картаға бейімделген.
   * Шығысы aStar-мен бірдей. Толық түсіндірме: docs/TUSINDIRME.md → «BFS коды жол-жолымен».
   */
  function bfs(map, start, goals, options = {}) {
    const opt = { ...DEFAULTS, ...options };
    // Бастапқы нүкте картадан тыс болса, cellAt түсінікті қате шығарады
    MapUtil.cellAt(map, start.x, start.y);
    // Пункттерді "x,y" жолдарына айналдырамыз: салыстыруға ыңғайлы
    const goalKeys = new Set(goals.map((g) => MapUtil.key(g.x, g.y)));

    // Дәрісте: queue = deque([(start, [start])]) — кезекте ұяшық және оған дейінгі жол
    const queue = [{ cell: start, path: [start] }];
    // Бір ұяшықты екі рет қарамау үшін (дәрістегі «The Role of the Visited Set»)
    const visited = new Set([MapUtil.key(start.x, start.y)]);
    // Зерттелген ұяшықтар реті: сайтта «толқынның» таралуын көрсету үшін
    const order = [];

    // Дәрісте: while queue:
    while (queue.length > 0) {
      // Дәрісте: state, path = queue.popleft() — кезектің басынан аламыз
      const { cell, path } = queue.shift();
      // Дәрісте: print("Exploring:", state) — біз басып шығарудың орнына жазып қоямыз
      order.push(cell);

      // Дәрісте: if state == goal: return path — бізде 3 пункт, кез келгені жарайды
      if (goalKeys.has(MapUtil.key(cell.x, cell.y))) {
        return { found: true, path, cost: path.length - 1, goal: cell, expanded: order.length, order };
      }

      // Дәрісте: for next_state in graph[state] — көршілерді map.js-тегі neighbors береді
      for (const next of MapUtil.neighbors(map, cell.x, cell.y)) {
        const k = MapUtil.key(next.x, next.y);
        if (visited.has(k)) continue;                 // бұрын көргенбіз — өткізіп жібереміз
        if (isClosed(opt, next.x, next.y)) continue;  // су басқан (P > threshold) — өтуге болмайды
        visited.add(k);                               // кезекке салған сәтте белгілейміз
        // Дәрісте: queue.append((next_state, path + [next_state])) — ескі жолды өзгертпей, жаңасын жасаймыз
        queue.push({ cell: next, path: [...path, next] });
      }
    }

    // Дәрісте: return None — жол табылмады
    return { found: false, path: [], cost: Infinity, goal: null, expanded: order.length, order };
  }

  return { DEFAULTS, heuristic, aStar, bfs };
});
