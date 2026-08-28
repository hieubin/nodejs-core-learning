import HttpError from '../errors/httpError.js';
import { verifyToken } from '../lib/jwt.js';

export default function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  const parts = authorization?.trim().split(/\s+/) || [];
  const [scheme, token, ...extra] = parts;

  if (scheme !== 'Bearer' || !token || extra.length > 0) {
    return next(new HttpError(401, 'Unauthorized'));
  }

  try {
    const claims = verifyToken(token);
    req.user = { id: claims.userId };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Unauthorized'));
    }
    next(error);
  }
}