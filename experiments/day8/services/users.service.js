import prisma from '../lib/prisma.js';
import HttpError from '../errors/httpError.js';

export async function createUser(data) {
  return prisma.user.create({ data });
}

export async function findUsers() {
  return prisma.user.findMany();
}

export async function findUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: { posts: true } });
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

export async function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

export default { createUser, findUsers, findUserById, updateUser, deleteUser };
