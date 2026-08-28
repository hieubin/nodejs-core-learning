import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import HttpError from '../errors/httpError.js';

const saltRounds = 12;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toSafeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export async function registerUser({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) throw new HttpError(409, 'Email already exists');

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, passwordHash },
  });
  return toSafeUser(user);
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new HttpError(401, 'Invalid email or password');

  const safeUser = toSafeUser(user);
  return { user: safeUser, token: signToken({ userId: safeUser.id }) };
}

export async function findCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) throw new HttpError(401, 'Unauthorized');
  return user;
}

export default { registerUser, loginUser, findCurrentUser };