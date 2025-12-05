import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import sitesRouter from "./routes/sites";
import devicesRouter from "./routes/devices";
import interfacesRouter from "./routes/interfaces";
import statsRouter from "./routes/stats";
import alertsRouter from "./routes/alerts";
import topologyRouter from "./routes/topology";
import healthRouter from "./routes/health";
import { setupWebSocket } from "./websocket";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/api/sites", sitesRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/interfaces", interfacesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/topology", topologyRouter);
app.use("/api/health", healthRouter);

setupWebSocket(server);

if (process.env.NODE_ENV === "production") {
  const publicPath = path.resolve(__dirname, "../public");
  app.use(express.static(publicPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});
