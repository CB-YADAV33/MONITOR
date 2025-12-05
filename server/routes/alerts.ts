import { Router } from "express";
import { db } from "../db";
import { alerts, insertAlertSchema } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allAlerts = await db.select().from(alerts).orderBy(desc(alerts.timestamp));
    res.json(allAlerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.get("/device/:deviceId", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const deviceAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.deviceId, deviceId))
      .orderBy(desc(alerts.timestamp));
    res.json(deviceAlerts);
  } catch (error) {
    console.error("Error fetching device alerts:", error);
    res.status(500).json({ error: "Failed to fetch device alerts" });
  }
});

router.get("/interface/:interfaceId", async (req, res) => {
  try {
    const interfaceId = parseInt(req.params.interfaceId);
    const interfaceAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.interfaceId, interfaceId))
      .orderBy(desc(alerts.timestamp));
    res.json(interfaceAlerts);
  } catch (error) {
    console.error("Error fetching interface alerts:", error);
    res.status(500).json({ error: "Failed to fetch interface alerts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertAlertSchema.parse(req.body);
    const newAlert = await db.insert(alerts).values(parsed).returning();
    res.status(201).json(newAlert[0]);
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(400).json({ error: "Failed to create alert" });
  }
});

export default router;
