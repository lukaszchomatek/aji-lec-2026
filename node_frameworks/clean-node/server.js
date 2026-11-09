import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { elements } from './data.js';
import { HttpError, readJson, sendEmpty, sendJson, sendText } from './http.js';
import { validateElement } from './validation.js';

const collectionPath = '/api/elements';
const collectionMethods = ['GET', 'HEAD', 'POST', 'OPTIONS'];
const itemMethods = ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

function methodNotAllowed(res, allowed) {
  // 405 wymaga nagłówka Allow z metodami obsługiwanymi przez zasób.
  sendEmpty(res, 405, { Allow: allowed.join(', ') });
}

function findByNumber(number) {
  return elements.findIndex(element => element.atomicNumber === number);
}

function checkUnique(candidate, ignoredNumber = null) {
  if (elements.some(element =>
    element.atomicNumber !== ignoredNumber &&
    (element.atomicNumber === candidate.atomicNumber || element.symbol === candidate.symbol)
  )) {
    throw new HttpError(409, 'Pierwiastek o tym numerze lub symbolu już istnieje');
  }
}

async function handleCollection(req, res, url) {
  if (req.method === 'OPTIONS') {
    return sendEmpty(res, 204, { Allow: collectionMethods.join(', ') });
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    // Demonstracja parametru query string oraz wartości logicznej.
    const metal = url.searchParams.get('metal');
    if (metal !== null && metal !== 'true' && metal !== 'false') {
      throw new HttpError(400, 'Parametr metal: tylko true lub false');
    }
    const result = metal === null ? elements : elements.filter(x => x.isMetal === (metal === 'true'));
    return sendJson(req, res, 200, { count: result.length, data: result });
  }
  if (req.method === 'POST') {
    const element = await readJson(req);
    validateElement(element);
    checkUnique(element);
    elements.push(element);
    return sendJson(req, res, 201, element, {
      Location: `/api/elements/${element.atomicNumber}`
    });
  }
  return methodNotAllowed(res, collectionMethods);
}

async function handleItem(req, res, atomicNumber) {
  if (req.method === 'OPTIONS') {
    return sendEmpty(res, 204, { Allow: itemMethods.join(', ') });
  }
  if (!itemMethods.includes(req.method)) return methodNotAllowed(res, itemMethods);

  const index = findByNumber(atomicNumber);
  if (index < 0) throw new HttpError(404, `Nie znaleziono pierwiastka ${atomicNumber}`);

  if (req.method === 'GET' || req.method === 'HEAD') {
    return sendJson(req, res, 200, elements[index]);
  }
  if (req.method === 'DELETE') {
    elements.splice(index, 1);
    return sendEmpty(res, 204); // 204: brak ciała odpowiedzi.
  }

  const changes = await readJson(req);
  validateElement(changes, { partial: req.method === 'PATCH' });
  if ('atomicNumber' in changes && changes.atomicNumber !== atomicNumber) {
    throw new HttpError(422, 'Nie można zmienić atomicNumber w adresie zasobu');
  }
  const updated = req.method === 'PUT'
    ? changes // PUT: pełna reprezentacja.
    : { ...elements[index], ...changes }; // PATCH: częściowa zmiana.
  checkUnique(updated, atomicNumber);
  elements[index] = updated;
  return sendJson(req, res, 200, updated);
}

export function createApp() {
  return http.createServer(async (req, res) => {
    // Jeden punkt wejścia; trasy rozpoznajemy ręcznie.
    try {
      const url = new URL(req.url, 'http://localhost');
      const path = url.pathname.replace(/\/$/, '') || '/';

      if (path === '/' && (req.method === 'GET' || req.method === 'HEAD')) {
        return sendText(req, res, 200, 'API pierwiastków: /api/elements\n');
      }
      if (path === '/' && req.method === 'OPTIONS') {
        return sendEmpty(res, 204, { Allow: 'GET, HEAD, OPTIONS' });
      }
      if (path === '/') return methodNotAllowed(res, ['GET', 'HEAD', 'OPTIONS']);

      if (path === collectionPath) return await handleCollection(req, res, url);

      const match = /^\/api\/elements\/(\d+)$/.exec(path);
      if (match) return await handleItem(req, res, Number(match[1]));

      throw new HttpError(404, 'Nie znaleziono ścieżki');
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error('Błąd serwera:', error);
      if (!res.headersSent) {
        sendJson(req, res, status, { error: status === 500 ? 'Błąd wewnętrzny serwera' : error.message });
      } else {
        res.destroy(error);
      }
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => {
    console.log(`Serwer działa: http://localhost:${port}`);
  });
}
