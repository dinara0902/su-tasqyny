/**
 * Картамен жұмыс: ұяшықты оқу, өтуге бола ма, көршілер.
 * Жауапты: Марат Нәрлі. Сипаттама: docs/SPEC.md, 1-бөлім.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MapUtil = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** Өтуге болмайтын белгілер. */
  const BLOCKED = new Set(['#', '~']);

  /**
   * (x, y) ұяшығының белгісі: '#', '.', '~', '=', 'H' немесе 'S'.
   * Картадан тыс болса — Error.
   */
  function cellAt(map, x, y) {
    if (x < 0 || x >= map.width || y < 0 || y>= map.height) {
    throw new Error('Координат картадан тыс: ' + x + ', ' + y);
    }
    return map.grid[y][x];
  }

  /** Ұяшық арқылы өтуге бола ма (тек карта бойынша, Байессіз). */
  function isPassable(map, x, y) {
    const cell = cellAt(map, x, y);
  return !BLOCKED.has(cell);
    }

  /** Өтуге болатын 4 көрші: [{x, y}, ...]. */
  function neighbors(map, x, y) {
    const directions = [
      { dx: 0, dy: -1 },  // жоғары
      { dx: 0, dy: 1 },   // төмен
      { dx: -1, dy: 0 },  // солға
      { dx: 1, dy: 0 },   // оңға
    ];
    const result = [];
    for (const d of directions) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) continue;
      if (isPassable(map, nx, ny)) {
        result.push({ x: nx, y: ny });
      }
    }
    return result;
  }
  /** Координат кілті: Map құрылымдарында қолдануға ыңғайлы. */
  function key(x, y) {
    return x + ',' + y;
  }

  return { BLOCKED, cellAt, isPassable, neighbors, key };
});
