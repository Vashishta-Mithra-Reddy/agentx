import { Router } from 'express';
import { register, login, refresh, logout, verify, addAgent } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/verify', verify);
router.post('/logout', logout);
router.post('/add-agent', addAgent);

export default router;