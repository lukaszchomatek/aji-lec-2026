import { HttpError } from './http.js';

const keys = ['atomicNumber', 'symbol', 'name', 'isMetal', 'discoveredOn', 'density'];

export function validateElement(value, { partial = false } = {}) {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new HttpError(422, 'Oczekiwano obiektu JSON');
  }

  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new HttpError(422, `Nieznane pole: ${key}`);
  }
  if (!partial) {
    for (const key of keys) {
      if (!(key in value)) throw new HttpError(422, `Brak wymaganego pola: ${key}`);
    }
  } else if (Object.keys(value).length === 0) {
    throw new HttpError(422, 'PATCH wymaga co najmniej jednego pola');
  }

  if ('atomicNumber' in value && (!Number.isInteger(value.atomicNumber) || value.atomicNumber <= 0)) {
    throw new HttpError(422, 'atomicNumber musi być dodatnią liczbą całkowitą');
  }
  if ('symbol' in value && !/^[A-Z][a-z]?$/.test(value.symbol)) {
    throw new HttpError(422, 'symbol: jedna wielka litera i opcjonalnie jedna mała');
  }
  if ('name' in value && (typeof value.name !== 'string' || !value.name.trim())) {
    throw new HttpError(422, 'name musi być niepustym napisem');
  }
  if ('isMetal' in value && typeof value.isMetal !== 'boolean') {
    throw new HttpError(422, 'isMetal musi być wartością true albo false');
  }
  if ('density' in value && (typeof value.density !== 'number' || !Number.isFinite(value.density) || value.density <= 0)) {
    throw new HttpError(422, 'density musi być dodatnią liczbą');
  }
  if ('discoveredOn' in value && value.discoveredOn !== null) {
    const date = value.discoveredOn;
    const match = typeof date === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const parsed = match ? new Date(`${date}T00:00:00Z`) : null;
    const valid = parsed && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    if (!valid) throw new HttpError(422, 'discoveredOn: data YYYY-MM-DD lub null');
  }
}
