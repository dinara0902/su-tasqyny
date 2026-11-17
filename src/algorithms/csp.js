/**
 * 3-апта: Шектеулерді қанағаттандыру (CSP).
 * Отбасыларды эвакуация пункттеріне бөледі.
 * Жауапты: Нұрдаулет Шұғыла. Сипаттама: docs/SPEC.md, 5-бөлім.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CSP = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULTS = { maxCost: Infinity, useMRV: true, useForwardChecking: true };

  /**
   * Бастапқы домендер: медицина және қашықтық шектеулеріне сай пункттер.
   * @returns {Object<string, string[]>} familyId → [shelterId, ...] (жақыны бірінші)
   */
  function initialDomains(families, shelters, distances, maxCost) {
    // TODO
    throw new Error('TODO: initialDomains');
  }

  /**
   * Отбасыларды пункттерге бөлу.
   * @param families   [{id, size, needsMedical, ...}]
   * @param shelters   [{id, capacity, hasMedical, ...}]
   * @param distances  distances[familyId][shelterId] = A* құны немесе Infinity
   * @param options    {maxCost, useMRV, useForwardChecking}
   * @returns {{ok:boolean, reason?:string, assignment:Object, load:Object, backtracks:number, nodes:number, steps:Array}}
   */
  function solve(families, shelters, distances, options = {}) {
    const opt = { ...DEFAULTS, ...options };
    // TODO: кірісті тексеру (size > 0, capacity >= 0)
    // TODO: жалпы орын жетпесе — бірден ok:false және себебі
    // TODO: backtracking + MRV + forward checking
    throw new Error('TODO: solve');
  }

  return { DEFAULTS, initialDomains, solve };
});
