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
