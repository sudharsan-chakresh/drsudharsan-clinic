import { Router } from "express";
import { db } from "../db";
import { StaffMember } from "../types";

export const staffRouter = Router();

// GET /api/staff?role=doctors  (role optional — omit to get everyone)
staffRouter.get("/", (req, res) => {
  const { role } = req.query;
  const rows = role
    ? db.prepare("SELECT * FROM staff WHERE role = ? ORDER BY id").all(role)
    : db.prepare("SELECT * FROM staff ORDER BY role, id").all();
  res.json(rows);
});

staffRouter.post("/", (req, res) => {
  const { name, role, shift, phone, status } = req.body as Partial<StaffMember>;
  if (!name || !role) return res.status(400).json({ error: "name and role are required" });
  const info = db
    .prepare("INSERT INTO staff (name, role, shift, phone, status) VALUES (?, ?, ?, ?, ?)")
    .run(name, role, shift ?? "", phone ?? "", status ?? "On duty");
  const created = db.prepare("SELECT * FROM staff WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

staffRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM staff WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
