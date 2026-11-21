/**
 * Метрикаларды есептеу: node benchmark.js  (немесе npm run benchmark)
 * Нәтижені README-дегі «Тесттер және метрикалар» кестесіне көшіріңіз.
 *
 * 1. A* пен BFS: әр үйден ең жақын пунктке — жол ұзындығы, зерттелген ұяшықтар, уақыт.
 * 2. Су қаупінің A*-ге әсері: көпірдің P(F) мәні өзгергенде жол құны.
 * 3. CSP: екі сценарий (қалыпты және «тығыз»), MRV / Forward Checking қосулы және өшірулі.
 * 4. Байес: Жарқын Динара толтырады.
 */
const village = require('./data/village.json');
const tight = require('./data/scenario-tight.json');
const Search = require('./src/algorithms/search.js');
const CSP = require('./src/algorithms/csp.js');

const goals = village.shelters.map((s) => ({ x: s.x, y: s.y }));

/** Функцияның орташа орындалу уақыты, мс (бірнеше рет іске қосып, орташасын аламыз). */
function timeMs(fn, runs = 200) {
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < runs; i++) fn();
  return Number(process.hrtime.bigint() - t0) / runs / 1e6;
}

// ───────────────────────── 1. A* пен BFS ─────────────────────────
console.log('\n1. A* пен BFS: әр үйден ең жақын пунктке\n');
const rows = [];
let sumA = 0, sumB = 0, timeA = 0, timeB = 0, samePath = true;
for (const f of village.families) {
  const a = Search.aStar(village, f.house, goals);
  const b = Search.bfs(village, f.house, goals);
  const ta = timeMs(() => Search.aStar(village, f.house, goals));
  const tb = timeMs(() => Search.bfs(village, f.house, goals));
  sumA += a.expanded; sumB += b.expanded; timeA += ta; timeB += tb;
  if (a.path.length !== b.path.length) samePath = false;
  rows.push({
    'отбасы': f.id,
    'пункт': village.shelters.find((s) => s.x === a.goal.x && s.y === a.goal.y).id,
    'қадам A*': a.cost,
    'қадам BFS': b.cost,
    'зерттелді A*': a.expanded,
    'зерттелді BFS': b.expanded,
  });
}
console.table(rows);
console.log(`Барлығы зерттелді: A* ${sumA}, BFS ${sumB} (A* ${(sumB / sumA).toFixed(1)} есе аз)`);
console.log(`Жол ұзындығы барлық үйде бірдей ме: ${samePath ? 'иә' : 'ЖОҚ'}`);
const n = village.families.length;
console.log(`Орташа уақыт бір үйге: A* ${(timeA / n).toFixed(3)} мс, BFS ${(timeB / n).toFixed(3)} мс`);

// ───────────────────────── 2. Су қаупінің әсері ─────────────────────────
console.log('\n2. Су қаупінің A*-ге әсері: батыс жақтағы үй (1, 7) → №1 мектеп, көпір арқылы\n');
const westHouse = { x: 1, y: 7 };
const school = [{ x: 22, y: 1 }];
const floodRows = [];
for (const p of [0, 0.3, 0.5, 0.7, 0.9]) {
  const floodProb = new Map([['12,7', p], ['13,7', p]]);
  const r = Search.aStar(village, westHouse, school, { floodProb });
  floodRows.push({ 'көпір P(F)': p, 'жол бар ма': r.found ? 'иә' : 'жоқ (жабық)', 'жол құны': r.found ? r.cost : '—' });
}
console.table(floodRows);

// ───────────────────────── 3. CSP ─────────────────────────
function distancesFor(map) {
  const d = {};
  for (const f of map.families) {
    d[f.id] = {};
    for (const s of map.shelters) d[f.id][s.id] = Search.aStar(map, f.house, [{ x: s.x, y: s.y }]).cost;
  }
  return d;
}
const distances = distancesFor(village);
const scenarios = [
  { name: 'қалыпты (40 орын)', shelters: village.shelters },
  { name: '«тығыз» (34 орын)', shelters: village.shelters.map((s) => ({ ...s, capacity: tight.capacity[s.id] })) },
];
const configs = [
  { name: 'MRV + FC', opt: { useMRV: true, useForwardChecking: true } },
  { name: 'тек MRV', opt: { useMRV: true, useForwardChecking: false } },
  { name: 'тек FC', opt: { useMRV: false, useForwardChecking: true } },
  { name: 'екеуі де жоқ', opt: { useMRV: false, useForwardChecking: false } },
];
console.log('\n3. CSP: отбасыларды пункттерге бөлу (34 адам)\n');
for (const sc of scenarios) {
  const cspRows = configs.map((c) => {
    const r = CSP.solve(village.families, sc.shelters, distances, c.opt);
    return { 'әдіс': c.name, 'шешім бар ма': r.ok ? 'иә' : 'жоқ', 'кері қайту': r.backtracks, 'тексерілген нұсқа': r.nodes, 'жүктеме': JSON.stringify(r.load) };
  });
  console.log(`Сценарий: ${sc.name}`);
  console.table(cspRows);
}

// ───────────────────────── 4. Байес ─────────────────────────
// TODO (Динара): қате хабар үлесі 10%, 30%, 50% болғанда Байес болжамының дәлдігі
console.log('\n4. Байес: Жарқын Динара толтырады (docs/TASKS.md)\n');
