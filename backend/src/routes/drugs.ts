import { Router } from "express";
import { query } from "../db";

export const drugsRouter = Router();

drugsRouter.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = "SELECT * FROM drugs WHERE 1=1";
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      sql += ` AND name ILIKE $${paramIdx}`;
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (category) {
      sql += ` AND category = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    sql += " ORDER BY name";
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch drugs" });
  }
});

drugsRouter.get("/categories", async (_req, res) => {
  try {
    const result = await query("SELECT DISTINCT category FROM drugs ORDER BY category");
    res.json(result.rows.map((r: any) => r.category));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

drugsRouter.get("/:id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM drugs WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Drug not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch drug" });
  }
});

drugsRouter.post("/", async (req, res) => {
  try {
    const { name, category, form, strength, common_usage } = req.body;
    if (!name) return res.status(400).json({ error: "Drug name is required" });
    const result = await query(
      "INSERT INTO drugs (name, category, form, strength, common_usage) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, category || "", form || "", strength || "", common_usage || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create drug" });
  }
});

drugsRouter.put("/:id", async (req, res) => {
  try {
    const { name, category, form, strength, common_usage } = req.body;
    const result = await query(
      "UPDATE drugs SET name = $1, category = $2, form = $3, strength = $4, common_usage = $5 WHERE id = $6 RETURNING *",
      [name, category || "", form || "", strength || "", common_usage || "", req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Drug not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update drug" });
  }
});

drugsRouter.delete("/:id", async (req, res) => {
  try {
    const result = await query("UPDATE drugs SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Drug not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete drug" });
  }
});
