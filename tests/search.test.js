// A* және BFS тесттері. Жауапты: Марат Нәрлі.
// Әр test.todo-ны нақты тестке айналдырыңыз. Тізімі: docs/SPEC.md → Тесттер.
const test = require('node:test');
const assert = require('node:assert/strict');
const Search = require('../src/algorithms/search.js');
const village = require('../data/village.json');

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

test('A* BFS-тен аз немесе тең ұяшық зерттейді', () => {
  const goals = village.shelters.map((s) => ({ x: s.x, y: s.y }));
  for (const family of village.families) {
    const a = Search.aStar(village, family.house, goals);
    const b = Search.bfs(village, family.house, goals);
    assert.ok(a.expanded <= b.expanded, family.id);
  }
});

test('P > threshold ұяшық арқылы жол өтпейді', () => {
  const start = { x: 0, y: 0 };
  const goals = [{ x: 4, y: 0 }];
  const floodProb = new Map([['2,0', 0.9]]);
  const a = Search.aStar(emptyMap, start, goals, { floodProb });
  assert.equal(a.found, true);
  for (const cell of a.path) {
    assert.ok(!(cell.x === 2 && cell.y === 0), 'жол су басқан ұяшықтан өтті');
  }
  assert.equal(a.cost, 6);
});

test('мақсатқа жол жоқ → found: false, қате шықпайды', () => {
  const walledMap = {
    width: 5,
    height: 3,
    grid: ['..#..', '..#..', '..#..'],
  };
  const a = Search.aStar(walledMap, { x: 0, y: 0 }, [{ x: 4, y: 0 }]);
  const b = Search.bfs(walledMap, { x: 0, y: 0 }, [{ x: 4, y: 0 }]);
  assert.equal(a.found, false);
  assert.equal(b.found, false);
  assert.equal(a.cost, Infinity);
  assert.deepEqual(a.path, []);
});

test('бастапқы нүкте мақсаттың өзі → жол ұзындығы 1, құн 0', () => {
  const a = Search.aStar(emptyMap, { x: 2, y: 2 }, [{ x: 2, y: 2 }]);
  assert.equal(a.found, true);
  assert.equal(a.path.length, 1);
  assert.equal(a.cost, 0);
});

test('картадан тыс координат → түсінікті қате', () => {
  assert.throws(() => Search.aStar(emptyMap, { x: 10, y: 0 }, [{ x: 4, y: 4 }]), /картадан тыс/);
  assert.throws(() => Search.bfs(emptyMap, { x: -1, y: 0 }, [{ x: 4, y: 4 }]), /картадан тыс/);
});
