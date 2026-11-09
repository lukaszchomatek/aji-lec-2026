import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';

let server;
let base;

before(async () => {
  server = createApp();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

const jsonHeaders = { 'Content-Type': 'application/json' };
const gallium = {
  atomicNumber: 31, symbol: 'Ga', name: 'Gal',
  isMetal: true, discoveredOn: '1875-01-01', density: 5.91
};

test('GET / zwraca tekst', async () => {
  const res = await fetch(base);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/plain/);
  assert.match(await res.text(), /API pierwiastków/);
});

test('GET /api/elements i filtrowanie', async () => {
  const all = await fetch(`${base}/api/elements`);
  assert.equal(all.status, 200);
  assert.equal((await all.json()).count, 8);
  const metal = await fetch(`${base}/api/elements?metal=true`);
  const payload = await metal.json();
  assert.equal(payload.count, 2);
  assert.ok(payload.data.every(x => x.isMetal));
});

test('HEAD i OPTIONS zwracają odpowiednie nagłówki', async () => {
  const head = await fetch(`${base}/api/elements/8`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.ok(Number(head.headers.get('content-length')) > 0);
  assert.equal(await head.text(), '');
  const options = await fetch(`${base}/api/elements/8`, { method: 'OPTIONS' });
  assert.equal(options.status, 204);
  assert.match(options.headers.get('allow'), /PATCH/);
});

test('POST -> GET -> PUT -> PATCH -> DELETE', async () => {
  const post = await fetch(`${base}/api/elements`, {
    method: 'POST', headers: jsonHeaders, body: JSON.stringify(gallium)
  });
  assert.equal(post.status, 201);
  assert.equal(post.headers.get('location'), '/api/elements/31');
  assert.equal((await post.json()).symbol, 'Ga');
  assert.equal((await (await fetch(`${base}/api/elements/31`)).json()).name, 'Gal');

  const put = await fetch(`${base}/api/elements/31`, {
    method: 'PUT', headers: jsonHeaders,
    body: JSON.stringify({ ...gallium, name: 'Gal 2' })
  });
  assert.equal(put.status, 200);
  assert.equal((await put.json()).name, 'Gal 2');

  const patch = await fetch(`${base}/api/elements/31`, {
    method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ density: 5.904 })
  });
  assert.equal((await patch.json()).density, 5.904);

  const del = await fetch(`${base}/api/elements/31`, { method: 'DELETE' });
  assert.equal(del.status, 204);
  assert.equal(await del.text(), '');
  assert.equal((await fetch(`${base}/api/elements/31`)).status, 404);
});

test('Obsługa błędów 400, 404, 405, 409, 415 i 422', async () => {
  assert.equal((await fetch(`${base}/api/elements?metal=nie`)).status, 400);
  assert.equal((await fetch(`${base}/brak`)).status, 404);
  const badMethod = await fetch(`${base}/api/elements`, { method: 'DELETE' });
  assert.equal(badMethod.status, 405);
  assert.match(badMethod.headers.get('allow'), /POST/);
  assert.equal((await fetch(`${base}/api/elements`, {
    method: 'POST', headers: jsonHeaders, body: '{x'
  })).status, 400);
  assert.equal((await fetch(`${base}/api/elements`, {
    method: 'POST', headers: jsonHeaders, body: JSON.stringify({ ...gallium, atomicNumber: 8 })
  })).status, 409);
  assert.equal((await fetch(`${base}/api/elements`, {
    method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'test'
  })).status, 415);
  assert.equal((await fetch(`${base}/api/elements`, {
    method: 'POST', headers: jsonHeaders, body: JSON.stringify({ ...gallium, isMetal: 'tak' })
  })).status, 422);
  assert.equal((await fetch(`${base}/api/elements`, {
    method: 'POST', headers: jsonHeaders, body: JSON.stringify({ ...gallium, discoveredOn: '2026-02-30' })
  })).status, 422);
});
