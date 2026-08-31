import { Router } from "express";
import { query } from "../db";

export const appointmentsRouter = Router();

appointmentsRouter.get("/", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM appointments ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

appointmentsRouter.post("/", async (req, res) => {
  try {
    const { time, patient, guardian, doctor, type, status } = req.body;
    if (!time || !patient) {
      return res.status(400).json({ error: "time and patient are required" });
    }
    const result = await query(
      "INSERT INTO appointments (time, patient, guardian, doctor, type, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [time, patient, guardian ?? "", doctor ?? "", type ?? "", status ?? "Scheduled"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

appointmentsRouter.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const result = await query("UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

appointmentsRouter.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM appointments WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});
