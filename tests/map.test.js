// Мысал картаның дұрыстығын тексереді. Бұл тесттер қазір де өтеді.
const test = require('node:test');
const assert = require('node:assert/strict');
const village = require('../data/village.json');

test('карта өлшемі width × height-ке сай', () => {
  assert.equal(village.grid.length, village.height);
  for (const row of village.grid) assert.equal(row.length, village.width);
});

test('картада тек белгілі белгілер бар', () => {
  const allowed = new Set(Object.keys(village.legend));
  for (const row of village.grid) for (const ch of row) assert.ok(allowed.has(ch), `белгісіз белгі: ${ch}`);
});

test('әр отбасының үйі картада H белгісімен тұр', () => {
  for (const f of village.families) assert.equal(village.grid[f.house.y][f.house.x], 'H', f.id);
});

test('әр пункт картада S белгісімен тұр', () => {
  for (const s of village.shelters) assert.equal(village.grid[s.y][s.x], 'S', s.id);
});

test('жалпы орын саны адам санынан көп', () => {
  const people = village.families.reduce((a, f) => a + f.size, 0);
  const places = village.shelters.reduce((a, s) => a + s.capacity, 0);
  assert.ok(places >= people, `${people} адам, ${places} орын`);
});

// TODO (Марат): src/map.js жазылғаннан кейін cellAt, isPassable, neighbors тесттері
test.todo('cellAt картадан тыс координатқа түсінікті қате шығарады');
test.todo('neighbors қабырға мен суды қайтармайды');
