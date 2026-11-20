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

  /**
   * Эвристика h: Манхэттен қашықтығы (дәрісте: manhattan(a, b)).
   * Бізде бірнеше пункт бар, сондықтан ең жақын пунктке дейінгі қашықтықты аламыз.
   */
  function heuristic(cell, goals) {
    let best = Infinity;
    for (const g of goals) {
      const d = Math.abs(cell.x - g.x) + Math.abs(cell.y - g.y);
      if (d < best) best = d;
    }
    return best;
  }

  /** Бір қадамның құны: 1 + penalty · P(F). Су басу қаупі жоғары ұяшық «қымбат». */
  function stepCost(options, x, y) {
    return 1 + options.penalty * floodProbAt(options, x, y);
  }

  /** cameFrom бойынша жолды кері қалпына келтіру: мақсаттан бастауға дейін, сосын аударамыз. */
  function buildPath(cameFrom, goalCell) {
    const path = [];
    let cur = goalCell;
    while (cur) {
      path.push(cur);
      cur = cameFrom.get(MapUtil.key(cur.x, cur.y));
    }
    return path.reverse();
  }

  /**
   * A* іздеу. Негізі — дәрістегі «A* Search – Grid Pathfinding Example» (Python), біздің картаға бейімделген.
   * Толық түсіндірме: docs/TUSINDIRME.md → «A* коды жол-жолымен».
   * @param map
   * @param {{x:number,y:number}} start
   * @param {Array<{x:number,y:number}>} goals
   * @param {{floodProb?: Map<string,number>, penalty?: number, threshold?: number}} options
   * @returns {{found:boolean, path:Array, cost:number, goal:object|null, expanded:number, order:Array}}
   */
  function aStar(map, start, goals, options = {}) {
    const opt = { ...DEFAULTS, ...options };
    // Кірісті тексеру: старт картада болуы керек, кемінде бір пункт керек
    MapUtil.cellAt(map, start.x, start.y);
    if (!Array.isArray(goals) || goals.length === 0) throw new Error('Кемінде бір эвакуация пункті керек');
    const goalKeys = new Set(goals.map((g) => MapUtil.key(g.x, g.y)));
    const startKey = MapUtil.key(start.x, start.y);

    // Дәрісте: frontier = []; heapq.heappush(frontier, (manhattan(start, goal), 0, start))
    // JavaScript-те heapq жоқ, сондықтан қарапайым тізім қолданамыз, f ең кішісін өзіміз іздейміз
    const frontier = [{ f: heuristic(start, goals), g: 0, cell: start }];
    // Дәрісте: came_from = {start: None}; cost_so_far = {start: 0}
    const cameFrom = new Map([[startKey, null]]);
    const costSoFar = new Map([[startKey, 0]]);
    const order = [];

    // Дәрісте: while frontier:
    while (frontier.length > 0) {
      // Дәрісте: f, g, current = heapq.heappop(frontier) — f ең кіші элементті аламыз
      let best = 0;
      for (let i = 1; i < frontier.length; i++) {
        if (frontier[i].f < frontier[best].f) best = i;
      }
      const { g, cell: current } = frontier.splice(best, 1)[0];
      const currentKey = MapUtil.key(current.x, current.y);

      // Ескірген жазба: бұл ұяшыққа кейін арзанырақ жол табылған — өткізіп жібереміз (дәрісте жоқ)
      if (g > costSoFar.get(currentKey)) continue;
      order.push(current);

      // Дәрісте: if current == goal: break — бізде 3 пункт, кез келгені жарайды
      if (goalKeys.has(currentKey)) {
        return { found: true, path: buildPath(cameFrom, current), cost: g, goal: current, expanded: order.length, order };
      }

      // Дәрісте: for neighbor in get_neighbors(current, grid) — көршілерді map.js-тегі neighbors береді
      for (const next of MapUtil.neighbors(map, current.x, current.y)) {
        if (isClosed(opt, next.x, next.y)) continue; // су басқан (P > threshold) — өтуге болмайды
        const nextKey = MapUtil.key(next.x, next.y);
        // Дәрісте: new_cost = g + 1 — бізде қадам құны су қаупіне байланысты
        const newCost = g + stepCost(opt, next.x, next.y);
        // Дәрісте: if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]
        if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)) {
          costSoFar.set(nextKey, newCost);
          // Дәрісте: f = new_cost + manhattan(neighbor, goal); heapq.heappush(...)
          frontier.push({ f: newCost + heuristic(next, goals), g: newCost, cell: next });
          cameFrom.set(nextKey, current); // дәрісте: came_from[neighbor] = current
        }
      }
    }

    // Кезек бос қалды, пунктке жете алмадық
    return { found: false, path: [], cost: Infinity, goal: null, expanded: order.length, order };
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
