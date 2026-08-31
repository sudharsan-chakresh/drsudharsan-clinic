import { Router } from "express";
import { query } from "../db";

export const patientsRouter = Router();

patientsRouter.get("/", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM patients WHERE deleted_at IS NULL ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

patientsRouter.get("/:id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Patient not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

patientsRouter.post("/", async (req, res) => {
  try {
    const { name, guardian, age, phone, blood } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const result = await query(
      "INSERT INTO patients (name, guardian, age, phone, blood, last_visit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, guardian ?? "", age ?? "", phone ?? "", blood ?? "", "—"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create patient" });
  }
});

patientsRouter.put("/:id", async (req, res) => {
  try {
    const { name, guardian, age, phone, blood } = req.body;
    const result = await query(
      "UPDATE patients SET name = $1, guardian = $2, age = $3, phone = $4, blood = $5 WHERE id = $6 AND deleted_at IS NULL RETURNING *",
      [name, guardian ?? "", age ?? "", phone ?? "", blood ?? "", req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Patient not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update patient" });
  }
});

patientsRouter.delete("/:id", async (req, res) => {
  try {
    const result = await query("UPDATE patients SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Patient not found" });
    res.json({ success: true, message: "Patient deactivated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

patientsRouter.post("/:id/restore", async (req, res) => {
  try {
    const result = await query("UPDATE patients SET deleted_at = NULL WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Patient not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to restore patient" });
  }
});
