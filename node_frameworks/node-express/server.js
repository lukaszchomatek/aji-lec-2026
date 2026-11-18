import 'dotenv/config';
import express from 'express';
import elementsRouter from './routes/elements.js';
import * as counter from './controllers/requestCounterController.js';
import { sequelize } from './config/database.js';
import './models/associations.js';

const app = express();

app.disable('x-powered-by');

app.use(express.json({ limit: '16kb' }));
app.use('/', counter.countRequest);
app.use('/', counter.logRequest);

app.get('/', (req, res) => {
  res.type('text/plain').send('API pierwiastków: /api/elements\n');
});

app.use('/api/elements', elementsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono ścieżki' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: 'Naruszenie ograniczenia unikalności',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      error: 'Błąd walidacji',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  console.error(err);

  return res.status(500).json({
    error: 'Wewnętrzny błąd serwera'
  });
});

const port = Number(process.env.PORT ?? 3000);

try {
  await sequelize.authenticate();
  console.log('Połączono z bazą SQLite');

  app.listen(port, () => {
    console.log(`Express: http://localhost:${port}`);
  });

} catch (error) {
  console.error('Nie można połączyć się z bazą danych:', error);
  process.exit(1);
}