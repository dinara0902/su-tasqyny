// A* және BFS тесттері. Жауапты: Марат Нәрлі.
// Әр test.todo-ны нақты тестке айналдырыңыз. Тізімі: docs/SPEC.md → Тесттер.
const test = require('node:test');
const assert = require('node:assert/strict');
const Search = require('../src/algorithms/search.js');
// const village = require('../data/village.json');

const emptyMap = {
  width: 5,
  height: 5,
  grid: ['.....', '.....', '.....', '.....', '.....'],
};

test('бос картада A* пен BFS жол ұзындығы бірдей', () => {
  const start = { x: 0, y: 0 };
  const goals = [{ x: 4, y: 4 }];
  const a = Search.aStar(emptyMap, start, goals);
  const b = Search.bfs(emptyMap, start, goals);
  assert.equal(a.found, true);
  assert.equal(b.found, true);
  assert.equal(a.path.length, b.path.length);
  assert.equal(a.cost, 8);
});

test.todo('A* BFS-тен аз немесе тең ұяшық зерттейді');
test.todo('P > threshold ұяшық арқылы жол өтпейді');
test.todo('мақсатқа жол жоқ → found: false, қате шықпайды');
test.todo('бастапқы нүкте мақсаттың өзі → жол ұзындығы 1, құн 0');
test.todo('картадан тыс координат → түсінікті қате');
