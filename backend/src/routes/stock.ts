import { Router } from "express";
import { query } from "../db";

export const stockRouter = Router();

stockRouter.get("/", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM stock ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock" });
  }
});

stockRouter.post("/", async (req, res) => {
  try {
    const { name, category, qty, reorder, unit } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const result = await query(
      "INSERT INTO stock (name, category, qty, reorder, unit) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, category ?? "", Number(qty) || 0, Number(reorder) || 0, unit ?? "units"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create stock item" });
  }
});

stockRouter.patch("/:id", async (req, res) => {
  try {
    const { qty } = req.body;
    if (qty === undefined) return res.status(400).json({ error: "qty is required" });
    const result = await query("UPDATE stock SET qty = $1 WHERE id = $2 RETURNING *", [Number(qty), req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Stock item not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update stock item" });
  }
});

stockRouter.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM stock WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete stock item" });
  }
});
