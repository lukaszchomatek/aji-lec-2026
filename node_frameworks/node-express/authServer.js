import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

const PORT = 3001;

const ACCESS_SECRET = process.env.JWT_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_JWT_TOKEN_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET || ACCESS_SECRET === REFRESH_SECRET) {
  throw new Error('Wymagane są dwa różne sekrety JWT w pliku .env');
}

const demoUser = {
  username: 'admin',
  password: 'admin123'
};

const refreshTokens = new Set();

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_SECRET, {
    expiresIn: '50s',
    algorithm: 'HS256'
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
    jwtid: randomUUID()
  });
}

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' ||
      typeof password !== 'string') {
    return res.status(400).json({
      error: 'Wymagane pola: username i password'
    });
  }

  if (username !== demoUser.username ||
      password !== demoUser.password) {
    return res.status(401).json({
      error: 'Nieprawidłowy login lub hasło'
    });
  }

  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.add(refreshToken);

  return res.json({ accessToken, refreshToken });
});

// POST /token
app.post('/token', (req, res) => {
  const refreshToken = req.body?.token;

  if (typeof refreshToken !== 'string' || !refreshToken) {
    return res.status(400).json({
      error: 'Wymagany refresh token'
    });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.sendStatus(403);
  }

  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET, {
      algorithms: ['HS256']
    });

    const accessToken = generateAccessToken({
      name: user.name
    });

    return res.json({ accessToken });
  } catch {
    refreshTokens.delete(refreshToken);
    return res.sendStatus(403);
  }
});

// DELETE /logout
app.delete('/logout', (req, res) => {
  const refreshToken = req.body?.token;

  if (typeof refreshToken !== 'string' || !refreshToken) {
    return res.status(400).json({
      error: 'Wymagany refresh token'
    });
  }

  refreshTokens.delete(refreshToken);

  return res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Auth server: http://localhost:${PORT}`);
});