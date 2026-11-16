const fields = [
  'atomicNumber',
  'symbol',
  'name',
  'isMetal',
  'discoveredOn',
  'density'
];

export function validateElement(value, { partial = false } = {}) {
  // Sprawdzenie struktury JSON
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    return 'Oczekiwano obiektu JSON';
  }

  const keys = Object.keys(value);

  // Odrzucenie nieznanych pól
  const unknown = keys.find(key => !fields.includes(key));

  if (unknown) {
    return `Nieznane pole: ${unknown}`;
  }

  if (partial) {
    // PATCH: wymagane przynajmniej jedno pole
    if (keys.length === 0) {
      return 'PATCH wymaga co najmniej jednego pola';
    }
  } else {
    // POST i PUT: wymagany komplet pól
    const missing = fields.find(key => !(key in value));

    if (missing) {
      return `Brak wymaganego pola: ${missing}`;
    }
  }

  return null;
}
