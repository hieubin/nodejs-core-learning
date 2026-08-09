import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await prisma.user.create({
      data: { name, email, phone },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Find many
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find unique with posts (eager loading)
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { posts: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, phone },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
