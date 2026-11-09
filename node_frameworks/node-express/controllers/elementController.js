import { elementModel as model } from '../models/elementModel.js';
import { validateElement } from '../models/validation.js';

const allowedCollection = 'GET, HEAD, POST, OPTIONS';
const allowedItem = 'GET, HEAD, PUT, PATCH, DELETE, OPTIONS';

function numberFromRequest(req) {
  const value = req.params.atomicNumber;

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function item(req) {
  const number = numberFromRequest(req);

  if (number === null) {
    return null;
  }

  const index = model.findIndex(number);

  if (index < 0) {
    return null;
  }

  return {
    index,
    number,
    element: model.find(number)
  };
}

// GET /api/elements
export function list(req, res) {
  const { metal } = req.query;

  if (metal !== undefined && metal !== 'true' && metal !== 'false') {
    return res.status(400).json({
      error: 'Parametr metal: tylko true lub false'
    });
  }

  let data = model.all();

  if (metal !== undefined) {
    data = data.filter(element => element.isMetal === (metal === 'true'));
  }

  res.status(200).json({
    count: data.length,
    message: "all content loaded",
    data
  });
}

// GET /api/elements/:atomicNumber
export function get(req, res) {
  const found = item(req);

  if (!found) {
    return res.status(404).json({
      error: 'Nie znaleziono pierwiastka'
    });
  }

  res.status(200).json(found.element);
}

// POST /api/elements
export function create(req, res) {
  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'Wymagany Content-Type: application/json'
    });
  }

  if (req.body === undefined) {
    return res.status(400).json({
      error: 'Brak poprawnego ciała JSON'
    });
  }

  const validation = validateElement(req.body);

  if (validation) {
    return res.status(422).json({ error: validation });
  }

  if (model.conflict(req.body)) {
    return res.status(409).json({
      error: 'Pierwiastek o tym numerze lub symbolu już istnieje'
    });
  }

  model.insert(req.body);

  res.location(`/api/elements/${req.body.atomicNumber}`);
  res.status(201).json(req.body);
}

// PUT /api/elements/:atomicNumber — pełne zastąpienie zasobu
export function replace(req, res) {
  const found = item(req);

  if (!found) {
    return res.status(404).json({
      error: 'Nie znaleziono pierwiastka'
    });
  }

  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'Wymagany Content-Type: application/json'
    });
  }

  if (req.body === undefined) {
    return res.status(400).json({
      error: 'Brak poprawnego ciała JSON'
    });
  }

  const validation = validateElement(req.body);

  if (validation) {
    return res.status(422).json({ error: validation });
  }

  if (req.body.atomicNumber !== found.number) {
    return res.status(422).json({
      error: 'Nie można zmienić atomicNumber w adresie zasobu'
    });
  }

  if (model.conflict(req.body, found.number)) {
    return res.status(409).json({
      error: 'Pierwiastek o tym numerze lub symbolu już istnieje'
    });
  }

  model.replace(found.index, req.body);
  res.status(200).json(req.body);
}

// PATCH /api/elements/:atomicNumber — częściowa aktualizacja zasobu
export function update(req, res) {
  const found = item(req);

  if (!found) {
    return res.status(404).json({
      error: 'Nie znaleziono pierwiastka'
    });
  }

  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'Wymagany Content-Type: application/json'
    });
  }

  if (req.body === undefined) {
    return res.status(400).json({
      error: 'Brak poprawnego ciała JSON'
    });
  }

  const validation = validateElement(req.body, { partial: true });

  if (validation) {
    return res.status(422).json({ error: validation });
  }

  if ('atomicNumber' in req.body && req.body.atomicNumber !== found.number) {
    return res.status(422).json({
      error: 'Nie można zmienić atomicNumber w adresie zasobu'
    });
  }

  const updated = {
    ...found.element,
    ...req.body
  };

  if (model.conflict(updated, found.number)) {
    return res.status(409).json({
      error: 'Pierwiastek o tym numerze lub symbolu już istnieje'
    });
  }

  model.replace(found.index, updated);
  res.status(200).json(updated);
}

// DELETE /api/elements/:atomicNumber
export function remove(req, res) {
  const found = item(req);

  if (!found) {
    return res.status(404).json({
      error: 'Nie znaleziono pierwiastka'
    });
  }

  model.remove(found.index);
  res.status(204).end();
}

// OPTIONS /api/elements
export function collectionOptions(req, res) {
  res.set('Allow', allowedCollection);
  res.status(204).end();
}

// OPTIONS /api/elements/:atomicNumber
export function itemOptions(req, res) {
  res.set('Allow', allowedItem);
  res.status(204).end();
}

// Metoda HTTP niedozwolona dla kolekcji
export function collectionMethodNotAllowed(req, res) {
  res.set('Allow', allowedCollection);
  res.status(405).end();
}

// Metoda HTTP niedozwolona dla pojedynczego zasobu
export function itemMethodNotAllowed(req, res) {
  res.set('Allow', allowedItem);
  res.status(405).end();
}
