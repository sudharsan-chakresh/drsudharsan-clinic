import { Router } from "express";
import { db } from "../db";
import { Appointment } from "../types";

export const appointmentsRouter = Router();

appointmentsRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM appointments ORDER BY id").all();
  res.json(rows);
});

appointmentsRouter.post("/", (req, res) => {
  const { time, patient, guardian, doctor, type, status } = req.body as Partial<Appointment>;
  if (!time || !patient) {
    return res.status(400).json({ error: "time and patient are required" });
  }
  const info = db
    .prepare(
      "INSERT INTO appointments (time, patient, guardian, doctor, type, status) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(time, patient, guardian ?? "", doctor ?? "", type ?? "", status ?? "Scheduled");
  const created = db.prepare("SELECT * FROM appointments WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

appointmentsRouter.patch("/:id", (req, res) => {
  const { status } = req.body as Partial<Appointment>;
  if (!status) return res.status(400).json({ error: "status is required" });
  db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, req.params.id);
  const updated = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);
  res.json(updated);
});

appointmentsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM appointments WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
