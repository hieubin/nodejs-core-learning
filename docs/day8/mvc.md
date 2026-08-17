# Day 8 — MVC after refactor

## Diagram (after)

```mermaid
graph LR
  Client --> App[experiments/day8/app.js]
  App --> Routes["routes/*.routes.js"]
  Routes --> Controllers["controllers/*.controller.js"]
  Controllers --> Services["services/*.service.js"]
  Services --> Prisma["lib/prisma.js"]
  Prisma --> Postgres[(PostgreSQL)]
```

## Example: POST /users — Before / After

Before (in `routes/users.js`):

```js
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

After:

```js
// routes/users.routes.js
router.post('/', usersController.create);

// controllers/users.controller.js
export async function create(req, res, next) {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
}

// services/users.service.js
export async function createUser(data) {
  return prisma.user.create({ data });
}
```

Benefits: DB logic isolated in services, controllers only map input → service → response, routes only register handlers.
