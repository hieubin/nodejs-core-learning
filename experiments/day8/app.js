import express from 'express';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/users', usersRouter);
app.use('/posts', postsRouter);

app.get('/', (req, res) => {
  res.send('Day 8 Prisma CRUD server');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
