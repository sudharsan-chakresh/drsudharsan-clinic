import { Router } from "express";
import { query } from "../db";

export const staffRouter = Router();

staffRouter.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    const result = role
      ? await query("SELECT * FROM staff WHERE role = $1 ORDER BY id", [role])
      : await query("SELECT * FROM staff ORDER BY role, id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

staffRouter.post("/", async (req, res) => {
  try {
    const { name, role, shift, phone, status } = req.body;
    if (!name || !role) return res.status(400).json({ error: "name and role are required" });
    const result = await query(
      "INSERT INTO staff (name, role, shift, phone, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, role, shift ?? "", phone ?? "", status ?? "On duty"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create staff member" });
  }
});

staffRouter.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM staff WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete staff member" });
  }
});
