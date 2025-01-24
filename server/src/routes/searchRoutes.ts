import { Router } from "express";
import { search } from "../controllers/searchController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware
router.use(authenticateToken);

// Search across projects, tasks, and users
router.get("/", search);

export default router;
