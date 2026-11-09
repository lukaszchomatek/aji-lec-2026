# API pierwiastków — Node.js bez Expressa

Projekt demonstracyjny na **90-minutowy wykład**: obsługa HTTP przy użyciu wyłącznie wbudowanych modułów Node.js. Bez Expressa, bibliotek npm, bazy danych i frontendu.

## Uruchomienie

Wymagane **Node.js 20+**:

```bash
npm start
# lub: node server.js
```

Serwer: `http://localhost:3000`. Można zmienić port: `PORT=4000 npm start` (Linux/macOS) lub `$env:PORT=4000; npm start` (PowerShell).

Testy automatyczne: `npm test`.

Żądania można wykonywać w terminalu (`curl`) albo z pliku **`requests.http`** (np. rozszerzenie *REST Client* w VS Code). Po restarcie serwera dane wracają do stanu początkowego.

## Model danych

Przechowywanie: mutowalna tablica obiektów `elements` w `data.js`.

| Pole | Typ JSON | Przykład | Uwagi |
| --- | --- | --- | --- |
| `atomicNumber` | number (integer) | `8` | Identyfikator w URL |
| `symbol` | string | `"O"` | Unikalny symbol |
| `name` | string | `"Tlen"` | Nazwa |
| `isMetal` | boolean | `false` | Uproszczona klasyfikacja metal/niemetal |
| `discoveredOn` | string / null | `"1774-01-01"` | Data w formacie ISO lub brak danych |
| `density` | number | `0.001429` | Gęstość, g/cm³; demonstracja liczby niecałkowitej |

**Uwaga historyczna:** odkrycia pierwiastków są często datowane wyłącznie rokiem; `YYYY-01-01` jest tutaj **umowną reprezentacją znanego roku**, nie stwierdzeniem, że odkrycie nastąpiło dokładnie 1 stycznia. `null` oznacza brak ustalonej daty (np. znane od starożytności). Przykładowe gęstości służą demonstracji typów danych, nie uwzględniają warunków pomiaru.

## Dokumentacja API

| Metoda | Ścieżka | Działanie | Status przy sukcesie |
| --- | --- | --- | --- |
| GET | `/` | Tekstowy opis | `200` |
| GET | `/api/elements` | Lista obiektów w JSON | `200` |
| GET | `/api/elements?metal=true` | Filtrowanie po `boolean` | `200` |
| GET | `/api/elements/8` | Jeden obiekt | `200` |
| HEAD | `/api/elements/8` | Tylko nagłówki, bez treści | `200` |
| OPTIONS | `/api/elements/8` | Dostępne metody (`Allow`) | `204` |
| POST | `/api/elements` | Utworzenie obiektu | `201`, `Location` |
| PUT | `/api/elements/8` | **Pełne zastąpienie** obiektu | `200` |
| PATCH | `/api/elements/8` | **Częściowa aktualizacja** | `200` |
| DELETE | `/api/elements/8` | Usunięcie obiektu | `204` |

Dostępne także `HEAD` i `OPTIONS` dla kolekcji. `PATCH` przyjmuje zwykły obiekt JSON z wybranymi polami (to **nie jest** format JSON Patch RFC 6902). Zmiana `atomicNumber` przez PUT/PATCH jest niedozwolona. Identyfikatory zasobów to dodatnie liczby całkowite.

### Przykład curl — filtrowanie

```bash
curl -i 'http://localhost:3000/api/elements?metal=true'
```

`-i` powoduje wyświetlenie **statusu i nagłówków** wraz z treścią odpowiedzi.

### Przykład curl — dodanie elementu

```bash
curl -i -X POST 'http://localhost:3000/api/elements' \
  -H 'Content-Type: application/json' \
  -d '{"atomicNumber":31,"symbol":"Ga","name":"Gal","isMetal":true,"discoveredOn":"1875-01-01","density":5.91}'
```

PowerShell: zamiast powyższej składni Bash można użyć pliku `requests.http`.

### Statusy błędów

| Status | Sytuacja | Przykład |
| --- | --- | --- |
| `400` | Błędny parametr zapytania / niepoprawna składnia JSON | `?metal=tak` |
| `404` | Brak zasobu lub ścieżki | `/api/elements/999` |
| `405` | Metoda nieobsługiwana przez istniejącą ścieżkę | `DELETE /api/elements` |
| `409` | Konflikt identyfikatora lub symbolu | `POST` z istniejącym symbolem |
| `413` | Ciało żądania > 16 KiB | Duży `POST` |
| `415` | Nieobsługiwany format ciała | `Content-Type: text/plain` |
| `422` | JSON poprawny składniowo, ale dane niepoprawne | `isMetal: "tak"` |
| `500` | Niespodziewany błąd serwera | Błąd implementacji |

Błędy (poza `405`, gdzie ważny jest nagłówek `Allow`) są zwracane jako JSON, np. `{"error":"Nie znaleziono ścieżki"}`. `204` nie ma ciała odpowiedzi.

## Pliki i ich rola

- `server.js` — `http.createServer`, ręczny routing, metody HTTP, logika endpointów.
- `http.js` — `writeHead`, `end`, JSON, nagłówki, odczyt strumienia żądania.
- `data.js` — tablica obiektów różnych typów.
- `validation.js` — walidacja pól i dat.
- `requests.http` — scenariusze wykonywane na żywo, także przypadki błędne.
- `test/server.test.js` — testy integracyjne przy użyciu wbudowanego `node:test` i `fetch`.

## Proponowany przebieg wykładu (90 minut)

| Czas | Pokaz | Koncepcja |
| --- | --- | --- |
| 0–10 min | `data.js`, `createApp`, `listen` | Proces Node.js, port, pamięć procesu |
| 10–25 min | `GET /` i `GET /api/elements` | `req`, `res`, status, `Content-Type`, `Content-Length`, JSON |
| 25–40 min | `GET /api/elements/8`, `?metal=true` | Routing, URL, parametry ścieżki i query string |
| 40–55 min | `POST /api/elements` | Nagłówki żądania, strumieniowe ciało, `JSON.parse`, `201`, `Location` |
| 55–67 min | `PUT`, `PATCH`, `DELETE` | Semantyka metod, `204` |
| 67–77 min | `HEAD`, `OPTIONS`, `405` | Nagłówki bez treści, `Allow` |
| 77–87 min | Wywołania błędne, walidacja | `400` vs `404` vs `409` vs `415` vs `422` |
| 87–90 min | Reset po restarcie, podsumowanie | Ograniczenia serwera bez frameworka |

## Pytania do studentów

1. Dlaczego przy odpowiedzi JSON ustawiamy `Content-Type`, skoro klient otrzymuje tekst?
2. Czym różni się `req.url` od `req.method`? Co robi `new URL(...)`?
3. Dlaczego `POST` ma `201` i `Location`, a `DELETE` ma `204`?
4. Dlaczego `HEAD` nie może zwrócić ciała odpowiedzi, choć ma `Content-Length`?
5. Jaka jest różnica między błędną składnią JSON (`400`) i błędną wartością `isMetal` (`422`)?
6. Co się stanie z dodanym pierwiastkiem po restarcie serwera?
7. Które elementy kodu uprościłby Express (`app.get`, `express.json`, `res.json`, router)?

## Ograniczenia celowe

Projekt jest **dydaktyczny**: brak bazy danych, uwierzytelniania, trwałości danych, kontroli równoczesnych zmian, pełnej zgodności REST/HATEOAS, rozbudowanej obsługi strumieni i rozróżniania wszystkich klas pierwiastków. Zaimplementowany routing jest ręczny, by było widać mechanizmy przykrywane później przez Expressa.
