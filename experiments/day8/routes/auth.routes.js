import express from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { validateLogin, validateRegister } from '../middlewares/validators.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, authCtrl.register);
router.post('/login', validateLogin, authCtrl.login);
router.get('/me', authMiddleware, authCtrl.me);

export default router;