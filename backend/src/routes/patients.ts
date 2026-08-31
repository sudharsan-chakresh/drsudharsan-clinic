import { Router } from "express";
import { query } from "../db";

export const patientsRouter = Router();

patientsRouter.get("/", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM patients ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patients" });
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

patientsRouter.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM patients WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete patient" });
  }
});
