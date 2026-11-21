// Үш модуль бірге: Байес → A* → CSP. Жауапты: Жарқын Динара (тестті Марат дайындады).
// Байес модулі дайын болғанша бұл тест «skip» болып өтеді, bayes.js жазылғаннан кейін өзі іске қосылады.
const test = require('node:test');
const assert = require('node:assert/strict');
const village = require('../data/village.json');
const Bayes = require('../src/algorithms/bayes.js');
const Search = require('../src/algorithms/search.js');
const CSP = require('../src/algorithms/csp.js');

/** bayes.js әлі заготовка ма (TODO қатесін шығара ма)? */
function bayesReady() {
  try {
    Bayes.update(0.5, 'flooded', 0.8);
    return true;
  } catch (err) {
    return !String(err.message).startsWith('TODO');
  }
}

/** Әр отбасынан әр пунктке A* қашықтығы (жол жоқ болса — Infinity). */
function distancesFor(map, floodProb) {
  const d = {};
  for (const f of map.families) {
    d[f.id] = {};
    for (const s of map.shelters) {
      d[f.id][s.id] = Search.aStar(map, f.house, [{ x: s.x, y: s.y }], { floodProb }).cost;
    }
  }
  return d;
}

test('көпірге «су басты» деген 3 хабар → көпір жабылады → батыс жағындағы отбасылар тек S2-ге түседі', (t) => {
  if (!bayesReady()) {
    t.skip('bayes.js әлі дайын емес');
    return;
  }

  // 1. Байес: көпірдің бір ұяшығына (12, 7) үш хабар «су басты», сенімділік r = 0.8
  const reports = [
    { x: 12, y: 7, says: 'flooded' },
    { x: 12, y: 7, says: 'flooded' },
    { x: 12, y: 7, says: 'flooded' },
  ];
  const { probs } = Bayes.applyReports(village, reports, 0.8);
  const pBridge = probs.get('12,7');
  assert.ok(pBridge > Search.DEFAULTS.threshold, `көпір P(F) = ${pBridge}, жабылуы керек`);

  // 2. A*: батыс жақтағы үйден шығыс жақтағы мектепке жол болмауы керек
  const westHouse = { x: 1, y: 7 };
  const school = [{ x: 22, y: 1 }];
  assert.equal(Search.aStar(village, westHouse, school, { floodProb: probs }).found, false);

  // 3. CSP: шығыс пункттерге (S1, S3) жете алмайтын отбасылар тек S2-ге түседі
  const distances = distancesFor(village, probs);
  const west = village.families.filter((f) => distances[f.id].S1 === Infinity && distances[f.id].S3 === Infinity);
  assert.ok(west.length > 0, 'батыс жақта отбасылар болуы керек');

  const result = CSP.solve(village.families, village.shelters, distances);
  assert.equal(result.ok, true, result.reason);
  for (const f of west) assert.equal(result.assignment[f.id], 'S2', f.id);
  for (const s of village.shelters) assert.ok(result.load[s.id] <= s.capacity, s.id);
});
