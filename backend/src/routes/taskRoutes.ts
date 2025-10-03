import { Router } from 'express';
import { uploadTasks, getAgentTasks, updateTaskStatus } from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/upload', protect, uploadTasks);
router.get('/agent-tasks', protect, getAgentTasks);
router.put('/agent-tasks/:id/status', protect, updateTaskStatus);

export default router;