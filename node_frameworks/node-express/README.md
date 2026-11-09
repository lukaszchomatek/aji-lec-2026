# API pierwiastków — Express 5

Projekt dydaktyczny demonstrujący REST API zbudowane przy użyciu Expressa, bez bazy danych.
Dane znajdują się w tablicy w pamięci procesu Node.js; restart przywraca dane początkowe.

## Uruchomienie

Wymagane: Node.js 20+ oraz npm.

```bash
npm install
npm start
```

Serwer: `http://localhost:3000`. Można ustawić inny port przez zmienną środowiskową `PORT`.

W Visual Studio Code można zainstalować rozszerzenie **REST Client** (Huachao Mao),
otworzyć `requests.http` i klikać **Send Request**.

## Struktura

```text
server.js                         konfiguracja Expressa i podłączenie routera
routes/elements.js                mapowanie metod HTTP na kontrolery
controllers/elementController.js  logika obsługi żądań i odpowiedzi
models/elementModel.js            operacje na tablicy pierwiastków
models/elements.js                dane początkowe
models/validation.js              walidacja bez zależności od Expressa
requests.http                     przykładowe żądania REST Client
```

## Metody i odpowiedzi

| Metoda | Adres | Efekt |
|---|---|---|
| GET | `/api/elements` | 200, lista; opcjonalnie `?metal=true` / `false` |
| GET | `/api/elements/:atomicNumber` | 200 lub 404 |
| POST | `/api/elements` | 201 i nagłówek `Location` |
| PUT | `/api/elements/:atomicNumber` | 200, pełne zastąpienie |
| PATCH | `/api/elements/:atomicNumber` | 200, częściowa aktualizacja |
| DELETE | `/api/elements/:atomicNumber` | 204, brak treści |
| HEAD | ścieżki GET | same nagłówki (automatycznie przez Express) |
| OPTIONS | kolekcja lub element | 204, nagłówek `Allow` |

Dodatkowo: 400 — błędny parametr lub brak treści; 405 — metoda niedozwolona;
409 — konflikt numeru/symbolu; 415 — niewłaściwy `Content-Type`;
422 — niepoprawne dane; 404 — nieznana ścieżka lub zasób.

## Założenia dydaktyczne

- Kontrolery `replace()` (PUT) i `update()` (PATCH) są osobne.
- Błędy domenowe są zwracane bezpośrednio przez `res.status(...).json(...)`.
- Walidator zwraca `null` lub komunikat błędu; nie rzuca `HttpError`.
- Brak własnego middleware obsługi błędów, loggera, JWT i kontenera DI.
- `express.json()` jest **wbudowanym middleware** odczytującym JSON.
- Niepoprawna składnia JSON i przekroczenie limitu treści są obsługiwane przez
  domyślny mechanizm błędów Expressa, który może zwracać HTML zamiast JSON.
  Ujednolicenie błędów to dobry temat na późniejszy wykład o middleware.
- `PATCH` wykorzystuje płytkie scalenie obiektów, a nie standard JSON Patch (RFC 6902).
- `PUT` aktualizuje wyłącznie istniejący zasób; nie tworzy nowego pod podanym URL.
- `discoveredOn`: data `YYYY-MM-DD` lub `null`; 1 stycznia oznacza umowny dzień,
  gdy historycznie znany jest tylko rok odkrycia.
- Gęstość jest liczbą dodatnią; w danych demonstracyjnych użyto wartości w g/cm³.

## Co porównać z wersją `node:http`?

1. `http.createServer()` ↔ `express()` i `app.listen()`.
2. Ręczne sprawdzanie metody/ścieżki ↔ `Router` i `req.params`.
3. Odczyt strumienia i `JSON.parse()` ↔ `express.json()` i `req.body`.
4. `writeHead()` / `end()` ↔ `res.status()`, `res.json()`, `res.location()`.
5. Własny kod obsługi `HEAD` ↔ automatyczna obsługa `HEAD` przez Express.
