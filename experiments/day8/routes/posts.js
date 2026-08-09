import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Create post
router.post('/', async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const post = await prisma.post.create({
      data: { title, content, authorId },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Find many
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({ include: { author: true } });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find unique
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, authorId } = req.body;
    const post = await prisma.post.update({
      where: { id },
      data: { title, content, authorId },
    });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
