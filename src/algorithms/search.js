/**
 * 2-апта: Іздеу. A* және салыстыру үшін BFS.
 * Су басқан аймақтарды айналып өтетін ең қауіпсіз жолды табады.
 * Жауапты: Марат Нәрлі. Сипаттама: docs/SPEC.md, 4-бөлім.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Search = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULTS = { penalty: 10, threshold: 0.7 };

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

  /** BFS: құнды ескермей, қадам саны бойынша ең қысқа жол. Шығысы aStar-мен бірдей. */
  function bfs(map, start, goals, options = {}) {
    // TODO
    throw new Error('TODO: bfs');
  }

  return { DEFAULTS, heuristic, aStar, bfs };
});
