const keys = [
  'atomicNumber',
  'symbol',
  'name',
  'isMetal',
  'discoveredOn',
  'density'
];

export function validateElement(value, { partial = false } = {}) {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    return 'Oczekiwano obiektu JSON';
  }

  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) {
      return `Nieznane pole: ${key}`;
    }
  }

  if (!partial) {
    for (const key of keys) {
      if (!(key in value)) {
        return `Brak wymaganego pola: ${key}`;
      }
    }
  } else if (Object.keys(value).length === 0) {
    return 'PATCH wymaga co najmniej jednego pola';
  }

  if (
    'atomicNumber' in value &&
    (!Number.isSafeInteger(value.atomicNumber) || value.atomicNumber <= 0)
  ) {
    return 'atomicNumber musi być dodatnią liczbą całkowitą';
  }

  if (
    'symbol' in value &&
    (typeof value.symbol !== 'string' || !/^[A-Z][a-z]?$/.test(value.symbol))
  ) {
    return 'symbol: jedna wielka litera i opcjonalnie jedna mała';
  }

  if (
    'name' in value &&
    (typeof value.name !== 'string' || !value.name.trim())
  ) {
    return 'name musi być niepustym napisem';
  }

  if ('isMetal' in value && typeof value.isMetal !== 'boolean') {
    return 'isMetal musi być wartością true albo false';
  }

  if (
    'density' in value &&
    (typeof value.density !== 'number' ||
     !Number.isFinite(value.density) ||
     value.density <= 0)
  ) {
    return 'density musi być dodatnią liczbą';
  }

  if ('discoveredOn' in value && value.discoveredOn !== null) {
    const date = value.discoveredOn;
    const match = typeof date === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const parsed = match ? new Date(`${date}T00:00:00Z`) : null;
    const valid = parsed &&
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date;

    if (!valid) {
      return 'discoveredOn: data YYYY-MM-DD lub null';
    }
  }

  return null;
}
