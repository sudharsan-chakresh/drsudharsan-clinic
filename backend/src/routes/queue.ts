import { Router } from "express";
import { query } from "../db";

export const queueRouter = Router();

const STAGE_ORDER = ["waiting", "consult", "done"];

queueRouter.get("/", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM queue ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});

queueRouter.post("/", async (req, res) => {
  try {
    const { patient, doctor } = req.body;
    if (!patient) return res.status(400).json({ error: "patient is required" });
    const countResult = await query("SELECT COUNT(*) AS c FROM queue");
    const count = parseInt(countResult.rows[0].c);
    const token = `T-${17 + count}`;
    const result = await query(
      "INSERT INTO queue (token, patient, doctor, stage) VALUES ($1, $2, $3, 'waiting') RETURNING *",
      [token, patient, doctor ?? ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create queue entry" });
  }
});

queueRouter.patch("/:id/advance", async (req, res) => {
  try {
    const entryResult = await query("SELECT * FROM queue WHERE id = $1", [req.params.id]);
    if (entryResult.rows.length === 0) return res.status(404).json({ error: "not found" });
    const entry = entryResult.rows[0];
    const currentIndex = STAGE_ORDER.indexOf(entry.stage);
    const nextStage = STAGE_ORDER[Math.min(currentIndex + 1, STAGE_ORDER.length - 1)];
    const result = await query("UPDATE queue SET stage = $1 WHERE id = $2 RETURNING *", [nextStage, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to advance queue entry" });
  }
});

queueRouter.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM queue WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete queue entry" });
  }
});
