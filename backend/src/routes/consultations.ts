import express from "express";
import { query } from "../db";

export const consultationsRouter = express.Router();

consultationsRouter.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM consultations ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

consultationsRouter.get("/doctor/:doctor_id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM consultations WHERE doctor_id = $1 ORDER BY created_at DESC", [req.params.doctor_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

consultationsRouter.get("/patient/:patient_id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM consultations WHERE patient_id = $1 ORDER BY created_at DESC", [req.params.patient_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

consultationsRouter.get("/:id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM consultations WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Consultation not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultation" });
  }
});

consultationsRouter.post("/", async (req, res) => {
  try {
    const { appointment_id, patient_id, doctor_id, video_link, prescription, notes, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, foodRecommendations, generalInstructions } = req.body;

    if (!patient_id || !doctor_id) {
      return res.status(400).json({ error: "Patient and Doctor are required" });
    }

    const created_at = new Date().toISOString();
    const result = await query(
      "INSERT INTO consultations (appointment_id, patient_id, doctor_id, status, video_link, prescription, notes, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, food_recommendations, general_instructions, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id",
      [appointment_id || null, patient_id, doctor_id, "scheduled", video_link || null, prescription || null, notes || null, history || null, diagnosis || null, temperature || null, heart_rate || null, respiratory_rate || null, weight || null, height || null, foodRecommendations || null, generalInstructions || null, created_at]
    );

    res.json({ id: result.rows[0].id, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create consultation" });
  }
});

consultationsRouter.put("/:id", async (req, res) => {
  try {
    const { status, video_link, prescription, notes, completed_at, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, foodRecommendations, generalInstructions } = req.body;
    const id = req.params.id;

    const existing = await query("SELECT * FROM consultations WHERE id = $1", [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Consultation not found" });

    const updates: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    const addUpdate = (field: string, value: any) => {
      if (value !== undefined) { updates.push(`${field} = $${paramIdx}`); values.push(value); paramIdx++; }
    };

    addUpdate("status", status);
    addUpdate("video_link", video_link);
    addUpdate("prescription", prescription);
    addUpdate("notes", notes);
    addUpdate("history", history);
    addUpdate("diagnosis", diagnosis);
    addUpdate("temperature", temperature);
    addUpdate("heart_rate", heart_rate);
    addUpdate("respiratory_rate", respiratory_rate);
    addUpdate("weight", weight);
    addUpdate("height", height);
    addUpdate("food_recommendations", foodRecommendations);
    addUpdate("general_instructions", generalInstructions);
    addUpdate("completed_at", completed_at);

    if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push(id);
    await query(`UPDATE consultations SET ${updates.join(", ")} WHERE id = $${paramIdx}`, values);
    res.json({ success: true, message: "Consultation updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

consultationsRouter.delete("/:id", async (req, res) => {
  try {
    const existing = await query("SELECT * FROM consultations WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Consultation not found" });
    await query("DELETE FROM consultations WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Consultation deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete consultation" });
  }
});
