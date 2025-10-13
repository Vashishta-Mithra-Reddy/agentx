import { Router } from 'express';
import { register, login, refresh, logout, verify, addAgent, listAgents, deleteAgent, updateAgent, addSubAgent, listSubAgents } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/verify', verify);
router.post('/logout', logout);
router.post('/add-agent',protect, addAgent);
router.post('/add-sub-agent',protect, addSubAgent);
router.get('/agents', protect, listAgents);
router.get('/subagents', protect, listSubAgents)
router.delete('/agent/delete/:id',protect,deleteAgent);
router.put('/agent/update/:id',protect,updateAgent);

export default router;