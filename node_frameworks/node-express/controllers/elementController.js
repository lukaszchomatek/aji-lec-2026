import { Op } from 'sequelize';
import { Element } from '../models/elementModel.js';
import { Discoverer } from '../models/discovererModel.js';

const allowedCollection = 'GET, HEAD, POST, OPTIONS';
const allowedItem = 'GET, HEAD, PUT, PATCH, DELETE, OPTIONS';

const discoverers = {
  model: Discoverer,
  through: { attributes: [] }
};

// Pomocnicze pobieranie pierwiastka
async function item(req) {
  const atomicNumber = Number(req.params.atomicNumber);

  if (!Number.isSafeInteger(atomicNumber) || atomicNumber < 1) {
    return null;
  }

  return Element.findByPk(atomicNumber);
}

// GET /api/elements
export async function list(req, res) {
  const { metal } = req.query;

  if (metal !== undefined && !['true', 'false'].includes(metal)) {
    return res.status(400).json({
      error: 'Parametr metal: tylko true lub false'
    });
  }

  const where = metal === undefined
    ? {}
    : { isMetal: metal === 'true' };

  const data = await Element.findAll({
    where,
    include: discoverers
  });

  res.json({
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

  res.json(element);
}

// POST /api/elements
export async function create(req, res) {
  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'Wymagany Content-Type: application/json'
    });
  }

  const element = await Element.create(req.body);

  res.status(201)
    .location(`/api/elements/${element.atomicNumber}`)
    .json(element);
}

// PUT /api/elements/:atomicNumber
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

  if (req.body?.atomicNumber !== element.atomicNumber) {
    return res.status(422).json({
      error: 'atomicNumber musi być zgodny z adresem zasobu'
    });
  }

  await element.update(req.body);

  res.json(element);
}

// PATCH /api/elements/:atomicNumber
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

  if (req.body?.atomicNumber !== undefined &&
      req.body.atomicNumber !== element.atomicNumber) {
    return res.status(422).json({
      error: 'Nie można zmienić atomicNumber'
    });
  }

  await element.update(req.body);

  res.json(element);
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

  res.status(204).end();
}

// GET /api/elements/by-discoverer?lastName=Curie
export async function getByDiscoverer(req, res) {
  const { lastName } = req.query;

  if (typeof lastName !== 'string' || !lastName.trim()) {
    return res.status(400).json({
      error: 'Wymagany parametr query: lastName'
    });
  }

  const elements = await Element.findAll({
    include: {
      ...discoverers,
      where: {
        lastName: {
          [Op.like]: `%${lastName.trim()}%`
        }
      }
    },
    order: [['atomicNumber', 'ASC']]
  });

  res.json(elements);
}

// OPTIONS /api/elements
export function collectionOptions(req, res) {
  res.set('Allow', allowedCollection).status(204).end();
}

// OPTIONS /api/elements/:atomicNumber
export function itemOptions(req, res) {
  res.set('Allow', allowedItem).status(204).end();
}

// Niedozwolone metody HTTP
export function collectionMethodNotAllowed(req, res) {
  res.set('Allow', allowedCollection).status(405).end();
}

export function itemMethodNotAllowed(req, res) {
  res.set('Allow', allowedItem).status(405).end();
}