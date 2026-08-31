import { Router } from "express";
import { db } from "../db";
import { QueueEntry, QueueStage } from "../types";

export const queueRouter = Router();

const STAGE_ORDER: QueueStage[] = ["waiting", "consult", "done"];

queueRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM queue ORDER BY id").all();
  res.json(rows);
});

queueRouter.post("/", (req, res) => {
  const { patient, doctor } = req.body as Partial<QueueEntry>;
  if (!patient) return res.status(400).json({ error: "patient is required" });
  const count = (db.prepare("SELECT COUNT(*) AS c FROM queue").get() as any).c;
  const token = `T-${17 + count}`;
  const info = db
    .prepare("INSERT INTO queue (token, patient, doctor, stage) VALUES (?, ?, ?, 'waiting')")
    .run(token, patient, doctor ?? "");
  const created = db.prepare("SELECT * FROM queue WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

// Advance a queue entry to its next stage: waiting -> consult -> done
queueRouter.patch("/:id/advance", (req, res) => {
  const entry = db.prepare("SELECT * FROM queue WHERE id = ?").get(req.params.id) as
    | QueueEntry
    | undefined;
  if (!entry) return res.status(404).json({ error: "not found" });
  const currentIndex = STAGE_ORDER.indexOf(entry.stage);
  const nextStage = STAGE_ORDER[Math.min(currentIndex + 1, STAGE_ORDER.length - 1)];
  db.prepare("UPDATE queue SET stage = ? WHERE id = ?").run(nextStage, req.params.id);
  const updated = db.prepare("SELECT * FROM queue WHERE id = ?").get(req.params.id);
  res.json(updated);
});

queueRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM queue WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
