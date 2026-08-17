import * as usersService from '../services/users.service.js';

export async function create(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const user = await usersService.createUser({ name, email, phone });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function findMany(req, res, next) {
  try {
    const users = await usersService.findUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function findById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await usersService.findUserById(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, email, phone } = req.body;
    const user = await usersService.updateUser(id, { name, email, phone });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export default { create, findMany, findById, update, remove };
