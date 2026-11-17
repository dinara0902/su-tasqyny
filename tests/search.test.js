// A* және BFS тесттері. Жауапты: Марат Нәрлі.
// Әр test.todo-ны нақты тестке айналдырыңыз. Тізімі: docs/SPEC.md → Тесттер.
const test = require('node:test');
// const assert = require('node:assert/strict');
// const Search = require('../src/algorithms/search.js');
// const village = require('../data/village.json');

test.todo('бос картада A* пен BFS жол ұзындығы бірдей');
test.todo('A* BFS-тен аз немесе тең ұяшық зерттейді');
test.todo('P > threshold ұяшық арқылы жол өтпейді');
test.todo('мақсатқа жол жоқ → found: false, қате шықпайды');
test.todo('бастапқы нүкте мақсаттың өзі → жол ұзындығы 1, құн 0');
test.todo('картадан тыс координат → түсінікті қате');
