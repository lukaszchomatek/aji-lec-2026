import { Element } from '../models/elementModel.js';
import { validateElement } from '../models/validation.js';
import { UniqueConstraintError, Op } from 'sequelize';
import { Discoverer } from '../models/discovererModel.js';

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

async function item(req) {
  const number = numberFromRequest(req);

  if (number === null) {
    return null;
  }

  return await Element.findByPk(number);
}

// GET /api/elements
export async function list(req, res) {
  const { metal } = req.query;

  if (metal !== undefined && metal !== 'true' && metal !== 'false') {
    return res.status(400).json({
      error: 'Parametr metal: tylko true lub false'
    });
  }

  const where = metal === undefined
    ? {}
    : { isMetal: metal === 'true' };

  const data = await Element.findAll({ where, 
    include: {
    model: Discoverer,
    through: {
      attributes: []
    }
  } });

  res.status(200).json({
    count: data.length,
    message: 'all content loaded',
    data
  });
}

// GET /api/elements/:atomicNumber
export async function get(req, res) {
  const element = await item(req);

  if (!element) {
    return res.status(404).json({
      error: 'Nie znaleziono pierwiastka'
    });
  }

  res.status(200).json(element);
}

// POST /api/elements
export async function create(req, res) {
  
  try {
    const element = await Element.create(req.body);

    res.location(`/api/elements/${element.atomicNumber}`);
    return res.status(201).json(element);

  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        error: 'Pierwiastek o tym numerze lub symbolu już istnieje'
      });
    }

    throw error;
  }
}

// PUT /api/elements/:atomicNumber — pełne zastąpienie zasobu
export async function replace(req, res) {
  const element = await item(req);

  if (!element) {
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

  if (req.body.atomicNumber !== element.atomicNumber) {
    return res.status(422).json({
      error: 'Nie można zmienić atomicNumber w adresie zasobu'
    });
  }

  try {
    await element.update(req.body);
    return res.status(200).json(element);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        error: 'Pierwiastek o tym numerze lub symbolu już istnieje'
      });
    }

    throw error;
  }
}

// PATCH /api/elements/:atomicNumber — częściowa aktualizacja zasobu
export async function update(req, res) {
  const element = await item(req);

  if (!element) {
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

  if ('atomicNumber' in req.body &&
      req.body.atomicNumber !== element.atomicNumber) {
    return res.status(422).json({
      error: 'Nie można zmienić atomicNumber w adresie zasobu'
    });
  }

  try {
    await element.update(req.body);
    return res.status(200).json(element);

  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        error: 'Pierwiastek o tym numerze lub symbolu już istnieje'
      });
    }

    throw error;
  }
}

// DELETE /api/elements/:atomicNumber
export async function remove(req, res) {
  const element = await item(req);

  if (!element) {
    return res.status(404).json({
      error: 'Nie znaleziono pierwiastka'
    });
  }

  await element.destroy();
  return res.status(204).end();
}

export async function getByDiscoverer(req, res) {
  const { lastName } = req.query;

  if (typeof lastName !== 'string' || !lastName.trim()) {
    return res.status(400).json({
      error: 'Wymagany parametr query: lastName'
    });
  }

  const elements = await Element.findAll({
    include: {
      model: Discoverer,
      where: {
        lastName: {
          [Op.like]: `%${lastName.trim()}%`
        }
      },
      attributes: ['id', 'firstName', 'lastName'],
      through: {
        attributes: []
      }
    },
    order: [['atomicNumber', 'ASC']]
  });

  return res.status(200).json(elements);
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
