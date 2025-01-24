import { Router } from "express";
import {
  getProjectTasks,
  createTask,
  updateTask,
  getUserTasks,
  getTask
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all tasks for a project
router.get("/project/:projectId", getProjectTasks);

// Get all tasks for a specific user
router.get("/user/:userId", getUserTasks);

// Get all tasks for the current user
router.get("/user", getUserTasks);

// Get a specific task by ID
router.get("/:taskId", getTask);

// Create a new task
router.post("/", createTask);

// Update a task
router.put("/:taskId", updateTask);

export default router;
