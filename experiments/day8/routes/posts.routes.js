import express from 'express';
import * as postsCtrl from '../controllers/posts.controller.js';
import { validateCreatePost, validateIdParam } from '../middlewares/validators.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/', validateCreatePost, postsCtrl.create);
router.get('/', postsCtrl.findMany);
router.get('/:id', validateIdParam, postsCtrl.findById);
router.put('/:id', validateIdParam, postsCtrl.update);
router.delete('/:id', validateIdParam, postsCtrl.remove);

export default router;
