/**
 * 6-апта: Ықтималдық және Байес ережесі.
 * Хабарламалар бойынша әр жол ұяшығының P(су басты) ықтималдығын есептейді.
 * Жауапты: Жарқын Динара. Сипаттама: docs/SPEC.md, 3-бөлім.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Bayes = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Ұяшықтың алғашқы P(F) мәні map.priors-тен:
   * көпір '=' → bridge, '~' ұяшығымен көрші → nearWater, әйтпесе → default.
   */
  function priorFor(map, x, y) {
    // TODO
    throw new Error('TODO: priorFor');
  }

  /**
   * Бір хабардан кейінгі жаңа ықтималдық.
   * @param {number} p      алдыңғы P(F), 0..1
   * @param {string} says   'flooded' немесе 'dry'
   * @param {number} r      хабар сенімділігі, 0..1
   * @returns {number}      P(F | хабар)
   */
  function update(p, says, r) {
    // TODO: кірісті тексеру (p, r — 0..1; says — тек екі мән)
    // TODO: Байес формуласы, docs/SPEC.md қараңыз
    throw new Error('TODO: update');
  }

  /**
   * Барлық хабарламаны ретімен қолдану.
   * @returns {{ probs: Map<string, number>, steps: Array }}
   *   probs — "x,y" → P(F) әр өтуге болатын ұяшық үшін;
   *   steps — әр хабардан кейінгі өзгеріс: { x, y, says, before, after }.
   */
  function applyReports(map, reports, r) {
    // TODO
    throw new Error('TODO: applyReports');
  }

  return { priorFor, update, applyReports };
});
