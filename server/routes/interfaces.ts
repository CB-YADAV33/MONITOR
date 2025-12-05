import { Router } from "express";
import { db } from "../db";
import { interfaces, interfaceStats, insertInterfaceSchema } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allInterfaces = await db.select().from(interfaces);
    res.json(allInterfaces);
  } catch (error) {
    console.error("Error fetching interfaces:", error);
    res.status(500).json({ error: "Failed to fetch interfaces" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const interfaceId = parseInt(req.params.id);
    const iface = await db.select().from(interfaces).where(eq(interfaces.id, interfaceId));
    if (iface.length === 0) {
      return res.status(404).json({ error: "Interface not found" });
    }
    res.json(iface[0]);
  } catch (error) {
    console.error("Error fetching interface:", error);
    res.status(500).json({ error: "Failed to fetch interface" });
  }
});

router.get("/:id/stats", async (req, res) => {
  try {
    const interfaceId = parseInt(req.params.id);
    const stats = await db
      .select()
      .from(interfaceStats)
      .where(eq(interfaceStats.interfaceId, interfaceId))
      .orderBy(desc(interfaceStats.timestamp));
    res.json(stats);
  } catch (error) {
    console.error("Error fetching interface stats:", error);
    res.status(500).json({ error: "Failed to fetch interface stats" });
  }
});

router.get("/:id/stats/latest", async (req, res) => {
  try {
    const interfaceId = parseInt(req.params.id);
    const stats = await db
      .select()
      .from(interfaceStats)
      .where(eq(interfaceStats.interfaceId, interfaceId))
      .orderBy(desc(interfaceStats.timestamp))
      .limit(1);
    res.json(stats[0] || null);
  } catch (error) {
    console.error("Error fetching latest interface stats:", error);
    res.status(500).json({ error: "Failed to fetch latest interface stats" });
  }
});

export default router;
