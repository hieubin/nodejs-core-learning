import prisma from '../lib/prisma.js';
import HttpError from '../errors/httpError.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
}

export async function findUsers() {
  return prisma.user.findMany({ select: userSelect });
}

export async function findUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: { posts: true } });
  if (!user) throw new HttpError(404, 'User not found');
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    posts: user.posts,
  };
}

export async function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data, select: userSelect });
}

export async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

export default { findUsers, findUserById, updateUser, deleteUser };
