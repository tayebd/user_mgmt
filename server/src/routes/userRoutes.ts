import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

router.get('/users', authenticateToken, getUsers);
router.get('/users/:userId', authenticateToken, getUser);
router.post('/users', authenticateToken, createUser);
router.put('/users/:userId', authenticateToken, updateUser);
router.delete('/users/:userId', authenticateToken, deleteUser);

export default router;
