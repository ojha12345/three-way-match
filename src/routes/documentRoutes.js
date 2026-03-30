import { Router } from "express";
import upload from "../middleware/upload.js";
import { getParsedDocument, uploadDocument } from "../controllers/documentController.js";

const router = Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/:id", getParsedDocument);

export default router;