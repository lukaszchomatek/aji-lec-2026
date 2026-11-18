import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authorization = req.get('Authorization');

  if (!authorization) {
    return res.status(401).json({
      error: 'Brak nagłówka Authorization'
    });
  }

  const match = /^Bearer ([^\s]+)$/.exec(authorization);

  if (!match) {
    return res.status(401).json({
      error: 'Wymagany nagłówek Authorization: Bearer <token>'
    });
  }

  const token = match[1];

  try {
    const user = jwt.verify(token, process.env.JWT_TOKEN_SECRET, {
      algorithms: ['HS256']
    });

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token wygasł'
      });
    }

    return res.status(401).json({
      error: 'Nieprawidłowy token'
    });
  }
}