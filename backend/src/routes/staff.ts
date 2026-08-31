import { Router } from "express";
import { query } from "../db";

export const staffRouter = Router();

staffRouter.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    const result = role
      ? await query("SELECT * FROM staff WHERE role = $1 AND deleted_at IS NULL ORDER BY id", [role])
      : await query("SELECT * FROM staff WHERE deleted_at IS NULL ORDER BY role, id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

staffRouter.get("/:id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM staff WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Staff not found" });
    res.json(result.rows[0]);
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

staffRouter.put("/:id", async (req, res) => {
  try {
    const { name, role, shift, phone, status } = req.body;
    const result = await query(
      "UPDATE staff SET name = $1, role = $2, shift = $3, phone = $4, status = $5 WHERE id = $6 AND deleted_at IS NULL RETURNING *",
      [name, role, shift ?? "", phone ?? "", status ?? "On duty", req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Staff not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update staff member" });
  }
});

staffRouter.delete("/:id", async (req, res) => {
  try {
    const result = await query("UPDATE staff SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Staff not found" });
    res.json({ success: true, message: "Staff member deactivated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete staff member" });
  }
});

staffRouter.post("/:id/restore", async (req, res) => {
  try {
    const result = await query("UPDATE staff SET deleted_at = NULL WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Staff not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to restore staff member" });
  }
});
