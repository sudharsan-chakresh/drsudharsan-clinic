import { Router } from "express";
import { db } from "../db";
import { StockItem } from "../types";

export const stockRouter = Router();

stockRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM stock ORDER BY id").all();
  res.json(rows);
});

stockRouter.post("/", (req, res) => {
  const { name, category, qty, reorder, unit } = req.body as Partial<StockItem>;
  if (!name) return res.status(400).json({ error: "name is required" });
  const info = db
    .prepare("INSERT INTO stock (name, category, qty, reorder, unit) VALUES (?, ?, ?, ?, ?)")
    .run(name, category ?? "", Number(qty) || 0, Number(reorder) || 0, unit ?? "units");
  const created = db.prepare("SELECT * FROM stock WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

stockRouter.patch("/:id", (req, res) => {
  const { qty } = req.body as Partial<StockItem>;
  if (qty === undefined) return res.status(400).json({ error: "qty is required" });
  db.prepare("UPDATE stock SET qty = ? WHERE id = ?").run(Number(qty), req.params.id);
  const updated = db.prepare("SELECT * FROM stock WHERE id = ?").get(req.params.id);
  res.json(updated);
});

stockRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM stock WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
