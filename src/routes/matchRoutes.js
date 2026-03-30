import { Router } from "express";
import { getMatchByPoNumber } from "../controllers/matchController.js";

const router = Router();

router.get("/:poNumber", getMatchByPoNumber);

export default router;