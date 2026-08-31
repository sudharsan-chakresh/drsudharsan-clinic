import { Router } from "express";
import { db } from "../db";
import { Patient } from "../types";

export const patientsRouter = Router();

patientsRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM patients ORDER BY id").all();
  res.json(rows);
});

patientsRouter.post("/", (req, res) => {
  const { name, guardian, age, phone, blood } = req.body as Partial<Patient>;
  if (!name) return res.status(400).json({ error: "name is required" });
  const info = db
    .prepare(
      "INSERT INTO patients (name, guardian, age, phone, blood, last_visit) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(name, guardian ?? "", age ?? "", phone ?? "", blood ?? "", "—");
  const created = db.prepare("SELECT * FROM patients WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

patientsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM patients WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
