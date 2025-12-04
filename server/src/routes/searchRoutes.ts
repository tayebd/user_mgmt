import express from 'express';
import { search } from "../controllers/searchController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();


// Apply authentication middleware
router.use(authenticateToken);

// Search across projects, tasks, organizations, reviews, and users
router.get("/", search);

export default router;
