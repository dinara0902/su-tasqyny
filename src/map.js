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
    // TODO: BLOCKED жиынын қолдану
    throw new Error('TODO: isPassable');
  }

  /** Өтуге болатын 4 көрші: [{x, y}, ...]. */
  function neighbors(map, x, y) {
    // TODO: жоғары, төмен, солға, оңға
    throw new Error('TODO: neighbors');
  }

  /** Координат кілті: Map құрылымдарында қолдануға ыңғайлы. */
  function key(x, y) {
    return x + ',' + y;
  }

  return { BLOCKED, cellAt, isPassable, neighbors, key };
});
