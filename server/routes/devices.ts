import { Router } from "express";
import { db } from "../db";
import { devices, interfaces, interfaceStats, topologyLinks, insertDeviceSchema } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allDevices = await db.select().from(devices);
    res.json(allDevices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const device = await db.select().from(devices).where(eq(devices.id, deviceId));
    if (device.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device[0]);
  } catch (error) {
    console.error("Error fetching device:", error);
    res.status(500).json({ error: "Failed to fetch device" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertDeviceSchema.parse(req.body);
    const newDevice = await db.insert(devices).values(parsed).returning();
    res.status(201).json(newDevice[0]);
  } catch (error) {
    console.error("Error creating device:", error);
    res.status(400).json({ error: "Failed to create device" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const parsed = insertDeviceSchema.partial().parse(req.body);
    const updated = await db.update(devices).set(parsed).where(eq(devices.id, deviceId)).returning();
    if (updated.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(400).json({ error: "Failed to update device" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const deleted = await db.delete(devices).where(eq(devices.id, deviceId)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Error deleting device:", error);
    res.status(500).json({ error: "Failed to delete device" });
  }
});

router.get("/:id/interfaces", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const deviceInterfaces = await db.select().from(interfaces).where(eq(interfaces.deviceId, deviceId));
    res.json(deviceInterfaces);
  } catch (error) {
    console.error("Error fetching device interfaces:", error);
    res.status(500).json({ error: "Failed to fetch device interfaces" });
  }
});

router.get("/:id/stats/latest", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const deviceInterfaces = await db.select().from(interfaces).where(eq(interfaces.deviceId, deviceId));
    
    const latestStats = await Promise.all(
      deviceInterfaces.map(async (iface) => {
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
    console.error("Error fetching device stats:", error);
    res.status(500).json({ error: "Failed to fetch device stats" });
  }
});

router.get("/:id/topology", async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const links = await db
      .select()
      .from(topologyLinks)
      .where(eq(topologyLinks.srcDeviceId, deviceId));
    res.json(links);
  } catch (error) {
    console.error("Error fetching device topology:", error);
    res.status(500).json({ error: "Failed to fetch device topology" });
  }
});

export default router;
