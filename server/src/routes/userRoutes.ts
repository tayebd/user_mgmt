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

router.get('/', authenticateToken, getUsers);
router.get('/:userId', authenticateToken, getUser);
router.post('/', authenticateToken, createUser);
router.put('/:userId', authenticateToken, updateUser);
router.delete('/:userId', authenticateToken, deleteUser);

export default router;
