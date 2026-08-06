import express from "express";
import cors from "cors";
import { registerApiRoutes } from "../server/apiRoutes.js";

const ALLOWED_ORIGINS = ["https://itsbravos.github.io"];

const app = express();
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
  })
);
app.use(express.json({ limit: "15mb" }));

registerApiRoutes(app);

export default app;
