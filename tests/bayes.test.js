// Байес модулінің тесттері. Жауапты: Жарқын Динара.
// Әр test.todo-ны нақты тестке айналдырыңыз. Тізімі: docs/SPEC.md → Тесттер.
const test = require('node:test');
// const assert = require('node:assert/strict');
// const Bayes = require('../src/algorithms/bayes.js');

test.todo('P = 0.6, r = 0.8, «су басты» → ≈ 0.857');
test.todo('«су басты», сосын «құрғақ» → P бастапқы мәнге қайтады');
test.todo('r = 0.5 болса, хабар P-ні өзгертпейді');
test.todo('бірдей бес хабар → P 1-ге жақындайды, бірақ 1-ден аспайды');
test.todo('r = 1.5 немесе says = "abc" → түсінікті қате');
