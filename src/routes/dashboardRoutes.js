import { Router } from "express";
import { getDashboard, updateProgress } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getDashboard);
router.patch("/progress/:courseId", requireAuth, updateProgress);

export default router;
