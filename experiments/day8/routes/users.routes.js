import express from 'express';
import * as usersCtrl from '../controllers/users.controller.js';
import { validateCreateUser, validateIdParam } from '../middlewares/validators.js';

const router = express.Router();

router.post('/', validateCreateUser, usersCtrl.create);
router.get('/', usersCtrl.findMany);
router.get('/:id', validateIdParam, usersCtrl.findById);
router.put('/:id', validateIdParam, usersCtrl.update);
router.delete('/:id', validateIdParam, usersCtrl.remove);

export default router;
