import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { user, token } = await authService.loginUser(req.body);
    req.session.userId = user.id;
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.findCurrentUser(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export default { register, login, me };