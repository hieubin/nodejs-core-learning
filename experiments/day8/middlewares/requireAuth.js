import HttpError from '../errors/httpError.js';

export default function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return next(new HttpError(401, 'Unauthorized'));
  }
  next();
}