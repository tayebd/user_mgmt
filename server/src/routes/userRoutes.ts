import { Router } from "express";
import { getUser, createUser } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Create a new user (signup)
router.post("/", createUser);

// Get current user profile (requires authentication)
router.get("/me", authenticateToken, getUser);

export default router;
