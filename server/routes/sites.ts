import { Router } from "express";
import { db } from "../db";
import { sites, insertSiteSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allSites = await db.select().from(sites);
    res.json(allSites);
  } catch (error) {
    console.error("Error fetching sites:", error);
    res.status(500).json({ error: "Failed to fetch sites" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const site = await db.select().from(sites).where(eq(sites.id, siteId));
    if (site.length === 0) {
      return res.status(404).json({ error: "Site not found" });
    }
    res.json(site[0]);
  } catch (error) {
    console.error("Error fetching site:", error);
    res.status(500).json({ error: "Failed to fetch site" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = insertSiteSchema.parse(req.body);
    const newSite = await db.insert(sites).values(parsed).returning();
    res.status(201).json(newSite[0]);
  } catch (error) {
    console.error("Error creating site:", error);
    res.status(400).json({ error: "Failed to create site" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const parsed = insertSiteSchema.partial().parse(req.body);
    const updated = await db.update(sites).set(parsed).where(eq(sites.id, siteId)).returning();
    if (updated.length === 0) {
      return res.status(404).json({ error: "Site not found" });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating site:", error);
    res.status(400).json({ error: "Failed to update site" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const deleted = await db.delete(sites).where(eq(sites.id, siteId)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Site not found" });
    }
    res.json({ message: "Site deleted successfully" });
  } catch (error) {
    console.error("Error deleting site:", error);
    res.status(500).json({ error: "Failed to delete site" });
  }
});

export default router;
