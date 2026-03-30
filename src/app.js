import express from "express";
import cors from "cors";

import documentRoutes from "./routes/documentRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Three-Way Match API is running"
  });
});

app.use("/documents", documentRoutes);
app.use("/match", matchRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
