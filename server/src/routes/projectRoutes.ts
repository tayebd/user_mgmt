import { Router } from "express";
import { createProject, getProjects, getProjectById } from "../controllers/projectController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all project routes
router.use(authenticateToken);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);

export default router;
