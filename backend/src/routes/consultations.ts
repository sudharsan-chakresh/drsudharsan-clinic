import express from "express";
import { db } from "../db";
import { Consultation } from "../types";

export const consultationsRouter = express.Router();

// Get all consultations
consultationsRouter.get("/", (req, res) => {
  try {
    const consultations = db.prepare("SELECT * FROM consultations ORDER BY created_at DESC").all() as Consultation[];
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

// Get consultations for a specific doctor
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

// Get consultations for a specific patient
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

// Get consultation by ID
consultationsRouter.get("/:id", (req, res) => {
  try {
    const consultation = db.prepare("SELECT * FROM consultations WHERE id = ?").get(req.params.id) as Consultation | undefined;

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch consultation" });
  }
});

// Create consultation
consultationsRouter.post("/", (req, res) => {
  try {
    const { appointment_id, patient_id, doctor_id, video_link, prescription, notes, vitals, history, diagnosis } = req.body;

    const created_at = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO consultations (appointment_id, patient_id, doctor_id, status, video_link, prescription, notes, vitals, history, diagnosis, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    const result = stmt.run(
      appointment_id || null,
      patient_id || null,
      doctor_id || null,
      "scheduled",
      video_link || null,
      prescription || null,
      notes || null,
      vitals || null,
      history || null,
      diagnosis || null,
      created_at
    );

    res.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create consultation" });
  }
});

// Update consultation
consultationsRouter.put("/:id", (req, res) => {
  try {
    const { status, video_link, prescription, notes, completed_at, vitals, history, diagnosis } = req.body;
    const id = req.params.id;

    const consultation = db.prepare("SELECT * FROM consultations WHERE id = ?").get(id);
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (video_link !== undefined) {
      updates.push("video_link = ?");
      values.push(video_link);
    }
    if (prescription !== undefined) {
      updates.push("prescription = ?");
      values.push(prescription);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }
    if (vitals !== undefined) {
      updates.push("vitals = ?");
      values.push(vitals);
    }
    if (history !== undefined) {
      updates.push("history = ?");
      values.push(history);
    }
    if (diagnosis !== undefined) {
      updates.push("diagnosis = ?");
      values.push(diagnosis);
    }
    if (completed_at !== undefined) {
      updates.push("completed_at = ?");
      values.push(completed_at);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE consultations SET ${updates.join(", ")} WHERE id = ?`;
    db.prepare(query).run(...values);

    res.json({ success: true, message: "Consultation updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

// Delete consultation
consultationsRouter.delete("/:id", (req, res) => {
  try {
    const consultation = db.prepare("SELECT * FROM consultations WHERE id = ?").get(req.params.id);

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    db.prepare("DELETE FROM consultations WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Consultation deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete consultation" });
  }
});
