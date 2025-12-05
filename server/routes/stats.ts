import { Router } from "express";
import { db } from "../db";
import { interfaces, interfaceStats } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/latest", async (req, res) => {
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
    
    res.json(latestStats);
  } catch (error) {
    console.error("Error fetching latest stats:", error);
    res.status(500).json({ error: "Failed to fetch latest stats" });
  }
});

router.get("/device/:deviceId", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const deviceInterfaces = await db.select().from(interfaces).where(eq(interfaces.deviceId, deviceId));
    
    const stats = await Promise.all(
      deviceInterfaces.map(async (iface) => {
        const ifaceStats = await db
          .select()
          .from(interfaceStats)
          .where(eq(interfaceStats.interfaceId, iface.id))
          .orderBy(desc(interfaceStats.timestamp))
          .limit(100);
        return {
          interface: iface,
          stats: ifaceStats,
        };
      })
    );
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching device stats:", error);
    res.status(500).json({ error: "Failed to fetch device stats" });
  }
});

router.get("/interface/:interfaceId", async (req, res) => {
  try {
    const interfaceId = parseInt(req.params.interfaceId);
    const stats = await db
      .select()
      .from(interfaceStats)
      .where(eq(interfaceStats.interfaceId, interfaceId))
      .orderBy(desc(interfaceStats.timestamp))
      .limit(100);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching interface stats:", error);
    res.status(500).json({ error: "Failed to fetch interface stats" });
  }
});

export default router;
