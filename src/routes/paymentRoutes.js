import { Router } from "express";
import { checkout, webhook } from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/checkout", requireAuth, checkout);
router.post("/webhook", webhook);

export default router;
