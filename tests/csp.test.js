
// CSP тесттері. Жауапты: Нұрдаулет Шұғыла.
// Тізімі: docs/SPEC.md → Тесттер.

const test = require('node:test');
const assert = require('node:assert/strict');
const CSP = require('../src/algorithms/csp.js');
const village = require('../data/village.json');

// Барлық отбасылар мен пункттерге бірдей қашықтық береміз.
function createDistances(families, shelters) {
  const distances = {};

  for (const family of families) {
    distances[family.id] = {};

    for (const shelter of shelters) {
      distances[family.id][shelter.id] = 10;
    }
  }

  return distances;
}

// 1. Барлық отбасы орналасады және сыйымдылық бұзылмайды.
test('мысал картада барлық отбасы орналасады, сыйымдылық бұзылмайды', () => {
  const families = structuredClone(village.families);
  const shelters = structuredClone(village.shelters);
  const distances = createDistances(families, shelters);

  const result = CSP.solve(families, shelters, distances);

  assert.equal(result.ok, true);

  // Әр отбасы бір пунктке бөлінгенін тексереміз.
  assert.equal(
    Object.keys(result.assignment).length,
    families.length
  );

  // Әр пункттің толуы сыйымдылығынан аспауы керек.
  for (const shelter of shelters) {
    assert.ok(result.load[shelter.id] <= shelter.capacity);
  }
});

// 2. Медициналық көмек қажет отбасылар тек медициналық пунктке түседі.
test('needsMedical отбасы тек медициналық пунктке түседі', () => {
  const families = structuredClone(village.families);
  const shelters = structuredClone(village.shelters);
  const distances = createDistances(families, shelters);

  const result = CSP.solve(families, shelters, distances);

  assert.equal(result.ok, true);

  for (const family of families) {
    if (family.needsMedical) {
      const shelterId = result.assignment[family.id];

      const shelter = shelters.find(
        item => item.id === shelterId
      );

      assert.ok(shelter);
      assert.equal(shelter.hasMedical, true);
    }
  }
});

// 3. Орын жетпесе, алгоритм false қайтарады.
test('орын жетпесе → ok: false және себебі жазылған', () => {
  const families = structuredClone(village.families);
  const shelters = structuredClone(village.shelters);

  // Әр пункттің сыйымдылығын 1 орынға азайтамыз.
  for (const shelter of shelters) {
    shelter.capacity = 1;
  }

  const distances = createDistances(families, shelters);

  const result = CSP.solve(families, shelters, distances);

  assert.equal(result.ok, false);
  assert.ok(result.reason.length > 0);
});

// 4. MRV қосылғанда backtracks саны көп болмауы керек.
test('MRV-мен backtrack саны MRV-сызбен салыстырғанда көп емес', () => {
  const families = [
    { id: 'F1', size: 3, needsMedical: false },
    { id: 'F2', size: 3, needsMedical: false },
    { id: 'F3', size: 2, needsMedical: false }
  ];

  const shelters = [
    { id: 'S1', capacity: 5, hasMedical: false },
    { id: 'S2', capacity: 5, hasMedical: false }
  ];

  // F1 екі пунктке де бара алады.
  // F2 тек S1 пунктіне бара алады.
  // F3 тек S2 пунктіне бара алады.
  const distances = {
    F1: { S1: 1, S2: 2 },
    F2: { S1: 1, S2: Infinity },
    F3: { S1: Infinity, S2: 1 }
  };

  const resultWithMRV = CSP.solve(
    families,
    shelters,
    distances,
    { useMRV: true }
  );

  const resultWithoutMRV = CSP.solve(
    families,
    shelters,
    distances,
    { useMRV: false }
  );

  assert.equal(resultWithMRV.ok, true);
  assert.equal(resultWithoutMRV.ok, true);

  assert.ok(
    resultWithMRV.backtracks <= resultWithoutMRV.backtracks
  );
});

// 5. Infinity болса, отбасы ол пунктке орналастырылмайды.
test('пунктке жол жоқ болса (Infinity), отбасы оған берілмейді', () => {
  const families = [
    { id: 'F1', size: 2, needsMedical: false }
  ];

  const shelters = [
    { id: 'S1', capacity: 5, hasMedical: false },
    { id: 'S2', capacity: 5, hasMedical: false }
  ];

  const distances = {
    F1: {
      S1: Infinity,
      S2: 5
    }
  };

  const result = CSP.solve(families, shelters, distances);

  assert.equal(result.ok, true);
  assert.equal(result.assignment.F1, 'S2');
});

// 6. Қате енгізілген деректер Error қатесін тудыруы керек.
test('теріс сыйымдылық немесе size = 0 → түсінікті қате', () => {
  const families = [
    { id: 'F1', size: 2, needsMedical: false }
  ];

  const shelters = [
    { id: 'S1', capacity: 5, hasMedical: false }
  ];

  const distances = {
    F1: { S1: 5 }
  };

  // Теріс capacity тексеріледі.
  const badShelters = [
    { id: 'S1', capacity: -1, hasMedical: false }
  ];

  assert.throws(
    () => CSP.solve(families, badShelters, distances),
    Error
  );

  // size = 0 тексеріледі.
  const badFamilies = [
    { id: 'F1', size: 0, needsMedical: false }
  ];

  assert.throws(
    () => CSP.solve(badFamilies, shelters, distances),
    Error
  );
});
