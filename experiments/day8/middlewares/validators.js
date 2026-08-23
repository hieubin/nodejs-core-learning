import HttpError from '../errors/httpError.js';

export function validateCreateUser(req, res, next) {
  const { name, email } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return next(new HttpError(400, 'Name is required'));
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return next(new HttpError(400, 'Email is required'));
  }
  next();
}

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return next(new HttpError(400, 'Name is required'));
  }
  if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
    return next(new HttpError(400, 'Valid email is required'));
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return next(new HttpError(400, 'Password must be at least 8 characters'));
  }
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
    return next(new HttpError(400, 'Valid email is required'));
  }
  if (!password || typeof password !== 'string') {
    return next(new HttpError(400, 'Password is required'));
  }
  next();
}

export function validateCreatePost(req, res, next) {
  const { title, authorId } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return next(new HttpError(400, 'Title is required'));
  }
  if (authorId === undefined || authorId === null || Number.isNaN(Number(authorId)) || !Number.isInteger(Number(authorId))) {
    return next(new HttpError(400, 'authorId must be an integer'));
  }
  next();
}

export function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return next(new HttpError(400, 'Invalid id'));
  next();
}
