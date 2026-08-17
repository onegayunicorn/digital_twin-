import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { processDeepSeekChat, type DeepSeekMessage } from "./deepseek-service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.post("/api/deepseek/chat", async (req, res) => {
    try {
      const { messages } = req.body as { messages: DeepSeekMessage[] };
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing or invalid messages array" });
      }
      const response = await processDeepSeekChat(messages);
      res.json(response);
    } catch (error) {
      console.error("API /api/deepseek/chat error:", error);
      res.status(500).json({ error: "Internal AI processing error", details: String(error) });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ACTIVE",
      engine: "Sovereign Cosmic & DeepSeek V4 Orchestrator",
      coherence: 0.99997,
      merkleRoot: "0x534f5645524549474e_ROOT_COSMIC_V4",
      timestamp: new Date().toISOString(),
      capabilities: {
        deepseek_v4: true,
        tri_structure_cosmic: true,
        camera_sensor_lab: true,
        j09_ble_bridge: true,
      },
    });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  return server;
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch(console.error);
}
