import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { db } from "./db";
import { interfaceStats, alerts, topologyLinks, interfaces } from "../shared/schema";
import { desc, eq } from "drizzle-orm";

interface WebSocketClients {
  stats: Set<WebSocket>;
  alerts: Set<WebSocket>;
  topology: Set<WebSocket>;
}

const clients: WebSocketClients = {
  stats: new Set(),
  alerts: new Set(),
  topology: new Set(),
};

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const channel = url.searchParams.get("channel");

    if (channel === "stats") {
      clients.stats.add(ws);
      ws.on("close", () => clients.stats.delete(ws));
    } else if (channel === "alerts") {
      clients.alerts.add(ws);
      ws.on("close", () => clients.alerts.delete(ws));
    } else if (channel === "topology") {
      clients.topology.add(ws);
      ws.on("close", () => clients.topology.delete(ws));
    }

    ws.on("error", console.error);
  });

  setInterval(async () => {
    if (clients.stats.size > 0) {
      try {
        const allInterfaces = await db.select().from(interfaces);
        const latestStats = await Promise.all(
          allInterfaces.map(async (iface) => {
            const stats = await db
              .select()
              .from(interfaceStats)
              .where(eq(interfaceStats.interfaceId, iface.id))
              .orderBy(desc(interfaceStats.timestamp))
              .limit(1);
            return {
              interface: iface,
              stats: stats[0] || null,
            };
          })
        );

        const message = JSON.stringify({ type: "stats", data: latestStats });
        clients.stats.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      } catch (error) {
        console.error("Error broadcasting stats:", error);
      }
    }
  }, 5000);

  setInterval(async () => {
    if (clients.alerts.size > 0) {
      try {
        const recentAlerts = await db
          .select()
          .from(alerts)
          .orderBy(desc(alerts.timestamp))
          .limit(10);

        const message = JSON.stringify({ type: "alerts", data: recentAlerts });
        clients.alerts.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      } catch (error) {
        console.error("Error broadcasting alerts:", error);
      }
    }
  }, 10000);

  setInterval(async () => {
    if (clients.topology.size > 0) {
      try {
        const links = await db.select().from(topologyLinks);
        const message = JSON.stringify({ type: "topology", data: links });
        clients.topology.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      } catch (error) {
        console.error("Error broadcasting topology:", error);
      }
    }
  }, 30000);

  return wss;
}
