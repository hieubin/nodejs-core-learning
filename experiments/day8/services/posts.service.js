import prisma from '../lib/prisma.js';
import HttpError from '../errors/httpError.js';

export async function createPost(data) {
  return prisma.post.create({ data });
}

export async function findPosts() {
  return prisma.post.findMany({
    include: { author: { select: { id: true, name: true, email: true } } },
  });
}

export async function findPostById(id) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  if (!post) throw new HttpError(404, 'Post not found');
  return post;
}

export async function updatePost(id, data) {
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}

export default { createPost, findPosts, findPostById, updatePost, deletePost };
