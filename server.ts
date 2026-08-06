import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { registerApiRoutes } from "./server/apiRoutes";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));

const PORT = 3000;

registerApiRoutes(app);

// Vite middleware & production static file server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ComparaJá Server] Servidor executando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
