import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ status: "error", database: "disconnected", timestamp: new Date().toISOString() });
  }
});

export default router;
