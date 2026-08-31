import express from "express";
import { db } from "../db";
import { Consultation } from "../types";

export const consultationsRouter = express.Router();

consultationsRouter.get("/", (req, res) => {
  try {
    const consultations = db.prepare("SELECT * FROM consultations ORDER BY created_at DESC").all() as Consultation[];
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

consultationsRouter.get("/doctor/:doctor_id", (req, res) => {
  try {
    const consultations = db
      .prepare("SELECT * FROM consultations WHERE doctor_id = ? ORDER BY created_at DESC")
      .all(req.params.doctor_id) as Consultation[];
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

consultationsRouter.get("/patient/:patient_id", (req, res) => {
  try {
    const consultations = db
      .prepare("SELECT * FROM consultations WHERE patient_id = ? ORDER BY created_at DESC")
      .all(req.params.patient_id) as Consultation[];
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

consultationsRouter.get("/:id", (req, res) => {
  try {
    const consultation = db.prepare("SELECT * FROM consultations WHERE id = ?").get(req.params.id) as Consultation | undefined;
    if (!consultation) return res.status(404).json({ error: "Consultation not found" });
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultation" });
  }
});

consultationsRouter.post("/", (req, res) => {
  try {
    const { appointment_id, patient_id, doctor_id, video_link, prescription, notes, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, foodRecommendations, generalInstructions } = req.body;

    if (!patient_id || !doctor_id) {
      return res.status(400).json({ error: "Patient and Doctor are required" });
    }

    const created_at = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO consultations (appointment_id, patient_id, doctor_id, status, video_link, prescription, notes, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, food_recommendations, general_instructions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    const result = stmt.run(
      appointment_id || null, patient_id, doctor_id, "scheduled",
      video_link || null, prescription || null, notes || null, history || null, diagnosis || null,
      temperature || null, heart_rate || null, respiratory_rate || null, weight || null, height || null,
      foodRecommendations || null, generalInstructions || null, created_at
    );

    res.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create consultation" });
  }
});

consultationsRouter.put("/:id", (req, res) => {
  try {
    const { status, video_link, prescription, notes, completed_at, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, foodRecommendations, generalInstructions } = req.body;
    const id = req.params.id;

    const consultation = db.prepare("SELECT * FROM consultations WHERE id = ?").get(id);
    if (!consultation) return res.status(404).json({ error: "Consultation not found" });

    const updates: string[] = [];
    const values: any[] = [];

    const addUpdate = (field: string, value: any) => {
      if (value !== undefined) { updates.push(`${field} = ?`); values.push(value); }
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
    db.prepare(`UPDATE consultations SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    res.json({ success: true, message: "Consultation updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

consultationsRouter.delete("/:id", (req, res) => {
  try {
    const consultation = db.prepare("SELECT * FROM consultations WHERE id = ?").get(req.params.id);
    if (!consultation) return res.status(404).json({ error: "Consultation not found" });
    db.prepare("DELETE FROM consultations WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Consultation deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete consultation" });
  }
});
