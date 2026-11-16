import express from 'express';
import elementsRouter from './routes/elements.js';
//import * as counter from './controllers/countController.js'
import * as counter from './controllers/requestCounterController.js'
const app = express();

app.disable('x-powered-by');

app.use(express.json({ limit: '16kb' }));
app.use('/', counter.countRequest)
app.use('/', counter.logRequest)
//app.use('/', counter.countRequest)

app.get('/', (req, res) => {
  res.type('text/plain').send('API pierwiastków: /api/elements\n');
});

app.use('/api/elements', elementsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono ścieżki' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Express: http://localhost:${port}`);
});
