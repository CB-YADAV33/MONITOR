import { Router } from "express";
import { db } from "../db";
import { topologyLinks, devices } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allDevices = await db.select().from(devices);
    const allLinks = await db.select().from(topologyLinks);
    
    const nodes = allDevices.map((device) => ({
      id: device.id,
      label: device.hostname || device.ipAddress,
      type: device.deviceType,
      status: device.status,
      ipAddress: device.ipAddress,
    }));
    
    const edges = allLinks.map((link) => ({
      id: link.id,
      source: link.srcDeviceId,
      target: link.dstDeviceId,
      sourceInterface: link.srcInterface,
      targetInterface: link.dstInterface,
    }));
    
    res.json({ nodes, edges });
  } catch (error) {
    console.error("Error fetching topology:", error);
    res.status(500).json({ error: "Failed to fetch topology" });
  }
});

router.get("/links", async (req, res) => {
  try {
    const allLinks = await db.select().from(topologyLinks);
    res.json(allLinks);
  } catch (error) {
    console.error("Error fetching topology links:", error);
    res.status(500).json({ error: "Failed to fetch topology links" });
  }
});

router.get("/graph", async (req, res) => {
  try {
    const allDevices = await db.select().from(devices);
    const allLinks = await db.select().from(topologyLinks);
    
    const deviceMap = new Map(allDevices.map(d => [d.id, d]));
    
    const nodes = allDevices.map((device) => ({
      id: `device-${device.id}`,
      data: {
        label: device.hostname || device.ipAddress,
        type: device.deviceType,
        status: device.status,
        ipAddress: device.ipAddress,
        vendor: device.vendor,
        model: device.model,
      },
      position: { x: 0, y: 0 },
    }));
    
    const edges = allLinks.map((link) => ({
      id: `link-${link.id}`,
      source: `device-${link.srcDeviceId}`,
      target: `device-${link.dstDeviceId}`,
      label: `${link.srcInterface} - ${link.dstInterface}`,
    }));
    
    res.json({ nodes, edges });
  } catch (error) {
    console.error("Error fetching topology graph:", error);
    res.status(500).json({ error: "Failed to fetch topology graph" });
  }
});

export default router;
