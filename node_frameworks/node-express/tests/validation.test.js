import test from 'node:test';
import assert from 'node:assert/strict';
import { validateElement } from '../models/validation.js';
import { Element } from '../models/elementModel.js';

const valid = {
  atomicNumber: 31,
  symbol: 'Ga',
  name: 'Gal',
  isMetal: true,
  discoveredOn: '1875-01-01',
  density: 5.91
};

test('poprawny pełny element', () => {
  assert.equal(validateElement(valid), null);
});

test('POST i PUT wymagają wszystkich pól', () => {
  assert.equal(
    validateElement({ symbol: 'Ga' }),
    'Brak wymaganego pola: atomicNumber'
  );
});

test('PATCH dopuszcza podzbiór pól, ale nie pusty obiekt', () => {
  assert.equal(
    validateElement({ density: 5.904 }, { partial: true }),
    null
  );

  assert.equal(
    validateElement({}, { partial: true }),
    'PATCH wymaga co najmniej jednego pola'
  );
});

test('odrzucenie nieznanych pól', () => {
  assert.equal(
    validateElement({ ...valid, color: 'silver' }),
    'Nieznane pole: color'
  );
});

test('odrzucenie niepoprawnej struktury JSON', () => {
  assert.equal(
    validateElement(null),
    'Oczekiwano obiektu JSON'
  );

  assert.equal(
    validateElement([]),
    'Oczekiwano obiektu JSON'
  );

  assert.equal(
    validateElement('tekst'),
    'Oczekiwano obiektu JSON'
  );
});

test('walidacja strukturalna nie sprawdza wartości pól', () => {
  assert.equal(
    validateElement({ ...valid, discoveredOn: '2025-02-30' }),
    null
  );

  assert.equal(
    validateElement({ ...valid, atomicNumber: 9007199254740992 }),
    null
  );
});

test('PATCH odrzuca nieznane pola', () => {
  assert.equal(
    validateElement({ color: 'silver' }, { partial: true }),
    'Nieznane pole: color'
  );
});

test('Sequelize odrzuca ujemną gęstość', async () => {
  const element = Element.build({
    atomicNumber: 31,
    symbol: 'Ga',
    name: 'Gal',
    isMetal: true,
    discoveredOn: '1875-01-01',
    density: -5
  });

  await assert.rejects(
    element.validate(),
    { name: 'SequelizeValidationError' }
  );
});