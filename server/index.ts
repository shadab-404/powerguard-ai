import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());
  
  // Register API routes
  app.use("/api", apiRouter);

  // Health endpoints for quick liveness checks
  app.get("/health", (_req, res) => {
    return res.status(200).json({ status: "ok" });
  });

  app.get("/api/health", (_req, res) => {
    return res.status(200).json({ status: "ok" });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for non-API GET requests.
  // Use a middleware instead of a wildcard route to avoid path-to-regexp
  // parsing issues in some nested router versions.
  app.use((req, res, next) => {
    // Only handle HTML GET requests that are not for the API or static assets
    if (
      req.method === "GET" &&
      req.accepts("html") &&
      !req.path.startsWith("/api") &&
      !req.path.startsWith("/public")
    ) {
      return res.sendFile(path.join(staticPath, "index.html"));
    }
    next();
  });

  const port = process.env.PORT || 5000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
